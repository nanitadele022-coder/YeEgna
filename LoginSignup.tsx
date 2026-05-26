import React, { useState } from "react";
import { CoupleProfile } from "../types";
import { Heart, Key, Mail, Sparkles, User, Calendar, Loader2 } from "lucide-react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { seedCoupleData, getCoupleProfile } from "../firebaseUtils";

interface LoginSignupProps {
  onAuthSuccess: (profile: CoupleProfile & { uid: string }) => void;
}

export default function LoginSignup({ onAuthSuccess }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("belen.michael@yeegna.com");
  const [password, setPassword] = useState("soulmates");
  const [wifeName, setWifeName] = useState("Belen");
  const [husbandName, setHusbandName] = useState("Michael");
  const [anniversary, setAnniversary] = useState("2024-10-12");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthSetupGuide, setShowAuthSetupGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setShowAuthSetupGuide(false);
    if (!email || !password) {
      setErrorMsg("Please fill in your secret email and puzzle key! 💕");
      return;
    }
    if (!isLogin && (!wifeName || !husbandName)) {
      setErrorMsg("A couple holds two names! Please enter both. 🌸🧸");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Firebase Authenticated Sign In
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await getCoupleProfile(cred.user.uid);
        if (profile) {
          onAuthSuccess({
            ...profile,
            uid: cred.user.uid,
          });
        } else {
          // Recreate node if orphan login without document
          const newProfile: CoupleProfile = {
            wifeName: "Wife",
            husbandName: "Husband",
            avatarWife: "🌸",
            avatarHusband: "🧸",
            anniversaryDate: anniversary,
          };
          await seedCoupleData(cred.user.uid, newProfile);
          onAuthSuccess({
            ...newProfile,
            uid: cred.user.uid,
          });
        }
      } else {
        // Create actual Firebase Auth account
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const newProfile: CoupleProfile = {
          wifeName: wifeName.trim(),
          husbandName: husbandName.trim(),
          avatarWife: "🌸",
          avatarHusband: "🧸",
          anniversaryDate: anniversary,
        };
        // Seed database collections
        await seedCoupleData(cred.user.uid, newProfile);
        onAuthSuccess({
          ...newProfile,
          uid: cred.user.uid,
        });
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      let friendlyError = err.message;
      if (err.code === "auth/invalid-credential") {
        friendlyError = "Invalid email or key. Double check your love credentials, sweeties! 🥰";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyError = "This joint email is already registered! Cozy log in instead? 🧸";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "The key is a bit weak! Please use at least 6 characters. 🔑";
      } else if (err.code === "auth/operation-not-allowed") {
        friendlyError = "Email/Password sign-in method is disabled in your Firebase project configuration! Let's enable it together below. 💓";
        setShowAuthSetupGuide(true);
      }
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const profile = await getCoupleProfile(cred.user.uid);
      if (profile) {
        onAuthSuccess({
          ...profile,
          uid: cred.user.uid,
        });
      } else {
        // Create standard initial profile for first-time Google sign-in
        const newProfile: CoupleProfile = {
          wifeName: "Belen",
          husbandName: "Michael",
          avatarWife: "🌸",
          avatarHusband: "🧸",
          anniversaryDate: "2024-10-12",
        };
        await seedCoupleData(cred.user.uid, newProfile);
        onAuthSuccess({
          ...newProfile,
          uid: cred.user.uid,
        });
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let friendly = err.message;
      if (err.code === "auth/operation-not-allowed") {
        friendly = "Google provider is disabled in your Firebase console. Go to Authentication > Sign-in method and enable Google! 💓";
      }
      setErrorMsg("Google login failed: " + friendly);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = async () => {
    setErrorMsg("");
    setShowAuthSetupGuide(false);
    setLoading(true);
    const demoEmail = "demo.couple@yeegna.com";
    const demoPass = "soulmates";

    try {
      // First attempt log in
      const cred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      const profile = await getCoupleProfile(cred.user.uid);
      if (profile) {
        onAuthSuccess({
          ...profile,
          uid: cred.user.uid,
        });
      } else {
        // Re-seed if profile got wiped
        const demoProfile: CoupleProfile = {
          wifeName: "Belen",
          husbandName: "Michael",
          avatarWife: "🌸",
          avatarHusband: "🧸",
          anniversaryDate: "2024-10-12",
        };
        await seedCoupleData(cred.user.uid, demoProfile);
        onAuthSuccess({
          ...demoProfile,
          uid: cred.user.uid,
        });
      }
    } catch (err: any) {
      // If user doesn't exist, create it dynamically
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-email") {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          const demoProfile: CoupleProfile = {
            wifeName: "Belen",
            husbandName: "Michael",
            avatarWife: "🌸",
            avatarHusband: "🧸",
            anniversaryDate: "2024-10-12",
          };
          await seedCoupleData(cred.user.uid, demoProfile);
          onAuthSuccess({
            ...demoProfile,
            uid: cred.user.uid,
          });
        } catch (createErr: any) {
          console.error("Failed creating demo couple:", createErr);
          let friendly = createErr.message;
          if (createErr.code === "auth/operation-not-allowed") {
            friendly = "Email/Password authentication must be enabled in the Firebase console for Demo Mode. Please log in with Google below instead, or enable Email/Password under Auth > Sign-in method. 💓";
          }
          setErrorMsg("Could not enter Demo Mode: " + friendly);
        }
      } else {
        console.error("Demo Mode error:", err);
        let friendly = err.message;
        if (err.code === "auth/operation-not-allowed") {
          friendly = "Email/Password sign-in provider is disabled in your Firebase console. Please enable it under Auth > Sign-in method to test with customized Demo accounts, or click 'Continue with Google' to sign in instantly! 💓";
        }
        setErrorMsg("Failed logging into demo account: " + friendly);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-rose-50 to-blue-100 relative overflow-hidden">
      {/* Soft floating pastel glass blurs */}
      <div className="absolute w-80 h-80 rounded-full bg-pink-300/30 -top-10 -left-10 blur-3xl" />
      <div className="absolute w-80 h-80 rounded-full bg-blue-300/30 -bottom-10 -right-10 blur-3xl" />
      <div className="absolute w-60 h-60 rounded-full bg-rose-200/20 top-1/3 right-1/4 blur-2xl" />

      {/* Main Authentic Romantic Login Card */}
      <div id="auth-card" className="w-full max-w-md bg-white/75 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-2xl p-8 relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block pb-2">
            {/* Pulsing ring highlights */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 via-rose-300 to-blue-400 rounded-[2rem] blur-md opacity-40 scale-105" />
            
            {/* Outer luxury border shape */}
            <div className="relative w-24 h-24 mx-auto rounded-[2rem] p-1 bg-gradient-to-br from-pink-300 via-[#FFE1E6] to-blue-300 shadow-[0_12px_28px_rgba(236,72,153,0.2)]">
              <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/src/assets/images/yeegna_logo_1779828455288.png"
                  alt="YeEgna Premium Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-pink-500 rounded-full text-[10px] shadow border border-white">
                💖
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight bg-gradient-to-r from-pink-600 via-[#C03E60] to-blue-600 bg-clip-text text-transparent mt-2">
            YeEgna
          </h1>
          <p className="text-xs text-[#7C716B] font-extrabold tracking-wide mt-1">
            "Ours" • Sweet Shared Money Space for Ethiopian Couples 🌸
          </p>
        </div>

        {/* Tab Toggle */}
        <div id="auth-tabs" className="grid grid-cols-2 bg-slate-100/80 p-1 rounded-2xl mb-6">
          <button
            id="login-tab-btn"
            disabled={loading}
            onClick={() => {
              setIsLogin(true);
              setErrorMsg("");
              setShowAuthSetupGuide(false);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              isLogin ? "bg-white text-pink-600 shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Cozy Log In
          </button>
          <button
            id="signup-tab-btn"
            disabled={loading}
            onClick={() => {
              setIsLogin(false);
              setErrorMsg("");
              setShowAuthSetupGuide(false);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              !isLogin ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Create Joint Nest
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200/80 text-red-700 text-[11px] p-3 rounded-xl mb-4 text-center animate-shake font-semibold">
            ✨ {errorMsg}
          </div>
        )}

        {/* Step-by-Step Enable Guide (Firebase Admin helper) */}
        {showAuthSetupGuide && (
          <div className="bg-amber-50/90 border border-amber-200/60 rounded-2xl p-4 mb-5 text-stone-800 text-xs shadow-sm space-y-3">
            <h4 className="font-extrabold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              🛠️ 1-Minute Firebase Setup Required
            </h4>
            <div className="space-y-2 text-[11px] leading-relaxed text-stone-605">
              <p>
                To allow custom accounts or Demo Mode to register, you need to enable the <strong>Email/Password</strong> provider in your Firebase console.
              </p>
              <ol className="list-decimal list-inside space-y-1 font-semibold pl-1">
                <li>Click the direct setup link below to open your console.</li>
                <li>Under <strong>Sign-in providers</strong>, click <strong>"Add new provider"</strong>.</li>
                <li>Select <strong>Email/Password</strong> and check <strong>Enable</strong>, then save!</li>
              </ol>
            </div>
            
            <a
              href="https://console.firebase.google.com/project/gen-lang-client-0809659732/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] rounded-xl transition text-center"
            >
              <span>🔗 Go to Firebase Auth Providers</span>
            </a>
            
            <p className="text-[10px] text-center text-stone-400 font-bold italic">
              After enabling, return here to register immediately or log in with Google below! 💖
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wider uppercase">
              Couple Shared Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
              <input
                id="auth-email-input"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="our.love@nest.com"
                className="w-full bg-white/90 border border-slate-200/70 focus:border-pink-300 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-800 outline-none transition"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wider uppercase">
              Our Key / Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-blue-400" />
              <input
                id="auth-password-input"
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/90 border border-slate-200/70 focus:border-blue-300 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-sans text-slate-800 outline-none transition"
              />
            </div>
          </div>

          {/* Signup Extra Fields */}
          {!isLogin && (
            <div className="space-y-4 pt-1 animate-fadeIn">
              
              <div className="grid grid-cols-2 gap-3">
                {/* Wife's Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wider uppercase">
                    Wife's First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-pink-400" />
                    <input
                      id="signup-wife-name"
                      type="text"
                      disabled={loading}
                      value={wifeName}
                      onChange={(e) => setWifeName(e.target.value)}
                      placeholder="Belen"
                      className="w-full bg-white/90 border border-slate-200/70 focus:border-pink-300 rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>

                {/* Husband's Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wider uppercase">
                    Husband's First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-400" />
                    <input
                      id="signup-husband-name"
                      type="text"
                      disabled={loading}
                      value={husbandName}
                      onChange={(e) => setHusbandName(e.target.value)}
                      placeholder="Michael"
                      className="w-full bg-white/90 border border-slate-200/70 focus:border-blue-300 rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Anniversary Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 tracking-wider uppercase">
                  Love Anniversary Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-purple-400" />
                  <input
                    id="signup-anniversary"
                    type="date"
                    disabled={loading}
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="w-full bg-white/90 border border-slate-200/70 focus:border-purple-300 rounded-2xl py-2 pl-11 pr-3 text-xs outline-none transition text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all text-center tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              "💝 Access Our Haven"
            ) : (
              "🌸 Create Our Joint Sanctuary"
            )}
          </button>
        </form>

        {/* Google Sign In Option */}
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center w-full my-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3">Or connect instantly</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>
          <button
            id="google-signin-btn"
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200/85 hover:border-pink-300 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.22-1.25-.61-1.67-1.11z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google 💖</span>
          </button>
        </div>

        {/* Divider and Preset Load */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Want a quick beautiful look?</span>
          <button
            id="quick-demo-btn"
            disabled={loading}
            onClick={loadDemo}
            className="mt-2 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100/80 px-4 py-2 rounded-xl border border-purple-200/50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Enter instantly with Demo Mode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
