import React, { useState } from 'react';
import { Sparkles, Hash, Copy } from 'lucide-react';

const BlogTitlesPage = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [generatedTitles, setGeneratedTitles] = useState([]);

  const categories = [
    'General', 'Technology', 'Business', 'Health',
    'Lifestyle', 'Education', 'Travel', 'Food'
  ];

  // Simple handler just to show the UI change (No AI logic)
  const handleGenerate = () => {
    // Static data to demonstrate the "Success" UI state
    setGeneratedTitles([
      `The Future of ${keyword || 'AI'}: A Comprehensive Guide`,
      `10 Essential Tips for ${selectedCategory} Success`,
      `Why Experts Love ${keyword || 'This Topic'}`,
      `The Ultimate Checklist for ${selectedCategory}`,
      `How to Master ${keyword || 'It'} in 5 Steps`
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Input Form --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI Title Generator</h2>
          </div>

          {/* Keyword Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keyword
            </label>
            <input
              type="text"
              placeholder="The future of artificial intelligence"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategory === category
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Hash className="w-4 h-4" />
            Generate title
          </button>
        </div>

        {/* --- Right Panel: Results Display --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[450px]">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Hash className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Generated titles</h2>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col">
             {generatedTitles.length > 0 ? (
               // State: With Results
               <div className="space-y-3 animate-in fade-in duration-500">
                 {generatedTitles.map((title, index) => (
                   <div 
                     key={index} 
                     className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:border-purple-300 hover:shadow-sm transition-all bg-gray-50/50 cursor-pointer group"
                   >
                     <p className="text-gray-700 text-sm font-medium">{title}</p>
                     <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-purple-600" />
                   </div>
                 ))}
               </div>
             ) : (
               // State: Empty
               <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                 <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    <Hash className="w-8 h-8 text-gray-300" />
                 </div>
                 <p className="text-sm max-w-[220px]">
                   Enter keywords and click "Generate title" to get started
                 </p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogTitlesPage;