import React, { useEffect, useState } from 'react';
import { dummyCreationData } from '../assets/assets';
import { Gem, Sparkles } from 'lucide-react';
import { Protect } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';

const Dashboard = () => {
  const [creations, setCreations] = useState([]);

  const getDashboardData = async () => {
    // Simulating an async fetch
    setCreations(dummyCreationData);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className='h-full overflow-y-scroll p-6 bg-gray-50'>
      <div className='flex justify-start gap-4 flex-wrap'>
        
        {/* Total creations card */}
        <div className='flex justify-between items-center w-72 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium text-gray-500'>Total Creations</p>
            <h2 className='text-2xl font-bold text-gray-900'>{creations.length}</h2>
          </div>
          <div className='p-3 bg-indigo-600 rounded-full shadow-md'>
            <Sparkles className='w-6 h-6 text-white' />
          </div>
        </div>

        {/* Active Plan Card (Updated with styles from image) */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          
          {/* Text Section */}
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold text-gray-900 mt-1'>
              <Protect plan="Premium" fallback="Free">Premium</Protect>
            </h2>
          </div>

          {/* Icon Section with Gradient */}
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-sm'>
            <Gem className='w-5 text-white' />
          </div>
          
        </div>

      </div>
      <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        {
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        }
      </div>
    </div>
  );
};

export default Dashboard;