import { LogOut, User, LayoutDashboard, IndianRupee } from "lucide-react";

function Navbar() {
  // We can fetch the user's name from localStorage or a global state (e.g., Context API)
  // For now, let's assume you store it in localStorage after login
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <IndianRupee className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
              FinTrack
            </span>
          </div>

          {/* Right Side: User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <User size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{userName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;