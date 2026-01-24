import { Edit, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

const WriteArticle = () => {
  const articleLength = [
    { length: 800, Text: "Short (500-800 words)" },
    { length: 1500, Text: "Medium (800-1500 words)" },
    { length: 2500, Text: "Long (1500+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0].length);
  const [input, setInput] = useState("");
  
  // 1. Fixed: Closed the function properly
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("Generating article...");
  }; 

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>

        {/* Article Topic Input */}
        <p className='mt-6 text-sm font-medium'>Article Topic</p>
        <input 
          type="text" 
          placeholder='The future of artificial intelligence is...'
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
        />

        {/* Article Length Selection */}
        <p className='mt-4 text-sm font-medium'>Article Length</p>
        <div className='flex flex-wrap gap-2 mt-2'>
          {articleLength.map((item, index) => (
            <div 
              key={index}
              onClick={() => setSelectedLength(item.length)}
              className={`p-2 px-4 rounded-full text-xs cursor-pointer border transition-all ${
                selectedLength === item.length 
                  ? 'border-[#4A7AFF] bg-[#EFF6FF] text-[#4A7AFF]' 
                  : 'border-gray-300 text-gray-600 hover:border-[#4A7AFF]'
              }`}
            >
              {item.Text}
            </div>
          ))}
        </div>
        
        <br/>
        {/* 2. Fixed: Typo in gradient class 'to0r' -> 'to-r' */}
        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:shadow-md transition-shadow'>
          <Edit className="w-4 h-4" />
          Generate Article
        </button>
      </form>

      {/* 3. Fixed: Completed Right Column based on screenshot */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
           <Edit className='w-5 h-5 text-[#4A7AFF]'/>
           <h1 className='text-xl font-semibold'>Generated Article</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <Edit className='w-10 h-10'/>
            <p>Enter a topic and click "Generate article" to get started</p>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default WriteArticle;