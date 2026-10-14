import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Any', 'CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Biotech', 'Other'];

const CreateVolunteerNeedModal = ({ isOpen, onClose, onNeedCreated }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Any',
    slotsTotal: '',
    dateTime: '',
    location: '',
    eventId: ''
  });
  const [myEvents, setMyEvents] = useState([]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      api.get('/events')
        .then(res => {
          const organizedEvents = res.data.filter(ev => ev.organizerId && ev.organizerId._id === user._id);
          setMyEvents(organizedEvents);
        })
        .catch(err => console.error('Failed to load events', err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.slotsTotal) {
      return toast.error('Please fill all required fields');
    }
    if (formData.department === 'Other' && !customDepartment.trim()) {
      return toast.error('Please specify the department');
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        slotsTotal: parseInt(formData.slotsTotal),
        eventId: formData.eventId === '' ? undefined : formData.eventId,
        department: formData.department === 'Any'
          ? undefined
          : (formData.department === 'Other' ? customDepartment.trim() : formData.department),
      };
      await api.post('/volunteers', payload);
      toast.success('Volunteer need posted! ✦');
      onNeedCreated();
      onClose();
      setFormData({
        title: '',
        description: '',
        department: 'Any',
        slotsTotal: '',
        dateTime: '',
        location: '',
        eventId: ''
      });
      setCustomDepartment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create volunteer opportunity');
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
        className="bg-white border-2 border-[#1E1B18] shadow-[6px_6px_0px_0px_#1E1B18] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-mono text-[10px] font-extrabold text-[#86EFAC] uppercase tracking-widest mb-0.5">✦ GIVING BACK</div>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Post Volunteer Need</h2>
          </div>
          <button onClick={onClose} className="neo-btn p-1.5">
            <FiX className="stroke-[3]" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Opportunity Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
              placeholder="e.g. Stage Decorator or Tree Planter"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow resize-none"
              placeholder="What will the volunteer be doing?"
              rows={3}
              required
            />
          </div>

          {/* Department & Slots row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {formData.department === 'Other' && (
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  className="w-full mt-2 border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
                  placeholder="Specify department"
                  required
                />
              )}
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
                <FiUsers size={11} /> Slots Required *
              </label>
              <input
                type="number"
                name="slotsTotal"
                value={formData.slotsTotal}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
                placeholder="e.g. 5"
                min="1"
                required
              />
            </div>
          </div>

          {/* Date/Time & Location row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
                <FiCalendar size={11} /> Date & Time
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
              />
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
                <FiMapPin size={11} /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
                placeholder="e.g. Main Ground"
              />
            </div>
          </div>

          {/* Link to Event (Optional) */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Link to Campus Event (Optional)</label>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#86EFAC] transition-shadow"
            >
              <option value="">Standalone (no linked event)</option>
              {myEvents.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn py-2 px-5 text-sm font-bold bg-[#FBF8F3] border-2 border-[#1E1B18]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="neo-btn py-2 px-6 text-sm font-black bg-[#86EFAC] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              {submitting ? 'Posting...' : '✦ Post Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVolunteerNeedModal;
