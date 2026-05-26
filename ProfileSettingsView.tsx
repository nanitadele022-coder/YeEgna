import React from "react";
import { CoupleProfile, Budget } from "../types";
import { User, Settings, ShieldAlert, Heart, Wallet, Sparkles } from "lucide-react";

interface ProfileSettingsViewProps {
  profile: CoupleProfile;
  setProfile: (profile: CoupleProfile) => void;
  budget: Budget;
  setBudget: (budget: Budget) => void;
}

export default function ProfileSettingsView({
  profile,
  setProfile,
  budget,
  setBudget,
}: ProfileSettingsViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn text-[#2D2421]">
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-serif font-black text-[#3C322E] flex items-center gap-2">
            <User className="w-5.5 h-5.5 text-pink-500 animate-wiggle" />
            <span>Our Shared Sanctuary Profiles</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Customize spouse identities, custom signatures emojis, combined spending plan thresholds, and administrative setups.
          </p>
        </div>

        {/* 1. SPOUSE DETAILS ENTRY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-5 border-t border-[#F2EAE0]">
          
          {/* Wife Panel */}
          <div className="bg-[#FFF0F2] p-5.5 rounded-3xl border border-pink-100/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl select-none">🌸</span>
              <h3 className="text-xs font-extrabold text-[#C23C62] uppercase tracking-widest">
                Wife’s Identity Settings
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-550 uppercase tracking-widest mb-1.5 pl-0.5">
                  Wife’s Name
                </label>
                <input
                  id="profile-wife-name"
                  type="text"
                  value={profile.wifeName}
                  onChange={(e) => setProfile({ ...profile, wifeName: e.target.value })}
                  className="w-full bg-white border border-pink-200/50 focus:border-pink-400 rounded-xl px-4 py-2.5 text-xs outline-none font-bold text-slate-800 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-550 uppercase tracking-widest mb-1.5 pl-0.5">
                  Signature Emoji Accent
                </label>
                <input
                  id="profile-wife-sig"
                  type="text"
                  value={profile.avatarWife}
                  onChange={(e) => setProfile({ ...profile, avatarWife: e.target.value })}
                  className="w-14 text-center bg-white border border-pink-200/50 focus:border-pink-400 rounded-xl px-3 py-2 text-xs outline-none font-bold shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Husband Panel */}
          <div className="bg-[#EAF5FF] p-5.5 rounded-3xl border border-blue-100/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl select-none">🧸</span>
              <h3 className="text-xs font-extrabold text-[#2979C7] uppercase tracking-widest">
                Husband’s Identity Settings
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-555 uppercase tracking-widest mb-1.5 pl-0.5">
                  Husband’s Name
                </label>
                <input
                  id="profile-husband-name"
                  type="text"
                  value={profile.husbandName}
                  onChange={(e) => setProfile({ ...profile, husbandName: e.target.value })}
                  className="w-full bg-white border border-blue-200/50 focus:border-blue-400 rounded-xl px-4 py-2.5 text-xs outline-none font-bold text-slate-800 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-555 uppercase tracking-widest mb-1.5 pl-0.5">
                  Signature Emoji Accent
                </label>
                <input
                  id="profile-husband-sig"
                  type="text"
                  value={profile.avatarHusband}
                  onChange={(e) => setProfile({ ...profile, avatarHusband: e.target.value })}
                  className="w-14 text-center bg-white border border-blue-200/50 focus:border-blue-400 rounded-xl px-3 py-2 text-xs outline-none font-bold shadow-inner"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 2. SPENDING PLANS CONFIGS */}
        <div className="bg-slate-50 p-6 rounded-[2.2rem] border border-slate-200/50 mt-8 space-y-5 shadow-inner">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
                👑 Configure Dynamic Spending plans (Monthly Goals)
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Establish custom limits to trigger sweet alerts when your joint money out approaches thresholds!
              </p>
            </div>
          </div>

          {/* Overall Month Limit input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1.5 max-w-sm">
            <label className="block text-[11px] font-extrabold text-slate-600">
              Combined Max Monthly Nest Spending (Birr)
            </label>
            <input
              id="profile-monthly-limit"
              type="number"
              value={budget.monthlyLimit}
              onChange={(e) => setBudget({ ...budget, monthlyLimit: Number(e.target.value) })}
              className="w-full bg-[#FAF8F5] border border-slate-150 focus:border-pink-355 rounded-xl px-4 py-2.5 text-xs outline-none font-extrabold"
            />
          </div>

          {/* Category specific limits */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {Object.entries(budget.categoryLimits).map(([cat, limit]) => (
              <div key={cat} className="space-y-1.5 bg-white p-4 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{cat} Plan Cap (Birr)</label>
                <input
                  id={`limit-input-${cat}`}
                  type="number"
                  value={limit}
                  onChange={(e) => {
                    const updatedLimits = { ...budget.categoryLimits, [cat]: Number(e.target.value) };
                    setBudget({ ...budget, categoryLimits: updatedLimits });
                  }}
                  className="w-full bg-[#FAF8F5] border border-slate-150 focus:border-purple-350 rounded-lg px-3 py-2 text-xs outline-none font-extrabold text-right"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. ADMINISTRATION SYSTEM CONTROLS */}
        <div className="bg-gradient-to-br from-[#FFF0EF] via-[#FFFBFB] to-transparent p-6 rounded-[2.2rem] border border-rose-150/45 mt-8 relative space-y-2">
          <div className="flex items-center gap-2 text-[#B03C30]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-widest">
              System Administration Details
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xl pl-0.5">
            Resetting clears the financial summaries and dream progress records in live browser storage, restoring initial Ethiopian presets (Belen & Michael dummy events) for audit reviews.
          </p>
          <div className="pt-2 pl-0.5">
            <button
              id="reset-demo-all"
              onClick={() => {
                if (confirm("Reset current profiles, ledger logs, and savings progress to default Ethiopian presets? 🥺")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-5 py-2.5 bg-[#FFF0EF] text-[#D93D5B] hover:bg-[#D93D5B] hover:text-white text-[11px] font-extrabold rounded-xl border border-rose-150/60 transition-all cursor-pointer"
            >
              Reset Sanctuary to default Ethiopian couples presets
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
