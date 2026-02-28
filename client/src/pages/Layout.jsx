import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from  'lucide-react';
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user, isLoaded } = useUser();

  // Optional: Show a loading state while Clerk fetches user data
  if (!isLoaded) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    user ? (
      <div className='flex flex-col min-h-screen'>
        
        {/* Navbar */}
        <nav className='flex items-center justify-between w-full px-8 border-b border-gray-200 min-h-14'>
          <img className='cursor-pointer w-32 sm:w-44' 
              src={assets.logo} 
              alt="logo" 
              onClick={() => navigate('/')} 
          />
          {
            sidebar 
              ? <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 cursor-pointer sm:hidden' />
              : <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 cursor-pointer sm:hidden' />
          }
        </nav>

        {/* Main Body (Sidebar + Content) */}
        <div className='flex w-full h-[calc(100vh-56px)]'>
          
          <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
          
          <div className='flex-1 bg-[#F4F7FB] overflow-y-auto'>
            <Outlet/>
          </div>
          
        </div>
      </div>
    ) : (
      // If not logged in, show Sign In page
      <div className='flex items-center justify-center h-screen'>
        <SignIn />
      </div>
    )
  )
}

export default Layout