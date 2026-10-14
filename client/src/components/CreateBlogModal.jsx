import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiStar, FiBriefcase, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateBlogModal = ({ isOpen, onClose, onBlogCreated }) => {
  const { user } = useAuth();
  
  const [type, setType] = useState('General');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [linkedEventId, setLinkedEventId] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  
  // Placement Experience fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [yearOfPlacement, setYearOfPlacement] = useState(new Date().getFullYear());
  const [placementDept, setPlacementDept] = useState('CSE');
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [verdictTips, setVerdictTips] = useState('');
  const [verifiedPlacement, setVerifiedPlacement] = useState(false);
  const [rounds, setRounds] = useState([{ roundName: '', description: '' }]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      api.get('/users/me/profile')
        .then(res => {
          const confirmedEvents = (res.data.activity?.rsvps || [])
            .filter(r => r.status === 'Confirmed' && r.eventId)
            .map(r => r.eventId);
          setMyEvents(confirmedEvents);
        })
        .catch(err => console.error('Failed to load user events', err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleAddRound = () => {
    setRounds([...rounds, { roundName: '', description: '' }]);
  };

  const handleRemoveRound = (index) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  const handleRoundChange = (index, field, value) => {
    const updated = [...rounds];
    updated[index][field] = value;
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      return toast.error('Title and content are required');
    }

    if (type === 'PlacementExperience') {
      if (!company || !role || !verdictTips) {
        return toast.error('Please fill in placement details (Company, Role, Verdict)');
      }
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      title,
      body,
      type,
      tags,
      linkedEventId: linkedEventId || undefined
    };

    if (type === 'PlacementExperience') {
      payload.placementDetails = {
        company,
        role,
        yearOfPlacement: parseInt(yearOfPlacement),
        department: placementDept,
        difficultyRating,
        verdictTips,
        roundsFaced: rounds.filter(r => r.roundName.trim() !== ''),
        verifiedPlacement: user.role === 'admin' ? verifiedPlacement : false
      };
    }

    setSubmitting(true);
    try {
      await api.post('/blogs', payload);
      toast.success('Post created successfully! ✦');
      onBlogCreated();
      onClose();
      // Reset
      setTitle('');
      setBody('');
      setTagsInput('');
      setLinkedEventId('');
      setCompany('');
      setRole('');
      setVerdictTips('');
      setRounds([{ roundName: '', description: '' }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B18]/60 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white border-2 border-[#1E1B18] shadow-[6px_6px_0px_0px_#1E1B18] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-mono text-[10px] font-extrabold text-[#FEEA75] bg-[#1E1B18] px-2 py-0.5 rounded inline-block uppercase tracking-widest mb-1">
              ✦ CAREER & CAMPUS ARCHIVE
            </div>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Write New Post</h2>
          </div>
          <button onClick={onClose} className="neo-btn p-1.5" style={{ padding: '0.4rem' }}>
            <FiX className="stroke-[3]" size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1.5 bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl mb-6">
          <button 
            type="button" 
            onClick={() => setType('General')} 
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              type === 'General'
                ? 'bg-[#C084FC] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]'
                : 'text-gray-600 hover:text-[#1E1B18]'
            }`}
          >
            📝 General Blog
          </button>
          <button 
            type="button" 
            onClick={() => setType('PlacementExperience')} 
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              type === 'PlacementExperience'
                ? 'bg-[#FEEA75] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18]'
                : 'text-gray-600 hover:text-[#1E1B18]'
            }`}
          >
            🎯 Placement Experience
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Post Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
              placeholder={type === 'PlacementExperience' ? "e.g. How I cracked Google SWE On-Campus" : "e.g. Summer Research Internship at IISc"}
              required 
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Content / Body *</label>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow resize-none" 
              placeholder="Write your experience, tips, and insights here..."
              rows={5}
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Tags (comma-separated)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)} 
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
                placeholder="e.g. Google, SWE, Interview"
              />
            </div>

            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Link to Event (optional)</label>
              <select 
                value={linkedEventId} 
                onChange={(e) => setLinkedEventId(e.target.value)} 
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              >
                <option value="">Select an Event you attended</option>
                {myEvents.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Structured Placement Experience Fields */}
          {type === 'PlacementExperience' && (
            <div className="p-5 bg-[#FEEA75]/20 border-2 border-[#1E1B18] rounded-xl flex flex-col gap-4">
              <div className="font-heading font-black text-sm uppercase text-[#1E1B18] flex items-center gap-1.5">
                <FiBriefcase className="text-[#2563EB]" /> Structured Placement Details
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Company Name *</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-white focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
                    placeholder="e.g. Microsoft"
                    required 
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Role Title *</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-white focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
                    placeholder="e.g. SDE-1 / Analyst"
                    required 
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Placement Year</label>
                  <input 
                    type="number" 
                    value={yearOfPlacement} 
                    onChange={(e) => setYearOfPlacement(e.target.value)} 
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-white focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Department</label>
                  <select 
                    value={placementDept} 
                    onChange={(e) => setPlacementDept(e.target.value)} 
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-white focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="EEE">EEE</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Biotech">Biotech</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Interview Difficulty</label>
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setDifficultyRating(star)} 
                      className={`p-1.5 rounded-lg border border-[#1E1B18] transition-all ${
                        star <= difficultyRating ? 'bg-[#FB7185] text-[#1E1B18]' : 'bg-white text-gray-400'
                      }`}
                    >
                      <FiStar size={16} className={star <= difficultyRating ? 'fill-current' : ''} />
                    </button>
                  ))}
                  <span className="font-mono text-xs font-bold text-gray-700 ml-2">Rating: {difficultyRating}/5</span>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Verdict & Tips *</label>
                <textarea 
                  value={verdictTips} 
                  onChange={(e) => setVerdictTips(e.target.value)} 
                  className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-xs bg-white focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow resize-none" 
                  placeholder="e.g. Selected! Focus on DSA trees, graph DP, and practice behavioral mocks."
                  rows={2}
                  required 
                />
              </div>

              {user && user.role === 'admin' && (
                <div className="flex items-center gap-2 p-3 bg-white border-2 border-[#1E1B18] rounded-xl">
                  <input 
                    type="checkbox" 
                    id="verifiedToggle" 
                    checked={verifiedPlacement} 
                    onChange={(e) => setVerifiedPlacement(e.target.checked)} 
                    className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                  />
                  <label htmlFor="verifiedToggle" className="font-mono text-xs font-bold text-gray-800 cursor-pointer">
                    Verify Placement Experience (Admin only)
                  </label>
                </div>
              )}

              {/* Interview Rounds */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-mono text-xs font-bold text-gray-700 uppercase">Interview Rounds Breakdown</h4>
                  <button 
                    type="button" 
                    onClick={handleAddRound} 
                    className="neo-btn py-1 px-3 text-[11px] font-bold flex items-center gap-1 bg-[#86EFAC]"
                  >
                    <FiPlus size={12} /> Add Round
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {rounds.map((round, index) => (
                    <div key={index} className="flex gap-2 items-start bg-white p-3 border-2 border-[#1E1B18] rounded-xl shadow-[2px_2px_0px_#1E1B18]">
                      <div className="flex-1 flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder={`Round ${index + 1} Name (e.g. Online Assessment, Tech 1)`} 
                          value={round.roundName} 
                          onChange={(e) => handleRoundChange(index, 'roundName', e.target.value)} 
                          className="w-full border border-[#1E1B18] rounded-lg p-2 font-mono text-xs bg-[#FBF8F3]"
                        />
                        <textarea 
                          placeholder="Questions asked, topics tested, format..." 
                          value={round.description} 
                          onChange={(e) => handleRoundChange(index, 'description', e.target.value)} 
                          className="w-full border border-[#1E1B18] rounded-lg p-2 font-body text-xs bg-[#FBF8F3] resize-none"
                          rows={2}
                        />
                      </div>
                      {rounds.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveRound(index)} 
                          className="neo-btn p-1.5 bg-[#FB7185] text-[#1E1B18] mt-1"
                          title="Remove Round"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t-2 border-[#1E1B18]">
            <button type="button" onClick={onClose} className="neo-btn text-xs py-2 px-4">Cancel</button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="neo-btn neo-btn-primary text-xs py-2 px-6"
            >
              {submitting ? 'Posting...' : 'Publish Post ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogModal;
