// src/pages/About.jsx
import React from 'react';

// Reusable component for the accuracy bar
const AccuracyBar = ({ label, percentage, colorClass, shadowColor }) => (
  <div className="mt-4 bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
    <div className="flex justify-between items-end mb-2">
      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</span>
      {/* Changed text color to white for better contrast */}
      <span className="text-xl font-bold text-white">{percentage}%</span>
    </div>
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`h-full ${colorClass} ${shadowColor}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="max-w-6xl mx-auto py-20 px-6 text-white/90 animate-fade-in">
      
      {/* 1. Header: The Problem & Solution */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          About NebulaLens
        </h1>
        
        <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
           <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">Problem & Solution</h3>
           
           <p className="text-white/80 leading-relaxed mb-4">
             As astronomical surveys like SDSS generate exponential amounts of data, manual classification has become a critical bottleneck. Distinguishing between distant Quasars and local Stars requires analyzing subtle spectral features that human inspection simply cannot scale to match.
           </p>
           
           <p className="text-white/80 leading-relaxed">
             <strong>NebulaLens</strong> solves this by deploying an automated, ensemble-based Machine Learning pipeline. Our goal is to provide astronomers with a tool that instantly classifies celestial objects into Stars, Galaxies, or Quasars with <strong>~97% accuracy</strong>, turning raw photometric data into actionable scientific insight.
           </p>
        </div>
      </div>

      <div className="space-y-8">
        
        <h2 className="text-2xl font-bold text-white text-center mb-8">Model Architecture & Performance</h2>

        {/* 2. Deep Learning Hero Card (Cyan Theme) */}
        <div className="relative bg-gradient-to-br from-cyan-950/80 to-black p-8 rounded-3xl border border-cyan-500/30 shadow-lg group hover:border-cyan-500/50 transition-all duration-500">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
             <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-3">
                 <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                 <h2 className="text-2xl font-bold text-white">Deep Neural Network (DNN)</h2>
               </div>
               <p className="text-white/70 text-sm leading-relaxed">
                 Our flagship model. A custom <strong>TensorFlow</strong> architecture (128→64→32 neurons) designed to mimic biological neural networks. It excels at identifying non-linear spectral patterns that traditional statistical models often miss.
               </p>
             </div>
             <div>
               <AccuracyBar label="Test Set Accuracy" percentage={97.2} colorClass="text-cyan-400 bg-cyan-400" shadowColor="shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
             </div>
           </div>
        </div>

        {/* 3. Classical Models Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Random Forest (Green) */}
            <div className="bg-gradient-to-br from-emerald-950/50 to-black p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <h3 className="font-bold text-lg text-emerald-100">Random Forest</h3>
              </div>
              <p className="text-sm text-white/60 mb-4 h-10">
                An ensemble of hundreds of decision trees. It "votes" on the final classification, making it incredibly robust against noise and outliers.
              </p>
              <AccuracyBar label="Accuracy" percentage={97.0} colorClass="text-emerald-400 bg-emerald-400" shadowColor="shadow-none" />
            </div>

            {/* MLP (Blue) */}
            <div className="bg-gradient-to-br from-blue-950/50 to-black p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h3 className="font-bold text-lg text-blue-100">Multi-Layer Perceptron</h3>
              </div>
              <p className="text-sm text-white/60 mb-4 h-10">
                A foundational neural network using Scikit-Learn. While simpler than our DNN, it serves as a strong baseline for neural performance.
              </p>
              <AccuracyBar label="Accuracy" percentage={95.1} colorClass="text-blue-400 bg-blue-400" shadowColor="shadow-none" />
            </div>

            {/* SVM (Purple) */}
            <div className="bg-gradient-to-br from-purple-950/50 to-black p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <h3 className="font-bold text-lg text-purple-100">Support Vector Machine</h3>
              </div>
              <p className="text-sm text-white/60 mb-4 h-10">
                Constructs optimal hyperplanes in high-dimensional space. Excellent for clearly separating distinct classes like Stars vs Quasars.
              </p>
              <AccuracyBar label="Accuracy" percentage={92.4} colorClass="text-purple-400 bg-purple-400" shadowColor="shadow-none" />
            </div>

            {/* KNN (Amber) */}
            <div className="bg-gradient-to-br from-amber-950/50 to-black p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <h3 className="font-bold text-lg text-amber-100">K-Nearest Neighbors</h3>
              </div>
              <p className="text-sm text-white/60 mb-4 h-10">
                A simple instance-based learner. It classifies an object by looking at the "votes" of its nearest neighbors in the feature space.
              </p>
              <AccuracyBar label="Accuracy" percentage={89.2} colorClass="text-amber-400 bg-amber-400" shadowColor="shadow-none" />
            </div>

        </div>

        {/* 4. Tech Stack Footer */}
        <section className="text-center pt-12 border-t border-white/10 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-4">Core Technologies</p>
          <div className="flex justify-center gap-6 text-sm font-semibold text-white/80">
             <span>REACT</span>
             <span>FASTAPI</span>
             <span>TENSORFLOW</span>
             <span>SCIKIT-LEARN</span>
             <span>GEMINI AI</span>
          </div>
        </section>

      </div>
    </div>
  );
}