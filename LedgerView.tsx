import React, { useState } from "react";
import { Transaction, CoupleProfile } from "../types";
import { Plus, Trash2, Calendar, Filter, FileText } from "lucide-react";

interface LedgerViewProps {
  profile: CoupleProfile;
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  setShowAddTransaction: (show: boolean) => void;
  activePartnerRole: "wife" | "husband";
}

export default function LedgerView({
  profile,
  transactions,
  setTransactions,
  setShowAddTransaction,
  activePartnerRole,
}: LedgerViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "shared" | "personal_wife" | "personal_husband">("all");

  const filtered = transactions.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "shared") return t.wallet === "shared";
    if (activeFilter === "personal_wife") return t.wallet === "wife";
    if (activeFilter === "personal_husband") return t.wallet === "husband";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-[#2D2421]">
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#F7F2EB] pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#3C322E]">Grand Ledger of Togetherness</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Complete chronicles of combined deposits, household expenditures, and mutual savings holdings.
            </p>
          </div>
          <button
            id="ledger-add-btn"
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-pink-400 to-blue-400 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Money Activity 🌸</span>
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all" ? "bg-[#3C322E] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Logs ({transactions.length})
          </button>
          <button
            onClick={() => setActiveFilter("shared")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "shared" ? "bg-pink-100 text-pink-700 font-black" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            Our Money Space
          </button>
          <button
            onClick={() => setActiveFilter("personal_wife")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "personal_wife" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {profile.wifeName}'s Account
          </button>
          <button
            onClick={() => setActiveFilter("personal_husband")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "personal_husband" ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {profile.husbandName}'s Account
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <span className="text-5xl block select-none">📔</span>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
              No registered logs found in this scope
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Add a dynamic expense or income line to initialize transactions records for this active filter!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] text-slate-400 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/40">
              <span className="font-bold">Displaying {filtered.length} entries</span>
              <span>Active Partner role: <strong className="text-rose-600 font-extrabold">{activePartnerRole === "wife" ? profile.wifeName : profile.husbandName} 💍</strong></span>
            </div>

            <div className="divide-y divide-[#FAF6F2]">
              {filtered.map((t) => {
                const isIncome = t.type === "income";
                const isSavings = t.type === "savings";
                return (
                  <div
                    key={t.id}
                    className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/40 px-3.5 rounded-2xl transition duration-150 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Styled decorative tags */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg select-none shrink-0 border shadow-sm ${
                        isIncome
                          ? "bg-green-50/50 border-green-100 text-green-700"
                          : isSavings
                          ? "bg-purple-50/50 border-purple-100 text-purple-700"
                          : "bg-pink-50/50 border-pink-100 text-pink-700"
                      }`}>
                        {isIncome ? "🌸" : isSavings ? "💎" : "🌹"}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#3C322E] leading-snug">
                          {t.notes}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-2 font-medium">
                          <span className="bg-slate-100 text-[#3C322E] ml-0.5 px-2 py-0.5 rounded font-extrabold uppercase">
                            {t.wallet === "shared" ? "Our Money Space" : t.wallet === "wife" ? `${profile.wifeName}’s Space` : `${profile.husbandName}’s Space`}
                          </span>
                          <span>•</span>
                          <span className="bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded font-bold">
                            {t.category === "Income" ? "Money In" : t.category === "Savings Contribution" ? "Saved Spend" : t.category}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-350" /> {t.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100/50">
                      <div className="text-left sm:text-right">
                        <span className={`text-base font-black ${
                          isIncome ? "text-green-600" : "text-[#2D2421]"
                        }`}>
                          {isIncome ? "+" : "-"}{Number(t.amount).toLocaleString()} <span className="text-[11px] font-sans font-bold text-slate-400">Birr</span>
                        </span>
                        <p className="text-[10px] text-pink-500 font-semibold italic">
                          by {t.addedBy === "wife" ? profile.wifeName : profile.husbandName}
                        </p>
                      </div>

                      <button
                        id={`del-tx-${t.id}`}
                        onClick={() => {
                          if (confirm("Delete this sweet entry from our joint ledger records? 🥺")) {
                            setTransactions(transactions.filter((tx) => tx.id !== t.id));
                          }
                        }}
                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-xl text-[10px] font-extrabold text-[#D93D5B] bg-[#FFF0EF] hover:bg-[#D93D5B] hover:text-white transition-all cursor-pointer border border-rose-150/40"
                        title="Remove registry row"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
