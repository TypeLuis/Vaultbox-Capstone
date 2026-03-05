import { createContext, useContext, useMemo } from "react";
import {useCookies} from 'react-cookie'
import axios from 'axios'


export type FormData = {
    name?: string,
    email:string,
    password:string,
    password2?:string
}

type AuthContextValue = {
    token?: string;
    login: (formdata: FormData) => Promise<void>;
    signup: (formdata: FormData) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null)

export default function authProvider({children}: { children: React.ReactNode }){
    const [cookies, setCookies, removeCookies] = useCookies()

    async function login(formdata:FormData){
        let res = await axios.post("/api/auth", formdata)
        setCookies('token', res.data.token)
    }
    async function signup(formdata:FormData){
        let res = await axios.post("/api/users", formdata)
        setCookies('token', res.data.token)
    }
    function logout(){
        // ['token'].forEach(token => removeCookies(token))
        removeCookies("token", {path : "/"})
    }

    // use memo, stores a value from computationally functions and will not rerun those functions as long as the value doesn't change
    // as long as cookies doesn't change, we don't need to rerun any of these functions
    const value = useMemo<AuthContextValue>(
        () => ({
            token: cookies.token,
            login,
            signup,
            logout,
        }),
        [cookies.token]
      );
    return( 
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth():AuthContextValue {
    const ctx = useContext(AuthContext)

    if (!ctx) {
      throw new Error("useAuth must be used inside <AuthProvider>")
    }
  
    return ctx
}