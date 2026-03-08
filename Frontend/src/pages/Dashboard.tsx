import { useState } from "react";
import "../styles/Dashboard.scss";
import { DevicesPage } from "./Devicepage";
import NavDashboard from "../components/NavDashboard";


export type Page = "devices" | "files" | "apps" | "settings";


export default function Dashboard() {
  const [activePage, setActivePage] = useState<Page>("devices");
  // const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="dashboard">
      {/* Background grid */}
      <div className="dashboard__grid-bg" />

      {/* Sidebar */}
      <NavDashboard activePage={activePage} setActivePage={setActivePage}/>

      {/* Main */}
      <DevicesPage />
    </div>
  );
}