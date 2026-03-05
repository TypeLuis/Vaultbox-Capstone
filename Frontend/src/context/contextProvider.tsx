// import AuthProvider from "./authContext/AuthContext";
import AuthProvider from "./authcontext";
import { CookiesProvider } from "react-cookie";

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <CookiesProvider>
      <AuthProvider>{children}</AuthProvider>
    </CookiesProvider>
  );
}