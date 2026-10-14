import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers, FiMessageSquare, FiEdit, FiTrash2, FiClock, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [waitlistPosition, setWaitlistPosition] = useState(null);
  
  const [newUpdate, setNewUpdate] = useState('');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
    dateTime: '',
    location: '',
    capacity: '',
    ticketPrice: 0
  });

  const fetchEventData = async () => {
    try {
      const [eventRes, updatesRes, attendeesRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/updates`),
        api.get(`/events/${id}/attendees`)
      ]);
      setEvent(eventRes.data);
      setUpdates(updatesRes.data);
      setAttendees(attendeesRes.data);
      
      setEditForm({
        title: eventRes.data.title,
        description: eventRes.data.description,
        category: eventRes.data.category,
        dateTime: new Date(eventRes.data.dateTime).toISOString().slice(0, 16),
        location: eventRes.data.location,
        capacity: eventRes.data.capacity === null ? '' : eventRes.data.capacity,
        ticketPrice: eventRes.data.ticketPrice ?? 0
      });

      if (user) {
        const rsvpRes = await api.get(`/events/${id}/my-rsvp`);
        setRsvpStatus(rsvpRes.data.status);
        setWaitlistPosition(rsvpRes.data.waitlistPosition);
      }
    } catch (err) {
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id, user]);

  const handleRSVP = async () => {
    if (!user) return toast.error('Please login to RSVP');
    try {
      const res = await api.post(`/events/${id}/rsvp`);
      toast.success(`RSVP Successful: ${res.data.status}`);
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRSVP = async () => {
    try {
      await api.delete(`/events/${id}/rsvp`);
      toast.success('RSVP Cancelled');
      setRsvpStatus(null);
      setWaitlistPosition(null);
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    try {
      await api.post(`/events/${id}/updates`, { text: newUpdate });
      setNewUpdate('');
      toast.success('Update posted');
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post update');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        capacity: editForm.capacity === '' ? null : parseInt(editForm.capacity),
        ticketPrice: editForm.ticketPrice === '' ? 0 : parseFloat(editForm.ticketPrice)
      };
      await api.put(`/events/${id}`, payload);
      toast.success('Event updated successfully');
      setIsEditing(false);
      fetchEventData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) return <div className="pt-28 text-center font-mono font-bold text-gray-500">Loading event details...</div>;
  if (!event) return <div className="pt-28 text-center font-mono font-bold text-gray-500">Event not found</div>;

  const isOrganizer = user && event.organizerId?._id === user._id;
  const isFull = event.capacity !== null && event.confirmedCount >= event.capacity;
  const canPostUpdate = isOrganizer || rsvpStatus === 'Confirmed';
  const fillPercentage = event.capacity ? Math.min(100, Math.round((event.confirmedCount / event.capacity) * 100)) : 0;

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 pt-3">
          
          <Link to="/events" className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-gray-600 hover:text-[#2563EB] mb-4">
            <FiArrowLeft /> Back to Events
          </Link>

          {/* Event Banner & Details Card */}
          <div className="neo-box bg-white p-6 md:p-8 relative mb-8">
            <div className="tape-header bg-[#FB7185] text-[#1E1B18]">EVENT TICKET</div>

            <div className="flex justify-between items-start gap-4 mb-4 mt-2">
              <span className="sticker-tag bg-[#FB7185]">
                {event.category}
              </span>

              {isOrganizer && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditing(!isEditing)} className="neo-btn py-1 px-3 text-xs flex items-center gap-1">
                    <FiEdit size={12} /> {isEditing ? 'Cancel Edit' : 'Edit'}
                  </button>
                  <button onClick={handleDeleteEvent} className="neo-btn py-1 px-3 text-xs bg-[#FB7185] text-[#1E1B18] flex items-center gap-1">
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 font-mono text-xs mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Title</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Category</label>
                    <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl">
                      <option value="Academic">Academic</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Technical">Technical</option>
                      <option value="Social">Social</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" rows={3} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Date & Time</label>
                    <input type="datetime-local" value={editForm.dateTime} onChange={(e) => setEditForm({...editForm, dateTime: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Location</label>
                    <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Capacity (leave empty for unlimited)</label>
                    <input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({...editForm, capacity: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Ticket Price (₹ 0 for Free)</label>
                    <input type="number" min="0" value={editForm.ticketPrice} onChange={(e) => setEditForm({...editForm, ticketPrice: e.target.value})} className="w-full border-2 border-[#1E1B18] p-2 rounded-xl" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="neo-btn text-xs">Cancel</button>
                  <button type="submit" className="neo-btn neo-btn-coral text-xs">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="font-heading font-black text-3xl text-[#1E1B18] mb-3">{event.title}</h1>
                <p className="font-body text-base text-gray-800 leading-relaxed mb-6">{event.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-mono text-xs bg-[#FBF8F3] p-4 border-2 border-[#1E1B18] rounded-xl">
                  <div>
                    <span className="text-gray-500 font-bold block mb-0.5">DATE & TIME</span>
                    <span className="font-bold flex items-center gap-1">
                      <FiCalendar className="text-[#FB7185]" /> {new Date(event.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block mb-0.5">LOCATION</span>
                    <span className="font-bold flex items-center gap-1">
                      <FiMapPin className="text-[#2563EB]" /> {event.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block mb-0.5">TICKET PRICE</span>
                    <span className="font-bold flex items-center gap-1">
                      <span className="text-[#86EFAC]">💸</span> {event.ticketPrice === 0 || event.ticketPrice === undefined ? 'Free Entry' : `₹${event.ticketPrice}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block mb-0.5">CAPACITY</span>
                    <span className="font-bold flex items-center gap-1">
                      <FiUsers className="text-[#86EFAC]" /> {event.capacity ? `${event.confirmedCount}/${event.capacity} (${isFull ? 'Full' : `${event.capacity - event.confirmedCount} left`})` : `${event.confirmedCount} Attending`}
                    </span>
                  </div>
                </div>

                {event.capacity && (
                  <div className="mb-6 font-mono text-xs font-bold">
                    <div className="flex justify-between mb-1">
                      <span>Capacity Filled</span>
                      <span>{fillPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#FBF8F3] h-3 border-2 border-[#1E1B18] rounded-full overflow-hidden p-0.5">
                      <div className="bg-[#FB7185] h-full rounded-full transition-all duration-500" style={{ width: `${fillPercentage}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t-2 border-[#1E1B18] font-mono text-xs">
                  <div className="font-bold text-gray-700">
                    Organized by: <Link to={`/profile/${event.organizerId?._id}`} className="text-[#2563EB] underline">{event.organizerId?.name}</Link>
                  </div>

                  <div>
                    {rsvpStatus ? (
                      <div className="flex items-center gap-2">
                        <span className={`sticker-tag ${rsvpStatus === 'Confirmed' ? 'bg-[#86EFAC]' : 'bg-[#FEEA75]'}`}>
                          {rsvpStatus === 'Confirmed' ? 'Confirmed ✓' : `Waitlisted #${waitlistPosition}`}
                        </span>
                        <button onClick={handleCancelRSVP} className="neo-btn text-xs py-1 px-3">Cancel RSVP</button>
                      </div>
                    ) : (
                      <button onClick={handleRSVP} className="neo-btn neo-btn-coral text-sm py-2 px-6">
                        {isFull ? 'Join Waitlist' : 'RSVP Now ✦'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Mini Updates & Attendees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Updates Feed */}
            <div className="md:col-span-2">
              <h2 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                <FiMessageSquare className="text-[#2563EB]" /> Event Updates
              </h2>

              {canPostUpdate && (
                <form onSubmit={handlePostUpdate} className="neo-box p-4 bg-white mb-4">
                  <textarea 
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder={isOrganizer ? "Post an official update..." : "Share a note or comment with attendees..."}
                    className="w-full bg-[#FBF8F3] border-2 border-[#1E1B18] rounded-xl p-3 font-mono text-xs font-bold mb-2 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={!newUpdate.trim()} className="neo-btn neo-btn-blue text-xs py-1 px-3 flex items-center gap-1">
                      <span>Post</span>
                      <FiSend size={12} />
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-3">
                {updates.length === 0 ? (
                  <div className="neo-box p-6 text-center font-mono text-xs text-gray-500">No updates posted yet.</div>
                ) : (
                  updates.map((update) => (
                    <div key={update._id} className="neo-box p-4 bg-white font-mono text-xs">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <Link to={`/profile/${update.authorId?._id}`} className="text-[#2563EB] hover:underline">{update.authorId?.name}</Link>
                          {update.authorId?._id === event.organizerId?._id && (
                            <span className="sticker-tag bg-[#FB7185] text-[9px] px-1 py-0">Organizer</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(update.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="font-body text-xs text-gray-800">{update.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Attendees List */}
            <div>
              <h2 className="font-heading font-black text-xl mb-4 flex items-center gap-2">
                <FiUsers className="text-[#86EFAC]" /> Who's Going
              </h2>

              <div className="neo-box p-4 bg-white">
                {attendees.length === 0 ? (
                  <div className="font-mono text-xs text-gray-500 text-center py-3">No confirmed attendees yet.</div>
                ) : (
                  <div className="flex flex-col gap-2.5 font-mono text-xs">
                    {attendees.map((attendee) => (
                      <Link to={`/profile/${attendee._id}`} key={attendee._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FBF8F3] border border-transparent hover:border-[#1E1B18] transition-all">
                        <div className="w-8 h-8 rounded-xl bg-[#FEEA75] border border-[#1E1B18] flex items-center justify-center font-black">
                          {attendee.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-[#1E1B18] truncate">{attendee.name}</div>
                          <div className="text-[10px] text-gray-500">{attendee.department} • Y{attendee.year}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>

        {/* Right Sidebar */}
        <RightSidebar />

      </div>
    </div>
  );
};

export default EventDetail;
