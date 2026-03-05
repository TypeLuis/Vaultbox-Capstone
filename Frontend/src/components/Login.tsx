import React, { useState } from "react";
import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const {login} = useAuth()
  const nav = useNavigate()

  const [errors, setErrors] = useState(null)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }


  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    try {
      await login(formData)
      nav('/dashboard')
    } catch (error:any) {
      setErrors(error.response.data.errors.map((err:any) => <p>{err}</p>))
      
    }
  }


  return (
    <div className='forms'>
      <h2>Login</h2>
      <form autoComplete='off' onSubmit={handleSubmit}>
        <label htmlFor='email'>Email: </label>
        <input type='email' id='email' name='email' placeholder='Email' onChange={handleChange} value={formData.email} />
        <label htmlFor='password'>Password: </label>
        <input
          type='password'
          id='password'
          name='password'
          placeholder='Password'
          minLength={6}
          onChange={handleChange}
          value={formData.password}
        />
        <button type='submit'>
          Log In
        </button>
      </form>
      {/* <p>
        Dont have an account? <button onClick={handleClick}>Sign Up</button>
      </p> */}
      {errors}
    </div>
  );
};

export default LoginForm;
