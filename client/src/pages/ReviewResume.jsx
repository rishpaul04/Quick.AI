import React, { useState } from 'react';
import { Sparkles, FileText, Loader2, Upload } from 'lucide-react';

const ResumeReview = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null); // Reset previous results
    }
  };

  // Mock processing function
  const handleReviewResume = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsProcessing(false);
      // Mock Analysis Result
      setAnalysisResult({
        score: 85,
        summary: "Strong resume with clear experience. Good use of action verbs.",
        strengths: ["Clear formatting", "Quantifiable achievements", "Relevant skills highlighted"],
        improvements: ["Add a summary section", "Include more soft skills", "Check for minor typos"]
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Outfit',_sans-serif]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- Left Panel: Upload Configuration --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-800">Resume Review</h2>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Resume
            </label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.png,.jpg"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-400">
              Supports PDF, PNG, JPG formats
            </p>
          </div>

          {/* Action Button (Teal) */}
          <button 
            onClick={handleReviewResume}
            disabled={!selectedFile || isProcessing}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            {isProcessing ? 'Analyzing Resume...' : 'Review Resume'}
          </button>
        </div>

        {/* --- Right Panel: Analysis Results --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl relative">
             
             {isProcessing ? (
               // Loading State
               <div className="text-center">
                 <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto mb-3" />
                 <p className="text-gray-500 font-medium text-sm">Scanning document...</p>
               </div>
             ) : analysisResult ? (
               // Success State (Mock Result)
               <div className="w-full text-left space-y-6 animate-in fade-in">
                 
                 {/* Score Card */}
                 <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-700 font-bold border-2 border-teal-200">
                        {analysisResult.score}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Resume Score</h3>
                        <p className="text-sm text-gray-600">{analysisResult.summary}</p>
                    </div>
                 </div>

                 {/* Strengths */}
                 <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h3>
                    <ul className="space-y-2">
                        {analysisResult.strengths.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>

                 {/* Improvements */}
                 <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Improvements Needed</h3>
                    <ul className="space-y-2">
                        {analysisResult.improvements.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>
               </div>
             ) : (
               // Empty State (Matches Screenshot)
               <div className="flex flex-col items-center text-center opacity-40">
                 <FileText className="w-16 h-16 text-gray-300 mb-4" strokeWidth={1.5} />
                 <p className="text-sm text-gray-500 font-medium max-w-[250px]">
                   Upload your resume and click "Review Resume" to get started
                 </p>
               </div>
             )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeReview;