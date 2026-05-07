import axios from "axios";
import { useState } from "react";
import { BACKEND_URL, FRONTEND_URL } from "../constants";
import toast from "react-hot-toast";

const SAMPLE_DATA = {
  findings: {
    gemini: [
      {
        name: 'gemini',
        type: 'overspend',
        reason: 'the expected spend for pro/1 should be 20 not 35, check for hidden charges',
        monthlySaving: 15,
        annualSaving: 180
      },
      {
        name: 'gemini',
        type: 'cheaper-plan',
        reason: 'Cheaper plans available like plus',
        monthlySaving: 27,
        annualSaving: 324
      },
      {
        name: 'gemini',
        type: 'alternatives',
        reason: 'Cheaper alternative plans available',
        alternatives: [
          { name: 'chatgpt', planName: 'go', price: 8, saving: 27 },
          { name: 'claude', planName: 'pro', price: 17, saving: 18 },
          { name: 'chatgpt', planName: 'plus', price: 20, saving: 15 }
        ],
        monthlySaving: 27,
        annualSaving: 324
      }
    ],
    claude: [
      {
        name: 'claude',
        type: 'wrong-plan',
        reason: 'team at $20/seat ($40/mo) is overkill for 2 seat(s) — switch to pro at $17/seat ($34/mo)',
        monthlySaving: 6,
        annualSaving: 72
      },
      {
        name: 'claude',
        type: 'cheaper-plan',
        reason: 'Cheaper plans available like pro',
        monthlySaving: 6,
        annualSaving: 72
      },
      {
        name: 'claude',
        type: 'alternatives',
        reason: 'Cheaper alternative plans available',
        alternatives: [
          { name: 'chatgpt', planName: 'go', price: 8, saving: 24 },
          { name: 'gemini', planName: 'plus', price: 8, saving: 24 }
        ],
        monthlySaving: 24,
        annualSaving: 288
      },
      {
        name: 'claude',
        type: 'api-to-flat',
        reason: 'Spending $150/mo on API — flat max_5x plan at $100/mo would be cheaper if usage is consistent',
        monthlySaving: 50,
        annualSaving: 600
      },
      {
        name: 'claude',
        type: 'alternatives',
        reason: 'Cheaper alternative plans available',
        alternatives: [
          { name: 'chatgpt', planName: 'go', price: 8, saving: 142 },
          { name: 'gemini', planName: 'plus', price: 8, saving: 142 },
          { name: 'chatgpt', planName: 'plus', price: 20, saving: 130 },
          { name: 'gemini', planName: 'pro', price: 20, saving: 130 },
          {
            name: 'chatgpt',
            planName: 'pro_100',
            price: 100,
            saving: 50
          }
        ],
        monthlySaving: 142,
        annualSaving: 1704
      }
    ],
    cursor: [
      {
        name: 'cursor',
        type: 'cheaper-plan',
        reason: 'Cheaper plans available like pro,pro_plus',
        monthlySaving: 140,
        annualSaving: 1680
      },
      {
        name: 'cursor',
        type: 'alternatives',
        reason: 'Cheaper alternative plans available',
        alternatives: [
          { name: 'chatgpt', planName: 'go', price: 8, saving: 192 },
          { name: 'copilot', planName: 'pro', price: 10, saving: 190 },
          { name: 'claude', planName: 'pro', price: 17, saving: 183 },
          { name: 'windsurf', planName: 'pro', price: 20, saving: 180 },
          { name: 'chatgpt', planName: 'plus', price: 20, saving: 180 },
          {
            name: 'copilot',
            planName: 'pro_plus',
            price: 39,
            saving: 161
          },
          {
            name: 'claude',
            planName: 'max_5x',
            price: 100,
            saving: 100
          },
          {
            name: 'chatgpt',
            planName: 'pro_100',
            price: 100,
            saving: 100
          }
        ],
        monthlySaving: 192,
        annualSaving: 2304
      },
      {
        name: 'cursor',
        type: 'alternatives',
        reason: 'Cheaper alternative plans available',
        alternatives: [
          {
            name: 'copilot',
            planName: 'business',
            price: 19,
            saving: 168
          },
          { name: 'claude', planName: 'team', price: 20, saving: 160 },
          {
            name: 'chatgpt',
            planName: 'business',
            price: 25,
            saving: 120
          }
        ],
        monthlySaving: 168,
        annualSaving: 2016
      }
    ],
    chatgpt: [
      {
        name: 'chatgpt',
        type: 'api-use-credits',
        reason: 'API spend of $6/mo is low — prepaid credits would be more cost effective than any flat plan',
        monthlySaving: 0,
        annualSaving: 0
      }
    ]
  },
  maxSavingPerTool: { gemini: 27, claude: 142, cursor: 192, chatgpt: 0 },
  summary : "will be added later ok haan",
  monthlySave: 361,
  id : "12344",
  yearlySave: 4332
}

const TOOL_META = {
  gemini:    { label: "Gemini",        color: "#4285F4", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/google-gemini.png" },
  claude:    { label: "Claude",        color: "#D97706", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/claude-ai.svg" },
  chatgpt:   { label: "ChatGPT",       color: "#10A37F", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/chatgpt.png" },
  cursor:    { label: "Cursor",        color: "#6366F1", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cursor.png" },
  copilot:   { label: "Copilot",       color: "#0EA5E9", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/github-copilot.png" },
  windsurf:  { label: "Windsurf",      color: "#06B6D4", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/windsurf.png" }
};

const FINDING_CONFIG = {
  "overspend":       { label: "Billing Anomaly", color: "#EF4444" },
  "wrong-plan":      { label: "Wrong Plan",      color: "#F59E0B" },
  "cheaper-plan":    { label: "Cheaper Plan",    color: "#3B82F6" },
  "alternatives":    { label: "Alternative",     color: "#10B981" },
  "api-to-flat":     { label: "API → Flat",      color: "#8B5CF6" },
  "api-use-credits": { label: "Use Credits",     color: "#8B5CF6" },
};

function ToolAvatar({ name, size = 36 }) {
  const meta = TOOL_META[name] || { label: name, logo: "/logos/default.svg" };

  return (
    <img
      src={meta.logo}
      alt={`${meta.label} logo`}
      className="shrink-0 object-cover bg-white border border-slate-200"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
      }}
    />
  );
}

function Badge({ type }) {
  const cfg = FINDING_CONFIG[type] || { label: type, color: "#64748B" };
  return (
    <span 
      className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded text-[10px] font-bold tracking-[0.07em] uppercase font-mono whitespace-nowrap"
      style={{
        backgroundColor: cfg.color + "12", color: cfg.color, border: `1px solid ${cfg.color}28`,
      }}
    >
      {cfg.label}
    </span>
  );
}

function AltPill({ alt }) {
  const meta = TOOL_META[alt.name] || { label: alt.name, logo: "/logos/default.svg" };
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
      <img 
        src={meta.logo} 
        alt="" 
        className="w-3.5 h-3.5 rounded-[3px] object-cover bg-white border border-slate-200"
      />
      <span className="text-slate-700 font-medium">{meta.label}</span>
      <span className="text-slate-300">·</span>
      <span className="text-slate-500 font-mono">{alt.planName}</span>
      <span className="text-slate-300">·</span>
      <span className="text-emerald-600 font-semibold font-mono">−${alt.saving}/mo</span>
    </div>
  );
}

function FindingRow({ finding, isLast }) {
  return (
    <div className={`py-3.5 px-5 ${isLast ? '' : 'border-b border-slate-50'}`}>
      <div className="flex gap-3 items-start flex-wrap">
        <div className="pt-[1px] shrink-0">
          <Badge type={finding.type} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="text-[13px] text-slate-700 leading-relaxed m-0">{finding.reason}</p>
          {finding.alternatives?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {finding.alternatives.map((alt, i) => <AltPill key={i} alt={alt} />)}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-xs font-bold text-emerald-600 m-0 whitespace-nowrap">−${finding.monthlySaving}/mo</p>
          <p className="font-mono text-[11px] text-slate-400 mt-0.5 mb-0 whitespace-nowrap">${finding.annualSaving}/yr</p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ toolName, findings, maxSaving }) {
  const [open, setOpen] = useState(true);
  const meta = TOOL_META[toolName] || { label: toolName, color: "#6366F1" };
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2.5 shadow-sm">
      <button onClick={() => setOpen(o => !o)} className="w-full bg-transparent border-none cursor-pointer p-4 px-5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <ToolAvatar name={toolName} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-900 m-0">{meta.label}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-slate-400 font-mono">
              {findings.length} finding{findings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono font-bold text-[13px] text-emerald-600 m-0">−${maxSaving}/mo</p>
          <p className="font-mono text-[11px] text-slate-400 mt-0.5 mb-0">${maxSaving * 12}/yr</p>
        </div>
        <span className="text-slate-300 text-[11px] shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100">
          {findings.map((f, i) => <FindingRow key={i} finding={f} isLast={i === findings.length - 1} />)}
        </div>
      )}
    </div>
  );
}

function CredexBanner({ monthlySave }) {
  return (
    <div className="bg-slate-900 rounded-xl py-5 px-6 mb-3 border border-slate-800">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-emerald-400 font-mono">Unlock More</span>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <p className="font-bold text-base text-slate-50 m-0 mb-1.5 leading-[1.35]">
            You're leaving ${monthlySave}/mo behind.<br />
            <span className="text-emerald-400">Credex can recover 2–4× more.</span>
          </p>
          <p className="text-[13px] text-slate-500 m-0 leading-relaxed">
            We negotiate vendor credits, consolidate overlapping tools, and identify free-tier alternatives — going well beyond plan switching.
          </p>
        </div>
        <a  href="https://credex.rocks/" target="_blank" className="bg-emerald-400 text-slate-900 border-none rounded-lg py-2.5 px-[18px] font-bold text-[13px] cursor-pointer whitespace-nowrap self-center shrink-0 hover:bg-emerald-300 transition-colors">
          Get an Audit →
        </a>
      </div>
    </div>
  );
}

function OptimalBanner() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-3 flex gap-3.5 items-start">
      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-lg text-green-700">✓</div>
      <div>
        <p className="font-semibold text-sm text-green-800 m-0 mb-[3px]">You're spending well.</p>
        <p className="text-[13px] text-green-700 m-0 leading-relaxed">Your current stack looks well-optimised. We don't manufacture savings — we'll notify you when real opportunities appear.</p>
      </div>
    </div>
  );
}

function EmailCapture({ setEmail, handleEmailReport, sendingEmail }) {
  return (
    <div className="bg-slate-900 rounded-xl p-[22px] border border-slate-800 mb-3">
      <p className="font-bold text-base text-slate-50 m-0 mb-1">
        Get your full report by email
      </p>
      <p className="text-[13px] text-slate-400 m-0 mb-4 leading-[1.55]">
        We'll send a detailed breakdown with step-by-step switching instructions for each finding.
      </p>
      <div className="flex gap-2 flex-wrap">
        <input 
          type="email" 
          onChange={(e) => setEmail(e.target.value)}
          disabled={sendingEmail}
          placeholder="you@company.com" 
          className="flex-1 min-w-[200px] py-[9px] px-[13px] border border-slate-700 rounded-lg text-[13px] text-slate-50 outline-none bg-slate-800 focus:border-emerald-400 transition-colors placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed" 
        />
        <button 
          onClick={handleEmailReport} 
          disabled={sendingEmail}
          className={`bg-emerald-400 text-slate-900 border-none rounded-lg py-[9px] px-6 font-bold text-[13px] flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 ${
            sendingEmail ? 'opacity-80 cursor-wait' : 'cursor-pointer hover:bg-emerald-300'
          }`}
        >
          {sendingEmail ? (
            <>
              <svg className="animate-spin -ml-1 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            "Send Report"
          )}
        </button>
      </div>
    </div>
  );
}

function ShareSection({ onShare, copied }) {
  return (
    <div className="bg-slate-900 rounded-xl p-[22px] border border-slate-800 flex items-center justify-between flex-wrap gap-4 mb-3">
      <div>
        <p className="font-bold text-base text-slate-50 m-0 mb-1">Share this report</p>
        <p className="text-[13px] text-slate-400 m-0 leading-[1.55]">Copy the link to share these findings with your team.</p>
      </div>
      <button 
        onClick={onShare}
        className="bg-emerald-400 text-slate-900 border-none rounded-lg py-[11px] px-6 font-bold text-[13px] cursor-pointer whitespace-nowrap hover:bg-emerald-300 transition-all duration-200 flex items-center gap-2"
      >
        {copied ? (
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">✓</span> Copied
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">🔗</span> Copy Link
          </span>
        )}
      </button>
    </div>
  );
}

export default function AuditResults({ data = SAMPLE_DATA, setState }) {
  const { findings, maxSavingPerTool, monthlySave, yearlySave, summary  , id } = data;
  const [copied, setCopied] = useState(false);
  const [email , setEmail] = useState()
  const [sendingEmail , setSendingEmail ] = useState(false)

  const toolCount = Object.keys(findings).length;
  const findingCount = Object.values(findings).reduce((s, f) => s + f.length, 0);
  const isOptimal = findingCount === 0 || monthlySave === 0;
  const isHighSaving = monthlySave > 500;

  const headline = isOptimal
    ? "Your stack looks healthy."
    : `Found $${monthlySave}/mo in savings across your stack.`;

  const subline = isOptimal
    ? `${toolCount} tool${toolCount !== 1 ? "s" : ""} audited · no major issues found`
    : `${toolCount} tool${toolCount !== 1 ? "s" : ""} audited · ${findingCount} finding${findingCount !== 1 ? "s" : ""} · $${yearlySave}/yr potential`;

  const handleShare = async (id : string) => {
    try {
      await navigator.clipboard.writeText(`${FRONTEND_URL}/share/${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleEmailReport = async()=>{
    try{
        setSendingEmail(true)
        const res = await axios.post(`${BACKEND_URL}/email` , {
            email, id
        })
        if(res.status === 200){
            toast.success("Email Sent Successfully", {
            className: "bg-slate-900 text-slate-50 border border-slate-800 font-bold text-[13px] shadow-sm",
            duration : 2000
        });
        }
    } catch(e){
        toast.error(e.message, {
            className: "bg-slate-900 text-slate-50 border border-slate-800 font-bold text-[13px] shadow-sm",
            duration : 2000
        });
    } finally {
        setSendingEmail(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-8 px-4 pb-16 font-sans">
      <div className="max-w-[660px] mx-auto">

        {/* Navigation Button */}
        <button 
          onClick={() => setState?.('form')}
          className="bg-transparent border-none p-0 flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-900 transition-colors cursor-pointer mb-6"
        >
          <span className="text-lg leading-none mb-[2px]">←</span> Back to form
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-[7px] mb-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOptimal ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 font-mono">Audit Report</span>
          </div>
          <h1 className="font-bold text-[clamp(20px,4.5vw,28px)] text-slate-900 m-0 mb-1 leading-tight">{headline}</h1>
          <p className="text-xs text-slate-400 m-0 font-mono">{subline}</p>
        </div>

        {/* 1. Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { label: "Monthly Savings", value: `$${monthlySave}`, sub: "potential", accent: "text-emerald-600" },
            { label: "Annual Savings",  value: `$${yearlySave}`,  sub: "potential", accent: "text-slate-900" },
            { label: "Findings",        value: findingCount,       sub: `${toolCount} tools`, accent: "text-slate-900" },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-[10px] py-[14px] px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <p className="text-[10px] text-slate-400 m-0 mb-1 font-mono uppercase tracking-[0.06em]">{label}</p>
              <p className={`font-bold text-[clamp(18px,3vw,22px)] m-0 mb-[1px] font-mono ${accent}`}>{value}</p>
              <p className="text-[11px] text-slate-400 m-0">{sub}</p>
            </div>
          ))}
        </div>

        {/* 2. Banners */}
        {isHighSaving && <CredexBanner monthlySave={monthlySave} />}
        {isOptimal && <OptimalBanner />}

        {/* 3. Summary */}
        {summary && (
          <div className="bg-white border border-slate-200 rounded-xl p-[18px] mb-3 shadow-sm">
            <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-2 font-mono">Summary</p>
            <p className="text-[13px] text-slate-700 leading-[1.7] m-0">{summary}</p>
          </div>
        )}

        {/* 4. Per-tool finding cards */}
        <div className="mb-3">
          <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-2.5 font-mono">Per-tool breakdown</p>
          {Object.entries(findings).map(([toolName, toolFindings]) => (
            <ToolCard key={toolName} toolName={toolName} findings={toolFindings} maxSaving={maxSavingPerTool[toolName] || 0} />
          ))}
        </div>

        {/* 5. Savings breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-[18px] mb-3 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-[14px] font-mono">Savings Breakdown</p>
          {Object.entries(maxSavingPerTool).map(([name, saving]) => {
            const pct = Math.min(100, Math.round((saving / monthlySave) * 100));
            const meta = TOOL_META[name] || { label: name, color: "#6366F1" };
            return (
              <div key={name} className="flex items-center gap-2.5 mb-2.5">
                <ToolAvatar name={name} size={28} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1.25">
                    <span className="text-xs font-medium text-slate-700">{meta.label}</span>
                    <span className="text-xs font-mono text-emerald-600 font-semibold">−${saving}/mo</span>
                  </div>
                  <div className="h-[3px] rounded-sm bg-slate-100">
                    <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: meta.color + "80" }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-slate-100 pt-3 mt-1.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Total (best saving per tool, non-additive)</span>
            <span className="text-[13px] font-mono font-bold text-emerald-600">−${monthlySave}/mo</span>
          </div>
        </div>

        {/* 6. Email capture */}
        <EmailCapture setEmail={setEmail} handleEmailReport={handleEmailReport} sendingEmail={sendingEmail}/>

        {/* 7. Dedicated Share Section */}
        <ShareSection onShare={()=>handleShare(id)} copied={copied} />

      </div>
    </div>
  );
}