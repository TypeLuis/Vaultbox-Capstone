import { useAuth } from "../context/authcontext";
import { Outlet } from "react-router-dom"; //used to protect certain routes

export default function ProtectedRoutes(){
    const {token} = useAuth()
    return token? <Outlet /> : <h1>You are not Authorize!</h1>
}