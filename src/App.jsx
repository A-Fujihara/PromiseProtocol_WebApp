import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile'; // You'll create this next
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The landing page for the app */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Your PP-011 Route using the promiserId parameter  */}
        <Route path="/profile/:promiserId" element={<PublicProfile />} />
        
        {/* Fallback to redirect users back to the dashboard if they hit a dead link */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;