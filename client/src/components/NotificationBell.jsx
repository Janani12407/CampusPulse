import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // Poll for new notifications every 30s so approvals/rejections show up without a refresh
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) fetchNotifications();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) => prev.map((n) => n._id === notification._id ? { ...n, read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="neo-btn p-2 rounded-full relative"
        style={{ padding: '0.4rem' }}
        title="Notifications"
      >
        <FiBell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FB7185] text-[#1E1B18] border-2 border-[#1E1B18] rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-black px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-white border-2 border-[#1E1B18] rounded-xl shadow-[4px_4px_0px_#1E1B18] overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b-2 border-[#1E1B18] bg-[#FBF8F3]">
            <span className="font-heading font-black text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="font-mono text-[10px] font-bold text-[#2563EB] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-gray-500 font-bold">
              ✦ No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left flex items-start gap-2.5 p-3 border-b border-gray-100 last:border-none hover:bg-[#FBF8F3] transition-colors ${!n.read ? 'bg-[#FEEA75]/10' : ''}`}
              >
                {n.type === 'VolunteerApproved' ? (
                  <FiCheckCircle className="text-[#86EFAC] shrink-0 mt-0.5" size={16} />
                ) : n.type === 'VolunteerRejected' ? (
                  <FiXCircle className="text-[#FB7185] shrink-0 mt-0.5" size={16} />
                ) : (
                  <FiBell className="text-[#2563EB] shrink-0 mt-0.5" size={16} />
                )}
                <div className="min-w-0">
                  <p className="font-body text-xs text-[#1E1B18] leading-snug">{n.message}</p>
                  <span className="font-mono text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-1" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
