import { useDevices } from '../hooks/Usedevices';
import VaultBoxIcon from './VaultboxIcon';
import '../styles/NavDashboard.scss'
import type { Page } from '../pages/Dashboard';

type NavDashboardProps = {
  setActivePage: React.Dispatch<React.SetStateAction<Page>>
  activePage: Page
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "devices", label: "Devices", icon: "⬡" },
  { id: "files", label: "Files", icon: "⊟" },
  { id: "apps", label: "Apps", icon: "⊞" },
  { id: "settings", label: "Settings", icon: "⚙" },
];


const NavDashboard = ({ activePage, setActivePage }: NavDashboardProps) => {
  const { devices } = useDevices();

  // Stats
  const totalStorageGB = devices.reduce((sum, d) => sum + (d.storageTotalGB ?? 0), 0).toFixed(1);
  const usedStorageGB = devices.reduce((sum, d) => sum + (d.storageUsedGB ?? 0), 0).toFixed(1);
  return (
    <>

      <aside className="dashboard__sidebar">
        <div className="dashboard__brand">
          <VaultBoxIcon />
          <div className="dashboard__brand-text">
            <span className="dashboard__brand-name">
              vault<span className="accent">box</span>
            </span>
            <span className="dashboard__brand-sub">personal server</span>
          </div>
        </div>



        <nav className="dashboard__nav">
          {NAV_ITEMS.map((item) => (
            <>
              <button
                key={item.id}
                className={`dashboard__nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            </>
          ))}
        </nav>

        {/* Sidebar storage summary */}
        <div className="dashboard__sidebar-stats">
          <div className="dashboard__sidebar-stat">
            <span className="label">Total Storage</span>
            <span className="value">{totalStorageGB} GB</span>
          </div>
          <div className="dashboard__sidebar-stat">
            <span className="label">Used</span>
            <span className="value accent">{usedStorageGB} GB</span>
          </div>
          <div className="dashboard__sidebar-stat">
            <span className="label">Devices</span>
            <span className="value">{devices.length}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavDashboard;