import './App.css';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import AuthPage from './pages/AuthPage';
import { useState } from 'react';
import RequireGuest from './components/RequireGuest';
import Dashboard from './pages/Dashboard';

function App() {
  const [newUser, setNewUser] = useState(false);
  return (
    <>
      <h2>My App</h2>
      <Routes>

        {/* Guest-only routes */}
        <Route  element={<RequireGuest />}>
          <Route path='/auth' element={
            <AuthPage
              newUser={newUser}
              setNewUser={setNewUser}
            />
          } />
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
