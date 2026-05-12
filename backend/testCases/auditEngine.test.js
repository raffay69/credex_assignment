import { describe , expect, it, vi } from "vitest";
import { audit_engine } from "../engine.js";
import { model } from "../llm.js";

vi.mock("../llm.js")

describe("Audit Engine Tests" , ()=>{
    it("should throw error on invalid input structure" , async ()=>{
        const input = {
            teamSize : 5,
            tools : "not an array"
        }

        await expect(audit_engine(input)).rejects.toThrow("invalid input structure")
    })

    it("should use the fallback summary when the LLM call fails" , async ()=>{
        const input = {
            teamSize: 2,
            tools: [
                {
                name: 'gemini',
                plan: 'pro',
                seats: 1,
                monthlySpend: 200,
                useCase: 'research'
                }
            ]
        }

        const outputSummary = '# **gemini**\n' +
        '\n' +
        '**Potential Savings:** **$192/mo** (**$2304/yr**)\n' +
        '\n' +
        '- **overspend**: \n' +
        "pro for 1 seat(s) should typically cost around $20/mo based on standard pricing, but you're currently paying $200/mo. This may indicate unused seats, add-ons, or billing inefficiencies.\n" +
        '\n' +
        '- **cheaper-plan**: \n' +
        'A lower-cost plan from the same provider may better match your current usage. Available alternatives: plus ($8/mo).\n' +
        '\n' +
        '- **alternatives**: \n' +
        'Comparable tools for research workflows are available at a lower estimated monthly cost. Switching providers could reduce spend while maintaining similar core functionality.'

        vi.mocked(model.invoke).mockRejectedValue("some error")

        const result = await audit_engine(input)

        expect(result).toBeDefined()
        expect(result.summary).toBe(outputSummary)
    })

    it("should return 'overspend' finding when the spend is higher then expected" , async ()=>{
        const input = {
            teamSize: 2,
            tools: [
                {
                name: 'gemini',
                plan: 'pro',
                seats: 1,
                monthlySpend: 200,
                useCase: 'research'
                }
            ]
        }

        vi.mocked(model.invoke).mockResolvedValue("mock summary")

        const result = await audit_engine(input)

        expect(result.findings[input.tools[0].name]).toContainEqual(expect.objectContaining({ type : "overspend"}))

    })

    it("should return 'cheaper-plan' finding when a cheaper plan is available" , async ()=>{
        const input = {
            teamSize: 2,
            tools: [
                {
                name: 'gemini',
                plan: 'pro',
                seats: 1,
                monthlySpend: 200,
                useCase: 'research'
                }
            ]
        }

        vi.mocked(model.invoke).mockResolvedValue("mock summary")

        const result = await audit_engine(input)

        expect(result.findings[input.tools[0].name]).toContainEqual(expect.objectContaining({ type : "cheaper-plan"}))

    })

    it("should return 'alternatives' finding when alternatives are available" , async ()=>{
        const input = {
            teamSize: 2,
            tools: [
                {
                name: 'gemini',
                plan: 'pro',
                seats: 1,
                monthlySpend: 200,
                useCase: 'research'
                }
            ]
        }

        vi.mocked(model.invoke).mockResolvedValue("mock summary")

        const result = await audit_engine(input)

        expect(result.findings[input.tools[0].name]).toContainEqual(expect.objectContaining({ type : "alternatives"}))

    })

    
    it("should return 'wrong-plan' finding when the selected plan is inefficient" , async ()=>{
        const input = {
            teamSize: 2,
            tools: [
                {
                name: 'chatgpt',
                plan: 'business',
                seats: 1,
                monthlySpend: 200,
                useCase: 'research'
                }
            ]
        }

        vi.mocked(model.invoke).mockResolvedValue("mock summary")

        const result = await audit_engine(input)

        expect(result.findings[input.tools[0].name]).toContainEqual(expect.objectContaining({ type : "wrong-plan"}))

    })
})
