import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-900 rounded-3xl shadow-xl border border-slate-800/50 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = "primary", className = "" }: { onClick?: () => void, children?: React.ReactNode, variant?: "primary" | "secondary" | "danger", className?: string }) => {
    const base = "w-full py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.97]";
    const variants = {
        primary: "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-900/20",
        secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
        danger: "bg-rose-950/30 text-rose-500 hover:bg-rose-900/40 border border-rose-900/30"
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

export const InputGroup = ({ label, value, onChange, type = "number", placeholder = "" }: { label: string, value: string | number, onChange: (val: string) => void, type?: string, placeholder?: string }) => (
  <div className="mb-5">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-white font-medium"
    />
  </div>
);

export const ResultBox = ({ title, value, subtext, colorClass = "text-white" }: { title: string, value: string, subtext?: string, colorClass?: string }) => (
    <div className="mt-8 p-6 bg-slate-800/50 rounded-3xl border border-slate-800 text-center animate-fade-in shadow-inner">
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1.5">{title}</div>
        <div className={`text-3xl font-heading font-extrabold ${colorClass}`}>{value}</div>
        {subtext && <div className="text-sm text-slate-400 mt-1.5 font-bold">{subtext}</div>}
    </div>
);