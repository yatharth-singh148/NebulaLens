import React, { useState, useEffect } from 'react';
import axios from 'axios'; // We need axios for fetching

// Helper component for the Model Agreement Section
const AgreementSection = ({ agreement }) => (
  <>
    <h2 className="font-semibold text-lg mb-2">Consensus Result</h2>
    <p className="text-sm text-white/70">
      <strong className="text-white">{agreement.count} out of {agreement.total}</strong> models agree.
    </p>
    <div className="text-4xl font-bold text-cosmic-accent my-3">
      {agreement.prediction}
    </div>
  </>
);

// Helper component for the new XAI Explanation Section
const ExplanationSection = ({ prediction, features }) => (
  <div className="mt-4 pt-4 border-t border-white/10">
    <h3 className="font-semibold text-md mb-2">Prediction Explanation (XAI)</h3>
    <p className="text-sm text-white/80">
      The consensus prediction is <strong className="text-cosmic-accent">{prediction}</strong>.
      This decision was primarily influenced by the model's analysis of these top 3 factors:
    </p>
    <div className="flex gap-2 mt-3">
      {features.map((feature) => (
        <span key={feature} className="text-xs bg-black/40 border border-white/10 px-3 py-1 rounded-full">
          {feature}
        </span>
      ))}
    </div>
  </div>
);

// Helper component for the Model Breakdown Section
const BreakdownSection = ({ predictions }) => (
  <div className="mt-4 pt-4 border-t border-white/10">
    <h3 className="font-semibold text-md">Model Breakdown</h3>
    <div className="grid grid-cols-2 gap-4 mt-3">
      {Object.entries(predictions).map(([modelName, data]) => (
        <div key={modelName} className="bg-black/30 p-3 rounded-lg border border-white/10">
          <span className="text-sm font-semibold text-white/90 uppercase">{modelName}</span>
          <div className="text-lg font-bold text-cosmic-accent mt-1">
            {data.prediction}
          </div>
          {/* This part is a placeholder for when you add confidence scores */}
          {data.confidence ? (
            <div className="text-xs text-white/70">
              Confidence: {(data.confidence * 100).toFixed(1)}%
            </div>
          ) : (
            <div className="text-xs text-white/70 italic">
              (Confidence data N/A)
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);


// --- Main ResultCard Component ---
export default function ResultCard({ predictions, modelAgreement, isLoading }) {
  
  // --- NEW: State to hold our XAI data ---
  const [topFeatures, setTopFeatures] = useState(null);

  // --- NEW: Fetch feature importance just once when the component mounts ---
  useEffect(() => {
    const fetchImportance = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/feature_importance');
        if (response.data && !response.data.error) {
          // Get the top 3 most important feature names
          const topThree = Object.keys(response.data).slice(0, 3);
          setTopFeatures(topThree);
        }
      } catch (err) {
        // Don't worry if this fails, the card will just not show the explanation
        console.error("Error fetching feature importance:", err);
      }
    };
    
    fetchImportance();
  }, []); // The empty array [] means this runs only ONCE.

  
  // --- Render logic ---

  if (isLoading) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <h2 className="font-semibold text-lg text-white/80">Analyzing...</h2>
      </div>
    );
  }

  if (!predictions || !modelAgreement) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <h2 className="font-semibold text-lg mb-4">Prediction Result</h2>
        <p className="text-white/50 text-sm">Enter parameters to see results.</p>
      </div>
    );
  }

  // --- After a prediction ---
  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-start text-left">
      
      {/* 1. Consensus Result */}
      <AgreementSection agreement={modelAgreement} />

      {/* 2. NEW: XAI Explanation Section */}
      {/* This will only appear if the prediction is ready AND our feature fetch worked */}
      {modelAgreement.prediction !== "Error" && topFeatures && (
        <ExplanationSection 
          prediction={modelAgreement.prediction} 
          features={topFeatures} 
        />
      )}

      {/* 3. Model Breakdown */}
      <BreakdownSection predictions={predictions} />

    </div>
  );
}