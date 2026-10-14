import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiClock, FiCheckCircle, FiPlus, FiHeart, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CreateVolunteerNeedModal from '../components/CreateVolunteerNeedModal';

const DEPT_FILTERS = ['All', 'IT', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS'];

const VolunteerList = () => {
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [appliedStatusMap, setAppliedStatusMap] = useState({});

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/volunteers/all');
      setNeeds(res.data);

      if (user) {
        try {
          const profileRes = await api.get('/users/me/profile');
          const volunteeringApps = profileRes.data.activity?.volunteering || [];
          const map = {};
          volunteeringApps.forEach(app => {
            const needId = app.volunteerNeedId?._id || app.volunteerNeedId;
            if (needId) {
              map[needId.toString()] = app.status;
            }
          });
          setAppliedStatusMap(map);
        } catch (err) {
          console.error('Failed to load user applications', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch volunteer needs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [user]);

  const handleApply = async (needId) => {
    if (!user) return toast.error('Please login to apply');
    setApplying(true);
    try {
      await api.post(`/volunteers/${needId}/apply`);
      toast.success('Application submitted! Pending creator review. ✦');
      setAppliedStatusMap(prev => ({ ...prev, [needId]: 'Pending' }));
      fetchNeeds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  // Filter needs by selected department (matches creator's department or need description tag)
  const filteredNeeds = selectedDept === 'All'
    ? needs
    : needs.filter(need => {
        const creatorDept = need.creatorId?.department?.toUpperCase() || '';
        const title = need.title?.toUpperCase() || '';
        const desc = need.description?.toUpperCase() || '';
        const dept = selectedDept.toUpperCase();
        return creatorDept.includes(dept) || title.includes(dept) || desc.includes(dept);
      });

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Stream */}
        <main className="flex-1 min-w-0 pt-3">
          
          {/* Header */}
          <div className="neo-box p-6 bg-[#86EFAC]/30 mb-6 relative">
            <div className="tape-header bg-[#86EFAC] text-[#1E1B18]">GIVING BACK</div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h1 className="font-heading font-black text-3xl tracking-tight">Volunteer Opportunities</h1>
                <p className="font-mono text-xs text-gray-700 font-bold mt-1">Help out around campus, lead teams, and earn volunteer credits.</p>
              </div>

              {user && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsModalOpen(true)} className="neo-btn neo-btn-mint flex items-center gap-1.5 text-xs">
                    <FiPlus className="stroke-[3]" /> Post Need
                  </button>
                  <Link to="/volunteering/dashboard" className="neo-btn neo-btn-primary py-1.5 px-3 text-xs">
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Department Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            {DEPT_FILTERS.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`neo-btn py-1 px-3.5 text-xs font-bold transition-all ${
                  selectedDept === dept
                    ? 'bg-[#FEEA75] border-[2px] border-[#1E1B18] text-[#1E1B18] shadow-[2px_2px_0px_0px_#1E1B18]'
                    : 'bg-white text-[#1E1B18] hover:bg-[#FBF8F3]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Volunteer Cards Stream */}
          {loading ? (
            <div className="neo-box p-12 text-center font-mono font-bold text-gray-500">
              ✦ Loading volunteer needs...
            </div>
          ) : filteredNeeds.length === 0 ? (
            <div className="neo-box p-12 text-center bg-white">
              <div className="text-4xl mb-2">🤝</div>
              <h3 className="font-heading font-black text-lg">
                {selectedDept === 'All' ? 'No open volunteer slots' : `No volunteer needs for ${selectedDept}`}
              </h3>
              <p className="font-mono text-xs text-gray-500 mt-1">
                {selectedDept === 'All' ? 'Check back later or post an opportunity!' : 'Try selecting a different department.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredNeeds.map((need) => {
                const isFull = need.status === 'Full' || need.slotsFilled >= need.slotsTotal;
                const fillPercentage = Math.min(100, Math.round((need.slotsFilled / need.slotsTotal) * 100));

                return (
                  <div key={need._id} className="neo-box bg-white p-6 relative">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`sticker-tag ${isFull ? 'bg-[#FB7185] text-[#1E1B18]' : 'bg-[#86EFAC] text-[#1E1B18]'}`}>
                            {isFull ? '✦ FULL' : '✦ SLOTS OPEN'}
                          </span>
                          <span className="font-mono text-xs font-bold text-gray-600">
                            Posted by {need.creatorId?.name || 'Admin'}
                          </span>
                          {need.creatorId?.department && (
                            <span className="sticker-tag bg-[#C084FC] text-[#1E1B18] text-[9px]">
                              {need.creatorId.department}
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-black text-2xl text-[#1E1B18] mb-2">
                          {need.title}
                        </h3>

                        <p className="font-body text-sm text-gray-800 mb-4 leading-relaxed">
                          {need.description}
                        </p>

                        {need.eventId && (
                          <div className="font-mono text-xs font-bold text-[#2563EB] flex items-center gap-1.5 mb-3 bg-[#FBF8F3] p-2 border-2 border-[#1E1B18] rounded-xl w-fit">
                            <FiCheckCircle className="text-[#86EFAC]" />
                            <span>Linked Event: <Link to={`/events/${need.eventId._id}`} className="underline">{need.eventId.title}</Link></span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="max-w-md font-mono text-xs font-bold">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Volunteer Slots</span>
                            <span className={isFull ? 'text-[#FB7185]' : 'text-[#2563EB]'}>
                              {need.slotsFilled} / {need.slotsTotal} Filled
                            </span>
                          </div>
                          <div className="w-full bg-[#FBF8F3] h-3 border-2 border-[#1E1B18] rounded-full overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-[#FB7185]' : 'bg-[#86EFAC]'}`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Date/Time & Location meta */}
                        {(need.dateTime || (need.location && need.location.trim() !== '')) && (
                          <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-bold text-gray-600 mt-3">
                            {need.dateTime && (
                              <span className="flex items-center gap-1">
                                📅 {new Date(need.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {need.location && need.location.trim() !== '' && (
                              <span className="flex items-center gap-1">
                                📍 {need.location}
                              </span>
                            )}
                          </div>
                        )}


                      </div>

                      {/* Action Button */}
                      <div className="md:border-l-2 border-[#1E1B18] md:pl-6 md:w-48 flex flex-col justify-center">
                        {appliedStatusMap[need._id] ? (
                          <div className={`neo-btn w-full py-2 text-xs font-bold text-center cursor-default ${
                            appliedStatusMap[need._id] === 'Approved'
                              ? 'bg-[#86EFAC] text-[#1E1B18]'
                              : appliedStatusMap[need._id] === 'Rejected'
                              ? 'bg-[#FB7185] text-[#1E1B18]'
                              : 'bg-[#FEEA75] text-[#1E1B18]'
                          }`}>
                            {appliedStatusMap[need._id] === 'Approved'
                              ? 'Approved ✓'
                              : appliedStatusMap[need._id] === 'Rejected'
                              ? 'Rejected'
                              : 'Applied (Pending)'}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleApply(need._id)}
                            disabled={applying || isFull}
                            className={`neo-btn w-full py-2 text-sm font-bold ${isFull ? 'bg-gray-200 cursor-not-allowed opacity-75' : 'neo-btn-mint'}`}
                          >
                            {isFull ? 'Slots Filled' : 'Apply Now ✦'}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>

      <CreateVolunteerNeedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onNeedCreated={fetchNeeds} 
      />
    </div>
  );
};

export default VolunteerList;
