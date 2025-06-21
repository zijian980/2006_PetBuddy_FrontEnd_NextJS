'use client'; 
 
import { useState } from 'react'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
 
const Login = () => { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const router = useRouter(); 

  sessionStorage.setItem('notifications', 'false'); // Set session storage item to true
 
  const handleLogin = async () => { 
    if (email && password) { 
      try { 
        // Send the login request to the backend 
        const response = await fetch('http://localhost:8000/login', { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
          }, 
          body: new URLSearchParams({ 
            username: email,  //backend expects 'username' instead of 'email' 
            password: password, 
          }), 
        }); 
 
        if (!response.ok) { 
          throw new Error('Invalid credentials or server error'); 
        } 
 
        const data = await response.json(); 
 
        // Ensure the response contains the access token and user ID 
        if (data.access_token && data.user_id) { 
          // Store the access token and user ID in sessionStorage 
          sessionStorage.setItem('access_token', data.access_token); 
          sessionStorage.setItem('user_id', data.user_id); 
          // Check if user has a profile
          const profileResponse = await fetch(`http://localhost:8000/users/${data.user_id}/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.access_token}`, // Assuming you're sending token for authentication
            },
          });

          const profileType= await profileResponse.json();
          sessionStorage.setItem('profile_type', profileType); 

          // Dispatch storage event
          window.dispatchEvent(new Event('storage'));
          
          // Redirect based on whether the profile exists
          if (profileType != -1) {
            router.push('/homepage') // Redirect to homepage if profile exists
          } else {
            router.push('/signout/signup/createProfile'); // Redirect to profile creation if not
          }
        } else { 
          throw new Error('Login failed: Missing required data from server'); 
        } 
      } catch (error) { 
        if (error instanceof Error) { 
          alert(`Error: ${error.message}`); 
        } else { 
          alert('An unknown error occurred, please try again later.'); 
        } 
      } 
    } else { 
      alert('Please provide both email and password'); 
    } 
  };
 


  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white"> 
      {/* Status Bar */} 
      <style jsx global>{` 
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; 
        } 
      `}</style> 
 
      {/* App name */} 
      <h1 className="jua text-4xl font-bold text-orange-500">PetBuddy</h1> 
 
      {/* Title */} 
      <h2 className="jua text-4xl text-gray-800 mt-4">Login</h2> 
      <p className="poppins text-xs text-gray-600 mt-2">Enter your login information</p> 
 
      {/* Email */} 
      <div className="poppins w-full max-w-xs mt-6"> 
        <label className="block text-gray-700 text-sm font-bold mb-2">Email<span className="text-red-500">*</span></label> 
        <input 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        /> 
      </div> 
 
      {/* Password */} 
      <div className="poppins w-full max-w-xs mt-4"> 
        <label className="block text-gray-700 text-sm font-bold mb-2">Password<span className="text-red-500">*</span></label> 
        <input 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          type="password" 
          placeholder="Enter your password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        /> 
      </div> 
 
      {/* Login Button */} 
      <button 
        className="poppins bg-orange-500 text-white py-2 px-4 rounded mt-6" 
        onClick={handleLogin} 
      > 
        Login 
      </button> 
 
      {/* Link to Sign Up */} 
      <p className="poppins mt-4"> 
        Don't have an account?{' '} 
        <Link href="/signout/signup" className="text-blue-500 hover:underline"> 
          Sign Up 
        </Link> 
      </p> 
    </div> 
  ); 
}; 
 
export default Login;
