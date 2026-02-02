import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../appwrite/config";
import Navbar from "../components/Navbar";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await account.create("unique()", email, password, name);
      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error(err);

      if (err.code === 409) {
        setError("Account already exists. Please login.");
      } else {
        setError(err.message || "Registration failed");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a]
        flex items-center justify-center px-4 py-4 text-slate-100 relative overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Success Popup */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-4 animate-fade-in">
            <div className="bg-gradient-to-br from-[#0f213a] to-[#0a1828] rounded-3xl 
              p-6 md:p-8 w-full max-w-sm text-center 
              shadow-2xl shadow-cyan-500/20 
              border border-cyan-500/30
              animate-scale-in">
              
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-75" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-500 
                  rounded-full flex items-center justify-center text-3xl md:text-4xl
                  shadow-lg shadow-green-500/30">
                  ✅
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Account Created!
              </h3>
              <p className="text-sm md:text-base text-slate-400 mb-4">
                Your account was created successfully.
              </p>

              <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full
                  animate-[width-expand_2s_ease-out_forwards]"
                  style={{animation: 'width-expand 2s ease-out forwards', width: '0%'}} />
              </div>

              <p className="text-xs md:text-sm text-slate-500 mt-4 flex items-center justify-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl md:rounded-3xl overflow-hidden 
          shadow-2xl shadow-black/50 backdrop-blur-xl relative z-10
          border border-cyan-500/10 animate-scale-in my-auto">

          {/* Left panel - Hidden on Mobile */}
          <div className="hidden md:flex flex-col justify-between p-10
            bg-gradient-to-br from-cyan-500 to-teal-500 text-slate-900 relative overflow-hidden">

            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold bg-white/30 rounded-full
                shadow-lg backdrop-blur-sm">
                Get Started
              </span>

              <h2 className="mt-6 text-4xl font-extrabold leading-tight">
                Create Your <br /> Cloud Account
              </h2>

              <p className="mt-4 text-base opacity-90 leading-relaxed">
                Secure document storage built with React & Appwrite.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "🚀 5GB free storage",
                  "🔐 Military-grade encryption",
                  "⚡ Instant file sync",
                  "📱 Multi-device access"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex justify-center mt-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative h-32 w-32 rounded-full bg-white/30 backdrop-blur-sm
                  flex items-center justify-center text-5xl
                  shadow-xl hover:scale-110 transition-transform duration-300">
                  ☁️
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="bg-gradient-to-br from-[#0f213a] to-[#0a1828] 
            p-5 md:p-10 flex flex-col justify-center relative">
            
            <div className="md:hidden text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold
                bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/20">
                <span>🔒</span>
                <span>Secure Cloud Doc</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-slate-400 text-xs md:text-sm text-center mb-4">
              Sign up to get started with 5GB free storage
            </p>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 
                backdrop-blur-sm animate-fade-in-up">
                <p className="text-red-400 text-xs md:text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-sm
                    bg-[#08162a]/50 border border-slate-700/50
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                    placeholder:text-slate-600
                    transition-all duration-200
                    backdrop-blur-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-sm
                    bg-[#08162a]/50 border border-slate-700/50
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                    placeholder:text-slate-600
                    transition-all duration-200
                    backdrop-blur-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-sm
                    bg-[#08162a]/50 border border-slate-700/50
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
                    placeholder:text-slate-600
                    transition-all duration-200
                    backdrop-blur-sm text-white"
                />
                <p className="text-[10px] md:text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                  <span>💡</span>
                  <span>Use 8+ characters with letters, numbers & symbols</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={success}
                className="w-full py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base
                  bg-gradient-to-r from-cyan-500 to-teal-500
                  text-slate-900 
                  hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300
                  relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {success ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="text-[10px] md:text-xs text-slate-500 text-center mt-3">
              By creating an account, you agree to our{" "}
              <span className="text-cyan-400 hover:underline cursor-pointer">Terms</span>
              {" "}and{" "}
              <span className="text-cyan-400 hover:underline cursor-pointer">Privacy Policy</span>
            </p>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px] md:text-xs">
                <span className="px-2 md:px-3 bg-[#0f213a] text-slate-500">Already have an account?</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-center text-slate-400">
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold
                hover:underline transition-colors">
                Sign in instead
              </Link>
            </p>

            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-center gap-2 text-[10px] md:text-xs text-slate-500">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes width-expand {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Register;