import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiVolume2, FiCalendar, FiBriefcase, FiUsers, FiUser } from 'react-icons/fi';

const LeftSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-28 flex flex-col gap-4">
        
        {/* Navigation Card */}
        <div className="neo-box p-4 bg-white">
          <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
            ✦ EXPLORE PULSE
          </div>
          
          <nav className="flex flex-col gap-1.5 font-mono text-xs font-bold">
            <NavLink 
              to="/news" 
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-[#2563EB] text-white border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]/40'}`}
            >
              <span className="text-base">📰</span>
              <span>Campus News</span>
            </NavLink>

            <NavLink 
              to="/events" 
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-[#FB7185] text-[#1E1B18] border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]/40'}`}
            >
              <span className="text-base">🎟️</span>
              <span>Events & Tickets</span>
            </NavLink>

            <NavLink 
              to="/volunteering" 
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-[#86EFAC] text-[#1E1B18] border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]/40'}`}
            >
              <span className="text-base">🤝</span>
              <span>Volunteering</span>
            </NavLink>

            <NavLink 
              to="/blogs" 
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-[#FEEA75] text-[#1E1B18] border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]/40'}`}
            >
              <span className="text-base">📝</span>
              <span>Placement & Blogs</span>
            </NavLink>

            {user && (
              <NavLink 
                to={`/profile/${user._id}`} 
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isActive ? 'bg-[#C084FC] text-[#1E1B18] border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18]' : 'border-transparent hover:border-[#1E1B18] hover:bg-[#FEEA75]/40'}`}
              >
                <span className="text-base">👤</span>
                <span>My Profile</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* User Card Widget */}
        {user ? (
          <div className="neo-box p-4 bg-[#C084FC]/15 relative mt-4">
            <div className="tape-header">STUDENT CARD</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 rounded-xl bg-[#C084FC] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center font-black text-xl text-[#1E1B18]">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-heading font-black text-sm text-[#1E1B18] truncate">{user.name}</h4>
                <p className="font-mono text-[11px] text-gray-700 font-bold">{user.department} • Year {user.year}</p>
                <span className="sticker-tag bg-[#86EFAC] text-[9px] mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="neo-box p-4 bg-[#FEEA75]/30">
            <h4 className="font-heading font-bold text-sm mb-1">Join Campus Pulse</h4>
            <p className="font-mono text-xs text-gray-600 mb-3">Sign up with your college email domain.</p>
            <NavLink to="/signup" className="neo-btn neo-btn-primary w-full text-xs text-center">
              Sign Up Now
            </NavLink>
          </div>
        )}

      </div>
    </aside>
  );
};

export default LeftSidebar;
