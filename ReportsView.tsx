import React from "react";
import { Transaction, CoupleProfile, Budget, ExpenseCategory } from "../types";
import { PieChart, TrendingUp, Sparkles, AlertCircle, Heart } from "lucide-react";

interface ReportsViewProps {
  profile: CoupleProfile;
  transactions: Transaction[];
  budget: Budget;
  catSpending: Record<string, number>;
  maxCategorySpendingValue: number;
  partnersSpending: { wifeTotal: number; husbandTotal: number };
  setActiveTab: (tab: string) => void;
}

export default function ReportsView({
  profile,
  transactions,
  budget,
  catSpending,
  maxCategorySpendingValue,
  partnersSpending,
  setActiveTab,
}: ReportsViewProps) {
  // Summing key totals
  const totalIn = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalOut = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDreams = transactions
    .filter((t) => t.type === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPartners = partnersSpending.wifeTotal + partnersSpending.husbandTotal || 1;
  const wifePct = Math.round((partnersSpending.wifeTotal / totalPartners) * 100);
  const husbandPct = 100 - wifePct;

  return (
    <div className="space-y-6 animate-fadeIn text-[#2D2421]">
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-serif font-black text-[#3C322E] flex items-center gap-2">
            <PieChart className="w-6 h-6 text-pink-500 animate-spin-slow" />
            <span>Grand Financial Insights Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Visual checks on spending speeds, spouse splits, and category savings plans for {profile.wifeName} & {profile.husbandName}.
          </p>
        </div>

        {/* 1. THREE COLUMN KPI COUNTER */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-[#F4FAF6] to-white p-5 rounded-2xl border border-green-100">
            <p className="text-[10px] font-extrabold text-[#527E6A] uppercase tracking-widest">
              Total Recorded Inflow
            </p>
            <p className="text-xl font-serif font-black text-green-700 mt-1">
              {totalIn.toLocaleString()} <span className="text-[11px] font-sans font-bold text-slate-400">Birr</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FFF0EF] to-white p-5 rounded-2xl border border-rose-100">
            <p className="text-[10px] font-extrabold text-[#B03C30] uppercase tracking-widest">
              Total Outflow spend
            </p>
            <p className="text-xl font-serif font-black text-rose-700 mt-1">
              {totalOut.toLocaleString()} <span className="text-[11px] font-sans font-bold text-slate-400">Birr</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FCF5FF] to-white p-5 rounded-2xl border border-purple-100">
            <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest">
              Secured in Dreams
            </p>
            <p className="text-xl font-serif font-black text-purple-700 mt-1">
              {totalDreams.toLocaleString()} <span className="text-[11px] font-sans font-bold text-slate-400">Birr</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FFFBF2] to-white p-5 rounded-2xl border border-amber-150">
            <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
              Harmony factor
            </p>
            <p className="text-xl font-serif font-black text-amber-700 mt-1 flex items-center gap-1">
              96% <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline-block animate-pulse" />
            </p>
          </div>
        </div>

        {/* 2. MAIN CHARTS COMPARISON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* Category progressive scales */}
          <div className="lg:col-span-7 bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-5">
            <div>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Our Category Spend boards
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Live monitoring of monthly expenditure levels compared to preset thresholds.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(catSpending).map(([cat, amount]) => {
                const limitVal = budget.categoryLimits[cat as ExpenseCategory] || 100;
                const progressPct = Math.min(Math.round((amount / limitVal) * 105), 100);
                const overLimit = amount > limitVal;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-extrabold text-slate-700">{cat}</span>
                      <div className="space-x-1">
                        <span className={`font-serif italic font-bold ${overLimit ? "text-red-650" : "text-slate-800"}`}>
                          {amount.toLocaleString()} Birr
                        </span>
                        <span className="text-[10px] text-slate-400">/ limit {limitVal.toLocaleString()} Birr</span>
                      </div>
                    </div>

                    {/* Progress Slider track */}
                    <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-slate-100 flex shadow-inner">
                      <div
                        className={`h-full bg-gradient-to-r rounded-full transition-all duration-300 ${
                          overLimit
                            ? "from-red-400 via-rose-500 to-red-600"
                            : "from-pink-200 via-rose-300 to-indigo-300"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User splitting charts */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="bg-white border border-[#F4EBE3] shadow-[0_12px_32px_rgba(45,36,32,0.02)] p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-black text-[#3C322E] uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                <span>Spouse record weights</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                A friendly display of registered logs weights. Remember: in true love finance has absolutely zero splits!
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-tr from-[#FFF2F4] via-white to-white p-4 rounded-2xl border border-pink-100/70 text-center shadow-[0_8px_20px_-4px_rgba(236,72,153,0.05)]">
                  <span className="text-2xl block mb-1">👩🏼</span>
                  <p className="text-xs font-black text-[#3C322E]">{profile.wifeName}</p>
                  <h4 className="text-base font-serif font-black text-pink-600 mt-0.5">
                    {partnersSpending.wifeTotal.toLocaleString()} <span className="text-[9px] font-sans font-bold text-slate-400">Birr</span>
                  </h4>
                </div>

                <div className="bg-gradient-to-tr from-[#EBF3FF] via-white to-white p-4 rounded-2xl border border-blue-100/40 text-center shadow-[0_8px_20px_-4px_rgba(59,130,246,0.04)]">
                  <span className="text-2xl block mb-1">👨🏼</span>
                  <p className="text-xs font-black text-[#3C322E]">{profile.husbandName}</p>
                  <h4 className="text-base font-serif font-black text-blue-600 mt-0.5">
                    {partnersSpending.husbandTotal.toLocaleString()} <span className="text-[9px] font-sans font-bold text-slate-400">Birr</span>
                  </h4>
                </div>
              </div>

              {/* Splits graphic bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] font-extrabold text-[#6E635F]">
                  <span className="text-pink-600">🌸 {profile.wifeName} ({wifePct}%)</span>
                  <span className="text-blue-600">🧸 {profile.husbandName} ({husbandPct}%)</span>
                </div>
                
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex p-0.5 shadow-inner relative">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-l-full transition-all duration-700 relative flex items-center justify-end pr-1"
                    style={{ width: `${wifePct}%` }}
                  >
                    {wifePct > 15 && (
                      <span className="text-[8px] font-black leading-none select-none text-white p-0.5 bg-white/20 rounded-full">
                        👩🏼
                      </span>
                    )}
                  </div>
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-r-full transition-all duration-700 relative flex items-center pl-1"
                    style={{ width: `${husbandPct}%` }}
                  >
                    {husbandPct > 15 && (
                      <span className="text-[8px] font-black leading-none select-none text-white p-0.5 bg-white/20 rounded-full">
                        👨🏼
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action prompts to AI */}
            <div className="bg-gradient-to-br from-[#FFF8F5] via-[#FCF4EE] to-[#F1F6FE] p-6 rounded-3xl border border-rose-100/50 text-center space-y-3 shadow-inner">
              <span className="text-2xl block">💡</span>
              <h5 className="text-xs font-black text-[#3C322E]">Want active custom advisor?</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Connect dynamically! Let Gemini inspect your limits ratios and suggest bespoke savings guidelines.
              </p>
              <button
                id="reports-ai-btn"
                onClick={() => {
                  setActiveTab("dashboard");
                  setTimeout(() => {
                    const btn = document.getElementById("trigger-ai-btn");
                    if (btn) btn.click();
                  }, 150);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-purple-700 text-xs font-extrabold rounded-xl border border-purple-100 text-center shadow hover:bg-slate-50 transition cursor-pointer"
              >
                Launch Gemini synergy advice
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
