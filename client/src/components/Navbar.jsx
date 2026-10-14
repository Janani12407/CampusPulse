import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiSearch, FiPlus, FiMenu, FiX, FiStar } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import CreatePostModal from './CreatePostModal';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/users/search', { params: { q: searchQuery } });
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/blogs?company=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FBF8F3]">
      {/* 1. Top Scrolling Marquee Banner */}
      <div className="bg-[#FEEA75] border-b-2 border-[#1E1B18] py-1 overflow-hidden select-none">
        <div className="animate-marquee font-mono text-xs font-extrabold tracking-wider text-[#1E1B18] whitespace-nowrap flex items-center gap-6">
          <span>✦ Live Campus Pulse Community Feed</span>
          <span>✦ Verified Student Placement Experiences</span>
          <span>✦ RSVP for Campus Events & Tech Talks</span>
          <span>✦ Volunteer Opportunities Open Across Campus</span>
          <span>✦ Connect With Peers & Alumni</span>
          <span>✦ Live Campus Pulse Community Feed</span>
          <span>✦ Verified Student Placement Experiences</span>
          <span>✦ RSVP for Campus Events & Tech Talks</span>
          <span>✦ Volunteer Opportunities Open Across Campus</span>
          <span>✦ Connect With Peers & Alumni</span>
        </div>
      </div>

      {/* 2. Main Neubrutalist Navigation Bar */}
      <nav className="bg-[#FFFFFF] border-b-2 border-[#1E1B18] px-4 md:px-8 py-3 shadow-[0px_3px_0px_#1E1B18]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/news" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 bg-[#FB7185] border-2 border-[#1E1B18] shadow-[2.5px_2.5px_0px_#1E1B18] rounded-xl flex items-center justify-center font-black text-xl text-[#1E1B18] group-hover:rotate-6 transition-transform">
                P
              </div>
              <span className="font-heading font-black text-2xl tracking-tighter text-[#1E1B18]">
                PULSE<span className="text-[#2563EB]">.</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 font-mono text-xs font-bold">
              <NavLink to="/news" className={({isActive}) => `px-3 py-1.5 rounded-full border-2 transition-all ${isActive ? 'bg-[#2563EB] text-white border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]'}`}>
                📰 News
              </NavLink>
              <NavLink to="/events" className={({isActive}) => `px-3 py-1.5 rounded-full border-2 transition-all ${isActive ? 'bg-[#FB7185] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]'}`}>
                🎟️ Events
              </NavLink>
              <NavLink to="/volunteering" className={({isActive}) => `px-3 py-1.5 rounded-full border-2 transition-all ${isActive ? 'bg-[#86EFAC] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]'}`}>
                🤝 Volunteer
              </NavLink>
              <NavLink to="/blogs" className={({isActive}) => `px-3 py-1.5 rounded-full border-2 transition-all ${isActive ? 'bg-[#FEEA75] text-[#1E1B18] border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]'}`}>
                📝 Blogs
              </NavLink>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs relative">
            <input 
              type="text" 
              placeholder="Search students, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-full px-4 py-1.5 pl-9 font-mono text-xs font-bold text-[#1E1B18] focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18] transition-all"
            />
            <FiSearch className="absolute left-3 text-gray-500" size={14} />

            {/* Y2K Styled Dropdown Results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#1E1B18] rounded-xl shadow-[4px_4px_0px_#1E1B18] overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searching ? (
                  <div className="p-3 text-center font-mono text-xs text-gray-500 font-bold">✦ Searching students...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center font-mono text-xs text-gray-500 font-bold">No students found.</div>
                ) : (
                  searchResults.map(u => (
                    <Link
                      key={u._id}
                      to={`/profile/${u._id}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center justify-between p-2.5 hover:bg-[#FBF8F3] border-b border-gray-100 last:border-none transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {u.profilePicture || u.avatar ? (
                          <img src={u.profilePicture || u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover border border-[#1E1B18]" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[#C084FC] border border-[#1E1B18] flex items-center justify-center font-black text-xs text-[#1E1B18]">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-heading font-bold text-xs text-[#1E1B18]">{u.name}</div>
                          <div className="font-mono text-[10px] text-gray-500">{u.department} • Year {u.year}</div>
                        </div>
                      </div>

                      <span className="sticker-tag bg-[#86EFAC] text-[#1E1B18] text-[9px] px-2">View</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button 
                  onClick={() => setIsPostModalOpen(true)}
                  className="neo-btn neo-btn-primary py-1.5 px-3 text-xs md:px-4 md:py-2 md:text-sm flex items-center gap-1.5 shadow-[3px_3px_0px_#1E1B18]"
                >
                  <FiPlus size={16} className="stroke-[3]" />
                  <span>Create Post</span>
                </button>

                <NotificationBell />

                <Link 
                  to={`/profile/${user._id}`} 
                  className="flex items-center gap-2 neo-box p-1 px-2.5 rounded-full hover:bg-[#C084FC]/30 transition-colors"
                >
                  {user.profilePicture || user.avatar ? (
                    <img 
                      src={user.profilePicture || user.avatar} 
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-[#1E1B18] object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#C084FC] border border-[#1E1B18] flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline font-mono font-bold text-xs">{user.name.split(' ')[0]}</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  title="Logout"
                  className="neo-btn p-2 rounded-full hidden sm:flex"
                  style={{ padding: '0.4rem' }}
                >
                  <FiLogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="neo-btn py-1.5 px-3 text-xs">Login</Link>
                <Link to="/signup" className="neo-btn neo-btn-primary py-1.5 px-3 text-xs">Sign Up</Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden neo-btn p-2 rounded-lg"
              style={{ padding: '0.4rem' }}
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t-2 border-[#1E1B18] flex flex-col gap-2 font-mono text-sm">
            <NavLink to="/news" onClick={() => setIsOpen(false)} className="px-4 py-2 border-2 border-[#1E1B18] rounded-xl bg-white shadow-[2px_2px_0px_#1E1B18] font-bold">
              📰 News & Announcements
            </NavLink>
            <NavLink to="/events" onClick={() => setIsOpen(false)} className="px-4 py-2 border-2 border-[#1E1B18] rounded-xl bg-[#FB7185] shadow-[2px_2px_0px_#1E1B18] font-bold">
              🎟️ Campus Events
            </NavLink>
            <NavLink to="/volunteering" onClick={() => setIsOpen(false)} className="px-4 py-2 border-2 border-[#1E1B18] rounded-xl bg-[#86EFAC] shadow-[2px_2px_0px_#1E1B18] font-bold">
              🤝 Volunteer Opportunities
            </NavLink>
            <NavLink to="/blogs" onClick={() => setIsOpen(false)} className="px-4 py-2 border-2 border-[#1E1B18] rounded-xl bg-[#FEEA75] shadow-[2px_2px_0px_#1E1B18] font-bold">
              📝 Placement & Blogs
            </NavLink>
            {user && (
              <button onClick={handleLogout} className="px-4 py-2 border-2 border-[#1E1B18] rounded-xl bg-gray-200 shadow-[2px_2px_0px_#1E1B18] font-bold text-left flex items-center justify-between mt-2">
                <span>Logout</span>
                <FiLogOut />
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Global Post Creation Modal */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onRefresh={() => window.location.reload()}
      />
    </header>
  );
};

export default Navbar;
