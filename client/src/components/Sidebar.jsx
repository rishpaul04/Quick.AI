import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { Eraser, FileText, House, Scissors, SquarePen, Users, Image, Hash, LogOut } from 'lucide-react'; // Added LogOut
import React from 'react'
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/ai', label: 'Dashboard', Icon: House },
    { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
    { to: '/ai/generate-images', label: 'Generate Image', Icon: Image },
    { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
    { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
    { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
    { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
    { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
    const { user } = useUser();
    // Destructure openUserProfile from useClerk
    const { signOut, openUserProfile } = useClerk();

    if (!user) return <div className='w-60'></div>;

    return (
        <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 sm:static h-full z-10 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>

            <div className='w-full my-7'>
                {/* User Profile */}
                <div className='flex flex-col items-center justify-center'>
                    <img src={user.imageUrl} alt="User avatar" className='rounded-full w-14 h-14' />
                    <h1 className='mt-2 font-medium text-center text-gray-700'>{user.fullName}</h1>
                </div>

                {/* Nav Items */}
                <div className='px-6 mt-5 text-sm text-gray-600 font-medium'>
                    {navItems.map(({ to, label, Icon }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={to === '/ai'} 
                            onClick={() => setSidebar(false)}
                            className={({ isActive }) => 
                                `px-3.5 py-2.5 flex items-center gap-3 rounded-lg transition-all duration-200 mb-1
                                ${isActive 
                                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Logout Button */}
            <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
                {/* Added cursor-pointer so the user knows it's clickable */}
                <div onClick={() => openUserProfile()} className='flex gap-2 items-center cursor-pointer'>
                    <img src={user.imageUrl} alt="User avatar" className='rounded-full w-8 h-8' />
                    <div>
                        <h1 className='text-sm font-medium'>{user.fullName}</h1>
                        <p className='text-xs text-gray-500'>
                            {/* Added a space before 'Plan' */}
                            <Protect plan='premium' fallback="Free">Premium</Protect> Plan
                        </p>
                    </div>
                </div>
                {/* Changed Logout to LogOut and w-4.5 to w-5 */}
                <LogOut onClick={() => signOut()} className='w-5 h-5 text-gray-400 hover:text-gray-700 transition cursor-pointer' />
            </div>

        </div>
    )
}

export default Sidebar