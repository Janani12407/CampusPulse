import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiCalendar, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';
import PlacementStatsWidget from './PlacementStatsWidget';

const TAG_COLORS = [
  'bg-[#FEEA75] text-[#1E1B18]',
  'bg-[#86EFAC] text-[#1E1B18]',
  'bg-[#FB7185] text-[#1E1B18]',
  'bg-[#2563EB] text-white',
  'bg-[#C084FC] text-[#1E1B18]',
];

const RightSidebar = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [campusStats, setCampusStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    totalClubs: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    api.get('/events')
      .then(res => setUpcomingEvents(res.data.slice(0, 3)))
      .catch(err => console.error('Failed to load sidebar events', err));

    api.get('/trending')
      .then(res => setTrendingTags(res.data))
      .catch(() => setTrendingTags([]));

    api.get('/stats')
      .then(res => {
        if (res.data) setCampusStats(res.data);
      })
      .catch(err => console.error('Failed to load campus stats', err));
  }, []);

  const validTags = (trendingTags || []).filter(tag => tag && typeof tag === 'string' && tag.trim() !== '' && tag.trim() !== '#');

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-28 pt-3 flex flex-col gap-5">
        
        {/* Placement Stats Widget */}
        <PlacementStatsWidget />

        {/* Trending Tags */}
        <div className="neo-box p-4 bg-white relative">
          <div className="tape-header bg-[#FB7185] text-[#1E1B18]">TRENDING</div>
          <h3 className="font-heading font-black text-sm uppercase mb-3 flex items-center gap-1.5 mt-2">
            <FiTrendingUp className="text-[#2563EB]" /> Hot Topics
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {validTags.length === 0 ? (
              <p className="font-mono text-xs text-gray-500 py-1">No trending topics yet.</p>
            ) : (
              validTags.map((tag, idx) => {
                const tagClean = tag.startsWith('#') ? tag : `#${tag}`;
                const colorClass = TAG_COLORS[idx % TAG_COLORS.length];
                return (
                  <Link 
                    to={`/blogs?company=${encodeURIComponent(tagClean.replace('#', ''))}`}
                    key={idx} 
                    className={`sticker-tag ${colorClass} hover:scale-105 transition-transform cursor-pointer`}
                  >
                    {tagClean}
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Events This Week */}
        <div className="neo-box p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading font-black text-sm uppercase flex items-center gap-1.5">
              <FiCalendar className="text-[#FB7185]" /> Events This Week
            </h3>
            <Link to="/events" className="font-mono text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5">
              SEE ALL <FiArrowRight size={10} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {upcomingEvents.length === 0 ? (
              <div className="font-mono text-xs text-gray-500 py-2">No upcoming events.</div>
            ) : (
              upcomingEvents.map((ev) => (
                <Link key={ev._id} to={`/events/${ev._id}`} className="block group">
                  <div className="p-3 bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl shadow-[2px_2px_0px_#1E1B18] group-hover:translate-x-1 transition-transform">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="sticker-tag text-[9px] bg-[#FB7185] px-1.5 py-0">
                        {ev.category}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-gray-600">
                        {new Date(ev.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-xs line-clamp-1 group-hover:text-[#2563EB]">
                      {ev.title}
                    </h4>
                    <p className="font-mono text-[10px] text-gray-500 mt-1">
                      📍 {ev.location}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Real Campus Pulse Stats */}
        <div className="neo-box p-4 bg-[#86EFAC]/20 border-2 border-[#1E1B18] relative">
          <div className="font-mono text-[10px] font-extrabold uppercase text-[#1E1B18] tracking-widest mb-1">
            ✦ LIVE CAMPUS METRICS
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
            <div className="bg-white border-2 border-[#1E1B18] p-2 rounded-lg text-center shadow-[1.5px_1.5px_0px_#1E1B18]">
              <div className="font-heading font-black text-lg text-[#2563EB]">
                {campusStats.totalClubs}
              </div>
              <div className="text-[10px] font-bold text-gray-600">Active Clubs</div>
            </div>
            <div className="bg-white border-2 border-[#1E1B18] p-2 rounded-lg text-center shadow-[1.5px_1.5px_0px_#1E1B18]">
              <div className="font-heading font-black text-lg text-[#FB7185]">
                {campusStats.placedStudents}
              </div>
              <div className="text-[10px] font-bold text-gray-600">Placements</div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default RightSidebar;
