import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { openSignIn } = useClerk();

    return (
        <div className='fixed top-0 left-0 w-full z-10 backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32'>
            <img
                src={assets.logo}
                alt="logo"
                className='w-32 sm:w-44 cursor-pointer'
                onClick={() => navigate('/')} 
            />
            
            {user ? (
                <UserButton />
            ) : (
                <button 
                    onClick={() => openSignIn({})} // <-- Added this so the button works
                    className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-blue-600 text-white px-10 py-2.5 transition-transform hover:scale-105'
                >
                    Get Started <ArrowRight className='w-4 h-4' />
                </button>
            )}
        </div>
    )
}

export default Navbar