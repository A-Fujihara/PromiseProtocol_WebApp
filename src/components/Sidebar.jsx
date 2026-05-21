import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const mockUser = {
  name: 'Dev User',
  role: 'Promiser',
};

const nav = [
  { id: 'dashboard', path: '/', icon: '▦', label: 'Dashboard' },
  { id: 'promises', path: '/promises', icon: '◇', label: 'My Promises' },
  { id: 'create', path: '/create', icon: '+', label: 'New Promise' },
  { id: 'profile', path: '/profile', icon: '◉', label: 'Profile' },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⬡</span>
        <span className={styles.logoText}>
          Promise
          <br />
          Protocol
        </span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {nav.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''} ${item.id === 'create' ? styles.navLinkNew : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className={styles.user}>
        <div className={styles.avatar}>{mockUser.name.charAt(0)}</div>
        <div>
          <div className={styles.userName}>{mockUser.name}</div>
          <div className={styles.userRole}>{mockUser.role}</div>
        </div>
      </div>
    </aside>
  );
}
