import React from "react";
import { Transaction, SavingsGoal, Budget, CoupleProfile, AISuggestions } from "../types";
import CoupleIllustration from "./CoupleIllustration";
import { translations } from "../translations";
import {
  Heart,
  Sparkles,
  Award,
  TrendingUp,
  Wallet,
  ChevronRight,
  PlusCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownLeft,
  Gem
} from "lucide-react";

interface DashboardViewProps {
  profile: CoupleProfile;
  balances: { shared: number; wife: number; husband: number };
  hideBalances: boolean;
  transactions: Transaction[];
  goals: SavingsGoal[];
  budget: Budget;
  aiData: AISuggestions | null;
  loadingAi: boolean;
  getAISuggestions: () => void;
  setActiveTab: (tab: string) => void;
  setShowAddGoal: (show: boolean) => void;
  setShowAddTransaction: (show: boolean) => void;
  setShowGoalDeposit: (goalId: string | null) => void;
  selectedTip: string;
  language?: "en" | "am";
}

export default function DashboardView({
  profile,
  balances,
  hideBalances,
  transactions,
  goals,
  budget,
  aiData,
  loadingAi,
  getAISuggestions,
  setActiveTab,
  setShowAddGoal,
  setShowAddTransaction,
  setShowGoalDeposit,
  selectedTip,
  language = "en",
}: DashboardViewProps) {
  const t = translations[language];

  // Extract days together with warm dynamic calculations
  const daysTogether = Math.max(
    1,
    Math.round(
      (Date.now() - new Date(profile.anniversaryDate || "2024-10-12").getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Spends limits computations
  const totalSpend = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const budgetPct = Math.min(Math.round((totalSpend / budget.monthlyLimit) * 100), 100);

  return (
    <div className="space-y-8 animate-fadeIn text-[#2D2421]">
      {/* 1. ROMANTIC GREETING & HERO ILLUST Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFBF9] via-[#FFF6F3] to-[#F3F7FF] rounded-[2rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.02)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-pink-100/35 rounded-full filter blur-2xl pointer-events-none" />
          <div className="relative space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100/50 text-rose-600 text-[10px] font-bold tracking-wider uppercase">
              <Heart className="w-3 h-3 fill-current" />
              {t.daysSplendid.replace("{days}", daysTogether.toString())}
            </span>
            <h2 className="text-3xl font-serif font-black tracking-tight text-[#3C322E] leading-tight-nest">
              {t.cozyNest}
            </h2>
            <p className="text-xs text-slate-550 leading-relaxed font-sans font-semibold">
              {t.everyCupBuna}
            </p>
          </div>

          <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-100/25 text-[11px] text-rose-800/90 font-medium italic flex gap-2 items-start">
            <span className="text-base leading-none font-sans mt-0.5">🕊️</span>
            <span>{t.perfectPeace}</span>
          </div>
        </div>

        {/* ILLUSTRATION CARD */}
        <div id="illustration-card" className="lg:col-span-7 bg-white/50 backdrop-blur rounded-[2.5rem] p-2.5 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.02)] flex items-center justify-center">
          <CoupleIllustration wifeName={profile.wifeName} husbandName={profile.husbandName} />
        </div>
      </div>

      {/* 2. OUR WALLETS ROW */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest pl-1">
          {t.householdSpaces}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* JOINT WALLET CARD - PREMIUM FOIL SHINE LOOK */}
          <div id="joint-card" className="bg-gradient-to-tr from-[#FFF2F4] via-[#FFFFFF] to-[#EBF3FF] rounded-[2.2rem] p-7 border border-pink-100/70 shadow-[0_12px_28px_-6px_rgba(236,72,153,0.15),0_18px_36px_-4px_rgba(59,130,246,0.1)] relative overflow-hidden group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_45px_rgba(236,72,153,0.18)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-200/15 via-rose-200/5 to-transparent rounded-full filter blur-xl" />
            <div className="absolute top-4 right-4 text-xs select-none">✨💖✨</div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="px-3.5 py-1.5 bg-white/80 backdrop-blur rounded-2xl text-[#C03E60] text-xs font-extrabold tracking-tight border border-rose-100/40 shadow-sm flex items-center gap-1.5">
                {t.ourMoneySpace}
              </div>
              <span className="text-[10px] text-pink-600 bg-white/90 border border-pink-100 px-2.5 py-0.5 rounded-full font-bold">
                {t.jointNest}
              </span>
            </div>
            
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.ourSharedBalance}
            </p>
            <h2 className="text-3.5xl font-serif font-black text-[#2D2421] tracking-tight mt-1 items-baseline">
              {hideBalances ? "💖,💖💖" : `${balances.shared.toLocaleString()}`}
              <span className="text-xs font-sans font-extrabold text-[#7C716B] ml-1.5">Birr</span>
            </h2>

            <div className="mt-5 pt-4 border-t border-[#F2EAE0]/50 flex justify-between text-[11px] text-[#6E635F] font-semibold">
              <span>{t.primaryShared}</span>
              <span className="text-rose-600 animate-pulse font-extrabold">{t.liveNest}</span>
            </div>
          </div>

          {/* WIFE FUND CARD */}
          <div id="wife-card" className="bg-gradient-to-tr from-pink-50/45 via-white to-white rounded-[2.2rem] p-7 border border-pink-100/70 shadow-[0_12px_30px_-8px_rgba(236,72,153,0.06)] relative overflow-hidden group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(236,72,153,0.12)]">
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1.5 bg-pink-50 rounded-2xl text-[#C23C62] text-xs font-bold flex items-center gap-1">
                {t.wifeSpace.replace("{wife}", profile.wifeName)}
              </div>
              <span className="text-[10px] text-pink-500 bg-pink-50/55 px-2 py-0.5 rounded-full font-bold">
                {t.allowance}
              </span>
            </div>

            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.myMoneySpace}
            </p>
            <h2 className="text-3xl font-serif font-black text-[#2D2421] tracking-tight mt-1">
              {hideBalances ? "🌸,🌸🌸" : `${balances.wife.toLocaleString()}`}
              <span className="text-xs font-sans font-bold text-[#7C716B] ml-1">Birr</span>
            </h2>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>{t.individualTreats}</span>
              <span className="text-[#C23C62] font-semibold">{t.selfCarePot}</span>
            </div>
          </div>

          {/* HUSBAND FUND CARD */}
          <div id="husband-card" className="bg-gradient-to-tr from-blue-50/35 via-white to-white rounded-[2.2rem] p-7 border border-blue-100/30 shadow-[0_12px_30px_-8px_rgba(59,130,246,0.05)] relative overflow-hidden group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]">
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1.5 bg-blue-50 rounded-2xl text-[#2979C7] text-xs font-bold flex items-center gap-1">
                {t.husbandSpace.replace("{husband}", profile.husbandName)}
              </div>
              <span className="text-[10px] text-blue-500 bg-blue-50/50 px-2 py-0.5 rounded-full font-bold">
                {t.surprise}
              </span>
            </div>

            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.myMoneySpace}
            </p>
            <h2 className="text-3xl font-serif font-black text-[#2D2421] tracking-tight mt-1">
              {hideBalances ? "🧸,🧸🧸" : `${balances.husband.toLocaleString()}`}
              <span className="text-xs font-sans font-bold text-[#7C716B] ml-1">Birr</span>
            </h2>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>{t.husbandSecret}</span>
              <span className="text-[#2979C7] font-semibold">{t.surprisePot}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI SYNERGY INSIGHTS */}
      <div id="ai-smart-spot" className="bg-gradient-to-tr from-[#1D1724] via-[#2A1B33] to-[#121124] text-white rounded-[2.8rem] p-7 sm:p-9 border border-[#483354] shadow-[0_25px_50px_rgba(42,27,51,0.25)] relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-pink-500/10 to-transparent text-pink-500 pointer-events-none" />
        <div className="absolute top-4 right-10 animate-spin-slow text-yellow-300/40 text-xl font-black font-serif">✦</div>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ECC1FF]">
            {t.aiInsights}
          </span>
        </div>

        {!aiData && !loadingAi && (
          <div className="space-y-4">
            <p className="text-sm sm:text-base font-medium text-slate-205 max-w-xl leading-relaxed">
              {t.letGemini}
            </p>
            <button
              id="trigger-ai-btn"
              onClick={getAISuggestions}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-[#8C6239] text-white shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.generateAiGuide}</span>
            </button>
          </div>
        )}

        {loadingAi && (
          <div className="py-10 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-4 border-[#ECC1FF]/20 border-t-pink-400 animate-spin" />
            <p className="text-xs text-pink-200 font-bold uppercase tracking-wider animate-pulse">
              {t.geminiCombing}
            </p>
          </div>
        )}

        {aiData && !loadingAi && (
          <div className="space-y-6 animate-fadeIn">
            {/* Executive summary block */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#EFE8E1]/80 mb-1">
                {t.ourCoPilotDecree}
              </p>
              <p className="text-xs sm:text-xs leading-relaxed text-slate-205 font-medium">
                "{aiData.analysis}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>💡</span> {t.recommendationKeys}
                </p>
                <ul className="space-y-2">
                  {aiData.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-pink-400 font-extrabold mt-0.5">✔</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>☕</span> {t.traditionalBunaTalks}
                </p>
                <ul className="space-y-2">
                  {aiData.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed italic">
                      <span className="text-yellow-300 mt-0.5 font-sans">★</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-slate-300 gap-3">
              <p className="flex items-center gap-1.5 font-semibold">
                {t.highestSpends}{" "}
                <span className="text-pink-300 font-black underline capitalize">{aiData.highestSpendingCategory}</span>
              </p>
              <button
                id="re-trigger-ai-btn"
                onClick={getAISuggestions}
                className="text-[10px] font-black uppercase text-pink-200 bg-white/10 hover:bg-white/25 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                {t.recalculateSynergy}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. DUAL LAYOUT: SHARED SAVINGS + SPENDING PLAN Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Savings Goals Overview */}
        <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold text-[#3C322E] flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span>{t.ourJointVision}</span>
              </h3>
              <button
                id="view-all-savings-btn"
                onClick={() => setActiveTab("savings")}
                className="text-xs font-extrabold text-pink-600 hover:text-pink-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{t.flyToDreams}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-bold text-slate-700">
                      <span>{g.title}</span>
                      <span className="text-purple-600 font-serif italic text-sm">{pct}%</span>
                    </div>
                    {/* Thin elegant bar */}
                    <div className="w-full h-2 bg-[#FAF6F2] rounded-full overflow-hidden border border-[#EFE8E1]">
                      <div
                        className="h-full bg-gradient-to-r from-pink-300 via-rose-300 to-purple-400 transition-all duration-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{t.saved} {g.savedAmount.toLocaleString()} Birr</span>
                      <span>{t.target} {g.targetAmount.toLocaleString()} Birr</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              id="add-savings-dash-btn"
              onClick={() => setShowAddGoal(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-purple-200 text-purple-600 text-xs font-extrabold hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addNewVision}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Spends plan snapshot */}
        <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold text-[#3C322E] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>{t.ourSpendingHealth}</span>
              </h3>
              <button
                id="view-all-reports-btn"
                onClick={() => setActiveTab("reports")}
                className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{language === "en" ? "Full charts" : "ሙሉ የወጪ ታሪክ"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#F5F9FC] via-white to-pink-50/20 p-5 rounded-[1.8rem] border border-blue-50/60 mb-5 text-slate-700">
              <div className="flex justify-between text-xs font-extrabold text-slate-800 mb-2">
                <span>{language === "en" ? "Joint Limit Buffer" : "አጠቃላይ ካፒታል (ወሰን)"}</span>
                <span>{budgetPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r transition-all duration-500 rounded-full ${
                    budgetPct > 90
                      ? "from-red-400 to-rose-400"
                      : budgetPct > 70
                      ? "from-amber-300 to-pink-400"
                      : "from-blue-300 to-purple-400"
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>{t.used} {totalSpend.toLocaleString()} Birr</span>
                <span>{t.limitCap} {budget.monthlyLimit.toLocaleString()} Birr</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                {t.categoryBudgets}
              </p>
              {Object.entries(budget.categoryLimits)
                .slice(0, 3)
                .map(([cat, limit]) => {
                  const used = transactions
                    .filter((t) => t.type === "expense" && t.category === cat)
                    .reduce((sum, t) => sum + Number(t.amount), 0);
                  return (
                    <div key={cat} className="flex justify-between items-center text-xs text-slate-600 py-1.5 border-b border-dashed border-slate-100 last:border-0 last:pb-0">
                      <span className="font-bold text-slate-700">{cat}</span>
                      <div className="text-right">
                        <span className="font-extrabold text-[#3C322E]">{used.toLocaleString()} Birr</span>
                        <span className="text-[10px] text-slate-400"> {t.of} {limit.toLocaleString()} Birr</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100/80 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>{t.capsActive}</span>
            <button
              id="manage-budget-link"
              onClick={() => setActiveTab("profile")}
              className="text-[#B03C30] font-black hover:underline cursor-pointer"
            >
              {t.adjustCeilings}
            </button>
          </div>
        </div>
      </div>

      {/* 5. COZY LEDGER MINI RECORD TRAIL */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-extrabold text-[#3C322E] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-pink-400 animate-wiggle" />
            <span>{t.cozyLedgerLines}</span>
          </h3>
          <button
            id="view-all-trans-btn"
            onClick={() => setActiveTab("expenses")}
            className="text-xs font-extrabold text-pink-600 hover:text-pink-700 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{t.completeHistory}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-semibold">
            {t.noEntriesYet}
          </div>
        ) : (
          <div className="divide-y divide-[#F7F2EB]">
            {transactions.slice(0, 4).map((tr) => {
              const formattedAmt = tr.amount.toLocaleString();
              const walletLabel = tr.wallet === "shared" 
                ? (language === "en" ? "Our Money Space" : "የጋራ የገንዘብ ማቆያ")
                : (language === "en" ? "My Money Space" : "የግል የገንዘብ ማቆያ");
              const categoryLabel = tr.category === "Income"
                ? (language === "en" ? "Money In" : "ገቢ")
                : tr.category === "Savings Contribution"
                ? (language === "en" ? "Saved Spend" : "ለህልም የተቀመጠ")
                : tr.category;
              const renderedBy = language === "en"
                ? `by ${tr.addedBy === "wife" ? profile.wifeName : profile.husbandName}`
                : `በ ${tr.addedBy === "wife" ? profile.wifeName : profile.husbandName}`;

              return (
                <div key={tr.id} className="py-4 flex items-center justify-between gap-4 transition hover:bg-slate-50/40 rounded-xl px-2 group">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold select-none shrink-0 ${
                      tr.type === "income"
                        ? "bg-[#EBF7F2] text-green-700"
                        : tr.type === "savings"
                        ? "bg-[#FAF0FC] text-purple-700"
                        : "bg-[#FFF0EF] text-rose-700"
                    }`}>
                      {tr.type === "income" ? "📈" : tr.type === "savings" ? "💎" : "💸"}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#3C322E] leading-snug">
                        {tr.notes}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                        <span className="font-extrabold uppercase bg-slate-100/80 text-slate-500 px-1.5 py-0.5 rounded">
                          {walletLabel}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-bold">
                          {categoryLabel}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{tr.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-sm font-black ${
                      tr.type === "income" ? "text-green-600" : "text-slate-800"
                    }`}>
                      {tr.type === "income" ? "+" : "-"}{formattedAmt} <span className="text-[10px] font-sans font-bold text-slate-400">Birr</span>
                    </span>
                    <p className="text-[9px] text-[#C03E60] font-bold italic mt-0.5">
                      {renderedBy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
