import { useState, useEffect } from 'react';
import { FiFilter, FiClock, FiUser, FiHeart, FiMessageCircle, FiShare2, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

const getStickerColor = (cat) => {
  switch(cat) {
    case 'Academic': return 'bg-[#2563EB] text-white';
    case 'Events': return 'bg-[#FB7185] text-[#1E1B18]';
    case 'Admin': return 'bg-[#FEEA75] text-[#1E1B18]';
    case 'Clubs': return 'bg-[#86EFAC] text-[#1E1B18]';
    default: return 'bg-white text-[#1E1B18]';
  }
};

const NewsCard = ({ item, index, onLikeUpdate }) => {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(item.commentsCount || 0);

  const isLiked = Boolean(
    user && item.likes && item.likes.some(id => (typeof id === 'string' ? id : id._id) === user._id)
  );
  const likesCount = item.likesCount !== undefined ? item.likesCount : (item.likes?.length || 0);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/news/${item._id}/comments`);
      setComments(res.data);
      setCommentCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!isCommentsOpen && comments.length === 0) {
      fetchComments();
    }
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) return toast.error('Please login to comment');

    setPostingComment(true);
    try {
      const res = await api.post(`/news/${item._id}/comments`, { text: commentText });
      setComments(prev => [res.data, ...prev]);
      setCommentText('');
      setCommentCount(prev => prev + 1);
      toast.success('Comment posted! ✦');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    try {
      const res = await api.post(`/news/${item._id}/like`);
      onLikeUpdate(item._id, res.data.likes, res.data.likesCount);
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/news#${item._id}`;
    const shareData = {
      title: item.title,
      text: `Check out this post on Campus Pulse: ${item.title}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Post link copied to clipboard! ✦');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Post link copied to clipboard! ✦');
    }
  };

  const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'];
  const tagRot = rotations[index % rotations.length];

  return (
    <article id={item._id} className="neo-box p-6 bg-white relative transition-all">
      
      {/* Sticker Tape Tag */}
      <div className={`tape-header ${getStickerColor(item.category)} ${tagRot}`}>
        ✦ {item.category.toUpperCase()}
      </div>

      {/* Author & Timestamp Header */}
      <div className="flex justify-between items-start gap-4 mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEEA75] border-2 border-[#1E1B18] shadow-[2px_2px_0px_#1E1B18] flex items-center justify-center font-black text-sm text-[#1E1B18]">
            {item.authorId?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-[#1E1B18] flex items-center gap-1.5">
              {item.authorId?.name}
              {item.authorId?.role !== 'student' && (
                <span className="sticker-tag text-[9px] bg-[#86EFAC] text-[#1E1B18] px-1 py-0">
                  {item.authorId?.role}
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] text-gray-500 font-bold">
              {item.authorId?.department} • {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <h2 className="font-heading font-black text-xl text-[#1E1B18] mb-3 leading-snug">
        {item.title}
      </h2>
      
      <p className="font-body text-sm text-gray-800 leading-relaxed mb-6 whitespace-pre-wrap">
        {item.body}
      </p>

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-[#1E1B18] font-mono text-xs font-bold">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLike} 
            className={`neo-btn py-1 px-3 text-xs flex items-center gap-1.5 active:scale-95 transition-transform ${isLiked ? 'bg-[#FB7185] text-[#1E1B18]' : ''}`}
          >
            <FiHeart className={isLiked ? 'fill-current' : ''} size={14} />
            <span>{likesCount}</span>
          </button>

          <button 
            onClick={handleToggleComments}
            className={`neo-btn py-1 px-3 text-xs flex items-center gap-1.5 active:scale-95 transition-transform ${isCommentsOpen ? 'bg-[#FEEA75]' : 'bg-[#FBF8F3]'}`}
          >
            <FiMessageCircle size={14} />
            <span>{commentCount} Comments</span>
          </button>
        </div>

        <button 
          onClick={handleShare}
          className="neo-btn py-1 px-3 text-xs bg-[#86EFAC]/30 hover:bg-[#86EFAC] flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <FiShare2 size={13} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Expandable Y2K Comment Section */}
      {isCommentsOpen && (
        <div className="mt-5 pt-5 border-t-2 border-dashed border-[#1E1B18]/40 bg-[#FBF8F3] -mx-6 -mb-6 p-6 rounded-b-xl">
          <h4 className="font-heading font-black text-sm uppercase mb-3 flex items-center gap-1.5">
            💬 Comments ({commentCount})
          </h4>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? "Write a comment..." : "Login to post a comment..."}
              disabled={!user || postingComment}
              className="flex-1 border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-white focus:outline-none focus:shadow-[3px_3px_0px_#2563EB] transition-shadow"
            />
            <button
              type="submit"
              disabled={!user || postingComment || !commentText.trim()}
              className="neo-btn bg-[#86EFAC] text-[#1E1B18] font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-[2px_2px_0px_#1E1B18] disabled:opacity-50"
            >
              {postingComment ? 'Posting...' : 'Post ✦'}
            </button>
          </form>

          {/* Comment List */}
          {loadingComments ? (
            <div className="font-mono text-xs text-gray-500 py-3 text-center">✦ Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="font-mono text-xs text-gray-500 py-3 text-center italic">No comments yet. Be the first!</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c._id} className="p-3 bg-white border-2 border-[#1E1B18] rounded-xl shadow-[2px_2px_0px_#1E1B18]">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#C084FC] border border-[#1E1B18] flex items-center justify-center font-black text-[10px] text-[#1E1B18]">
                        {c.authorId?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-heading font-bold text-xs text-[#1E1B18]">{c.authorId?.name}</span>
                      {c.authorId?.department && (
                        <span className="sticker-tag bg-[#FEEA75] text-[#1E1B18] text-[9px] py-0 px-1">
                          {c.authorId.department}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-body text-xs text-gray-800 pl-8">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </article>
  );
};

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news', { params: { category } });
      setNews(res.data.news);
    } catch (err) {
      console.error('Failed to fetch news', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  const handleLikeUpdate = (id, newLikes, newCount) => {
    setNews(prev => prev.map(item => {
      if (item._id === id) {
        return {
          ...item,
          likes: newLikes,
          likesCount: newCount
        };
      }
      return item;
    }));
  };

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Feed Stream */}
        <main className="flex-1 min-w-0 pt-3">
          
          {/* Header & Category Bar */}
          <div className="neo-box p-6 bg-white mb-6 relative">
            <div className="tape-header bg-[#FB7185] text-[#1E1B18]">OFFICIAL BROADCAST</div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h1 className="font-heading font-black text-3xl tracking-tight">Campus News & Broadcasts</h1>
                <p className="font-mono text-xs text-gray-600 font-bold mt-1">Official updates from admin and verified campus clubs.</p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <FiFilter className="text-[#1E1B18]" size={16} />
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#FBF8F3] border-2 border-[#1E1B18] font-mono font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:shadow-[2.5px_2.5px_0px_#1E1B18]"
                >
                  <option value="">All Categories</option>
                  <option value="Academic">Academic</option>
                  <option value="Events">Events</option>
                  <option value="Admin">Admin</option>
                  <option value="Clubs">Clubs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feed List */}
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="neo-box p-12 text-center font-mono font-bold text-gray-500">
                ✦ Loading campus feed...
              </div>
            ) : news.length === 0 ? (
              <div className="neo-box p-12 text-center bg-white">
                <div className="text-4xl mb-2">📭</div>
                <h3 className="font-heading font-black text-lg">No broadcast found</h3>
                <p className="font-mono text-xs text-gray-500 mt-1">Try switching categories or check back later.</p>
              </div>
            ) : (
              news.map((item, index) => (
                <NewsCard
                  key={item._id}
                  item={item}
                  index={index}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))
            )}
          </div>

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  );
};

export default NewsFeed;
