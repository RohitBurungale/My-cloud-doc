import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1d33] via-[#0f2a44] to-[#08162a] text-slate-100 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        
        {/* Left Content */}
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up text-center md:text-left">
          
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold
            bg-cyan-500/10 text-cyan-400 rounded-full
            border border-cyan-400/20
            shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="text-base sm:text-lg">🔒</span>
            <span className="font-bold tracking-wide text-white">Secure Cloud Doc</span>
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
            Store, Organize &<br />
            Access Your<br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Documents Securely
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <Link
              to="/register"
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 
              text-slate-900 font-semibold shadow-lg shadow-cyan-500/30
              hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105
              transition-all duration-300 text-center">
              Get Started Free
            </Link>

            <Link
              to="/login"
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border-2 border-cyan-400/50
              text-cyan-400 font-semibold
              hover:bg-cyan-400/10 hover:border-cyan-400
              backdrop-blur-sm
              transition-all duration-300 text-center">
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 pt-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>End-to-end Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative flex justify-center animate-fade-in mt-8 md:mt-0">
          
          {/* Glow Effect */}
          <div className="absolute inset-0 blur-3xl bg-cyan-500/20 rounded-full" />

          {/* Premium Card */}
          <div className="relative bg-gradient-to-br from-[#0f213a] to-[#0a1828]
            border border-cyan-500/30
            rounded-3xl p-6 sm:p-8 md:p-10 
            shadow-2xl shadow-cyan-500/10
            backdrop-blur-xl
            hover:shadow-cyan-500/20 hover:scale-105
            transition-all duration-500
            max-w-sm w-full">
            
            {/* Floating Icon */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full
                  bg-gradient-to-br from-cyan-400 to-teal-400
                  flex items-center justify-center shadow-xl text-3xl sm:text-4xl
                  group-hover:scale-110 transition-transform duration-300">
                  ☁️
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 sm:space-y-4 mb-6">
              {[
                { icon: "📁", text: "Unlimited Storage" },
                { icon: "🔐", text: "Military-grade Security" },
                { icon: "⚡", text: "Lightning Fast Access" },
                { icon: "🌐", text: "Access Anywhere" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-300 text-sm sm:text-base
                  hover:text-cyan-400 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4 border-t border-cyan-500/20">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Your private cloud storage
              </p>
              <p className="text-cyan-400 text-xs mt-1">Trusted by thousands</p>
            </div>
          </div>
        </div>

      </section>

      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-32 sm:w-40 h-32 sm:h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-40 sm:w-56 h-40 sm:h-56 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Home;