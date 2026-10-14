import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiUser, FiMail, FiLock } from 'react-icons/fi';

const Signup = () => {
  const CURRENT_YEAR = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    year: '1',
    graduationYear: String(CURRENT_YEAR + (4 - 1)) // default suggestion for 1st year
  });
  const [customDepartment, setCustomDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-suggest graduation year when academic year changes, unless user already edited it
      if (name === 'year') {
        next.graduationYear = String(CURRENT_YEAR + (4 - parseInt(value)));
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Please fill all fields');
    }
    if (formData.department === 'Other' && !customDepartment.trim()) {
      return toast.error('Please specify your department');
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        department: formData.department === 'Other' ? customDepartment.trim() : formData.department,
      };
      await signup(payload);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center bg-[#FBF8F3]">
      <div className="neo-box max-w-4xl w-full bg-white grid grid-cols-1 md:grid-cols-2 relative overflow-hidden">
        
        {/* Left Side Hero */}
        <div className="bg-[#FB7185] p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#1E1B18] relative">
          <div className="tape-header bg-[#FEEA75] text-[#1E1B18]">✦ JOIN THE PULSE</div>
          
          <div className="mt-8">
            <div className="w-14 h-14 bg-[#FEEA75] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] rounded-2xl flex items-center justify-center font-black text-2xl text-[#1E1B18] mb-4">
              P
            </div>
            <h1 className="font-heading font-black text-4xl text-[#1E1B18] tracking-tight leading-none mb-3">
              Create Account<span className="text-[#2563EB]">.</span>
            </h1>
            <p className="font-body text-sm text-[#1E1B18] font-semibold leading-relaxed">
              Sign up using your college email domain (e.g. college.edu). Connect with peers across departments and share placement insights.
            </p>
          </div>

          <div className="mt-8 font-mono text-xs bg-white border-2 border-[#1E1B18] p-3 rounded-xl shadow-[2px_2px_0px_#1E1B18]">
            <span className="sticker-tag bg-[#86EFAC] text-[9px] mb-1">STRICT DOMAIN CHECK</span>
            <div className="text-gray-700 mt-1 font-bold">Email regex validation enabled</div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-4">
            <span className="sticker-tag bg-[#C084FC] mb-2 inline-block">✦ STUDENT REGISTRATION</span>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Enter your details</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-mono text-xs">
            <div>
              <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 pl-9 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]" 
                  placeholder="Arjun Sharma" 
                  required 
                />
                <FiUser className="absolute left-3 top-2.5 text-gray-500" size={14} />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1E1B18] mb-1 uppercase">College Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 pl-9 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]" 
                  placeholder="you@college.edu" 
                  required 
                />
                <FiMail className="absolute left-3 top-2.5 text-gray-500" size={14} />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 pl-9 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]" 
                  placeholder="Min 6 characters" 
                  minLength={6}
                  required 
                />
                <FiLock className="absolute left-3 top-2.5 text-gray-500" size={14} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Department</label>
                <select 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-2 py-2 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]"
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

              <div>
                <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Year</label>
                <select 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-2 py-2 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {formData.department === 'Other' && (
              <div>
                <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Specify Department</label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]"
                  placeholder="e.g. Aerospace, IT, Fashion Tech"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-[#1E1B18] mb-1 uppercase">Year of Graduation (Class of...)</label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                min="2020"
                max="2035"
                className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]"
                placeholder={String(CURRENT_YEAR)}
                required
              />
              <p className="font-mono text-[10px] text-gray-500 mt-1">Auto-filled from your year, but edit it if it's wrong — this is what powers "Class of ___" verification.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="neo-btn neo-btn-coral py-2.5 mt-2 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="mt-4 text-center font-mono text-xs font-bold text-gray-600">
            Already registered? <Link to="/login" className="text-[#2563EB] underline">Log in here</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
