import './App.scss';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthPage from './pages/AuthPage';
import RequireGuest from './components/RequireGuest';
import Dashboard from './pages/Dashboard';
import RootRedirect from './components/RootRedirect';

function App() {

  return (
    <>
      {/* <h2>My App</h2> */}
      <Routes>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />


        {/* Guest-only routes */}
        <Route element={<RequireGuest />}>
          <Route path='/auth' element={<AuthPage />} />
        </Route>


        {/* Logged-in only routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path='/dashboard' element={<Dashboard />} />
        </Route>


      </Routes>
    </>
  );
}

export default App;
