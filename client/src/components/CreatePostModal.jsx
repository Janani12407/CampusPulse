import { useState } from 'react';
import { FiX, FiCalendar, FiVolume2, FiHeart, FiBookOpen } from 'react-icons/fi';
import CreateEventModal from './CreateEventModal';
import CreateNewsModal from './CreateNewsModal';
import CreateBlogModal from './CreateBlogModal';
import CreateVolunteerNeedModal from './CreateVolunteerNeedModal';
import { useAuth } from '../context/AuthContext';

const CreatePostModal = ({ isOpen, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState(null); // 'event', 'news', 'blog', 'volunteer'

  if (!isOpen) return null;

  const canPostNews = user && (user.role === 'admin' || user.role === 'club');

  return (
    <>
      {!activeType && (
        <div className="neo-modal-overlay animate-fade-in" onClick={onClose}>
          <div className="neo-modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="sticker-tag bg-[#FEEA75] mb-2 inline-block">✦ PULSE CREATOR</span>
                <h2 className="text-2xl font-black">What do you want to share?</h2>
              </div>
              <button onClick={onClose} className="neo-btn p-2" style={{ padding: '0.4rem' }}>
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Blog / Placement */}
              <button 
                onClick={() => setActiveType('blog')} 
                className="neo-box p-5 text-left flex flex-col gap-3 hover:bg-[#FEEA75]/20 group transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FEEA75] border-2 border-[#1E1B18] flex items-center justify-center font-bold text-xl">
                  📝
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:underline">Blog / Placement</h3>
                  <p className="text-xs text-gray-600 font-mono mt-1">Share interview experience or campus blog</p>
                </div>
              </button>

              {/* Option 2: Event */}
              <button 
                onClick={() => setActiveType('event')} 
                className="neo-box p-5 text-left flex flex-col gap-3 hover:bg-[#FB7185]/20 group transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FB7185] border-2 border-[#1E1B18] flex items-center justify-center font-bold text-xl">
                  🎟️
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:underline">Campus Event</h3>
                  <p className="text-xs text-gray-600 font-mono mt-1">Host a workshop, fest, or talk</p>
                </div>
              </button>

              {/* Option 3: Volunteer Need */}
              <button 
                onClick={() => setActiveType('volunteer')} 
                className="neo-box p-5 text-left flex flex-col gap-3 hover:bg-[#86EFAC]/20 group transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#86EFAC] border-2 border-[#1E1B18] flex items-center justify-center font-bold text-xl">
                  🤝
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:underline">Volunteer Need</h3>
                  <p className="text-xs text-gray-600 font-mono mt-1">Request student helpers for an activity</p>
                </div>
              </button>

              {/* Option 4: News Announcement (Admins/Clubs) */}
              <button 
                onClick={() => canPostNews ? setActiveType('news') : null} 
                disabled={!canPostNews}
                className={`neo-box p-5 text-left flex flex-col gap-3 transition-all ${canPostNews ? 'hover:bg-[#2563EB]/20 group cursor-pointer' : 'opacity-50 cursor-not-allowed bg-gray-100'}`}
              >
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white border-2 border-[#1E1B18] flex items-center justify-center font-bold text-xl">
                  📢
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:underline flex items-center gap-1">
                    Announcement {!canPostNews && <span className="text-[10px] font-mono bg-gray-200 px-1 py-0.5 rounded border border-[#1E1B18]">Club/Admin</span>}
                  </h3>
                  <p className="text-xs text-gray-600 font-mono mt-1">Official notice or club broadcast</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modals */}
      <CreateEventModal 
        isOpen={activeType === 'event'} 
        onClose={() => { setActiveType(null); onClose(); }} 
        onEventCreated={() => { if (onRefresh) onRefresh(); }} 
      />

      <CreateNewsModal 
        isOpen={activeType === 'news'} 
        onClose={() => { setActiveType(null); onClose(); }} 
        onNewsCreated={() => { if (onRefresh) onRefresh(); }} 
      />

      <CreateBlogModal 
        isOpen={activeType === 'blog'} 
        onClose={() => { setActiveType(null); onClose(); }} 
        onBlogCreated={() => { if (onRefresh) onRefresh(); }} 
      />

      <CreateVolunteerNeedModal 
        isOpen={activeType === 'volunteer'} 
        onClose={() => { setActiveType(null); onClose(); }} 
        onNeedCreated={() => { if (onRefresh) onRefresh(); }} 
      />
    </>
  );
};

export default CreatePostModal;
