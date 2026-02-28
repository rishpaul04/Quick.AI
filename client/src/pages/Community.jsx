import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from lucide-react;
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CreationsPage = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken, userId } = useAuth();

  // 1. Fetch Public Creations from Backend
  const fetchPublicCreations = async () => {
    try {
      setLoading(true);
      // Calls your getPublishedCreations controller
      const { data } = await axios.get(`${BASE_URL}/api/user/get-published-creations`);
      if (data.success) {
        setCreations(data.creations);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicCreations();
  }, []);

  // 2. Real-time Like Toggle with Backend Sync
  const toggleLike = async (id, event) => {
    event.stopPropagation();
    
    try {
      const token = await getToken();
      // Calls your toggleLikeCreations controller
      const { data } = await axios.post(
        `${BASE_URL}/api/user/toggle-like-creations`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Update local state immediately with the updated object from DB
        setCreations(current => 
          current.map(item => item.id === id ? data.creation : item)
        );
      }
    } catch (error) {
      toast.error("Please sign in to like creations");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-['Outfit',_sans-serif]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center md:text-left">
          Community Creations
        </h1>

        {creations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No public creations found. Be the first to publish!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creations.map((item) => {
              // Check if you have liked this specifically
              const isLikedByMe = item.likes?.includes(userId);

              return (
                <div 
                  key={item.id} 
                  className="group relative h-96 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  {/* content column stores the Cloudinary URL */}
                  <img 
                    src={item.content} 
                    alt={item.prompt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Aesthetic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium line-clamp-3 mb-4 leading-relaxed opacity-90 italic">
                      "{item.prompt}"
                    </p>

                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <span className="text-xs font-bold tracking-wider bg-teal-500/80 backdrop-blur-md px-3 py-1.5 rounded-full uppercase">
                        {item.type}
                      </span>
                      
                      <button 
                         onClick={(e) => toggleLike(item.id, e)}
                         className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors"
                      >
                        <span className="text-sm font-bold">{item.likes?.length || 0}</span>
                        <Heart 
                          className={`w-5 h-5 transition-all duration-300 ${
                            isLikedByMe ? 'fill-red-500 text-red-500 scale-125' : 'text-white'
                          }`} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationsPage;