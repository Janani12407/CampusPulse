import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

const VolunteerDashboard = () => {
  const [data, setData] = useState({ needs: [], applications: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/volunteers/creator/dashboard');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAction = async (appId, action) => {
    try {
      await api.put(`/volunteers/applications/${appId}/${action}`);
      toast.success(`Application ${action}d!`);
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} application`);
    }
  };

  if (loading) return <div className="pt-28 text-center font-mono font-bold text-gray-500">Loading creator dashboard...</div>;

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 pt-3">
          
          <Link to="/volunteering" className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-gray-600 hover:text-[#2563EB] mb-4">
            <FiArrowLeft /> Back to Volunteer Needs
          </Link>

          <div className="neo-box p-6 bg-[#86EFAC]/30 mb-6 relative">
            <div className="tape-header bg-[#86EFAC] text-[#1E1B18]">CREATOR CONTROL</div>
            <h1 className="font-heading font-black text-3xl text-[#1E1B18] mt-2">Volunteer Manager</h1>
            <p className="font-mono text-xs text-gray-700 font-bold mt-1">Review applications, approve student volunteers, and track slot availability.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Opportunities List */}
            <div>
              <h2 className="font-heading font-black text-xl mb-4">Your Opportunities</h2>
              <div className="flex flex-col gap-4">
                {data.needs.length === 0 ? (
                  <div className="neo-box p-6 text-center font-mono text-xs text-gray-500 bg-white">
                    You haven't posted any volunteer needs yet.
                  </div>
                ) : (
                  data.needs.map(need => (
                    <div key={need._id} className="neo-box p-5 bg-white font-mono text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-bold text-base text-[#1E1B18]">{need.title}</h3>
                        <span className={`sticker-tag ${need.status === 'Open' ? 'bg-[#86EFAC]' : 'bg-[#FB7185]'}`}>
                          {need.status}
                        </span>
                      </div>
                      <p className="font-body text-xs text-gray-700 mb-3">{need.description}</p>
                      <div className="flex items-center gap-2 font-bold text-gray-800 bg-[#FBF8F3] p-2 border border-[#1E1B18] rounded-lg">
                        <FiUsers className="text-[#2563EB]" /> 
                        <span>{need.slotsFilled} / {need.slotsTotal} Slots Filled</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Applicant Review */}
            <div>
              <h2 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FEEA75] border-2 border-[#1E1B18] flex items-center justify-center text-sm shadow-[2px_2px_0px_#1E1B18]">📋</span>
                Applicant Applications
              </h2>

              {data.applications.length === 0 ? (
                <div className="p-8 text-center border-2 border-[#1E1B18] rounded-2xl bg-white shadow-[3px_3px_0px_0px_#1E1B18]">
                  <div className="text-3xl mb-2">🤝</div>
                  <p className="font-mono text-xs font-bold text-gray-500">✦ No pending volunteer applications to review yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.applications.map(app => {
                    const relatedNeed = (app.volunteerNeedId && typeof app.volunteerNeedId === 'object' && app.volunteerNeedId.title)
                      ? app.volunteerNeedId
                      : data.needs.find(n => String(n._id) === String(app.volunteerNeedId?._id || app.volunteerNeedId));
                    
                    const isPending = app.status === 'Pending';
                    const isApproved = app.status === 'Approved';

                    return (
                      <div
                        key={app._id}
                        className="neo-box bg-white p-4 flex flex-col lg:flex-row lg:flex-wrap lg:items-center justify-between gap-3 hover:bg-[#FBF8F3] transition-colors"
                      >
                        {/* LEFT: Avatar + Student Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {app.userId?.profilePicture ? (
                            <img
                              src={app.userId.profilePicture}
                              alt={app.userId.name}
                              className="w-10 h-10 rounded-full border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#C084FC] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center font-black text-sm text-[#1E1B18] shrink-0">
                              {app.userId?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-heading font-black text-sm text-[#1E1B18] truncate">
                              {app.userId?.name || 'Unknown Student'}
                            </div>
                            <div className="font-mono text-[10px] font-bold text-gray-500">
                              {app.userId?.department || '—'} • Year {app.userId?.year || '?'}
                            </div>
                          </div>
                        </div>

                        {/* CENTER: Need/Event Pill */}
                        <div className="flex-shrink-0">
                          {relatedNeed ? (
                            <span className="inline-block bg-[#FEEA75] border-2 border-[#1E1B18] px-3 py-1 rounded-full text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#1E1B18] truncate max-w-[200px]">
                              ✦ {relatedNeed.title}
                            </span>
                          ) : (
                            <span className="inline-block bg-[#FBF8F3] border-2 border-[#1E1B18] px-3 py-1 rounded-full text-xs font-mono font-bold text-gray-400">
                              Unknown Need
                            </span>
                          )}
                        </div>

                        {/* RIGHT: Action Buttons or Status Badge */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleAction(app._id, 'approve')}
                                className="shrink-0 whitespace-nowrap bg-[#86EFAC] text-[#1E1B18] border-2 border-[#1E1B18] px-4 py-1.5 rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1E1B18] hover:-translate-y-0.5 transition-all flex items-center gap-1"
                              >
                                <FiCheck size={12} className="stroke-[3] shrink-0" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(app._id, 'reject')}
                                className="shrink-0 whitespace-nowrap bg-[#FB7185] text-[#1E1B18] border-2 border-[#1E1B18] px-4 py-1.5 rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1E1B18] hover:-translate-y-0.5 transition-all flex items-center gap-1"
                              >
                                <FiX size={12} className="stroke-[3] shrink-0" /> Reject
                              </button>
                            </>
                          ) : isApproved ? (
                            <span className="shrink-0 whitespace-nowrap bg-[#86EFAC] text-[#1E1B18] border-2 border-[#1E1B18] px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1E1B18] flex items-center gap-1">
                              <FiCheck size={11} className="stroke-[3] shrink-0" /> APPROVED
                            </span>
                          ) : (
                            <span className="shrink-0 whitespace-nowrap bg-[#FB7185] text-[#1E1B18] border-2 border-[#1E1B18] px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1E1B18] flex items-center gap-1">
                              <FiX size={11} className="stroke-[3] shrink-0" /> REJECTED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


          </div>

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  );
};

export default VolunteerDashboard;
