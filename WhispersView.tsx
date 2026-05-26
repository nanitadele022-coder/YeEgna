import React from "react";
import { NotificationItem } from "../types";
import { Bell, LucideIcon, Award, AlertTriangle, Info, Smile } from "lucide-react";

interface WhispersViewProps {
  notifications: NotificationItem[];
  setNotifications: (notifs: NotificationItem[]) => void;
}

export default function WhispersView({
  notifications,
  setNotifications,
}: WhispersViewProps) {
  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#2D2421]">
      <div className="bg-white rounded-[2.5rem] p-7 border border-[#F4EBE3] shadow-[0_15px_40px_rgba(45,36,32,0.015)]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#F7F2EB] pb-5 mb-5">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#3C322E] flex items-center gap-2">
              <Bell className="w-5.5 h-5.5 text-blue-500 animate-bounce" />
              <span>Sweet Couple Whispers</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Live records of ledger updates, threshold alerts, and achieved dream achievements.
            </p>
          </div>
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            className="text-xs font-black text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <span className="text-4xl block select-none">💬🌱</span>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">
              All is silent in our sweet sanctuary
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              No pending alerts. Everything in your shared home is perfectly aligned and beautiful!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#FAF6F2]">
            {notifications.map((n) => {
              const isAlert = n.type === "alert";
              const isCelebrate = n.type === "celebration";
              return (
                <div
                  key={n.id}
                  className={`py-4 flex items-start gap-4 transition-all duration-200 rounded-2xl px-3 ${
                    !n.read ? "bg-gradient-to-r from-pink-50/25 via-blue-50/15 to-transparent border border-[#FDF2F4]/50" : ""
                  }`}
                >
                  <div className="text-2xl pt-0.5 shrink-0 select-none">
                    {isCelebrate ? "🏆" : isAlert ? "⚠️" : "💌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-xs sm:text-xs font-black text-slate-850 flex items-center gap-2">
                        <span>{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                        )}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium select-text">
                      {n.message}
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
