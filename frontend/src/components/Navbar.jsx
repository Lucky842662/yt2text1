import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, LayoutDashboard, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
            group-hover:bg-brand-400 transition-colors">
            <Zap size={16} className="text-slate-950" strokeWidth={2.5} />
          </div> */}
          <span className="font-bold text-lg tracking-tight">
            Transcribe<span className="text-brand-400"></span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/about" className={`btn-ghost text-sm ${isActive('/about') ? 'text-slate-200 bg-slate-800' : ''}`}>
            About
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`btn-ghost text-sm ${isActive('/dashboard') ? 'text-slate-200 bg-slate-800' : ''}`}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <div className="ml-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30
                  flex items-center justify-center text-brand-400 text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm ml-1">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full justify-start">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex btn-ghost w-full justify-start">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex btn-ghost w-full justify-start text-red-400">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full justify-start">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block btn-primary w-full justify-center mt-2">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
