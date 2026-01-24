import React, { useState } from 'react';
import { Sparkles, Scissors, Loader2 } from 'lucide-react';

const ObjectRemoval = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null); // Reset result
    }
  };

  // Mock processing function
  const handleRemoveObject = () => {
    if (!selectedFile || !prompt) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      // For demo, we just show the original image again
      setProcessedImage(previewUrl); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Configuration --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#5044E5]" />
            <h2 className="text-lg font-semibold text-gray-800">Object Removal</h2>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload image
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          {/* Description Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe object to remove
            </label>
            <textarea
              rows={3}
              placeholder="e.g., car in background, tree from the image"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5044E5] focus:border-transparent text-sm resize-none"
            />
            <p className="mt-2 text-xs text-gray-400">
              Be specific about what you want to remove
            </p>
          </div>

          {/* Action Button (Blue/Purple) */}
          <button 
            onClick={handleRemoveObject}
            disabled={!selectedFile || !prompt || isProcessing}
            className="w-full py-3 bg-[#5044E5] hover:bg-[#4338ca] text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Scissors className="w-5 h-5" />
            )}
            {isProcessing ? 'Removing object...' : 'Remove object'}
          </button>
        </div>

        {/* --- Right Panel: Result Display --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Scissors className="w-5 h-5 text-[#5044E5]" />
            <h2 className="text-lg font-semibold text-gray-800">Processed Image</h2>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl relative overflow-hidden">
             
             {isProcessing ? (
               // Loading State
               <div className="text-center">
                 <Loader2 className="w-10 h-10 text-[#5044E5] animate-spin mx-auto mb-3" />
                 <p className="text-gray-500 font-medium text-sm">Erasing object...</p>
               </div>
             ) : processedImage ? (
               // Success State
               <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-gray-200">
                 <img 
                   src={processedImage} 
                   alt="Object Removed" 
                   className="max-w-full max-h-[400px] object-contain drop-shadow-md" 
                 />
               </div>
             ) : (
               // Empty State (Matches Screenshot)
               <div className="flex flex-col items-center text-center opacity-40">
                 <Scissors className="w-12 h-12 text-gray-400 mb-4" />
                 <p className="text-sm text-gray-500 font-medium max-w-[250px]">
                   Upload an image and describe what to remove
                 </p>
               </div>
             )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ObjectRemoval;