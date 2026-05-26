import React, { useState, useEffect } from "react";
import {
  WalletSelection,
  TransactionType,
  ExpenseCategory,
  Transaction,
  SavingsGoal,
  Budget,
  NotificationItem,
  CoupleProfile,
  AISuggestions,
  BunaDate,
} from "./types";
import {
  STARTING_TRANS,
  STARTING_GOALS,
  STARTING_BUDGET,
  STARTING_NOTIFS,
  MOTIVATIONAL_TIPS,
  calculateBalances,
} from "./utils";
import LoginSignup from "./components/LoginSignup";
import DashboardView from "./components/DashboardView";
import LedgerView from "./components/LedgerView";
import ReportsView from "./components/ReportsView";
import SavingsGoalsView from "./components/SavingsGoalsView";
import WhispersView from "./components/WhispersView";
import ProfileSettingsView from "./components/ProfileSettingsView";
import BunaDateTracker from "./components/BunaDateTracker";
import { translations } from "./translations";
import { motion, AnimatePresence } from "motion/react";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, collection } from "firebase/firestore";
import {
  saveTransaction,
  eraseTransaction,
  saveSavingsGoal,
  eraseSavingsGoal,
  saveNotification,
  updateNotificationReadState,
  updateCoupleBudget,
  updateCoupleProfileFields,
  saveBunaDate,
  eraseBunaDate,
} from "./firebaseUtils";
import {
  Heart,
  Wallet,
  PieChart,
  Award,
  Bell,
  Settings,
  User,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  X,
  Star,
  Loader2,
} from "lucide-react";

export default function App() {
  // Authentication & Session
  const [profile, setProfile] = useState<(CoupleProfile & { uid: string }) | null>(null);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  // Core Firestore Synced State Nodes
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [budget, setBudget] = useState<Budget>(STARTING_BUDGET);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // UI Navigation & Preferences
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  const [activePartnerRole, setActivePartnerRole] = useState<"wife" | "husband">("wife");

  // Interface Modals
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showGoalDeposit, setShowGoalDeposit] = useState<string | null>(null);

  // Form states registers
  const [transForm, setTransForm] = useState({
    amount: "",
    type: "expense" as TransactionType,
    category: "Food" as ExpenseCategory | "Income" | "Savings Contribution" | "Debt Settlement",
    wallet: "shared" as WalletSelection,
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [goalForm, setGoalForm] = useState({
    title: "",
    targetAmount: "",
    category: "House" as any,
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
  });

  const [depositAmount, setDepositAmount] = useState("");

  // AI Insights states
  const [aiData, setAiData] = useState<AISuggestions | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedTip, setSelectedTip] = useState(MOTIVATIONAL_TIPS[0]);

  // Saved achievements celebrating popup
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Language selection and traditional Buna dates
  const [language, setLanguage] = useState<"en" | "am">(() => {
    return (localStorage.getItem("nest_lang") as "en" | "am") || "en";
  });
  const [bunaDates, setBunaDates] = useState<BunaDate[]>([]);


  // 1. Firebase Authentication State Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // We set a temporary profile containing UID. The nested listeners will fully populate fields.
        setProfile({
          uid: user.uid,
          wifeName: "Wife",
          husbandName: "Husband",
          avatarWife: "🌸",
          avatarHusband: "🧸",
          anniversaryDate: "",
        });
      } else {
        setProfile(null);
        setTransactions([]);
        setGoals([]);
        setNotifications([]);
      }
      setLoadingFirebase(false);
    });
    return () => unsub();
  }, []);

  // 2. Real-time Sync listeners for Active Couple Account
  useEffect(() => {
    if (!profile?.uid) return;

    const coupleId = profile.uid;

    // Listen to parent couple profile configurations & budget metadata
    const unsubProfile = onSnapshot(doc(db, "couples", coupleId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          uid: coupleId,
          wifeName: data.wifeName || "Wife",
          husbandName: data.husbandName || "Husband",
          avatarWife: data.avatarWife || "🌸",
          avatarHusband: data.avatarHusband || "🧸",
          anniversaryDate: data.anniversaryDate || "",
        });
        if (data.budget) {
          setBudget(data.budget as Budget);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `couples/${coupleId}`);
    });

    // Listen to individual transactions subcollection
    const unsubTrans = onSnapshot(
      collection(db, "couples", coupleId, "transactions"),
      (snap) => {
        const list: Transaction[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as Transaction);
        });
        // Sort descending by transaction date
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couples/${coupleId}/transactions`);
      }
    );

    // Listen to individual goals subcollection
    const unsubGoals = onSnapshot(
      collection(db, "couples", coupleId, "goals"),
      (snap) => {
        const list: SavingsGoal[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as SavingsGoal);
        });
        setGoals(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couples/${coupleId}/goals`);
      }
    );

    // Listen to individual notification whispers subcollection
    const unsubNotifs = onSnapshot(
      collection(db, "couples", coupleId, "notifications"),
      (snap) => {
        const list: NotificationItem[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as NotificationItem);
        });
        // Sort descending by registry date
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couples/${coupleId}/notifications`);
      }
    );

    // Listen to traditional bunaDates subcollection
    const unsubBuna = onSnapshot(
      collection(db, "couples", coupleId, "buna_dates"),
      (snap) => {
        const list: BunaDate[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as BunaDate);
        });
        // Sort descending by date
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBunaDates(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couples/${coupleId}/buna_dates`);
      }
    );

    return () => {
      unsubProfile();
      unsubTrans();
      unsubGoals();
      unsubNotifs();
      unsubBuna();
    };
  }, [profile?.uid]);

  // Connection validation checker for Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        const { getDocFromServer } = await import("firebase/firestore");
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Interval rotation for cute advice snippets
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * MOTIVATIONAL_TIPS.length);
      setSelectedTip(MOTIVATIONAL_TIPS[idx]);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Compute live balances based on current pulled ledger list
  const balances = calculateBalances(transactions);

  const handleAuthSuccess = (newProfile: CoupleProfile & { uid: string }) => {
    setProfile(newProfile);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  // Recording Transaction Activity
  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const parsedAmt = parseFloat(transForm.amount);
    if (!parsedAmt || isNaN(parsedAmt) || parsedAmt <= 0) {
      alert("Please specify a beautiful sensible amount! 💕");
      return;
    }

    const newTrans: Transaction = {
      id: "tx_" + Date.now(),
      amount: parsedAmt,
      category: transForm.type === "income" ? "Income" : transForm.category as ExpenseCategory,
      date: transForm.date,
      notes: transForm.notes.trim() || `${transForm.type === "expense" ? "Money spent" : "Money received"} added by ${activePartnerRole === "wife" ? profile.wifeName : profile.husbandName}`,
      wallet: transForm.wallet,
      type: transForm.type,
      addedBy: activePartnerRole,
    };

    // Calculate budget limits
    let triggeredNotifMessage = "";
    if (newTrans.type === "expense") {
      const category = newTrans.category as ExpenseCategory;
      const catLimit = budget.categoryLimits[category] || 0;

      const currentMonthSpent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category &&
            new Date(t.date).getMonth() === new Date().getMonth()
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const predictedSpent = currentMonthSpent + parsedAmt;

      if (catLimit > 0 && predictedSpent > catLimit) {
        triggeredNotifMessage = `Oh sweeties! You spent more than your ${catLimit} Birr spending plan for "${category}" this month. You have used ${predictedSpent} Birr so far. Let's align on this!`;
      }
    }

    // Save transaction permanently to Firestore
    await saveTransaction(profile.uid, newTrans);

    // Save notification permanently to Firestore
    if (triggeredNotifMessage) {
      const budgetNotif: NotificationItem = {
        id: "alert_" + Date.now(),
        title: `Spent More Than Plan for ${newTrans.category}! ⚠️`,
        message: triggeredNotifMessage,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        read: false,
        type: "alert",
      };
      await saveNotification(profile.uid, budgetNotif);
    } else {
      const simpleNotif: NotificationItem = {
        id: "info_" + Date.now(),
        title: `Money Out Registered! 🌸`,
        message: `${activePartnerRole === "wife" ? profile.wifeName : profile.husbandName} registered ${parsedAmt} Birr for ${newTrans.category} in the ${newTrans.wallet === "shared" ? "Our Money" : "My Money"} space.`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        read: false,
        type: "info",
      };
      await saveNotification(profile.uid, simpleNotif);
    }

    // Reset Form & close
    setTransForm({
      amount: "",
      type: "expense",
      category: "Food",
      wallet: "shared",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddTransaction(false);
  };

  // Creating Savings Dream Target
  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const parsedTarget = parseFloat(goalForm.targetAmount);
    if (!parsedTarget || isNaN(parsedTarget) || parsedTarget <= 0) {
      alert("Please specify sweet dream target goals! 🌟");
      return;
    }

    const newGoal: SavingsGoal = {
      id: "goal_" + Date.now(),
      title: goalForm.title.trim() || "Dream Sanctuary Suite 🎡",
      targetAmount: parsedTarget,
      savedAmount: 0,
      deadline: goalForm.deadline,
      completed: false,
      category: goalForm.category,
    };

    await saveSavingsGoal(profile.uid, newGoal);
    setShowAddGoal(false);
    setGoalForm({
      title: "",
      targetAmount: "",
      category: "House",
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
    });
  };

  // Move funds directly into specific savings goal in Firestore
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const amt = parseFloat(depositAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      alert("Deposit lovely amount!");
      return;
    }

    const goalId = showGoalDeposit;
    if (!goalId) return;

    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newSaved = targetGoal.savedAmount + amt;
    const completedNow = newSaved >= targetGoal.targetAmount;

    const updatedGoal: SavingsGoal = {
      ...targetGoal,
      savedAmount: Math.min(newSaved, targetGoal.targetAmount),
      completed: completedNow,
    };

    // Save updated savings goal to Firestore
    await saveSavingsGoal(profile.uid, updatedGoal);

    // Save transaction to Firestore
    const newTrans: Transaction = {
      id: "tx_sav_" + Date.now(),
      amount: amt,
      category: "Savings Contribution",
      date: new Date().toISOString().split("T")[0],
      notes: `Saving contribution towards ${targetGoal.title} 💌`,
      wallet: "shared",
      type: "savings",
      addedBy: activePartnerRole,
    };
    await saveTransaction(profile.uid, newTrans);

    // Save notification to Firestore
    if (completedNow && !targetGoal.completed) {
      setShowCelebration(targetGoal.title);
      const achievementNotif: NotificationItem = {
        id: "achieve_" + Date.now(),
        title: "Dream Milestones Unlocked! 💖🏆",
        message: `Breathtaking! ${profile.wifeName} and ${profile.husbandName} achieved their goal '${targetGoal.title}'! Your romantic savings journey has hit the sky.`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        read: false,
        type: "celebration",
      };
      await saveNotification(profile.uid, achievementNotif);
    } else {
      const saveNotif: NotificationItem = {
        id: "save_tx_" + Date.now(),
        title: "Dream Goal Progress Updated! 🌱",
        message: `Dedicated ${amt} Birr for '${targetGoal.title}' by ${activePartnerRole === "wife" ? profile.wifeName : profile.husbandName}. Every single Birr brings us closer!`,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        read: false,
        type: "info",
      };
      await saveNotification(profile.uid, saveNotif);
    }

    setDepositAmount("");
    setShowGoalDeposit(null);
  };

  // Express or Backup Gemini advisory call
  const getAISuggestions = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wifeBalance: balances.wife,
          husbandBalance: balances.husband,
          sharedBalance: balances.shared,
          transactions,
          savingsGoals: goals,
          budgets: budget,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed fetching suggestion response.");
      }

      const data = await response.json();
      setAiData(data);
    } catch (err) {
      console.warn("Express endpoint error, using luxury client side backup advisor.");
      const totalSpend = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setAiData({
        analysis: `We computed your lovely nesting space, sweeties! Right now, you are maintaining ${balances.shared.toLocaleString()} Birr in your Shared "Our Money" space. Total Money Out has touched ${totalSpend.toLocaleString()} Birr this season. Your joint harmony is sitting beautifully at 94%!`,
        recommendations: [
          "Dedicate 500 Birr from personal spending to your baby Dream Goal next Thursday.",
          "Check spending plan targets! Your Food spending has plenty of sweet space to grow.",
          "Hold a 5-minute sweet check-in over a cup of hot traditional Buna this weekend. ☕",
        ],
        highestSpendingCategory: "Shopping & Dining out",
        tips: [
          "Host an intimate candlelit dinner in your living room instead of heading to expensive cafes.",
          "Check search subscriptions or data bundles together to see if you can save on Ethio Telecom packages.",
          "Leave sticky cute dream goals reminder notes for each other on the mirror! 🌹",
        ],
        isFallback: true,
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Recording traditional Buna Coffee alignment date ceremonies
  const handleAddBunaDate = async (date: string, brewer: "wife" | "husband", notes: string) => {
    if (!profile) return;
    const newBuna: BunaDate = {
      id: "buna_" + Date.now(),
      date,
      brewer,
      notes,
    };
    await saveBunaDate(profile.uid, newBuna);

    // Save an elegant whisper notification celebrate update
    const simpleNotif: NotificationItem = {
      id: "buna_notif_" + Date.now(),
      title: language === "en" ? "Buna & Harmony Shared! ☕" : "የቡና እና የፍቅር ሰዓት! ☕",
      message: language === "en"
        ? `${brewer === "wife" ? profile.wifeName : profile.husbandName} prepared hot traditional buna and fendisha. We aligned under the steam: "${notes}" 💕`
        : `${brewer === "wife" ? profile.wifeName : profile.husbandName} ሞቅ ያለ ባህላዊ ቡና እና ፈንድሻ በፍቅር አቀረቡ። በጢሱ ስር የተስማማነው ሃሳብ፦ "${notes}" 💕`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: false,
      type: "celebration",
    };
    await saveNotification(profile.uid, simpleNotif);
  };

  const handleDeleteBunaDate = async (id: string) => {
    if (!profile) return;
    await eraseBunaDate(profile.uid, id);
  };


  // Local helper calculations
  const getCategorySpendingDict = () => {
    const data: Record<ExpenseCategory, number> = {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Rent: 0,
      Internet: 0,
      Entertainment: 0,
      Gifts: 0,
      Bills: 0,
      Healthcare: 0,
      Other: 0,
    };
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category as ExpenseCategory;
        if (data[cat] !== undefined) {
          data[cat] += Number(t.amount);
        }
      });
    return data;
  };

  const getPartnerSpendingDict = () => {
    let wifeTotal = 0;
    let husbandTotal = 0;
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.addedBy === "wife") wifeTotal += Number(t.amount);
        else husbandTotal += Number(t.amount);
      });
    return { wifeTotal, husbandTotal };
  };

  const catSpending = getCategorySpendingDict();
  const maxCategorySpendingValue = Math.max(...Object.values(catSpending), 100);
  const partnersSpending = getPartnerSpendingDict();

  // Firestore delete and clear wrappers bound to downstream view prop triggers
  const handleSetTransactions = async (newVal: Transaction[]) => {
    if (!profile) return;
    if (newVal.length < transactions.length) {
      const removed = transactions.filter((t) => !newVal.some((nt) => nt.id === t.id));
      for (const r of removed) {
        await eraseTransaction(profile.uid, r.id);
      }
    }
  };

  const handleSetGoals = async (newVal: SavingsGoal[]) => {
    if (!profile) return;
    if (newVal.length < goals.length) {
      const removed = goals.filter((g) => !newVal.some((ng) => ng.id === g.id));
      for (const r of removed) {
        await eraseSavingsGoal(profile.uid, r.id);
      }
    }
  };

  const handleSetNotifications = async (newVal: NotificationItem[]) => {
    if (!profile) return;
    // Mark items read in Firestore
    for (const item of newVal) {
      const prev = notifications.find((n) => n.id === item.id);
      if (prev && prev.read !== item.read) {
        await updateNotificationReadState(profile.uid, item.id, item.read);
      }
    }
  };

  const handleSetProfile = async (newProfile: CoupleProfile) => {
    if (!profile) return;
    await updateCoupleProfileFields(profile.uid, newProfile);
  };

  const handleSetBudget = async (newBudget: Budget) => {
    if (!profile) return;
    await updateCoupleBudget(profile.uid, newBudget);
  };

  if (loadingFirebase) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
        {/* Lux Pinterest Glowing Ambient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-200/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-100/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-[35%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-amber-50/30 blur-[90px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          {/* Elegant Circular Logo Frame with spinning shimmer halo */}
          <div className="relative mb-8 animate-floatImg">
            {/* Spinning gradient halo ring */}
            <div className="absolute -inset-2.5 rounded-[2.6rem] bg-gradient-to-tr from-pink-400 via-rose-300 to-blue-400 opacity-60 blur-md animate-spin" style={{ animationDuration: '14s' }} />
            
            {/* Main luxury white boundary container */}
            <div className="relative w-28 h-28 bg-white rounded-[2.2rem] p-1.5 shadow-[0_22px_45px_rgba(244,63,94,0.18)] flex items-center justify-center border border-pink-100/35 overflow-hidden">
              <img
                src="/src/assets/images/yeegna_logo_1779828455288.png"
                alt="YeEgna Premium Logo"
                className="w-full h-full object-cover scale-102 hover:scale-105 transition-transform duration-500 rounded-[1.8rem]"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating sweet hearts badges */}
            <span className="absolute -top-1.5 -right-1.5 text-2xl select-none">🌸</span>
            <span className="absolute -bottom-2 -left-2 text-2xl select-none">🧸</span>
          </div>

          {/* Main Brand Title & Description typography */}
          <h1 className="text-3xl font-serif font-black tracking-tight text-[#3C322E] mb-2 flex items-center gap-1.5 justify-center">
            YeEgna <span className="text-pink-500 select-none animate-pulse">♥</span> የኛ
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-[#8C6239] uppercase font-bold mb-6">
            Luxury Joint Money Sanctuary
          </p>

          {/* Luxurious shimmering progress gauge bar */}
          <div className="w-40 h-1.5 bg-[#FAF3EA] rounded-full overflow-hidden p-[1px] border border-[#F2EAE0]/50 mb-5 shadow-inner relative">
            <div className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-350 to-blue-400 animate-loadingBar w-full" />
          </div>

          {/* Sweet narrative status subtitle */}
          <div className="space-y-1 bg-white/45 backdrop-blur-sm py-3 px-5 rounded-2xl border border-pink-100/15 shadow-sm max-w-[280px]">
            <p className="text-xs font-extrabold text-[#6E635F]">
              Assembling sanctuary spaces... ✨
            </p>
            <p className="text-[10px] text-stone-400/90 font-semibold leading-normal">
              "የፍቅር እና የገንዘብ ማደሪያ ጎጆዎን እያዘጋጀን ነው... ☕"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Route to auth box if session token is missing
  if (!profile) {
    return <LoginSignup onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2421] font-sans flex flex-col md:flex-row relative selection:bg-pink-100 selection:text-pink-850 antialiased">
      
      {/* 1. Ambient Sparkle Orbs backgrounds */}
      <div className="absolute top-[-250px] left-[-200px] w-[500px] h-[550px] rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-100px] w-[450px] h-[450px] rounded-full bg-amber-100/15 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-[20%] w-[550px] h-[550px] rounded-full bg-blue-100/10 blur-3xl pointer-events-none z-0" />

      {/* 2. RESPONSIVE NAVIGATION STRUCTURE */}

      {/* A. MOBILE STICKY TOPBAR HEADER */}
      <header className="md:hidden sticky top-0 bg-white/75 backdrop-blur-md border-b border-pink-100/30 px-5 py-3.5 flex items-center justify-between z-30 shadow-[0_2px_12px_rgba(45,36,32,0.02)]">
        <div className="flex items-center gap-2">
          <span className="text-3xl select-none leading-none">🏩</span>
          <div>
            <h1 className="font-serif italic font-extrabold text-xl tracking-tight text-[#3C322E]">
              {translations[language].appName}
            </h1>
            <span className="text-[8px] font-black uppercase tracking-wider text-pink-500/85 block pl-0.5 mt-0.5 leading-none">
              {language === "en" ? "Joint Harmony Nest ♥" : "የፍቅር እና የገንዘብ ጎጆ"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Role selector switcher with smooth indicators */}
          <div className="flex bg-[#F2ECE4] border border-[#E9E1D5] p-0.5 rounded-full text-[9px] font-black shrink-0 relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => setActivePartnerRole("wife")}
              className={`px-2.5 py-1 rounded-full transition-all duration-300 relative ${
                activePartnerRole === "wife" 
                  ? "bg-white text-pink-600 font-bold shadow-[0_2px_6px_rgba(192,62,96,0.15)] scale-102" 
                  : "text-stone-555"
              }`}
            >
              🌸 {profile?.wifeName ? profile.wifeName.substring(0, 4) : "Wife"}
            </button>
            <button
              onClick={() => setActivePartnerRole("husband")}
              className={`px-2.5 py-1 rounded-full transition-all duration-300 relative ${
                activePartnerRole === "husband" 
                  ? "bg-white text-blue-600 font-bold shadow-[0_2px_6px_rgba(41,121,199,0.15)] scale-102" 
                  : "text-stone-555"
              }`}
            >
              🧸 {profile?.husbandName ? profile.husbandName.substring(0, 4) : "Hubby"}
            </button>
          </div>

          {/* Language toggler */}
          <button
            id="mobile-language-toggle"
            onClick={() => {
              const next = language === "en" ? "am" : "en";
              setLanguage(next);
              localStorage.setItem("nest_lang", next);
            }}
            className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1]/85 text-pink-600 text-[10px] font-extrabold shadow-sm flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
            title="ቋንቋ / Language"
          >
            {language === "en" ? "EN" : "አማ"}
          </button>
          
          {/* Privacy toggler */}
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1]/85 text-stone-500 shrink-0 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Privacy Toggle"
          >
            {hideBalances ? <EyeOff className="w-3.5 h-3.5 text-stone-400" /> : <Eye className="w-3.5 h-3.5 text-pink-500" />}
          </button>
        </div>
      </header>

      {/* B. FIXED FLOATING BOTTOM MENU DOCK (MOBILE) */}
      <div className="md:hidden fixed bottom-5 left-5 right-5 bg-white/95 backdrop-blur-xl border border-pink-100/20 shadow-[0_16px_40px_rgba(45,36,32,0.12)] rounded-[2.2rem] px-3 py-2 flex items-center justify-around z-40">
        {[
          { id: "dashboard", label: translations[language].home, icon: Heart, activeCol: "text-pink-600 bg-pink-50/70" },
          { id: "expenses", label: translations[language].ledger, icon: Wallet, activeCol: "text-blue-600 bg-blue-50/70" },
          { id: "reports", label: translations[language].reports, icon: PieChart, activeCol: "text-amber-600 bg-amber-50/70" },
          { id: "savings", label: translations[language].savings, icon: Award, activeCol: "text-purple-600 bg-purple-50/70" },
          { id: "whispers", label: translations[language].whispers, icon: Bell, activeCol: "text-rose-600 bg-rose-50/70", badge: notifications.some((n) => !n.read) },
          { id: "profile", label: translations[language].settings, icon: User, activeCol: "text-stone-700 bg-stone-100/70" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-300 relative cursor-pointer ${
                isActive ? `${tab.activeCol} scale-105 font-bold` : "text-stone-400"
              }`}
            >
              <tab.icon className="w-5 h-5 transition-transform" />
              {tab.badge && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-550 rounded-full animate-pulse border border-white" />
              )}
              <span className="text-[8px] font-black uppercase tracking-tight mt-0.5 leading-none font-sans block scale-90">
                {isActive ? tab.label.substring(0, 8) : ""}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* E. MOBILE FLOATING ACTION BUTTON (FAB) FOR RECORDING TRANSACTIONS */}
      <div className="md:hidden fixed bottom-24 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddTransaction(true)}
          className="w-14 h-14 bg-gradient-to-tr from-pink-500 via-rose-400 to-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_35px_rgba(244,63,94,0.55)] transition-all cursor-pointer"
          title={translations[language].recordMoney}
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </div>

      {/* C. DESKTOP FLOATING BLUR SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-80 bg-white/70 backdrop-blur-xl border border-[#F3EDE2]/80 m-5 mr-0 rounded-[2.5rem] p-6 shadow-[0_12px_45px_rgba(45,36,32,0.025)] sticky top-5 h-[calc(100vh-40px)] shrink-0 z-20">
        
        <div className="space-y-7">
          {/* Brand Logo with Language Switcher */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-400 to-blue-300 text-white flex items-center justify-center shadow-md select-none">
                <span className="text-xl">🏩</span>
              </div>
              <div>
                <h1 className="font-serif italic font-black text-xl text-[#3D322E] tracking-tight leading-none">
                  {translations[language].appName}
                </h1>
                <span className="text-[8px] text-pink-600/80 font-bold uppercase tracking-widest pl-0.5 block mt-0.5">
                  {language === "en" ? "Couples Nest 💍" : "የጥንዶች ጎጆ 💍"}
                </span>
              </div>
            </div>

            <button
              id="desktop-language-toggle"
              onClick={() => {
                const next = language === "en" ? "am" : "en";
                setLanguage(next);
                localStorage.setItem("nest_lang", next);
              }}
              className="px-2 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-[10px] font-black uppercase tracking-wider border border-pink-100/50 transition cursor-pointer flex items-center gap-1 shrink-0"
              title="LANGUAGE / ቋንቋ"
            >
              🌐 {language === "en" ? "EN" : "አማ"}
            </button>
          </div>

          {/* Partner toggle selection */}
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F1EAE0] space-y-2">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider pl-1 font-mono">
              {translations[language].roleSwitch}
            </p>
            <div className="grid grid-cols-2 gap-1 bg-slate-200/40 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setActivePartnerRole("wife")}
                className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  activePartnerRole === "wife" ? "bg-white text-pink-600 shadow-sm" : "text-slate-550"
                }`}
              >
                🌸 {profile.wifeName || "Wife"}
              </button>
              <button
                onClick={() => setActivePartnerRole("husband")}
                className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  activePartnerRole === "husband" ? "bg-white text-blue-600 shadow-sm" : "text-slate-555"
                }`}
              >
                🧸 {profile.husbandName || "Husband"}
              </button>
            </div>
          </div>

          {/* Links Nav list */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: translations[language].home, icon: Heart, iconColor: "text-pink-500 font-bold" },
              { id: "expenses", label: translations[language].ledger, icon: Wallet, iconColor: "text-blue-500" },
              { id: "reports", label: translations[language].reports, icon: PieChart, iconColor: "text-amber-500" },
              { id: "savings", label: translations[language].savings, icon: Award, iconColor: "text-purple-500" },
              { id: "whispers", label: translations[language].whispers, icon: Bell, iconColor: "text-rose-500", badge: notifications.some((n) => !n.read) },
              { id: "profile", label: translations[language].settings, icon: Settings, iconColor: "text-slate-500" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4.5 py-3 rounded-2xl text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer ${
                  activeTab === item.id 
                    ? "bg-[#3C322E] text-white shadow-md translate-x-1" 
                    : "text-[#6E635F] hover:bg-slate-50 hover:text-slate-850"
                }`}
              >
                <div className="flex items-center gap-3 font-sans">
                  <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-white" : item.iconColor}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer info logout */}
        <div className="space-y-4 pt-4 border-t border-[#F2EAE0]">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#6E635F]">
            <span className="flex items-center gap-1 cursor-pointer" onClick={() => setHideBalances(!hideBalances)}>
              {hideBalances ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-pink-400" />}
              <span className="pl-1.5">{hideBalances ? translations[language].showBalances : translations[language].hideBalances}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-[#B03C30] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{translations[language].logout}</span>
            </button>
          </div>
        </div>

      </aside>

      {/* 3. CENTER COMPONENT LAYOUT WORKSPACE */}
      <main className="flex-1 min-w-0 px-4 py-6 md:p-8 pb-32 md:pb-8 relative z-10 overflow-x-hidden">
        
        {/* TOP COGNIZANT BAR (DESKTOP) */}
        <div className="hidden md:flex justify-between items-center mb-8 pb-4 border-b border-[#F2EAE0]/60 font-sans">
          <div>
            <span className="text-[10px] uppercase font-black text-[#8C6239] tracking-wider font-mono">
              {language === "en" ? "YeEgna Couples Sanctuary Workspace" : "የኛ ጥንዶች ፍቅር ጎጆ መተግበሪያ"}
            </span>
            <div className="text-xs text-slate-550 font-bold mt-1">
              {translations[language].activeUnion} <span className="text-[#C03E60] font-black">{profile.wifeName} ♥ {profile.husbandName}</span> (Exchange ledger items: ETB)
            </div>
          </div>
          
          <button
            id="top-add-trans-btn"
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-pink-400 to-[#8C6239] shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{translations[language].recordMoney}</span>
          </button>
        </div>

        {/* COMPONENT BODY SELECTOR */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <DashboardView
                profile={profile}
                balances={balances}
                hideBalances={hideBalances}
                transactions={transactions}
                goals={goals}
                budget={budget}
                aiData={aiData}
                loadingAi={loadingAi}
                getAISuggestions={getAISuggestions}
                setActiveTab={setActiveTab}
                setShowAddGoal={setShowAddGoal}
                setShowAddTransaction={setShowAddTransaction}
                setShowGoalDeposit={setShowGoalDeposit}
                selectedTip={selectedTip}
                language={language}
              />

              <BunaDateTracker
                language={language}
                profile={profile}
                bunaDates={bunaDates}
                activePartnerRole={activePartnerRole}
                onAddBunaDate={handleAddBunaDate}
                onDeleteBunaDate={handleDeleteBunaDate}
              />
            </motion.div>
          )}

          {activeTab === "expenses" && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <LedgerView
                profile={profile}
                transactions={transactions}
                setTransactions={handleSetTransactions}
                setShowAddTransaction={setShowAddTransaction}
                activePartnerRole={activePartnerRole}
              />
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReportsView
                profile={profile}
                transactions={transactions}
                budget={budget}
                catSpending={catSpending}
                maxCategorySpendingValue={maxCategorySpendingValue}
                partnersSpending={partnersSpending}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === "savings" && (
            <motion.div
              key="savings"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <SavingsGoalsView
                goals={goals}
                setGoals={handleSetGoals}
                setShowAddGoal={setShowAddGoal}
                setShowGoalDeposit={setShowGoalDeposit}
              />
            </motion.div>
          )}

          {activeTab === "whispers" && (
            <motion.div
              key="whispers"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <WhispersView
                notifications={notifications}
                setNotifications={handleSetNotifications}
              />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProfileSettingsView
                profile={profile}
                setProfile={handleSetProfile}
                budget={budget}
                setBudget={handleSetBudget}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* 4. DIALOG MODALS */}

      {/* A. NEW ACTIVITY MODAL */}
      {showAddTransaction && (
        <div id="add-trans-modal" className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 border border-white rounded-[2.8rem] shadow-2xl w-full max-w-md p-7 relative animate-up font-sans">
            
            <button
              id="close-trans-modal"
              onClick={() => setShowAddTransaction(false)}
              className="absolute top-5 right-5 text-[#6E635F]/65 hover:text-[#3C322E] p-1.5 bg-[#FAF6F1] rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-rose-50 pb-3 mt-1">
              <span className="text-2xl select-none font-sans">💍</span>
              <div>
                <h3 className="text-base font-black text-[#2D2421]">Record Money Activity 🌸</h3>
                <p className="text-[10px] text-slate-450 font-medium">Record spending and inflows transparently.</p>
              </div>
            </div>

            <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
              
              {/* Selector switch */}
              <div className="grid grid-cols-2 bg-[#FAF8F5] p-1 rounded-2xl border border-slate-100 shadow-inner">
                <button
                  id="tab-form-expense"
                  type="button"
                  onClick={() => setTransForm({ ...transForm, type: "expense" })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    transForm.type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-550"
                  }`}
                >
                  Money Out 💸
                </button>
                <button
                  id="tab-form-income"
                  type="button"
                  onClick={() => setTransForm({ ...transForm, type: "income" })}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    transForm.type === "income" ? "bg-white text-green-600 shadow-sm" : "text-slate-55s"
                  }`}
                >
                  Money In 📈
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Amount in Birr
                </label>
                <input
                  id="form-amount"
                  type="number"
                  required
                  step="any"
                  value={transForm.amount}
                  onChange={(e) => setTransForm({ ...transForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-pink-300 rounded-xl py-2.5 px-4 text-xs outline-none font-bold shadow-inner text-slate-800"
                />
              </div>

              {/* Source Space select */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Source Money Space
                </label>
                <select
                  id="form-wallet"
                  value={transForm.wallet}
                  onChange={(e) => setTransForm({ ...transForm, wallet: e.target.value as any })}
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-pink-300 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                >
                  <option value="shared">🏩 Our Money Space</option>
                  <option value="wife">🌸 {profile?.wifeName}'s Space</option>
                  <option value="husband">🧸 {profile?.husbandName}'s Space</option>
                </select>
              </div>

              {/* Expense category */}
              {transForm.type === "expense" && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                    Spending plan category
                  </label>
                  <select
                    id="form-category"
                    value={transForm.category}
                    onChange={(e) => setTransForm({ ...transForm, category: e.target.value as any })}
                    className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-pink-300 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                  >
                    <option value="Food">Food / Candlelight Dine 🕯️</option>
                    <option value="Transport">Transport / Honeymoon suites</option>
                    <option value="Shopping">Shopping / Pinterest decorated</option>
                    <option value="Rent">Rent / Home mortgage</option>
                    <option value="Internet">Internet & Streaming</option>
                    <option value="Entertainment">Entertainment & Movies 🍿</option>
                    <option value="Gifts">Gifts & Surprises 🎁</option>
                    <option value="Bills">Bills & Clean energy utilities</option>
                    <option value="Healthcare">Healthcare & Spa days</option>
                    <option value="Other">Other / Miscellaneous</option>
                  </select>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Date
                </label>
                <input
                  id="form-date"
                  type="date"
                  required
                  value={transForm.date}
                  onChange={(e) => setTransForm({ ...transForm, date: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-pink-300 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-705"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Heart Label Notes
                </label>
                <input
                  id="form-notes"
                  type="text"
                  value={transForm.notes}
                  onChange={(e) => setTransForm({ ...transForm, notes: e.target.value })}
                  placeholder="Roses, cozy traditional Buna, sweets... ☘️"
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-pink-300 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                />
              </div>

              {/* Submit */}
              <button
                id="form-trans-submit"
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-pink-400 to-blue-400 shadow hover:brightness-105 transition cursor-pointer"
              >
                {transForm.type === "expense" ? "Add Money Out 💸" : "Add Money In 📈"}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* B. NEW VISION DREAM GOAL */}
      {showAddGoal && (
        <div id="add-goal-modal" className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 border border-white rounded-[2.8rem] shadow-2xl w-full max-w-md p-7 relative animate-up font-sans">
            
            <button
              id="close-goal-modal"
              onClick={() => setShowAddGoal(false)}
              className="absolute top-5 right-5 text-[#6E635F]/65 hover:text-[#3C322E] p-1.5 bg-[#FAF6F1] rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-purple-50 pb-3 mt-1">
              <span className="text-2xl select-none">🪐</span>
              <div>
                <h3 className="text-base font-black text-[#2D2421]">Pledge Mutual Pursuit 🚀</h3>
                <p className="text-[10px] text-slate-405 font-medium">Save together for the grand future you plan.</p>
              </div>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5">
                  Dream Title name
                </label>
                <input
                  id="goal-form-title"
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="Paris travel, traditional wedding nested..."
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-purple-350 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Required Dream Goal Amount (Birr)
                </label>
                <input
                  id="goal-form-target"
                  type="number"
                  required
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  placeholder="5000"
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-purple-350 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Goal category group
                </label>
                <select
                  id="goal-form-cat"
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as any })}
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-purple-350 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-850"
                >
                  <option value="Emergency">Emergency Safety net 🧸</option>
                  <option value="Baby">Baby Fund 🍼</option>
                  <option value="House">Dream Nest House Fund 🏡</option>
                  <option value="Car">Celestial Car Fund 🚗</option>
                  <option value="Wedding">Wedding Celebration Suit 💍</option>
                  <option value="Travel">Paris Honeymoon flights ✈️</option>
                  <option value="Other">Other Surprises & Surrender 🎁</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5 font-mono">
                  Deadline date
                </label>
                <input
                  id="goal-form-dl"
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-purple-355 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-705"
                />
              </div>

              <button
                id="goal-form-submit"
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400 shadow hover:brightness-105 transition cursor-pointer"
              >
                Pledge Mutual Pursuit 💖
              </button>

            </form>
          </div>
        </div>
      )}

      {/* C. DEPOSIT TARGET GOAL PREVIEW */}
      {showGoalDeposit && (
        <div id="deposit-modal" className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 border border-white rounded-[2.8rem] shadow-2xl w-full max-w-sm p-7 relative animate-up font-sans">
            
            <button
              id="close-deposit-modal"
              onClick={() => setShowGoalDeposit(null)}
              className="absolute top-5 right-5 text-[#6E635F]/65 hover:text-[#3C322E] p-1.5 bg-[#FAF6F1] rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black text-[#2D2421] mb-2">💘 Add Money to Our Dream</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Moving money to this objective reduces your available cash from the general Our Money space.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4 mt-5 border-t border-purple-50 pt-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 pl-0.5">
                  Added Amount (Birr)
                </label>
                <input
                  id="deposit-input-val"
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="250.00"
                  className="w-full bg-[#FAF8F5] border border-slate-205 focus:border-purple-350 rounded-xl py-2.5 px-4 text-xs outline-none font-bold text-slate-800"
                />
              </div>

              <button
                id="deposit-submit-btn"
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-pink-400 to-purple-400 shadow hover:brightness-105 transition cursor-pointer"
              >
                Add Money to Goal 💖
              </button>
            </form>
          </div>
        </div>
      )}

      {/* D. IMMERSIVE CELEBRATION */}
      {showCelebration && (
        <div id="celebrate-screen" className="fixed inset-0 bg-gradient-to-tr from-pink-400/90 via-purple-500/95 to-blue-400/90 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn font-sans">
          <div className="bg-white rounded-[3rem] p-8 max-w-sm text-center shadow-2xl border-4 border-yellow-250 space-y-4 animate-scaleUp relative">
            
            <div className="absolute top-2 left-6 text-3xl animate-bounce">🎈</div>
            <div className="absolute top-3 right-6 text-3xl animate-bounce">🥂</div>
            <div className="absolute bottom-6 left-12 text-2xl animate-spin-slow">✨</div>

            <span className="text-5xl block select-none">🏆💖🍾</span>
            <h2 className="text-2.5xl font-serif font-black text-rose-800 leading-tight">Dream Goal Achieved!</h2>
            
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              Adoring congratulations! {profile.wifeName} and {profile.husbandName} successfully finalized their dream:
            </p>
            <div className="bg-pink-100/60 p-4 border border-pink-200/50 rounded-2xl text-pink-700 font-extrabold text-xs">
              "{showCelebration}"
            </div>
            
            <p className="text-xs text-slate-500 italic">
              "When love and cooperation unite, any financial mountain becomes a cute set of stairs."
            </p>

            <button
              id="celebrate-dismiss"
              onClick={() => setShowCelebration(null)}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-blue-400 hover:brightness-105 text-white font-black text-xs rounded-2xl tracking-wider uppercase transition shadow-lg cursor-pointer"
            >
              Continue Our Legacy
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
