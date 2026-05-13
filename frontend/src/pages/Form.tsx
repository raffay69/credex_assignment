import axios from "axios";
import React, { useState, useEffect, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../constants";

// --- Types & Interfaces ---

export type ToolId = 
  | "chatgpt" 
  | "claude" 
  | "cursor" 
  | "copilot" 
  | "gemini" 
  | "windsurf" 
  | "anthropic" 
  | "openai";

export interface ToolConfig {
  label: string;
  plans: string[];
}

export interface ToolEntry {
  id: string;
  toolId: ToolId | string;
  plan: string;
  seats: string;
  spend: string;
  useCase: string;
}

export interface AuditFormData {
  teamSize: string;
  tools: ToolEntry[];
}

export interface OutputPayload {
  teamSize: number;
  tools: {
    name: string;
    plan: string;
    seats: number;
    monthlySpend: number;
    useCase: string;
  }[];
}

const TOOLS_CONFIG: Record<string, ToolConfig> = {
  chatgpt: { 
    label: "ChatGPT",       
    plans: ["Free", "Go", "Plus", "Pro","Business", "API Direct"] 
  },
  claude: { 
    label: "Claude",        
    plans: ["Free", "Pro", "Max 5x", "Team", "Team Premium", "API Direct"] 
  },
  cursor: { 
    label: "Cursor",        
    plans: ["Free", "Pro", "Pro Plus", "Ultra", "Teams"] 
  },
  copilot: { 
    label: "GitHub Copilot",
    plans: ["Free", "Pro", "Pro Plus", "Business"] 
  },
  gemini: { 
    label: "Gemini",        
    plans: ["Free", "Plus", "Pro", "Ultra", "API Direct"] 
  },
  windsurf: { 
    label: "Windsurf",      
    plans: ["Free", "Pro", "Max", "Teams"] 
  },
};

const USE_CASES: string[] = ["Coding", "Writing", "Data", "Research", "Mixed"];

const DEFAULT_STATE: AuditFormData = {
  teamSize: "",
  tools: [
    { id: "initial-tool", toolId: "gemini", plan: "Pro", seats: "1", spend: "20", useCase: "Research" }
  ]
};


function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="block text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 mb-1.5 font-mono" {...props}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className="w-full py-[9px] px-[13px] border border-slate-200 rounded-lg text-[13px] text-slate-900 outline-none bg-neutral-50 focus:border-slate-400 focus:bg-white transition-colors placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100"
      {...props} 
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      className="w-full py-[9px] px-[13px] border border-slate-200 rounded-lg text-[13px] text-slate-900 outline-none bg-neutral-50 focus:border-slate-400 focus:bg-white transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-100"
      {...props}
    >
      {children}
    </select>
  );
}


export default function AuditForm({ setState , setData } : { setState : React.Dispatch<SetStateAction<string>> , setData : React.Dispatch<SetStateAction<any>>}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AuditFormData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai-stack-audit");
      if (saved) return JSON.parse(saved) as AuditFormData;
    }
    return DEFAULT_STATE;
  });

  // Persist state to localStorage on every change
  useEffect(() => {
    localStorage.setItem("ai-stack-audit", JSON.stringify(formData));
  }, [formData]);

  const updateTeamSize = (value: string) => {
    setFormData((prev) => ({ ...prev, teamSize: value }));
  };

  const addTool = () => {
    setFormData((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        { 
          id: crypto.randomUUID(), 
          toolId: "claude", 
          plan: "Pro", 
          seats: "1", 
          spend: "", 
          useCase: "Coding" 
        }
      ]
    }));
  };

  const removeTool = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.id !== id)
    }));
  };

  const updateTool = (id: string, key: keyof ToolEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((tool) => {
        if (tool.id !== id) return tool;
        
        const updatedTool = { ...tool, [key]: value };
        
        // If changing tool type, automatically select the first valid plan for that tool
        if (key === 'toolId') {
          updatedTool.plan = TOOLS_CONFIG[value]?.plans[0] || "";
        }
        
        return updatedTool;
      })
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try{
        e.preventDefault();
        setIsSubmitting(true);

        const payload: OutputPayload = {
        teamSize: parseInt(formData.teamSize, 10) || 0,
        tools: formData.tools.map((tool) => ({
            name: tool.toolId,
            plan: tool.plan.toLowerCase().replace(/\s+/g, '_'),
            seats: parseInt(tool.seats, 10) || 0,
            monthlySpend: parseFloat(tool.spend) || 0, 
            useCase: tool.useCase.toLowerCase(), 
        }))
        };
        
        const res = await axios.post(`${BACKEND_URL}/audit` , {
            data : payload
        })

        setData(res.data)

        setFormData(DEFAULT_STATE);
        localStorage.removeItem("ai-stack-audit");
        setState("results");

      }catch(e: unknown){
        const message = e instanceof Error ? e.message : "An unexpected error occurred";
        toast.error(message, {
            className: "bg-slate-900 text-slate-50 border border-slate-800 font-bold text-[13px] shadow-sm",
            duration : 2000
        });
    }finally{
        setIsSubmitting(false);
    }
    
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-8 px-4 pb-16 font-sans relative">
      
      {/* Optional Full Page Overlay during submission */}
      {isSubmitting && (
        <div className="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[1px] pointer-events-none" />
      )}

      <div className="max-w-[660px] mx-auto relative z-20">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-[7px] mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 font-mono">Setup</span>
          </div>
          <h1 className="font-bold text-[clamp(20px,4.5vw,28px)] text-slate-900 m-0 mb-1 leading-tight">Audit Your Stack</h1>
          <p className="text-[13px] text-slate-500 m-0 leading-relaxed">
            Enter your current AI tools, plans, and spend. We'll find overlapping features, cheaper tier alternatives, and wasted seats.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* 1. Global Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-[22px] shadow-sm mb-4">
            <p className="font-semibold text-sm text-slate-900 m-0 mb-4">Team Overview</p>
            <div className="max-w-[200px]">
              <Label>Total Team Size</Label>
              <Input 
                type="number" 
                min="1" 
                placeholder="e.g. 10" 
                required
                disabled={isSubmitting}
                value={formData.teamSize}
                onChange={(e) => updateTeamSize(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Tool Stack */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-slate-900 m-0">Your Subscriptions</p>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.tools.length} tool{formData.tools.length !== 1 ? 's' : ''} added
              </span>
            </div>

            {formData.tools.map((tool) => (
              <div key={tool.id} className={`bg-white border border-slate-200 rounded-xl p-[22px] shadow-sm mb-3 relative group transition-opacity ${isSubmitting ? 'opacity-70' : ''}`}>
                
                {/* Remove button (visible if >1 tool) */}
                {formData.tools.length > 1 && !isSubmitting && (
                  <button 
                    type="button" 
                    onClick={() => removeTool(tool.id)}
                    className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Remove Tool"
                  >
                    ✕
                  </button>
                )}

                {/* Row 1: Tool & Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pr-6">
                  <div>
                    <Label>Tool</Label>
                    <div className="relative">
                      <Select 
                        value={tool.toolId}
                        disabled={isSubmitting}
                        onChange={(e) => updateTool(tool.id, "toolId", e.target.value)}
                      >
                        {Object.entries(TOOLS_CONFIG).map(([id, config]) => (
                          <option key={id} value={id}>{config.label}</option>
                        ))}
                      </Select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Plan</Label>
                    <div className="relative">
                      <Select 
                        value={tool.plan}
                        disabled={isSubmitting}
                        onChange={(e) => updateTool(tool.id, "plan", e.target.value)}
                      >
                        {TOOLS_CONFIG[tool.toolId]?.plans.map(plan => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </Select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Seats, Spend, & Use Case */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div>
                    <Label>Seats / Licenses</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="1"
                      required
                      disabled={isSubmitting}
                      value={tool.seats}
                      onChange={(e) => updateTool(tool.id, "seats", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Monthly Spend ($)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="0.00"
                      required
                      disabled={isSubmitting}
                      value={tool.spend}
                      onChange={(e) => updateTool(tool.id, "spend", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Primary Use Case</Label>
                    <div className="relative">
                      <Select 
                        value={tool.useCase}
                        disabled={isSubmitting}
                        onChange={(e) => updateTool(tool.id, "useCase", e.target.value)}
                      >
                        {USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
                      </Select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button 
              type="button" 
              onClick={addTool}
              disabled={isSubmitting}
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 border-dashed rounded-xl py-3 text-[13px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg leading-none">+</span> Add Another Tool
            </button>
          </div>

          {/* 3. Submit Actions */}
          <div className="bg-slate-900 rounded-xl p-[22px] border border-slate-800 flex items-center justify-between flex-wrap gap-4 mt-6">
            <div>
              <p className="font-bold text-base text-slate-50 m-0 mb-1">Ready to optimize?</p>
              <p className="text-[13px] text-slate-400 m-0">This takes ~5 seconds to run through our pricing engine.</p>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`bg-emerald-400 text-slate-900 border-none rounded-lg py-[11px] px-6 font-bold text-[13px] flex items-center gap-2 transition-all duration-200 ${
                isSubmitting ? 'opacity-80 cursor-wait' : 'cursor-pointer hover:bg-emerald-300'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Run Audit →"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}