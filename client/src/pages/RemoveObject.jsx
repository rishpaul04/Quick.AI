import React, { useState } from 'react';
import { Sparkles, Scissors, Loader2, Download } from lucide-react;
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ObjectRemoval = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getToken } = useAuth();

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null); // Reset result
    }
  };

  // Actual API Integration
  const handleRemoveObject = async () => {
    if (!selectedFile) {
      toast.error("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please describe what to remove.");
      return;
    }

    try {
      setIsProcessing(true);
      const token = await getToken();

      // We use FormData because we are uploading a file AND sending text
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('object', prompt);

      // Make sure this endpoint matches your backend route
      const { data } = await axios.post(`${BASE_URL}/api/ai/remove-image-object`, 
        formData, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      // Look for secure_url (Cloudinary) or imageUrl
      if (data.success && (data.secure_url || data.imageUrl)) {
        setProcessedImage(data.secure_url || data.imageUrl);
        toast.success("Object removed successfully!");
      } else {
        toast.error(data.message || "Failed to process image.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle downloading the processed image
  const handleDownload = async () => {
    if (!processedImage) return;
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Object_Removed_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback if CORS prevents blob fetching
      window.open(processedImage, '_blank');
    }
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
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          {/* Show a mini preview of the uploaded image before processing */}
          {previewUrl && !processedImage && (
            <div className="mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2 max-h-[200px]">
               <img src={previewUrl} alt="Preview" className="max-h-full object-contain opacity-70" />
            </div>
          )}

          {/* Description Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe object to remove
            </label>
            <textarea
              rows={3}
              placeholder="e.g., car in background, person on the right, dog..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5044E5] focus:border-transparent text-sm resize-none"
            />
            <p className="mt-2 text-xs text-gray-400">
              Be specific about what you want to remove.
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
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#5044E5]" />
              <h2 className="text-lg font-semibold text-gray-800">Processed Image</h2>
            </div>
            {processedImage && !isProcessing && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#5044E5] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
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
               <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-500">
                 <img 
                   src={processedImage} 
                   alt="Object Removed" 
                   className="max-w-full max-h-[400px] object-contain drop-shadow-md" 
                 />
               </div>
             ) : (
               // Empty State
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