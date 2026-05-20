import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MyPromises from './pages/MyPromises';
import CreatePromise from './pages/CreatePromise';
import PromiseDetail from './pages/PromiseDetail';
import PublicProfile from './pages/PublicProfile';
import './App.css';

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 — Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

function App() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--pp-bg)',
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/promises" element={<MyPromises />} />
          <Route path="/promises/:id" element={<PromiseDetail />} />
          <Route path="/create" element={<CreatePromise />} />
          <Route path="/profile" element={<PublicProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
