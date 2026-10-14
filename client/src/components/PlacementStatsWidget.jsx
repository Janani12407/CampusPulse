import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiArrowRight } from 'react-icons/fi';
import api from '../api/axios';

const PlacementStatsWidget = () => {
  const [stats, setStats] = useState({
    placedCount: 0,
    currentGradYear: new Date().getFullYear(),
    topRecruiters: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/placements/stats')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(err => console.error('Failed to load placement stats', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="neo-box p-4 bg-[#86EFAC]/30 border-2 border-[#1E1B18] relative">
      <div className="tape-header bg-[#86EFAC] text-[#1E1B18] text-[9px] font-black uppercase">PLACEMENT TRACKER</div>

      <div className="flex justify-between items-center mt-2 mb-3">
        <h3 className="font-heading font-black text-sm uppercase flex items-center gap-1.5 text-[#1E1B18]">
          <FiAward className="text-[#2563EB]" /> Campus Placements
        </h3>
        <Link 
          to="/blogs?type=PlacementExperience" 
          className="font-mono text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5"
        >
          REVIEWS <FiArrowRight size={10} />
        </Link>
      </div>

      {/* Main Placement Banner Box */}
      <div className="bg-[#86EFAC] border-2 border-[#1E1B18] p-3 rounded-xl shadow-[3px_3px_0px_#1E1B18] text-center mb-4">
        {loading ? (
          <div className="font-mono text-xs font-bold text-gray-700 py-1">Loading live stats...</div>
        ) : (
          <>
            <div className="font-heading font-black text-2xl text-[#1E1B18]">
              {stats.placedCount} {stats.placedCount === 1 ? 'STUDENT PLACED' : 'STUDENTS PLACED'} 🎯
            </div>
            <div className="font-mono text-[10px] font-bold text-gray-800 uppercase tracking-wide mt-0.5">
              ✦ Class of {stats.currentGradYear} Verification Active
            </div>
          </>
        )}
      </div>

      {/* Top Hiring Companies */}
      <div className="font-mono text-xs font-bold text-gray-700 uppercase mb-1.5">
        Top Recruiters:
      </div>
      <div className="flex flex-col gap-1.5">
        {loading ? (
          <div className="font-mono text-[11px] text-gray-500 py-1">Fetching recruiters...</div>
        ) : stats.topRecruiters && stats.topRecruiters.length > 0 ? (
          stats.topRecruiters.slice(0, 3).map((rec, idx) => (
            <Link 
              key={idx}
              to={`/blogs?company=${encodeURIComponent(rec.company)}`}
              className="flex justify-between items-center p-2 bg-white border-2 border-[#1E1B18] rounded-lg hover:translate-x-1 transition-transform shadow-[1.5px_1.5px_0px_#1E1B18]"
            >
              <span className="font-bold text-[#1E1B18] truncate">{rec.company}</span>
              <span className="sticker-tag bg-[#FEEA75] text-[#1E1B18] text-[10px] shrink-0">
                {rec.hiredCount} {rec.hiredCount === 1 ? 'Hired' : 'Hired'}
              </span>
            </Link>
          ))
        ) : (
          <div className="p-2.5 bg-white border-2 border-[#1E1B18] rounded-lg text-center font-mono text-[10px] text-gray-600 font-bold">
            No placement records yet for Class of {stats.currentGradYear}.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementStatsWidget;