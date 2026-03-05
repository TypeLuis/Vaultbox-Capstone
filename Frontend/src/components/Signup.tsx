import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type FormData } from '../context/authcontext';

const SignUp = () => {
  const {signup} = useAuth()
  const nav = useNavigate()


  const [errors, setErrors] = useState()
  const [formData, setFormData] = useState<FormData>({
    name : "",
    email: "",
    password: "",
    password2: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }


  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    try {
      if(formData.password !== formData.password2){
        alert("password dont match")
        return
      }else{
        await signup(formData)
        nav('/dashboard')
      }
    } catch (error:any) {
      setErrors(error.response.data.errors.map((err:any) => <p>{err}</p>))
    }
  }

//   const handleClick = () => {
//     setNewUser(false);
//   };

  return (
    <div className='forms'>
      <h2>SignUp</h2>
      <form autoComplete='off' onSubmit={handleSubmit}>
        <label htmlFor='name1'>Name: </label>
        <input
          type='text'
          id='name1'
          name='name'
          placeholder='First and Last Name'
          onChange={handleChange}
          value={formData.name}
        />
        <label htmlFor='email1'>Email: </label>
        <input
          type='email'
          id='email1'
          name='email'
          placeholder='Email'
          onChange={handleChange}
          value={formData.email}
        />
        <label htmlFor='password1'>Password: </label>
        <input
          type='password'
          id='password1'
          name='password'
          placeholder='Password'
          minLength={6}
          onChange={handleChange}
          value={formData.password}
        />
        <input
          type='password'
          id='password2'
          name='password2'
          placeholder='Confirm Password'
          minLength={6}
          onChange={handleChange}
          value={formData.password2}
        />
        <button type='submit'>Sign Up</button>
      </form>
      {/* <p>
        Already have an account? <button onClick={handleClick}>Sign In</button>
      </p> */}
      {errors}
    </div>
  );
};

export default SignUp;
