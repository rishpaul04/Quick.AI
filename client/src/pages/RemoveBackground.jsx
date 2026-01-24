import React, { useState } from 'react';
import { Sparkles, Eraser, Loader2, Hand, Image as ImageIcon } from 'lucide-react';

const BackgroundRemoval = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL just to preview what was uploaded
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null); // Reset result
    }
  };

  // Mock function - No real AI, just UI simulation
  const handleRemoveBackground = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    // Simulate a 2-second delay to show the loading state
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, the API result would go here.
      // For now, we just show the original image again to simulate a result.
      setProcessedImage(previewUrl); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Upload Configuration --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#FF5A1A]" />
            <h2 className="text-lg font-semibold text-gray-800">Background Removal</h2>
          </div>

          {/* File Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload image
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-400">
              Supports JPG, PNG, and other image formats
            </p>
          </div>

          {/* Action Button (Orange Gradient) */}
          <button 
            onClick={handleRemoveBackground}
            disabled={!selectedFile || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-[#FF5A1A] to-[#FF8C5A] hover:opacity-90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Eraser className="w-5 h-5" />
            )}
            {isProcessing ? 'Removing background...' : 'Remove background'}
          </button>
        </div>

        {/* --- Right Panel: Result Display --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Eraser className="w-5 h-5 text-[#FF5A1A]" />
            <h2 className="text-lg font-semibold text-gray-800">Processed Image</h2>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl relative overflow-hidden">
             
             {isProcessing ? (
               // State 1: Loading
               <div className="text-center">
                 <Loader2 className="w-10 h-10 text-[#FF5A1A] animate-spin mx-auto mb-3" />
                 <p className="text-gray-500 font-medium text-sm">Processing image...</p>
               </div>
             ) : processedImage ? (
               // State 2: Result Shown
               <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-gray-200">
                 {/* Checkerboard background to imply transparency */}
                 <div className="absolute inset-0 opacity-10" 
                      style={{
                        backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' 
                      }}>
                 </div>
                 <img 
                   src={processedImage} 
                   alt="Removed Background" 
                   className="max-w-full max-h-[400px] object-contain relative z-10 drop-shadow-xl" 
                 />
               </div>
             ) : (
               // State 3: Empty Placeholder (Matches Screenshot)
               <div className="flex flex-col items-center text-center opacity-40">
                 <div className="flex items-end justify-center mb-4 gap-2">
                    <Hand className="w-10 h-10 text-gray-500 -mb-2" />
                    <Eraser className="w-8 h-8 text-gray-400 mb-2" />
                 </div>
                 <p className="text-sm text-gray-500 font-medium max-w-[220px]">
                   Upload an image and click "Remove Background" to get started
                 </p>
               </div>
             )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default BackgroundRemoval;