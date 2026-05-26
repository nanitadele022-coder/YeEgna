import React, { useState } from "react";
import { CoupleProfile, BunaDate } from "../types";
import { translations } from "../translations";
import { Coffee, Plus, Calendar, User, Check, Heart, Trash2, Award, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BunaDateTrackerProps {
  language: "en" | "am";
  profile: CoupleProfile;
  bunaDates: BunaDate[];
  activePartnerRole: "wife" | "husband";
  onAddBunaDate: (date: string, brewer: "wife" | "husband", notes: string) => Promise<void>;
  onDeleteBunaDate: (id: string) => Promise<void>;
}

export default function BunaDateTracker({
  language,
  profile,
  bunaDates,
  activePartnerRole,
  onAddBunaDate,
  onDeleteBunaDate,
}: BunaDateTrackerProps) {
  const t = translations[language];
  const [showForm, setShowForm] = useState(false);
  const [dateVal, setDateVal] = useState(new Date().toISOString().split("T")[0]);
  const [brewerVal, setBrewerVal] = useState<"wife" | "husband">(activePartnerRole);
  const [notesVal, setNotesVal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Derive a dynamic "Buna Connection Meter"
  const count = bunaDates.length;
  const levelPercent = Math.min(count * 20, 100); // 5 ceremonies = 100%
  
  let statusBadge = "🌱 Cozy Beginnings";
  let statusColor = "text-amber-600 bg-amber-50 border-amber-200";
  if (language === "am") statusBadge = "🌱 ጅምር ፍቅር";

  if (count >= 5) {
    statusBadge = language === "en" ? "👑 Ultimate Harmony Peak!" : "👑 ፍጹም የፍቅር ስምምነት!";
    statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse";
  } else if (count >= 3) {
    statusBadge = language === "en" ? "🔥 Radiant Sweet Bonding" : "🔥 ምርጥ መስተጋብር";
    statusColor = "text-pink-600 bg-pink-50 border-pink-100";
  } else if (count >= 1) {
    statusBadge = language === "en" ? "☕ Warm Alignment Rising" : "☕ የሃሳብ መግባባት";
    statusColor = "text-[#8D6E63] bg-[#EFEBE9] border-[#D7CCC8]";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesVal.trim()) {
      alert(language === "en" ? "Please fill what you agreed under the buna steam! ☕" : "እባክዎን በቡናው ጢስ ስር የተስማማችሁበትን አጭር ማስታወሻ ይጻፉ! ☕");
      return;
    }
    setSubmitting(true);
    try {
      await onAddBunaDate(dateVal, brewerVal, notesVal.trim());
      setNotesVal("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="buna-harmony-container" className="bg-[#FAF6F2] rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)] space-y-6 relative overflow-hidden">
      
      {/* Soft traditional Habesha tricolor background border accent (Pinterest-style luxury) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex select-none">
        <div className="w-1/3 h-full bg-[#138808]/40" /> {/* soft green */}
        <div className="w-1/3 h-full bg-[#FCD116]/40" /> {/* soft yellow */}
        <div className="w-1/3 h-full bg-[#CD2A3E]/40" /> {/* soft red */}
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E2D4C9] to-[#8C6239] text-white flex items-center justify-center shadow-md select-none relative group">
            <span className="text-2xl filter drop-shadow">☕</span>
            <span className="absolute -top-1 -right-1 text-xs animate-ping">🍿</span>
          </div>
          <div>
            <h3 className="text-base text-stone-800 font-serif font-black tracking-tight flex items-center gap-1.5">
              <span>{t.bunaDateHarmony}</span>
            </h3>
            <p className="text-[10px] text-stone-500 font-semibold max-w-md mt-0.5 leading-relaxed">
              {t.bunaDatesSub}
            </p>
          </div>
        </div>

        <button
          id="toggle-buna-form-btn"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#8C6239] hover:bg-[#704E2D] text-white text-[11px] font-black rounded-xl shadow transition duration-200 flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          {showForm ? (
            <span>Close</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{t.logNewBunaTitle}</span>
            </>
          )}
        </button>
      </div>

      {/* Traditional introduction card */}
      <div className="bg-white/60 rounded-2xl p-4 border border-[#F2EAE0] text-xs leading-relaxed text-[#5D4037] flex items-start gap-2.5">
        <span className="text-lg shrink-0">🍿🌿</span>
        <p className="font-semibold italic">
          {t.bunaExplain}
        </p>
      </div>

      {/* Harmony Level Section */}
      <div className="bg-white rounded-3xl p-5 border border-[#F2EAE0] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              {t.bunaHarmonyLevel}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-serif font-black text-stone-800">{levelPercent}%</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border leading-none ${statusColor}`}>
                {statusBadge}
              </span>
            </div>
          </div>
          <div className="text-right text-[11px] font-bold text-stone-600">
            <span>{bunaDates.length} {language === "en" ? "Buna Ceremonies Logs" : "ቡናዎች ተመዝግበዋል"}</span>
          </div>
        </div>

        {/* Custom luxury agreement slide bar */}
        <div className="w-full h-3 bg-[#F5EBE6] rounded-full overflow-hidden border border-[#EBE1D9] relative">
          <div
            className="h-full bg-gradient-to-r from-[#D7CCC8] via-[#8D6E63] to-[#5D4037] rounded-full transition-all duration-1000"
            style={{ width: `${levelPercent}%` }}
          />
          {/* Subtle bubbles/steam */}
          <div className="absolute top-0 right-[20%] text-[8px] animate-bounce select-none">💭</div>
        </div>
      </div>

      {/* COLLAPSIBLE LOG FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-[#F2EAE0] space-y-4 shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-[#FAF6F2] pb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-700">
                  {t.logNewBunaTitle}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider pl-0.5">
                    {t.bunaTalkDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={dateVal}
                    onChange={(e) => setDateVal(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E9E1D8] focus:border-[#8C6239] rounded-xl px-3 py-2 text-xs font-bold text-slate-880 outline-none"
                  />
                </div>

                {/* Who Prepared */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider pl-0.5">
                    {t.whoBrewed}
                  </label>
                  <select
                    value={brewerVal}
                    onChange={(e) => setBrewerVal(e.target.value as any)}
                    className="w-full bg-[#FDFBF7] border border-[#E9E1D8] focus:border-[#8C6239] rounded-xl px-3 py-2 text-xs font-bold text-slate-880 outline-none"
                  >
                    <option value="wife">🌸 {profile.wifeName} (Wife)</option>
                    <option value="husband">🧸 {profile.husbandName} (Husband)</option>
                  </select>
                </div>
              </div>

              {/* What We Agreed / Shared Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider pl-0.5">
                  {t.steamAgreements}
                </label>
                <textarea
                  required
                  rows={2}
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  placeholder={language === "en" ? "e.g., agreed to reduce clothing expenses, had coffee together 💖" : "ምሳሌ፦ አብረን ቡና ጠጥተን የወር የልብስ ወጪ ለመቀነስ ተስማማን 💖"}
                  className="w-full bg-[#FDFBF7] border border-[#E9E1D8] focus:border-[#8C6239] rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-850 outline-none placeholder:text-stone-400"
                />
                <span className="text-[9px] text-stone-400 font-medium pl-0.5 block italic">{t.steamExplain}</span>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#8C6239] hover:bg-[#704E2D] disabled:opacity-50 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveBunaDate}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIST OF BUNA DATES */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Buna Logs Shared History" : "የቡና ሰዓቶች ታሪክ"}</span>
        </h4>

        {bunaDates.length === 0 ? (
          <div className="bg-white/50 rounded-2.5xl p-6 text-center text-xs text-stone-400 font-semibold border border-dashed border-[#F2EAE0]">
            {t.noBunaDatesYet}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {bunaDates.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 border border-[#F2EAE0] hover:shadow-md transition duration-300 flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-amber-800 flex items-center justify-center text-base font-black border border-[#F1E0CE] shrink-0 select-none">
                    ☕
                  </div>
                  <div className="space-y-1">
                    <p className="text-[#5D4037] text-xs font-black leading-snug">
                      "{b.notes}"
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold">
                      <span className="bg-[#FAF0E6] text-[#8C6239] px-2 py-0.5 rounded-md text-[9px]">
                        Brewed: {b.brewer === "wife" ? profile.wifeName : profile.husbandName}
                      </span>
                      <span>•</span>
                      <span>{b.date}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(language === "en" ? "Remove this sweet Buna session?" : "ይህን የቡና ቀን መዝገብ ማጥፋት ይፈልጋሉ?")) {
                      onDeleteBunaDate(b.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer button-delete-buna shrink-0"
                  title="Delete Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
