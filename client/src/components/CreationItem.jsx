import React, { useState } from 'react';
import Markdown from 'react-markdown';

const CreationItem = ({ item, onPublish }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e) => {
    e.stopPropagation(); // Stops the accordion from toggling when clicking the button
    setLoading(true);
    if (onPublish) {
      // Logic: Pass the item ID to the parent handler
      await onPublish(); 
    }
    setLoading(false);
  };

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className='p-4 mb-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow'
    >
      <div className='flex justify-between items-center gap-4'>
        <div>
          <h2 className='font-medium text-gray-900 line-clamp-1'>{item.prompt}</h2>
          <p className='text-gray-500 mt-1'>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* Only allow images to be published to the community feed */}
          {item.type === 'image' && (
            <button 
              onClick={handlePublish}
              disabled={loading}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                item.publish // Changed from isPublished to match your SQL 'publish' column
                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600'
              }`}
            >
              {loading ? '...' : item.publish ? 'Published' : 'Publish to Community'}
            </button>
          )}
          
          <span className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full text-xs font-medium uppercase'>
            {item.type}
          </span>
        </div>
      </div>

      {/* Accordion Content */}
      {expanded && (
        <div className='mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2'>
          {item.type === 'image' ? (
            <div className='flex flex-col items-center bg-gray-50 p-4 rounded-lg'>
              <img 
                src={item.content} 
                alt="Generated" 
                className='w-full max-w-md rounded-md shadow-lg border border-gray-200' 
              />
            </div>
          ) : (
            <div className='prose prose-sm max-w-none p-2'>
              <Markdown>{item.content}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;