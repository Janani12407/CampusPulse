import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiClock, FiBriefcase, FiStar, FiMessageSquare, FiCalendar, FiSend, FiArrowUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const fetchBlogData = async () => {
    try {
      const [blogRes, commentsRes] = await Promise.all([
        api.get(`/blogs/${id}`),
        api.get(`/blogs/${id}/comments`)
      ]);
      setBlog(blogRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      toast.error('Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to comment');
    if (!newComment.trim()) return;

    try {
      await api.post(`/blogs/${id}/comments`, { text: newComment });
      setNewComment('');
      toast.success('Comment posted');
      fetchBlogData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleUpvote = async () => {
    if (!user) return toast.error('Please login to upvote');
    try {
      const res = await api.post(`/blogs/${id}/upvote`);
      setBlog((prev) => ({
        ...prev,
        upvotes: res.data.upvoted
          ? [...(prev.upvotes || []), user._id]
          : (prev.upvotes || []).filter((uid) => uid !== user._id)
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upvote');
    }
  };

  const handleVerify = async (verified) => {
    try {
      await api.put(`/blogs/${id}/verify`, { verified });
      toast.success(verified ? 'Experience verified!' : 'Verification removed');
      fetchBlogData();
    } catch (err) {
      toast.error('Failed to update verification status');
    }
  };

  if (loading) return <div className="pt-28 text-center font-mono font-bold text-gray-500">Loading blog details...</div>;
  if (!blog) return <div className="pt-28 text-center font-mono font-bold text-gray-500">Blog not found</div>;

  const isPlacement = blog.type === 'PlacementExperience';
  const pd = blog.placementDetails;
  const upvoteCount = blog.upvotes?.length || 0;
  const hasUpvoted = user && blog.upvotes?.some((uid) => uid === user._id || uid?._id === user._id);

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 pt-3">
          
          <Link to="/blogs" className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-gray-600 hover:text-[#2563EB] mb-4">
            <FiArrowLeft /> Back to Blogs
          </Link>

          <article className="neo-box bg-white p-6 md:p-8 relative mb-8">
            <div className="tape-header bg-[#FEEA75] text-[#1E1B18]">CAREER ARCHIVE</div>

            <div className="flex justify-between items-start gap-4 mb-4 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`sticker-tag ${isPlacement ? 'bg-[#FEEA75]' : 'bg-[#C084FC]'}`}>
                  {isPlacement ? '✦ PLACEMENT EXPERIENCE' : '✦ GENERAL BLOG'}
                </span>

                {isPlacement && pd?.verifiedPlacement && (
                  <span className="sticker-tag bg-[#86EFAC]">Verified ✓</span>
                )}
              </div>

              <button
                onClick={handleUpvote}
                className={`shrink-0 flex items-center gap-1.5 border-2 border-[#1E1B18] rounded-xl px-3 py-1.5 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#1E1B18] transition-all hover:-translate-y-0.5 ${
                  hasUpvoted ? 'bg-[#2563EB] text-white' : 'bg-white text-[#1E1B18]'
                }`}
              >
                <FiArrowUp size={13} className="stroke-[3]" />
                {upvoteCount}
              </button>
            </div>

            <h1 className="font-heading font-black text-3xl md:text-4xl text-[#1E1B18] mb-4 leading-snug">{blog.title}</h1>

            <div className="flex items-center gap-4 font-mono text-xs text-gray-600 font-bold mb-6 pb-4 border-b-2 border-[#1E1B18]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FEEA75] border border-[#1E1B18] flex items-center justify-center font-black">
                  {blog.authorId?.name?.charAt(0) || 'U'}
                </div>
                <Link to={`/profile/${blog.authorId?._id}`} className="text-[#2563EB] underline">{blog.authorId?.name}</Link>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1"><FiClock /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, i) => (
                  <span key={i} className="sticker-tag bg-[#FBF8F3]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Placement Breakdown Card */}
            {isPlacement && pd && (
              <div className="neo-box bg-[#FBF8F3] p-5 mb-8">
                <h2 className="font-heading font-black text-lg mb-3 flex items-center gap-2 text-[#2563EB]">
                  <FiBriefcase /> Placement Summary
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs font-bold mb-4">
                  <div>
                    <span className="text-gray-500 block text-[10px]">COMPANY</span>
                    <span className="text-base text-[#1E1B18]">{pd.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">ROLE</span>
                    <span className="text-base text-[#1E1B18]">{pd.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">DEPT & YEAR</span>
                    <span>{pd.department} '{String(pd.yearOfPlacement).slice(-2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">DIFFICULTY</span>
                    <div className="flex gap-1 text-[#FB7185] mt-1">
                      {Array.from({length: pd.difficultyRating || 3}).map((_, idx) => (
                        <FiStar key={idx} className="fill-current" size={14} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#1E1B18] font-body text-xs italic">
                  <span className="font-mono font-bold not-italic text-gray-500 block text-[10px] uppercase mb-1">Verdict & Tips</span>
                  "{pd.verdictTips}"
                </div>
              </div>
            )}

            {/* Body */}
            <div className="font-body text-base text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
              {blog.body}
            </div>

            {/* Rounds */}
            {isPlacement && pd && pd.roundsFaced && pd.roundsFaced.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading font-black text-xl mb-4">Interview Rounds Breakdown</h3>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {pd.roundsFaced.map((round, idx) => (
                    <div key={idx} className="neo-box p-4 bg-[#FBF8F3]">
                      <h4 className="font-bold text-sm text-[#2563EB] mb-1">Round {idx + 1}: {round.roundName}</h4>
                      <p className="font-body text-xs text-gray-700">{round.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Event */}
            {blog.linkedEventId && (
              <div className="neo-box p-4 bg-[#86EFAC]/20 flex justify-between items-center font-mono text-xs font-bold mb-8">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-[#2563EB]" />
                  <span>Linked Event: {blog.linkedEventId.title}</span>
                </div>
                <Link to={`/events/${blog.linkedEventId._id}`} className="neo-btn py-1 px-3 text-xs">
                  View Event
                </Link>
              </div>
            )}

            {/* Admin Controls */}
            {user && user.role === 'admin' && isPlacement && (
              <div className="pt-4 border-t-2 border-[#1E1B18] flex items-center justify-between font-mono text-xs bg-[#FEEA75]/30 p-3 rounded-xl">
                <div>
                  <strong className="block">Admin Verification Controls</strong>
                  <span className="text-[10px] text-gray-600">Mark experience as verified if student proof is validated.</span>
                </div>
                {pd?.verifiedPlacement ? (
                  <button onClick={() => handleVerify(false)} className="neo-btn py-1 px-3 bg-[#FB7185] text-xs">Remove</button>
                ) : (
                  <button onClick={() => handleVerify(true)} className="neo-btn neo-btn-mint py-1 px-3 text-xs">Verify ✓</button>
                )}
              </div>
            )}

          </article>

          {/* Comments */}
          <div>
            <h2 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-[#2563EB]" /> Discussion & Comments ({comments.length})
            </h2>

            {user ? (
              <form onSubmit={handlePostComment} className="neo-box p-4 bg-white mb-6">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question about interview prep or share thoughts..."
                  className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl p-3 font-mono text-xs font-bold mb-2 focus:outline-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button type="submit" disabled={!newComment.trim()} className="neo-btn neo-btn-primary text-xs py-1.5 px-4 flex items-center gap-1">
                    <span>Post Comment</span>
                    <FiSend size={12} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="neo-box p-4 bg-white text-center font-mono text-xs text-gray-500 mb-6">
                Please <Link to="/login" className="text-[#2563EB] underline font-bold">log in</Link> to join the discussion.
              </div>
            )}

            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment._id} className="neo-box p-4 bg-white font-mono text-xs">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2 font-bold">
                      <div className="w-6 h-6 rounded-full bg-[#FEEA75] border border-[#1E1B18] flex items-center justify-center font-black text-[10px]">
                        {comment.authorId?.name?.charAt(0) || 'U'}
                      </div>
                      <Link to={`/profile/${comment.authorId?._id}`} className="text-[#2563EB] hover:underline">{comment.authorId?.name}</Link>
                    </div>
                    <span className="text-[10px] text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-body text-xs text-gray-800 pl-8">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  );
};

export default BlogDetail;
