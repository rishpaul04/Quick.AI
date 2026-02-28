import { Edit, Sparkles, Loader2, Copy, Check } from lucide-react;
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, Text: "Short (500-800 words)" },
    { length: 1500, Text: "Medium (800-1500 words)" },
    { length: 2500, Text: "Long (1500+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0].length);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const { getToken } = useAuth();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();
      
      const prompt = `Write a detailed article on "${input}" (~${selectedLength} words). Use Markdown: include a H1 title, H2 subheadings, and bullet points. Tone: Professional but accessible.`;

      const { data } = await axios.post(`${BASE_URL}/api/ai/generate-article`, 
        { prompt, length: selectedLength }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Article generated!");
      } else {
        toast.error(data.message || "Failed to generate.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-auto p-6 flex items-start flex-wrap gap-6 text-slate-700 bg-gray-50'>
      
      {/* Configuration Form */}
      <form onSubmit={onSubmitHandler} className='flex-1 min-w-[350px] max-w-lg p-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Article Topic</p>
        <input 
          type="text" 
          placeholder='e.g. The future of AI in healthcare'
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className='w-full p-2.5 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:border-[#4A7AFF] transition-colors'
        />

        <p className='mt-4 text-sm font-medium'>Article Length</p>
        <div className='flex flex-wrap gap-2 mt-2'>
          {articleLength.map((item, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setSelectedLength(item.length)}
              className={`p-2 px-4 rounded-full text-xs cursor-pointer border transition-all ${
                selectedLength === item.length 
                  ? 'border-[#4A7AFF] bg-[#EFF6FF] text-[#4A7AFF]' 
                  : 'border-gray-300 text-gray-600 hover:border-[#4A7AFF]'
              }`}
            >
              {item.Text}
            </button>
          ))}
        </div>
        
        <button 
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-3 mt-8 text-sm font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed'
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
          {loading ? "Generating..." : "Generate Article"}
        </button>
      </form>

      {/* Output Display */}
      <div className='flex-[1.5] min-w-[400px] p-6 bg-white rounded-xl flex flex-col border border-gray-200 shadow-sm min-h-[600px] max-h-[800px]'>
        <div className='flex items-center justify-between border-b pb-4'>
          <div className='flex items-center gap-3'>
             <Edit className='w-5 h-5 text-[#4A7AFF]'/>
             <h1 className='text-xl font-semibold'>Generated Content</h1>
          </div>
          {content && !loading && (
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#4A7AFF] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Text"}
            </button>
          )}
        </div>

        <div className='flex-1 overflow-y-auto mt-4 pr-2'>
          {loading ? (
            <div className='h-full flex flex-col items-center justify-center text-gray-400 gap-3'>
               <Loader2 className='w-10 h-10 animate-spin text-[#4A7AFF]' />
               <p className='animate-pulse'>AI is crafting your masterpiece...</p>
            </div>
          ) : !content ? (
            <div className='h-full flex flex-col items-center justify-center text-gray-400 gap-5 text-center'>
              <div className='p-4 bg-gray-50 rounded-full'>
                <Edit className='w-8 h-8 opacity-20' />
              </div>
              <p className='max-w-[250px] text-sm'>Your generated article will appear here. Enter a topic and click generate.</p>
            </div>
          ) : (
            /* The 'prose' class from @tailwindcss/typography is vital here. 
               It automatically styles h1, h2, p, ul, etc., generated by Markdown.
            */
            <div className="prose prose-blue prose-sm max-w-none animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Markdown>{content}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WriteArticle;