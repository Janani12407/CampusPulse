import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error('Please fill all fields');
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center bg-[#FBF8F3]">
      <div className="neo-box max-w-4xl w-full bg-white grid grid-cols-1 md:grid-cols-2 relative overflow-hidden">
        
        {/* Left Side: Brand Hero */}
        <div className="bg-[#FEEA75] p-8 flex flex-col justify-between border-b-2 md:border-b-0 md:border-r-2 border-[#1E1B18] relative">
          <div className="tape-header bg-[#FB7185] text-[#1E1B18]">✦ VERIFIED ACCESS</div>
          
          <div className="mt-8">
            <div className="w-14 h-14 bg-[#FB7185] border-2 border-[#1E1B18] shadow-[3px_3px_0px_#1E1B18] rounded-2xl flex items-center justify-center font-black text-2xl text-[#1E1B18] mb-4">
              P
            </div>
            <h1 className="font-heading font-black text-4xl text-[#1E1B18] tracking-tight leading-none mb-3">
              PULSE<span className="text-[#2563EB]">.</span>
            </h1>
            <p className="font-body text-sm text-[#1E1B18] font-semibold leading-relaxed">
              The high-energy, community-verified campus hub. Stay updated on news, RSVP for events, volunteer, and read placement experiences.
            </p>
          </div>

          <div className="mt-8 font-mono text-xs bg-white border-2 border-[#1E1B18] p-3 rounded-xl shadow-[2px_2px_0px_#1E1B18]">
            <div className="font-bold text-[#2563EB] mb-1">💡 Quick Demo Login:</div>
            <div className="text-gray-700">arjun@college.edu / password123</div>
            <div className="text-gray-500 text-[10px] mt-0.5">(CSE, Year 1)</div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <span className="sticker-tag bg-[#86EFAC] mb-2 inline-block">✦ WELCOME BACK</span>
            <h2 className="font-heading font-black text-2xl text-[#1E1B18]">Log into your account</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-xs">
            <div>
              <label className="block font-bold text-[#1E1B18] mb-1.5 uppercase">College Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2.5 pl-9 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]" 
                  placeholder="you@college.edu" 
                  required 
                />
                <FiMail className="absolute left-3 top-3 text-gray-500" size={14} />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1E1B18] mb-1.5 uppercase">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2.5 pl-9 font-bold text-xs focus:outline-none focus:bg-white focus:shadow-[3px_3px_0px_#1E1B18]" 
                  placeholder="••••••••" 
                  required 
                />
                <FiLock className="absolute left-3 top-3 text-gray-500" size={14} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="neo-btn neo-btn-primary py-2.5 mt-3 text-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : 'Log In'}</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="mt-6 text-center font-mono text-xs font-bold text-gray-600">
            Don't have an account? <Link to="/signup" className="text-[#2563EB] underline">Sign up here</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
