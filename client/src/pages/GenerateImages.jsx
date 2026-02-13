import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AIImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [isPublic, setIsPublic] = useState(false);
  
  // New states for API handling
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  
  const { getToken } = useAuth();

  const styles = [
    'Realistic', 'Ghibli style', 'Anime style', 'Cartoon style',
    'Fantasy style', '3D style', 'Portrait style', 'Cyberpunk'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error("Please describe what you want to see.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      // Construct a detailed prompt combining user input and selected style
      const finalPrompt = `${prompt}, ${selectedStyle}, high quality, detailed`;

      // Update this endpoint to match your actual backend route
      const { data } = await axios.post(`${BASE_URL}/api/ai/generate-image`, 
        { 
          prompt: finalPrompt,
          isPublic: isPublic 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("SERVER RESPONSE:", data);

     // NEW CODE
      if (data.success && data.secure_url) {
        setGeneratedImage(data.secure_url);
        toast.success("Image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      // Fetch the image as a blob so it downloads directly instead of opening a new tab
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AI_Generated_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback if CORS prevents blob fetching
      window.open(generatedImage, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Input Form --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI Image Generator</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Image
            </label>
            <textarea
              rows={4}
              placeholder="e.g. A futuristic city skyline at sunset with flying cars..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none transition-shadow"
            />
          </div>

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

          <div className="mb-8 flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">Make this image Public</span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {loading ? "Generating Image..." : "Generate Image"}
          </button>
        </div>

        {/* --- Right Panel: Results Display --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[450px]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Generated Result</h2>
            </div>
            {generatedImage && !loading && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {loading ? (
              // State: Loading
              <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="animate-pulse text-sm">Painting your digital canvas...</p>
              </div>
            ) : generatedImage ? (
              // State: With Image
              <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <img 
                  src={generatedImage} 
                  alt="AI Generated" 
                  className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm border border-gray-100"
                />
              </div>
            ) : (
              // State: Empty
              <div className="flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-sm max-w-[250px]">
                  Enter a prompt, select a style, and click "Generate Image" to get started.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIImageGeneratorPage;