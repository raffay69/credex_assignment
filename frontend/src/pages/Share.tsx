import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router";

export interface AltPlan { name: string; planName: string; price: number; saving: number; }
export interface Finding { name: string; type: string; reason: string; monthlySaving: number; annualSaving: number; alternatives?: AltPlan[]; }
export interface AuditData {
  findings: Record<string, Finding[]>;
  maxSavingPerTool: Record<string, number>;
  summary: string;
  monthlySave: number;
  yearlySave: number;
}

const SAMPLE_DATA: AuditData = {
  findings: {
    gemini: [
      { name: 'gemini', type: 'overspend', reason: 'the expected spend for pro/1 should be 20 not 35, check for hidden charges', monthlySaving: 15, annualSaving: 180 },
      { name: 'gemini', type: 'cheaper-plan', reason: 'Cheaper plans available like plus', monthlySaving: 27, annualSaving: 324 },
      { name: 'gemini', type: 'alternatives', reason: 'Cheaper alternative plans available', alternatives: [{ name: 'chatgpt', planName: 'go', price: 8, saving: 27 }, { name: 'claude', planName: 'pro', price: 17, saving: 18 }, { name: 'chatgpt', planName: 'plus', price: 20, saving: 15 }], monthlySaving: 27, annualSaving: 324 }
    ],
    claude: [
      { name: 'claude', type: 'wrong-plan', reason: 'team at $20/seat ($40/mo) is overkill for 2 seat(s) — switch to pro at $17/seat ($34/mo)', monthlySaving: 6, annualSaving: 72 },
      { name: 'claude', type: 'api-to-flat', reason: 'Spending $150/mo on API — flat max_5x plan at $100/mo would be cheaper if usage is consistent', monthlySaving: 50, annualSaving: 600 },
      { name: 'claude', type: 'alternatives', reason: 'Cheaper alternative plans available', alternatives: [{ name: 'chatgpt', planName: 'go', price: 8, saving: 142 }, { name: 'gemini', planName: 'plus', price: 8, saving: 142 }], monthlySaving: 142, annualSaving: 1704 }
    ],
    cursor: [
      { name: 'cursor', type: 'cheaper-plan', reason: 'Cheaper plans available like pro, pro_plus', monthlySaving: 140, annualSaving: 1680 },
    ],
    chatgpt: [
      { name: 'chatgpt', type: 'api-use-credits', reason: 'API spend of $6/mo is low — prepaid credits would be more cost effective than any flat plan', monthlySaving: 0, annualSaving: 0 }
    ]
  },
  maxSavingPerTool: { gemini: 27, claude: 142, cursor: 140, chatgpt: 0 },
  summary : "This team is overpaying across multiple vendors. Consolidating API usage to flat tiers and switching under-utilized Team plans to Pro plans yields significant monthly returns.",
  monthlySave: 309,
  yearlySave: 3708
};

// --- Config ---
const TOOL_META: Record<string, { label: string; color: string; logo: string }> = {
  gemini:    { label: "Gemini",        color: "#4285F4", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/google-gemini.png" },
  claude:    { label: "Claude",        color: "#D97706", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/claude-ai.svg" },
  chatgpt:   { label: "ChatGPT",       color: "#10A37F", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/chatgpt.png" },
  cursor:    { label: "Cursor",        color: "#6366F1", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/cursor.png" },
  copilot:   { label: "Copilot",       color: "#0EA5E9", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/github-copilot.png" },
  windsurf:  { label: "Windsurf",      color: "#06B6D4", logo: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-png@latest/light/windsurf.png" }
};

const FINDING_CONFIG: Record<string, { label: string; color: string }> = {
  "overspend":       { label: "Billing Anomaly", color: "#EF4444" },
  "wrong-plan":      { label: "Wrong Plan",      color: "#F59E0B" },
  "cheaper-plan":    { label: "Cheaper Plan",    color: "#3B82F6" },
  "alternatives":    { label: "Alternative",     color: "#10B981" },
  "api-to-flat":     { label: "API → Flat",      color: "#8B5CF6" },
  "api-use-credits": { label: "Use Credits",     color: "#8B5CF6" },
};

// --- UI Components ---
function ToolAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const meta = TOOL_META[name] || { label: name, color: "#64748B", logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/default.png" };
  return (
    <img
      src={meta.logo}
      alt={`${meta.label} logo`}
      className="shrink-0 object-cover bg-white border border-slate-200"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    />
  );
}

function Badge({ type }: { type: string }) {
  const cfg = FINDING_CONFIG[type] || { label: type, color: "#64748B" };
  return (
    <span 
      className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded text-[10px] font-bold tracking-[0.07em] uppercase font-mono whitespace-nowrap"
      style={{ backgroundColor: cfg.color + "12", color: cfg.color, border: `1px solid ${cfg.color}28` }}
    >
      {cfg.label}
    </span>
  );
}

function AltPill({ alt }: { alt: AltPlan }) {
  const meta = TOOL_META[alt.name] || { label: alt.name, logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/default.png" };
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
      <img src={meta.logo} alt="" className="w-3.5 h-3.5 rounded-[3px] object-cover bg-white border border-slate-200" />
      <span className="text-slate-700 font-medium">{meta.label}</span>
      <span className="text-slate-300">·</span>
      <span className="text-slate-500 font-mono">{alt.planName}</span>
      <span className="text-slate-300">·</span>
      <span className="text-emerald-600 font-semibold font-mono">−${alt.saving}/mo</span>
    </div>
  );
}

function FindingRow({ finding, isLast }: { finding: Finding; isLast: boolean }) {
  return (
    <div className={`py-3.5 px-5 ${isLast ? '' : 'border-b border-slate-50'}`}>
      <div className="flex gap-3 items-start flex-wrap">
        <div className="pt-[1px] shrink-0">
          <Badge type={finding.type} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <p className="text-[13px] text-slate-700 leading-relaxed m-0">{finding.reason}</p>
          {finding.alternatives && finding.alternatives.length > 0 && (
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

function ToolCard({ toolName, findings, maxSaving }: { toolName: string; findings: Finding[]; maxSaving: number }) {
  const [open, setOpen] = useState(true);
  const meta = TOOL_META[toolName] || { label: toolName, color: "#6366F1" };
  
  if (findings.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2.5 shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full bg-transparent border-none cursor-pointer p-4 px-5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
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

// --- The Viral Loop CTA ---
function ViralCTA() {
  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-[32px] border border-slate-800 mt-8 flex flex-col items-center text-center shadow-lg">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[400px] bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-emerald-400 font-mono">Free Tool</span>
        </div>
        
        <h2 className="text-[clamp(22px,5vw,28px)] font-bold text-white m-0 mb-3 leading-tight">
          Are you overpaying for AI?
        </h2>
        <p className="text-[14px] text-slate-400 m-0 mb-8 max-w-[400px] leading-relaxed mx-auto">
          The average team wastes 30% of their AI budget on overlapping tools and wrong plan tiers. See how much you can save in 2 minutes.
        </p>
        
        <button 
          onClick={() => window.location.href = '/'} // Redirects to the form input page
          className="bg-emerald-400 text-slate-900 border-none rounded-xl py-3.5 px-8 font-bold text-[14px] cursor-pointer whitespace-nowrap hover:bg-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
        >
          Run a Free Audit →
        </button>
      </div>
    </div>
  );
}

// --- Skeleton Loader ---
function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-10 w-3/4 bg-slate-200 rounded-lg mb-3"></div>
      <div className="h-4 w-1/2 bg-slate-200 rounded mb-8"></div>
      
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-200 rounded-[10px]"></div>
        ))}
      </div>
      
      <div className="h-32 bg-slate-200 rounded-xl mb-3"></div>
      <div className="h-40 bg-slate-200 rounded-xl mb-3"></div>
      <div className="h-40 bg-slate-200 rounded-xl mb-3"></div>
    </div>
  );
}

// --- Main Page Component ---
export default function SharedAuditView() {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams()

  useEffect(() => {
    const auditId = params.id;

    // 2. Dummy API Call
    console.log(`Fetching public audit data for ID: ${auditId}`);
    
    const fetchDummyData = async () => {
    //   await new Promise(resolve => setTimeout(resolve, 1500));
      const res = await axios.post("http://localhost:3000/share" , {
        id : auditId
      })
      setData(res.data);
    // setData(SAMPLE_DATA)
      setLoading(false);
    };

    fetchDummyData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      
      {/* Top Banner indicating a shared view */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-mono py-2 text-center border-b border-slate-800 tracking-wide">
        You are viewing an anonymized AI Stack Audit.
      </div>

      <div className="pt-8 px-4 pb-16 max-w-[660px] mx-auto">
        
        {loading || !data ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-[7px] mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 font-mono">Shared Report</span>
              </div>
              <h1 className="font-bold text-[clamp(24px,5vw,32px)] text-slate-900 m-0 mb-2 leading-tight">
                Found <span className="text-emerald-600">${data.monthlySave}/mo</span> in potential savings.
              </h1>
              <p className="text-[13px] text-slate-500 m-0 font-mono">
                {Object.keys(data.findings).length} tools audited · identifying details stripped for privacy
              </p>
            </div>

            {/* 1. Stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { label: "Monthly Savings", value: `$${data.monthlySave}`, sub: "potential", accent: "text-emerald-600" },
                { label: "Annual Savings",  value: `$${data.yearlySave}`,  sub: "potential", accent: "text-slate-900" },
                { label: "Total Findings",  value: Object.values(data.findings).reduce((s, f) => s + f.length, 0), sub: "across stack", accent: "text-slate-900" },
              ].map(({ label, value, sub, accent }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-[10px] py-[14px] px-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                  <p className="text-[10px] text-slate-400 m-0 mb-1 font-mono uppercase tracking-[0.06em]">{label}</p>
                  <p className={`font-bold text-[clamp(18px,3vw,22px)] m-0 mb-[1px] font-mono ${accent}`}>{value}</p>
                  <p className="text-[11px] text-slate-400 m-0">{sub}</p>
                </div>
              ))}
            </div>

            {/* 2. Summary */}
            {data.summary && (
              <div className="bg-white border border-slate-200 rounded-xl p-[20px] mb-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
                <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-2 font-mono ml-2">Executive Summary</p>
                <p className="text-[13px] text-slate-700 leading-[1.7] m-0 ml-2">{data.summary}</p>
              </div>
            )}

            {/* 3. Per-tool finding cards */}
            <div className="mb-4">
              <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-3 font-mono mt-8">Detailed Findings</p>
              {Object.entries(data.findings).map(([toolName, toolFindings]) => (
                <ToolCard key={toolName} toolName={toolName} findings={toolFindings} maxSaving={data.maxSavingPerTool[toolName] || 0} />
              ))}
            </div>

            {/* 4. Savings breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-[20px] shadow-sm mb-4">
              <p className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 m-0 mb-[16px] font-mono">Value Breakdown</p>
              {Object.entries(data.maxSavingPerTool)
                .filter(([_, saving]) => saving > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([name, saving]) => {
                const pct = Math.min(100, Math.round((saving / data.monthlySave) * 100));
                const meta = TOOL_META[name] || { label: name, color: "#6366F1", logo: "" };
                return (
                  <div key={name} className="flex items-center gap-3 mb-3">
                    <ToolAvatar name={name} size={30} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-slate-700">{meta.label}</span>
                        <span className="text-[13px] font-mono text-emerald-600 font-bold">−${saving}/mo</span>
                      </div>
                      <div className="h-[4px] rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-mono">Total Optimization Value</span>
                <span className="text-[14px] font-mono font-bold text-emerald-600">−${data.monthlySave}/mo</span>
              </div>
            </div>

            {/* 5. The Viral Acquisition Engine */}
            <ViralCTA />

          </>
        )}
      </div>
    </div>
  );
}