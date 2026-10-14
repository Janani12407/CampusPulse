import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const CreateNewsModal = ({ isOpen, onClose, onNewsCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'Academic'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body || !formData.category) {
      return toast.error('Please fill all required fields');
    }

    setSubmitting(true);
    try {
      await api.post('/news', formData);
      toast.success('News announcement posted successfully! ✦');
      onNewsCreated();
      onClose();
      setFormData({
        title: '',
        body: '',
        category: 'Academic'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post news');
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-mono text-[10px] font-extrabold text-[#2563EB] uppercase tracking-widest mb-0.5">✦ OFFICIAL BROADCAST</div>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Post Announcement</h2>
          </div>
          <button onClick={onClose} className="neo-btn p-1.5" style={{ padding: '0.4rem' }}>
            <FiX className="stroke-[3]" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow" 
              placeholder="e.g. Mid-term exam schedules released"
              required 
            />
          </div>

          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Category *</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
            >
              <option value="Academic">Academic</option>
              <option value="Events">Events</option>
              <option value="Admin">Admin</option>
              <option value="Clubs">Clubs</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Announcement Content *</label>
            <textarea 
              name="body" 
              value={formData.body} 
              onChange={handleChange} 
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow resize-none" 
              placeholder="Provide detail for the announcement..."
              rows={5}
              required 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t-2 border-[#1E1B18]">
            <button type="button" onClick={onClose} className="neo-btn text-xs py-2 px-4">Cancel</button>
            <button type="submit" disabled={submitting} className="neo-btn neo-btn-blue text-xs py-2 px-5">
              {submitting ? 'Posting...' : 'Post Announcement ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewsModal;
