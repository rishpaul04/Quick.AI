import React, { useState } from 'react';
import Markdown from 'react-markdown'; // 1. Fixed typo: Removed space in 'react-markdown '

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false); // 2. Used imported useState directly

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow'
    >
      <div className='flex justify-between items-center gap-4'>
        
        {/* Left Side: Prompt and Date */}
        <div>
          <h2 className='font-medium text-gray-900'>{item.prompt}</h2>
          <p className='text-gray-500 mt-1'>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Right Side: Type Badge */}
        <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full text-xs font-medium'>
          {item.type}
        </button>
        
      </div>

      {/* Expanded Content Section */}
      {expanded && (
        <div>
          {item.type === 'image' ? (
            <div>
              <img 
                src={item.content} 
                alt="image" 
                className='mt-3 w-full max-w-md rounded-md' 
              />
            </div>
          ) : (
            // 3. Added 'prose' class so bolding, lists, and headers render correctly
            <div className='reset-tw'>
              <Markdown>{item.content}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;