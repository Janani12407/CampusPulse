import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiBriefcase, FiUser, FiClock, FiPlus, FiStar, FiBookmark, FiArrowRight, FiArrowUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CreateBlogModal from '../components/CreateBlogModal';

const BlogList = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Placement filters
  const [type, setType] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (type !== 'General') {
        if (company) params.company = company;
        if (role) params.role = role;
        if (department) params.department = department;
        if (year) params.year = year;
      }
      
      const res = await api.get('/blogs', { params });
      setBlogs(res.data.blogs);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [type, company, role, department, year]);

  const handleUpvote = async (blogId) => {
    if (!user) return toast.error('Please login to upvote');
    try {
      const res = await api.post(`/blogs/${blogId}/upvote`);
      setBlogs((prev) => prev.map((b) => {
        if (b._id !== blogId) return b;
        const upvotes = res.data.upvoted
          ? [...(b.upvotes || []), user._id]
          : (b.upvotes || []).filter((uid) => uid !== user._id);
        return { ...b, upvotes };
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upvote');
    }
  };

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Stream */}
        <main className="flex-1 min-w-0 pt-3">
          
          {/* Header */}
          <div className="neo-box p-6 bg-[#FEEA75]/30 mb-6 relative">
            <div className="tape-header bg-[#FEEA75] text-[#1E1B18]">CAREER ARCHIVES</div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h1 className="font-heading font-black text-3xl tracking-tight">Placement Experiences & Blogs</h1>
                <p className="font-mono text-xs text-gray-700 font-bold mt-1">Real interview rounds, question breakdowns, and campus wisdom.</p>
              </div>

              {user && (
                <button onClick={() => setIsModalOpen(true)} className="neo-btn neo-btn-primary flex items-center gap-2">
                  <FiPlus className="stroke-[3]" /> Write Post
                </button>
              )}
            </div>
          </div>

          {/* Neubrutalist Filter Bar */}
          <div className="neo-box p-5 bg-white mb-6">
            <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiFilter className="text-[#2563EB]" /> FILTER PLACEMENT & BLOGS
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold focus:outline-none focus:shadow-[2px_2px_0px_#1E1B18]"
              >
                <option value="">All Post Types</option>
                <option value="PlacementExperience">Placement Experiences</option>
                <option value="General">General Blogs</option>
              </select>

              <input 
                type="text" 
                placeholder="Company (e.g. Google)" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_#1E1B18]"
                disabled={type === 'General'}
              />

              <input 
                type="text" 
                placeholder="Role (e.g. SDE)" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_#1E1B18]"
                disabled={type === 'General'}
              />

              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold focus:outline-none focus:shadow-[2px_2px_0px_#1E1B18]"
                disabled={type === 'General'}
              >
                <option value="">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Chemical">Chemical</option>
                <option value="Biotech">Biotech</option>
              </select>

              <input 
                type="number" 
                placeholder="Year (2025)" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl px-3 py-2 font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_#1E1B18]"
                disabled={type === 'General'}
              />
            </div>
          </div>

          {/* Placement Blog Stream */}
          {loading ? (
            <div className="neo-box p-12 text-center font-mono font-bold text-gray-500">
              ✦ Loading placement experiences...
            </div>
          ) : blogs.length === 0 ? (
            <div className="neo-box p-12 text-center bg-white">
              <div className="text-4xl mb-2">📝</div>
              <h3 className="font-heading font-black text-lg">No posts found</h3>
              <p className="font-mono text-xs text-gray-500 mt-1">Try tweaking your search filters!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => {
                const isPlacement = blog.type === 'PlacementExperience';
                const pd = blog.placementDetails;

                return (
                  <div key={blog._id} className="neo-box bg-white p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all relative">
                    
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`sticker-tag ${isPlacement ? 'bg-[#FEEA75] text-[#1E1B18]' : 'bg-[#C084FC] text-[#1E1B18]'}`}>
                          {isPlacement ? '✦ PLACEMENT' : '✦ GENERAL'}
                        </span>

                        {isPlacement && pd?.verifiedPlacement && (
                          <span className="sticker-tag bg-[#86EFAC] text-[#1E1B18]">
                            Verified ✓
                          </span>
                        )}
                      </div>

                      {/* Post Title */}
                      <h3 className="font-heading font-black text-xl text-[#1E1B18] mb-2 group-hover:text-[#2563EB] transition-colors leading-snug">
                        {blog.title}
                      </h3>

                      {/* Placement Metadata Pills */}
                      {isPlacement && pd && (
                        <div className="flex items-center gap-2 flex-wrap font-mono text-xs font-bold mb-3">
                          {pd.company && pd.company.trim() !== '' && (
                            <span className="sticker-tag bg-[#2563EB] text-white">
                              <FiBriefcase size={12} /> {pd.company}
                            </span>
                          )}
                          {pd.role && pd.role.trim() !== '' && (
                            <span className="sticker-tag bg-[#FBF8F3]">
                              {pd.role}
                            </span>
                          )}
                          {(pd.department || pd.yearOfPlacement) && (
                            <span className="sticker-tag bg-[#86EFAC]">
                              {pd.department && pd.department.trim() !== '' ? pd.department : ''}
                              {pd.department && pd.yearOfPlacement ? " '" : ''}
                              {pd.yearOfPlacement ? String(pd.yearOfPlacement).slice(-2) : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="font-body text-xs text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                        {blog.body}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t-2 border-[#1E1B18] flex items-center justify-between font-mono text-xs font-bold gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#FEEA75] border border-[#1E1B18] flex items-center justify-center text-[10px] shrink-0">
                          {blog.authorId?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-gray-600 truncate max-w-[90px]">{blog.authorId?.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpvote(blog._id)}
                          className={`shrink-0 whitespace-nowrap flex items-center gap-1 border-2 border-[#1E1B18] rounded-xl px-2.5 py-1 text-xs font-bold shadow-[1.5px_1.5px_0px_0px_#1E1B18] transition-all hover:-translate-y-0.5 ${
                            user && blog.upvotes?.some((uid) => uid === user._id || uid?._id === user._id)
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-white text-[#1E1B18]'
                          }`}
                        >
                          <FiArrowUp size={12} className="stroke-[3]" />
                          {blog.upvotes?.length || 0}
                        </button>

                        <Link
                          to={`/blogs/${blog._id}`}
                          className="neo-btn neo-btn-primary py-1 px-3 text-xs flex items-center gap-1 shrink-0 whitespace-nowrap"
                        >
                          <span>Read</span>
                          <FiArrowRight size={12} />
                        </Link>
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

      <CreateBlogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onBlogCreated={fetchBlogs} 
      />
    </div>
  );
};

export default BlogList;
