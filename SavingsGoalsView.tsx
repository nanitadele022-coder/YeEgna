import React from "react";
import { SavingsGoal } from "../types";
import { Award, Target, Calendar, Sparkles, Star } from "lucide-react";

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  setGoals: (goals: SavingsGoal[]) => void;
  setShowAddGoal: (show: boolean) => void;
  setShowGoalDeposit: (goalId: string | null) => void;
}

export default function SavingsGoalsView({
  goals,
  setGoals,
  setShowAddGoal,
  setShowGoalDeposit,
}: SavingsGoalsViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn text-[#2D2421]">
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        
        {/* Banner header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-[#F7F2EB] pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#3C322E] flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600 animate-pulse" />
              <span>Our Shared Dreams & Vision Boards</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Every beautiful travel milestone, cozy cottage house, or cute future surprises starts with brief, dedicated savings commitments.
            </p>
          </div>
          <button
            id="add-savings-btn"
            onClick={() => setShowAddGoal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-pink-400 to-purple-400 shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-250 fill-amber-200" />
            <span>Enshrine New Dream</span>
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <span className="text-5xl block select-none">🕊️💎</span>
            <p className="text-sm text-slate-400 font-extrabold uppercase tracking-wide">
              No shared dream blocks exist
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Define your first romantic target (e.g. Traditional wedding suite or Honeymoon in Hawassa) to begin!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => {
              const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
              const isDone = g.completed || pct >= 100;

              return (
                <div
                  key={g.id}
                  className={`bg-gradient-to-br from-white via-[#FFF9FA] to-[#F5FAFF] border border-[#F4EBE3] rounded-[2.4rem] p-6.5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_40px_rgba(236,72,153,0.06)] group hover:translate-y-[-2px] ${
                    isDone ? "bg-gradient-to-br from-emerald-50/20 via-white to-green-50/20 border-emerald-200 shadow-[0_15px_30px_rgba(16,185,129,0.05)]" : ""
                  }`}
                >
                  {/* Complete Sparkle badge */}
                  {isDone && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-[10px] px-3.5 py-1.5 rounded-full font-black tracking-wider uppercase border border-emerald-200 shadow-sm animate-pulse">
                      Completed! ✨🍾
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-[#EFE8E1]">
                        {g.category === "Travel" ? "✈️" : g.category === "House" ? "🏡" : g.category === "Car" ? "🚗" : g.category === "Baby" ? "🍼" : g.category === "Wedding" ? "💍" : "🎁"}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#3C322E] leading-tight">
                          {g.title}
                        </h4>
                        <span className="inline-block mt-1 text-[9px] uppercase font-extrabold tracking-widest text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          {g.category} Target ✨
                        </span>
                      </div>
                    </div>

                    {/* Progress Slider track gauge */}
                    <div className="space-y-1.5 ring-offset-2">
                      <div className="flex justify-between items-baseline text-xs font-extrabold text-[#3C322E]">
                        <span>{g.savedAmount.toLocaleString()} Birr</span>
                        <span className="text-purple-600 font-serif italic text-sm">{pct}%</span>
                      </div>
                      
                      <div className="w-full h-3.5 bg-slate-150/45 rounded-full overflow-hidden border border-[#EFE8E1] p-0.5 shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 via-rose-350 to-indigo-400 rounded-full transition-all duration-700 relative"
                          style={{ width: `${pct}%` }}
                        >
                          <span className="absolute right-1 top-0.5 w-1 h-1 bg-white rounded-full animate-ping" />
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Pledge target: {g.targetAmount.toLocaleString()} Birr</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-355" /> {g.deadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-6 pt-4 border-t border-[#F2EAE0]/60 flex items-center justify-between gap-4">
                    <button
                      id={`del-goal-${g.id}`}
                      onClick={() => {
                        if (confirm("Delete this beautiful dream goal, sweethearts? 🥺")) {
                          setGoals(goals.filter((item) => item.id !== g.id));
                        }
                      }}
                      className="text-[10px] font-extrabold text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                    >
                      Cancel Target
                    </button>

                    <button
                      id={`deposit-goal-btn-${g.id}`}
                      onClick={() => setShowGoalDeposit(g.id)}
                      className={`px-4.5 py-2.5 text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isDone
                          ? "bg-slate-100 text-slate-400 border-slate-200"
                          : "bg-white text-purple-700 hover:bg-purple-100/40 border-purple-200"
                      }`}
                      disabled={isDone}
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                      Add Money to Goal
                    </button>
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
