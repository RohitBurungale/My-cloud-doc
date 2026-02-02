import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full bg-gradient-to-r from-[#08162a] via-[#0f2a44] to-[#08162a] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

       <h1 className="text-lg font-bold tracking-wide text-white select-none cursor-default">
  My Cloud Doc
</h1>


        {/* Action */}
        <Link
          to="/register"
          className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-900
          font-semibold hover:bg-cyan-400 transition shadow-md"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
