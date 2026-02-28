import React, { useState } from 'react';
import { Sparkles, Hash, Copy, Loader2, Check } from lucide-react;
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BlogTitlesPage = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const { getToken } = useAuth();

  const categories = [
    'General', 'Technology', 'Business', 'Health',
    'Lifestyle', 'Education', 'Travel', 'Food'
  ];

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Title copied!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault(); // Prevent form submission if wrapped in a form later
    
    if (!keyword.trim()) {
      toast.error("Please enter a keyword first.");
      return;
    }
    
    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      // Instruct the AI to return a clean list
      const prompt = `Generate 5 catchy, highly-clickable, and SEO-friendly blog titles about "${keyword}" in the "${selectedCategory}" category. Return ONLY the titles, one per line, without any extra conversation.`;

      // Note: Make sure your backend route name matches here. 
      // I used generate-content as a generic endpoint name.
      const { data } = await axios.post(`${BASE_URL}/api/ai/generate-blog-title`, 
        { prompt }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // AI usually returns a single text block. 
        // This splits it by newlines, removes empty lines, and strips out numbers (e.g., "1. "), bullets, and quotes.
        const titlesArray = data.content
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => line.replace(/^[\d.\-*]\s*/, '').replace(/["*]/g, '').trim());
          
        setGeneratedTitles(titlesArray);
        toast.success("Titles generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate titles.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Input Form --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI Title Generator</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keyword or Topic
            </label>
            <input
              type="text"
              placeholder="e.g. The future of artificial intelligence"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-shadow"
            />
          </div>

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

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
            {loading ? "Generating titles..." : "Generate titles"}
          </button>
        </div>

        {/* --- Right Panel: Results Display --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[450px]">
          
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Hash className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Generated titles</h2>
          </div>

          <div className="flex-1 flex flex-col">
             {loading ? (
                // State: Loading
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                  <p className="animate-pulse text-sm">Brainstorming the best titles...</p>
                </div>
             ) : generatedTitles.length > 0 ? (
               // State: With Results
               <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 {generatedTitles.map((title, index) => (
                   <div 
                     key={index}
                     onClick={() => handleCopy(title, index)}
                     className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:border-purple-300 hover:shadow-sm transition-all bg-gray-50/50 cursor-pointer group"
                   >
                     <p className="text-gray-700 text-sm font-medium pr-4">{title}</p>
                     <button className="flex-shrink-0 text-gray-400 group-hover:text-purple-600 transition-colors">
                       {copiedIndex === index ? (
                         <Check className="w-4 h-4 text-green-500" />
                       ) : (
                         <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                       )}
                     </button>
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
                   Enter a keyword and click "Generate titles" to get started
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