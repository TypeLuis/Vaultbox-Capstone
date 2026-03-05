import type React from "react";
import SignUp from "../components/Signup";
import LoginForm from "../components/Login";

type AuthPageProps = {
  newUser: boolean;
  setNewUser: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthPage({ newUser, setNewUser }: AuthPageProps) {
  return (
    <div>
      <h1>{newUser ? "Create account" : "Welcome back"}</h1>

      {newUser ? <SignUp /> : <LoginForm />}

      <div>
        {newUser ? (
          <p>
            Already have an account?{" "}
            <button type="button" onClick={() => setNewUser(false)}>
              Log in
            </button>
          </p>
        ) : (
          <p>
            New here?{" "}
            <button type="button" onClick={() => setNewUser(true)}>
              Create account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}