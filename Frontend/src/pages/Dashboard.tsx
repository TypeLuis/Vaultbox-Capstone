import React from 'react';
import { useAuth } from '../context/authcontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type DashboardProps = {

}

const Dashboard = ({ }: DashboardProps) => {
  const { logout, token } = useAuth()
  const nav = useNavigate()




  function handleLogout() {
    logout();
    nav('/auth')
  }

    async function handleGetData(){
      try {
        let res = await axios.get("/api/auth", {
          headers: {"x-auth-token" : token}
        }) // Get user info with id and auth token
        console.log(res.data)
      } catch (error) {
        
      }
    }
  return (
    <>
      Testing
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleGetData}>Get Data</button>
    </>
  );
};

export default Dashboard;