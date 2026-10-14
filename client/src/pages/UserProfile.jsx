import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiUserPlus, FiUserMinus, FiBook, FiCalendar, FiHeart, FiEdit3, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

const DEPARTMENTS = ['CSE', 'ECE', 'Mechanical', 'Civil', 'EEE', 'Chemical', 'Biotech', 'Other', 'Admin'];

/* ─── Edit Profile Modal ─── */
const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
  const [form, setForm] = useState({
    bio: '',
    department: 'CSE',
    year: 1,
    clubs: '',
    interests: [],
    github: '',
    instagram: '',
    profilePicture: '',
    isPlaced: false,
    placementDetails: {
      company: '',
      role: '',
      offerType: 'On-Campus'
    }
  });
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setForm({
        bio: userData.bio || '',
        department: userData.department || 'CSE',
        year: userData.year || 1,
        clubs: Array.isArray(userData.clubs) ? userData.clubs.join(', ') : (userData.clubs || ''),
        interests: userData.interests || [],
        github: userData.github || '',
        instagram: userData.instagram || '',
        profilePicture: userData.profilePicture || userData.avatar || '',
        isPlaced: userData.isPlaced || false,
        placementDetails: {
          company: userData.placementDetails?.company || '',
          role: userData.placementDetails?.role || '',
          offerType: userData.placementDetails?.offerType || 'On-Campus'
        }
      });
    }
  }, [userData, isOpen]);

  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !form.interests.includes(trimmed)) {
      setForm(prev => ({ ...prev, interests: [...prev.interests, trimmed] }));
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interest) => {
    setForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        clubs: typeof form.clubs === 'string' 
          ? form.clubs.split(',').map(c => c.trim()).filter(Boolean)
          : form.clubs
      };
      const res = await api.put('/users/me/profile', payload);
      onSave(res.data);
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="neo-modal-overlay" onClick={onClose}>
      <div className="bg-[#FFFFFF] border-[2px] border-[#1E1B18] shadow-[6px_6px_0px_0px_#1E1B18] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-black text-2xl">Edit Profile ✎</h2>
          <button onClick={onClose} className="neo-btn p-2">
            <FiX className="stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Bio */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              maxLength={500}
              rows={3}
              placeholder="Write a short bio about yourself..."
              className="w-full border-2 border-[#1E1B18] rounded-xl p-3 font-body text-sm bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow resize-none"
            />
            <span className="font-mono text-[10px] text-gray-500 mt-0.5 block text-right">
              {form.bio.length}/500
            </span>
          </div>

          {/* Department & Year row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Department</label>
              <select
                value={form.department}
                onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Batch Year</label>
              <select
                value={form.year}
                onChange={e => setForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs font-bold bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              >
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Placement Toggle */}
          <div className="p-4 bg-[#86EFAC]/20 border-2 border-[#1E1B18] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-heading font-black text-sm text-[#1E1B18] cursor-pointer">
                  Are you Placed? 🎯
                </label>
                <p className="font-mono text-[11px] text-gray-600">Show a Placed badge on your profile</p>
              </div>
              <input
                type="checkbox"
                checked={form.isPlaced}
                onChange={e => setForm(prev => ({ ...prev, isPlaced: e.target.checked }))}
                className="w-5 h-5 accent-[#2563EB] cursor-pointer"
              />
            </div>

            {form.isPlaced && (
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t-2 border-[#1E1B18]/20">
                <div>
                  <label className="font-mono text-[10px] font-bold text-gray-700 uppercase block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={form.placementDetails.company}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      placementDetails: { ...prev.placementDetails, company: e.target.value }
                    }))}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2 font-mono text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold text-gray-700 uppercase block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={form.placementDetails.role}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      placementDetails: { ...prev.placementDetails, role: e.target.value }
                    }))}
                    placeholder="e.g. Software Engineer"
                    className="w-full border-2 border-[#1E1B18] rounded-xl p-2 font-mono text-xs bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clubs */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Clubs</label>
            <input
              type="text"
              value={form.clubs}
              onChange={e => setForm(prev => ({ ...prev, clubs: e.target.value }))}
              placeholder="e.g. IEEE, Rotaract, GDSC (comma separated)"
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Interests</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.interests.map((interest, idx) => (
                <span key={idx} className="sticker-tag bg-[#FEEA75] text-[#1E1B18] text-[10px] flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-[#FB7185]">
                    <FiX size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="Add interest..."
                className="flex-1 border-2 border-[#1E1B18] rounded-xl p-2 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              />
              <button type="button" onClick={handleAddInterest} className="neo-btn neo-btn-primary py-1.5 px-3 text-xs">
                <FiPlus className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Profile Picture / Avatar */}
          <div>
            <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Avatar Image URL</label>
            <input
              type="text"
              value={form.profilePicture}
              onChange={e => setForm(prev => ({ ...prev, profilePicture: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">GitHub Handle</label>
              <input
                value={form.github}
                onChange={e => setForm(prev => ({ ...prev, github: e.target.value }))}
                placeholder="username"
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              />
            </div>
            <div>
              <label className="font-mono text-xs font-bold text-gray-700 uppercase block mb-1.5">Instagram Handle</label>
              <input
                value={form.instagram}
                onChange={e => setForm(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="username"
                className="w-full border-2 border-[#1E1B18] rounded-xl p-2.5 font-mono text-xs bg-[#FBF8F3] focus:outline-none focus:shadow-[4px_4px_0px_#2563EB] transition-shadow"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="neo-btn w-full py-2.5 text-sm font-black mt-2 bg-[#86EFAC] hover:bg-[#4ade80]"
          >
            {saving ? 'Saving...' : 'Save Changes ✦'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─── User Profile Page ─── */
const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const targetId = id || (currentUser ? currentUser._id : null);
      if (!targetId) return;

      const profileRes = await api.get(`/users/${id ? id + '/activity' : 'me/profile'}`);
      setProfileData(profileRes.data);

      const [followersRes, followingRes] = await Promise.all([
        api.get(`/connections/${targetId}/followers`),
        api.get(`/connections/${targetId}/following`)
      ]);
      
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);

      if (currentUser && targetId !== currentUser._id) {
        setIsFollowing(followersRes.data.some(f => f.followerId && f.followerId._id === currentUser._id));
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return toast.error('Please login to follow users');
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/connections/${profileData.user._id}/unfollow`);
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f.followerId && f.followerId._id !== currentUser._id));
      } else {
        await api.post(`/connections/${profileData.user._id}/follow`);
        setIsFollowing(true);
        setFollowers(prev => [...prev, { followerId: { _id: currentUser._id, name: currentUser.name } }]);
      }
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileSave = (updatedUser) => {
    // Update in auth context so navbar/sidebar reflect changes immediately
    setUser(updatedUser);
    // Update local profile data too
    setProfileData(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  if (loading) return <div className="text-center font-mono font-bold text-gray-500 py-12">Loading student profile...</div>;
  if (!profileData) return <div className="text-center font-mono font-bold text-gray-500 py-12">Profile not found</div>;

  const { user, activity } = profileData;
  const isOwnProfile = currentUser && currentUser._id === user._id;

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content — pt-6 gives tape badges breathing room */}
        <main className="flex-1 min-w-0 pt-6">
          
          {/* Profile Student ID Card */}
          <div className="neo-box bg-white p-6 md:p-8 relative mb-8">
            <div className="tape-header bg-[#C084FC] text-[#1E1B18]">STUDENT IDENTIFICATION</div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-2">
              
              {/* Avatar */}
              {user.profilePicture || user.avatar ? (
                <img 
                  src={user.profilePicture || user.avatar} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-2xl border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] object-cover shrink-0" 
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#C084FC] border-3 border-[#1E1B18] shadow-[4px_4px_0px_#1E1B18] flex items-center justify-center font-black text-4xl text-[#1E1B18] shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-heading font-black text-3xl text-[#1E1B18]">{user.name}</h1>
                      {user.isPlaced && (
                        <span className="px-3 py-1 bg-[#86EFAC] border-2 border-[#1E1B18] rounded-full text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#1E1B18]">
                          🎯 PLACED{user.placementDetails?.company ? ` @ ${user.placementDetails.company}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs font-bold text-gray-600 mt-1 mb-2">
                      {user.department} • Class of Year {user.year}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <button 
                        onClick={() => setEditModalOpen(true)}
                        className="neo-btn neo-btn-lavender py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
                      >
                        <FiEdit3 className="stroke-[2.5]" /> Edit Profile
                      </button>
                    ) : (
                      <button 
                        onClick={handleFollowToggle} 
                        disabled={followLoading}
                        className={`neo-btn text-xs py-1.5 px-4 font-mono font-bold transition-all ${
                          isFollowing 
                            ? 'bg-[#FBF8F3] border-2 border-[#1E1B18] text-[#1E1B18]' 
                            : 'bg-[#86EFAC] text-[#1E1B18] border-2 border-[#1E1B18] shadow-[2px_2px_0px_0px_#1E1B18]'
                        }`}
                      >
                        {isFollowing ? 'Following ✓' : '✦ Follow'}
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-body text-sm text-gray-700 mb-4 max-w-lg">
                  {user.bio || 'No bio provided.'}
                </p>

                {/* Social Links */}
                {(user.github || user.instagram) && (
                  <div className="flex items-center gap-2 font-mono text-xs font-bold mb-4">
                    {user.github && (
                      <a 
                        href={`https://github.com/${user.github.replace('https://github.com/', '').replace('github.com/', '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#2563EB] text-white border border-[#1E1B18] rounded-md hover:underline flex items-center gap-1 shadow-[1.5px_1.5px_0px_#1E1B18]"
                      >
                        github.com/{user.github.replace('https://github.com/', '').replace('github.com/', '')}
                      </a>
                    )}
                    {user.instagram && (
                      <a 
                        href={`https://instagram.com/${user.instagram.replace('https://instagram.com/', '').replace('@', '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#FB7185] text-[#1E1B18] border border-[#1E1B18] rounded-md hover:underline flex items-center gap-1 shadow-[1.5px_1.5px_0px_#1E1B18]"
                      >
                        instagram.com/{user.instagram.replace('https://instagram.com/', '').replace('@', '')}
                      </a>
                    )}
                  </div>
                )}

                {/* Clubs & Interests */}
                <div className="flex flex-col gap-2.5 font-mono text-xs font-bold">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
                    <span className="text-gray-500 uppercase text-[10px] mr-1">Clubs:</span>
                    {user.clubs && user.clubs.filter(c => c && typeof c === 'string' && c.trim() !== '').length > 0 ? (
                      user.clubs.filter(c => c && typeof c === 'string' && c.trim() !== '').map((club, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#FEEA75] border border-[#1E1B18] rounded-md text-xs font-mono font-bold mr-1 text-[#1E1B18]">
                          #{club.startsWith('#') ? club.slice(1) : club}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic text-xs font-normal">No clubs joined yet.</span>
                    )}
                  </div>

                  {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      <span className="text-gray-500 uppercase text-[10px]">Interests:</span>
                      {user.interests.map((interest, idx) => (
                        <span key={idx} className="sticker-tag bg-[#86EFAC] text-[#1E1B18] text-[10px]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Stats Row */}
                <div className="flex items-center justify-center sm:justify-start gap-6 font-mono text-xs font-bold mt-4 pt-4 border-t-2 border-[#1E1B18]">
                  <div>
                    <span className="font-heading font-black text-xl text-[#2563EB] block">
                      {followers.length}
                    </span>
                    <span className="text-gray-500 text-[10px] uppercase">Followers</span>
                  </div>
                  <div>
                    <span className="font-heading font-black text-xl text-[#FB7185] block">
                      {following.length}
                    </span>
                    <span className="text-gray-500 text-[10px] uppercase">Following</span>
                  </div>
                  <div>
                    <span className="font-heading font-black text-xl text-[#86EFAC] block">
                      {activity.rsvps?.length || 0}
                    </span>
                    <span className="text-gray-500 text-[10px] uppercase">Events RSVP'd</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Activity Trail Grid */}
          <h2 className="font-heading font-black text-2xl mb-4">Activity Trail & Contributions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Events RSVP'd */}
            <div className="neo-box p-5 bg-white">
              <h3 className="font-heading font-black text-lg mb-3 flex items-center gap-2 text-[#FB7185]">
                <FiCalendar /> RSVP'd Events ({activity.rsvps.length})
              </h3>

              <div className="flex flex-col gap-2.5 font-mono text-xs max-h-72 overflow-y-auto pr-1">
                {activity.rsvps.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events attended yet.</p>
                ) : (
                  activity.rsvps.map((rsvp) => (
                    <Link to={`/events/${rsvp.eventId?._id}`} key={rsvp._id} className="p-3 bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl hover:translate-x-1 transition-transform block">
                      <div className="font-bold text-[#1E1B18] line-clamp-1 mb-1">{rsvp.eventId?.title}</div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                        <span>{new Date(rsvp.eventId?.dateTime).toLocaleDateString()}</span>
                        <span className={`sticker-tag text-[9px] ${rsvp.status === 'Confirmed' ? 'bg-[#86EFAC]' : 'bg-[#FEEA75]'}`}>
                          {rsvp.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Volunteering Applications */}
            <div className="neo-box p-5 bg-white">
              <h3 className="font-heading font-black text-lg mb-3 flex items-center gap-2 text-[#86EFAC]">
                <FiHeart /> Volunteering ({activity.volunteering.length})
              </h3>

              <div className="flex flex-col gap-2.5 font-mono text-xs max-h-72 overflow-y-auto pr-1">
                {activity.volunteering.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No volunteer applications yet.</p>
                ) : (
                  activity.volunteering.map((app) => (
                    <div key={app._id} className="p-3 bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl">
                      <div className="font-bold text-[#1E1B18] line-clamp-1 mb-1">{app.volunteerNeedId?.title}</div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                        <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        <span className={`sticker-tag text-[9px] ${app.status === 'Approved' ? 'bg-[#86EFAC]' : app.status === 'Rejected' ? 'bg-[#FB7185]' : 'bg-[#FEEA75]'}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Authored Blogs */}
            <div className="neo-box p-5 bg-white md:col-span-2">
              <h3 className="font-heading font-black text-lg mb-3 flex items-center gap-2 text-[#FEEA75]">
                <FiBook /> Blogs & Placement Posts ({activity.blogs.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {activity.blogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 col-span-2">No blogs published yet.</p>
                ) : (
                  activity.blogs.map((blog) => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="p-4 bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl hover:translate-y-0.5 transition-transform block">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-heading font-bold text-sm text-[#1E1B18] line-clamp-1">{blog.title}</h4>
                        <span className="sticker-tag text-[9px] bg-[#FEEA75]">
                          {blog.type === 'General' ? 'Blog' : 'Placement'}
                        </span>
                      </div>
                      <p className="font-body text-xs text-gray-600 line-clamp-2">{blog.body}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={profileData?.user}
        onSave={handleProfileSave}
      />
    </div>
  );
};

export default UserProfile;
