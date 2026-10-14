import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CreateEventModal from '../components/CreateEventModal';

const EventList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Feed Stream */}
        <main className="flex-1 min-w-0 pt-3">
          
          {/* Header & Create Event Button */}
          <div className="neo-box p-6 bg-[#FB7185]/20 mb-6 relative">
            <div className="tape-header bg-[#FB7185] text-[#1E1B18]">CAMPUS TICKETS</div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <h1 className="font-heading font-black text-3xl tracking-tight">Campus Events & Tickets</h1>
                <p className="font-mono text-xs text-gray-700 font-bold mt-1">Discover, RSVP, and reserve your spots for campus fests & tech talks.</p>
              </div>

              {user && (
                <button onClick={() => setIsModalOpen(true)} className="neo-btn neo-btn-coral flex items-center gap-2">
                  <FiPlus className="stroke-[3]" /> Create Event
                </button>
              )}
            </div>
          </div>

          {/* Grid of Ticket Cards */}
          {loading ? (
            <div className="neo-box p-12 text-center font-mono font-bold text-gray-500">
              ✦ Loading campus events...
            </div>
          ) : events.length === 0 ? (
            <div className="neo-box p-12 text-center bg-white">
              <div className="text-4xl mb-2">🎟️</div>
              <h3 className="font-heading font-black text-lg">No events scheduled</h3>
              <p className="font-mono text-xs text-gray-500 mt-1">Check back later or host your own event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const isFull = event.capacity !== null && event.confirmedCount >= event.capacity;
                const eventDate = new Date(event.dateTime);
                const fillPercentage = event.capacity ? Math.min(100, Math.round((event.confirmedCount / event.capacity) * 100)) : 0;

                return (
                  <div key={event._id} className="neo-box bg-white flex flex-col justify-between relative group hover:-translate-y-1 transition-all overflow-hidden">

                    {/* Banner Image */}
                    {event.bannerImage && event.bannerImage.trim() !== '' && (
                      <div className="h-28 w-full overflow-hidden border-b-2 border-[#1E1B18]">
                        <img
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Top Sticker & Category */}
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="sticker-tag bg-[#FB7185] text-[#1E1B18]">
                          {event.category}
                        </span>

                        {/* Date Pill */}
                        <div className="sticker-tag bg-[#FEEA75] text-[#1E1B18]">
                          <FiCalendar size={12} />
                          <span>{eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <h3 className="font-heading font-black text-xl text-[#1E1B18] mb-2 group-hover:text-[#2563EB] transition-colors">
                        {event.title}
                      </h3>

                      <p className="font-body text-xs text-gray-600 line-clamp-2 mb-4">
                        {event.description}
                      </p>

                      <div className="flex flex-col gap-1.5 font-mono text-xs font-bold text-gray-700 mb-4 bg-[#FBF8F3] p-3 border-2 border-[#1E1B18] rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-[#FB7185]" />
                          <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiMapPin className="text-[#2563EB]" />
                          <span>{event.location}</span>
                        </div>
                        {(event.ticketPrice === 0 || event.ticketPrice > 0) && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#86EFAC]">💸</span>
                            <span>{event.ticketPrice === 0 ? 'Free Entry' : `₹${event.ticketPrice}`}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Capacity Progress Bar & Action */}
                    <div className="px-5 pb-5">
                      {event.capacity ? (
                        <div className="mb-4 font-mono text-xs font-bold">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Capacity ({event.confirmedCount}/{event.capacity})</span>
                            <span className={isFull ? 'text-[#FB7185]' : 'text-[#2563EB]'}>
                              {isFull ? 'Full (Waitlist Open)' : `${event.capacity - event.confirmedCount} spots left`}
                            </span>
                          </div>
                          <div className="w-full bg-[#FBF8F3] h-3 border-2 border-[#1E1B18] rounded-full overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-[#FB7185]' : 'bg-[#2563EB]'}`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 font-mono text-xs font-bold text-gray-600 flex items-center gap-1">
                          <FiUsers className="text-[#86EFAC]" /> {event.confirmedCount} Attending (Unlimited)
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t-2 border-[#1E1B18]">
                        <span className="font-mono text-[11px] font-bold text-gray-500">
                          By {event.organizerId?.name || 'Club'}
                        </span>

                        <Link 
                          to={`/events/${event._id}`}
                          className={`neo-btn text-xs py-1.5 px-4 font-bold flex items-center gap-1 ${isFull ? 'bg-[#FEEA75]' : 'bg-[#FB7185] text-[#1E1B18]'}`}
                        >
                          <span>{isFull ? 'Waitlist' : 'RSVP Now'}</span>
                          <FiArrowRight size={14} />
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

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onEventCreated={fetchEvents} 
      />
    </div>
  );
};

export default EventList;
