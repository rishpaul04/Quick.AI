import React, { useEffect, useState } from 'react';
// import { dummyCreationData } from '../assets/assets'; <--- 1. You can remove this now
import { Gem, Sparkles } from lucide-react;
import { Protect, useAuth } from '@clerk/clerk-react'; // 2. Added useAuth
import CreationItem from '../components/CreationItem';
import axios from 'axios'; // 3. Import axios
import toast from 'react-hot-toast'; // 4. Import toast

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const { getToken } = useAuth(); // 5. Initialize useAuth

  // 6. ACTUAL API FETCH for Dashboard
  const getDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BASE_URL}/api/user/get-user-creations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCreations(data.creations);
      }
    } catch (error) {
      toast.error("Failed to load your creations");
    }
  };

  // 7. THE PUBLISH TOGGLE FUNCTION (Step 4 code)
  const handlePublishToggle = async (id, currentStatus) => {
    try {
      const token = await getToken();
      // We flip the current status: if it's true, we send false, and vice versa
      const { data } = await axios.post(
        `${BASE_URL}/api/user/toggle-publish`,
        { id, publish: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Update local state so UI updates immediately
        setCreations(prev => prev.map(item => 
          item.id === id ? { ...item, publish: !currentStatus } : item
        ));
        toast.success(!currentStatus ? "Published!" : "Hidden from Community");
      }
    } catch (error) {
      toast.error("Error updating publish status");
    }
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

        {/* Active Plan Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold text-gray-900 mt-1'>
              <Protect plan="Premium" fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-sm'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        <div className='flex flex-col gap-3'> {/* Added a wrapper for spacing */}
          {creations.map((item) => (
            <CreationItem 
              key={item.id} 
              item={item} 
              // 8. PASSING THE FUNCTION DOWN
              onPublish={() => handlePublishToggle(item.id, item.publish)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;