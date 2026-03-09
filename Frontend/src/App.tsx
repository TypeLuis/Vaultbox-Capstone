import './App.scss';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './routes/ProtectedRoutes';
import AuthPage from './pages/AuthPage';
import RequireGuest from './routes/RequireGuest';
import Dashboard from './pages/Dashboard';
import RootRedirect from './routes/RootRedirect';
import DeployedPage from './pages/DeployedPage';
import SetupPage from './pages/SetupPage';

function App() {
  // const selfHosted = import.meta.env.VITE_SELF_HOSTED === "";
  const selfHosted = import.meta.env.VITE_SELF_HOSTED === "true";
  return (
    <>
      {/* <h2>My App</h2> */}
      <Routes>


        {selfHosted ? (
          <>
            {/* Root redirect */}
            <Route path="*" element={<RootRedirect />} />

            {/* Guest-only routes */}
            <Route element={<RequireGuest />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* Logged-in only routes */}
            <Route element={<ProtectedRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </>
        ) : (
          <>
            <Route path="*" element={<DeployedPage />} />
            <Route path="/start" element={<SetupPage />} />
          </>
        )}


      </Routes >
    </>
  );
}

export default App;
