import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

const AIImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  // 1. New state for the public toggle
  const [isPublic, setIsPublic] = useState(false);

  const styles = [
    'Realistic', 'Ghibli style', 'Anime style', 'Cartoon style',
    'Fantasy style', 'Realistic style', '3D style', 'Portrait style'
  ];

  // Simple handler just to show the UI change (No AI logic)
  const handleGenerate = () => {
    console.log(`Generating image. Prompt: "${prompt}", Style: ${selectedStyle}, Public: ${isPublic}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Input Form --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI Image Generator</h2>
          </div>

          {/* Textarea Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Image
            </label>
            <textarea
              rows={4}
              placeholder="Describe what you want to see in the image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Style Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                    selectedStyle === style
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* --- 2. New "Make this image Public" Toggle --- */}
          <div className="mb-8 flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer" 
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              {/* Switch Container */}
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              {/* Label Text */}
              <span className="ml-3 text-sm font-medium text-gray-700">Make this image Public</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <ImageIcon className="w-4 h-4" />
            Generate Image
          </button>
        </div>

        {/* --- Right Panel: Results Display (Placeholder) --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[450px] items-center justify-center text-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-sm max-w-[250px]">
            Enter a prompt, select a style, and click "Generate Image" to get started.
            </p>
        </div>

      </div>
    </div>
  );
};

export default AIImageGeneratorPage;