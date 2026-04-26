import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import PromiseDetail from './pages/PromiseDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Dashboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* PP-011: Public Profile Route */}
        <Route path="/profile/:promiserId" element={<PublicProfile />} />
        
        {/* PP-010: Promise Detail Route (Angela's code, wired in) */}
        <Route path="/promise/:promiseId" element={<PromiseDetail />} />
        
        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;