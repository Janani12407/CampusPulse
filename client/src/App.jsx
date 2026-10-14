import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import NewsFeed from './pages/NewsFeed';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import VolunteerList from './pages/VolunteerList';
import VolunteerDashboard from './pages/VolunteerDashboard';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import UserProfile from './pages/UserProfile';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="app-container">
      <Navbar />
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
        },
      }}/>
      
      <main className="pt-28 md:pt-32">
        <Routes>
          <Route path="/" element={<Navigate to="/news" />} />
          <Route path="/news" element={<NewsFeed />} />
          
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          
          <Route path="/volunteering" element={<VolunteerList />} />
          <Route path="/volunteering/dashboard" element={
            <ProtectedRoute>
              <VolunteerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          
          <Route path="/profile/:id?" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/news" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/news" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
