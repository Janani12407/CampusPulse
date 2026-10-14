import { useState } from 'react';
import { FiX, FiCalendar, FiMapPin, FiImage, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    dateTime: '',
    location: '',
    capacity: '',
    ticketPrice: '',
    bannerImage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.dateTime || !formData.location) {
      return toast.error('Please fill all required fields');
    }
    if (formData.category === 'Other' && !customCategory.trim()) {
      return toast.error('Please specify the event category');
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        category: formData.category === 'Other' ? customCategory.trim() : formData.category,
        capacity: formData.capacity === '' ? null : parseInt(formData.capacity),
        ticketPrice: formData.ticketPrice === '' ? 0 : parseFloat(formData.ticketPrice),
      };
      await api.post('/events', payload);
      toast.success('Event created! ✦');
      onEventCreated();
      onClose();
      setFormData({
        title: '',
        description: '',
        category: 'Academic',
        dateTime: '',
        location: '',
        capacity: '',
        ticketPrice: '',
        bannerImage: ''
      });
      setCustomCategory('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
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
            <div className="font-mono text-[10px] font-extrabold text-[#FB7185] uppercase tracking-widest mb-0.5">✦ CAMPUS TICKETS</div>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Create Campus Event</h2>
          </div>
          <button onClick={onClose} className="neo-btn p-1.5">
            <FiX className="stroke-[3]" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              placeholder="e.g. Hackathon Kickoff 2026"
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
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow resize-none"
              placeholder="What is this event about?"
              rows={3}
              required
            />
          </div>

          {/* Category & Capacity row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              >
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Volunteering">Volunteering</option>
                <option value="Sports">Sports</option>
                <option value="Clubs">Clubs</option>
                <option value="Other">Other</option>
              </select>
              {formData.category === 'Other' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
                  placeholder="Specify category"
                  required
                />
              )}
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Capacity (Optional)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
                placeholder="Unlimited"
                min="1"
              />
            </div>
          </div>

          {/* Date & Ticket Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
                <FiCalendar size={11} /> Date & Time *
              </label>
              <input
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
                <FiTag size={11} /> Ticket Price
              </label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
                placeholder="₹0 = Free"
                min="0"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
              <FiMapPin size={11} /> Venue / Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              placeholder="e.g. Seminar Hall, Room 102, or Zoom link"
              required
            />
          </div>

          {/* Banner Image URL */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5 flex items-center gap-1">
              <FiImage size={11} /> Banner Image URL (Optional)
            </label>
            <input
              type="text"
              name="bannerImage"
              value={formData.bannerImage}
              onChange={handleChange}
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              placeholder="https://images.unsplash.com/..."
            />
            {formData.bannerImage && (
              <div className="mt-2 border-2 border-[#1E1B18] rounded-xl overflow-hidden shadow-[2px_2px_0px_#1E1B18] h-28">
                <img
                  src={formData.bannerImage}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
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
              className="neo-btn py-2 px-6 text-sm font-black bg-[#FB7185] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              {submitting ? 'Creating...' : '✦ Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
