import React, { useState } from 'react';
import { Heart } from 'lucide-react';

// Images from your assets folder
import fishingImage from '../assets/ai_gen_img_1.png';
import bicycleImage from '../assets/ai_gen_img_2.png';
import atvImage from '../assets/ai_gen_img_3.png';

const CreationsPage = () => {
  // 1. Initialize state with data (added 'isLiked' property to track status)
  const [creations, setCreations] = useState([
    {
      id: 1,
      image: fishingImage,
      prompt: "Generate an image of A Boy is on Boat, and fishing in the style Anime style.",
      likes: 2,
      style: "Anime",
      isLiked: false
    },
    {
      id: 2,
      image: bicycleImage,
      prompt: "A young boy riding a bicycle on a sunny street with trees.",
      likes: 2,
      style: "Anime",
      isLiked: false
    },
    {
      id: 3,
      image: atvImage,
      prompt: "A happy kid riding a flying red quad bike in the clouds.",
      likes: 1,
      style: "3D Render",
      isLiked: false
    }
  ]);

  // 2. Function to handle the like click
  const toggleLike = (id, event) => {
    // stopPropagation prevents the click from activating the card's main click (if you add one later)
    event.stopPropagation();

    setCreations(currentCreations =>
      currentCreations.map(item => {
        if (item.id === id) {
          return {
            ...item,
            // If currently liked, decrease count. If not, increase.
            likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            // Toggle the boolean
            isLiked: !item.isLiked
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-['Outfit',_sans-serif]">
      
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Creations</h1>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((item) => (
          <div 
            key={item.id} 
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Main Image */}
            <img 
              src={item.image} 
              alt={item.prompt} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>

            {/* Content Positioned at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              
              {/* Prompt Text */}
              <p className="text-sm font-medium line-clamp-2 mb-3 leading-relaxed opacity-95">
                {item.prompt}
              </p>

              {/* Likes & Style Badge */}
              <div className="flex justify-between items-center">
                <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white/90">
                    {item.style}
                </span>
                
                {/* 3. Interactive Like Button */}
                <button 
                   onClick={(e) => toggleLike(item.id, e)}
                   className="flex items-center gap-1.5 group/heart hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                   <span className="text-sm font-semibold">{item.likes}</span>
                   <Heart 
                     className={`w-5 h-5 transition-all duration-300 ${
                       item.isLiked 
                         ? 'fill-red-500 text-red-500 scale-110' // Style when Liked
                         : 'text-white group-hover/heart:text-red-500' // Style when Not Liked
                     }`} 
                   />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreationsPage;