import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { TOOLS } from "./data.js"
import { model, systemPrompt } from "./llm.js"

const INDIVIDUAL_PLAN = 3
const teamPlans = ["team", "business", "team_premium", "teams"]

export async function audit_engine(input) {
    const tools = input.tools
    if(!Array.isArray(tools)) throw Error("invalid input structure")
    const findings = []
    let expectedSpend = null

    for (const tool of tools) {
        if (!TOOLS[tool.name] || !TOOLS[tool.name].plans[tool.plan]) continue

        const seats = tool.seats
        const currentPlanPrice = TOOLS[tool.name].plans[tool.plan].price

        // step 0
        if(tool.plan !== "api"){
            expectedSpend = seats * currentPlanPrice
            if (tool.monthlySpend > expectedSpend) {
                const maxSaving = tool.monthlySpend - expectedSpend
                findings.push({
                    name: tool.name,
                    type: "overspend",
                    reason: `${tool.plan} for ${seats} seat(s) should typically cost around $${expectedSpend}/mo based on standard pricing, but you're currently paying $${tool.monthlySpend}/mo. This may indicate unused seats, add-ons, or billing inefficiencies.`,
                    monthlySaving: Math.floor(maxSaving),
                    annualSaving: Math.floor(maxSaving * 12)
                })
            }
        }

        // step 1
        if (teamPlans.includes(tool.plan) && seats < INDIVIDUAL_PLAN) {
            const toolPlansFromObj = TOOLS[tool.name].plans
            const cheaper = []
            Object.entries(toolPlansFromObj).forEach(([name, data]) => {
                if (name!=="free" && data.seats === "solo" && data.price < toolPlansFromObj[tool.plan].price) {
                    cheaper.push({ name, price: data.price })
                }
            })

            if (cheaper.length > 0) {
                const sorted = cheaper.sort((a, b) => a.price - b.price)
                const maxSaving = tool.monthlySpend - (sorted[0].price * seats)
                findings.push({
                    name: tool.name,
                    type: "wrong-plan",
                    reason: `${tool.plan} is likely more than your team currently needs for ${seats} seat(s). Switching to ${cheaper.map(el => `${el.name} ($${el.price * seats}/mo)`).join(" or ")} could provide similar functionality at a lower monthly cost.`,
                    monthlySaving: Math.floor(maxSaving),
                    annualSaving: Math.floor(maxSaving * 12)
                })
            }
        }

        // step 2 — cheaper plan from same vendor
        const cheaperPlans = []
        Object.entries(TOOLS[tool.name].plans).forEach(([name, data]) => {
            if (seats <= INDIVIDUAL_PLAN && teamPlans.includes(name)) return
            if (seats > INDIVIDUAL_PLAN && !teamPlans.includes(name)) return
            if (["free", "api"].includes(name)) return
            const threshold = tool.plan === "api" ? tool.monthlySpend : currentPlanPrice * seats
            if (data.price * seats < threshold) {
                cheaperPlans.push({ name, price: data.price })
            }
        })

        if (cheaperPlans.length > 0) {
            const sorted = cheaperPlans.sort((a, b) => a.price - b.price)
            const bestFit = sorted[sorted.length - 1]
            const maxSaving = tool.monthlySpend - (bestFit.price * seats)
            findings.push({
                name: tool.name,
                type: tool.plan === "api" ? "api-to-flat" : "cheaper-plan",
                reason: tool.plan === "api" 
                    ? `Your current API spend is around $${tool.monthlySpend}/mo. For predictable or recurring usage, the ${bestFit.name} plan at approximately $${bestFit.price * seats}/mo may provide better value and more predictable billing.`
                    : `A lower-cost plan from the same provider may better match your current usage. Available alternatives: ${cheaperPlans.map(el => `${el.name} ($${el.price * seats}/mo)`).join(", ")}.`,
                monthlySaving: Math.floor(maxSaving),
                annualSaving: Math.floor(maxSaving * 12)
            })
        } else if (tool.plan === "api") {
            findings.push({
                name: tool.name,
                type: "api-use-credits",
                reason: `Your API usage appears relatively low at $${tool.monthlySpend}/mo. Usage-based billing or prepaid credits may be more cost-efficient than maintaining a fixed subscription tier.`,
                monthlySaving: 0,
                annualSaving: 0
            })
        }

        // step 3 — cheaper alts from diff vendors
        const alts = []
        Object.entries(TOOLS).forEach(([name, data]) => {
            if (name !== tool.name && data.useCases.includes(tool.useCase)) {
                Object.entries(data.plans).forEach(([planName, planData]) => {
                    if (seats <= INDIVIDUAL_PLAN && teamPlans.includes(planName)) return
                    if (seats > INDIVIDUAL_PLAN && !teamPlans.includes(planName)) return
                    if (!["free", "api"].includes(planName)) {
                        const cost = planData.price * seats
                        if (cost < tool.monthlySpend) {
                            const saving = tool.monthlySpend - cost
                            alts.push({ name, planName, price: planData.price, saving: Math.floor(saving) })
                        }
                    }
                })
            }
        })

        if (alts.length > 0) {
            const sortedAlts = alts.sort((a, b) => a.price - b.price)
            const moneySaved = sortedAlts[0].saving
            findings.push({
                name: tool.name,
                type: "alternatives",
                reason: `Comparable tools for ${tool.useCase} workflows are available at a lower estimated monthly cost. Switching providers could reduce spend while maintaining similar core functionality.`,
                alternatives: alts,
                monthlySaving: Math.floor(moneySaved),
                annualSaving: Math.floor(moneySaved * 12)
            })
        }
    }

    const obj = {}
    for(const tool of findings){
    if(!obj[tool.name]) obj[tool.name] = []
        obj[tool.name].push(tool)
    }

    const maxSavingPerTool = {}
    Object.entries(obj).forEach(([name, data]) => {
        const filtered = data.filter(f => f.type !== "overspend")
        if (filtered.length === 0) return
        const sorted = filtered.sort((a, b) => b.monthlySaving - a.monthlySaving)
        maxSavingPerTool[name] = sorted[0].monthlySaving
    })

    const monthlySave = Object.values(maxSavingPerTool).reduce((acc, el) => acc + el, 0)

    const output = {
        findings : obj,
        maxSavingPerTool,
        monthlySave,
        yearlySave : Math.floor(monthlySave * 12)
    }

    let summary = null
    try{
        const llmOutput = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(JSON.stringify(output))
        ])

        summary = llmOutput.data
    }catch(e){
        // fallback summary
       summary = Object.entries(output.findings)
        .map(([name, data]) => {
            const bullets = data
            .map((el) => `- **${el.type}**: \n${el.reason}`)
            .join("\n\n");

            return [
            `# **${name}**`,
            `**Potential Savings:** **$${maxSavingPerTool[name]}/mo** (**$${maxSavingPerTool[name] * 12}/yr**)`,
            bullets,
            ].join("\n\n");
        })
        .join("\n\n---\n\n");
    }


    return {
        ...output,
        summary
    }
}