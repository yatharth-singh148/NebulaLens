import React, { useState, useEffect } from 'react';
import axios from 'axios'; // We still need axios

// --- 
// --- 1. YOUR NEW FEATURE FLAG ---
// Set this to 'false' to disable the Gemini API call for testing.
// ---
const ENABLE_AI_EXPLANATION = true;
// ---
// --- 2. TYPEWRITER SPEED (in milliseconds) ---
// Lower is faster.
// ---
const TYPEWRITER_SPEED_MS = 5;


// --- Helper Component for Probability Bars ---
// (This component is unchanged)
const ProbabilityBreakdown = ({ probabilities }) => {
  const sortedProbs = Object.entries(probabilities)
    .sort(([, probA], [, probB]) => probB - probA);

  return (
    <div className="space-y-2 mt-2">
      {sortedProbs.map(([className, prob]) => (
        <div key={className} className="text-xs">
          <div className="flex justify-between text-white/70 mb-0.5">
            <span>{className}</span>
            <span>{(prob * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5 border border-white/10">
            <div
              className="bg-cosmic-accent h-full rounded-full"
              style={{ width: `${prob * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Helper Component for the Model Breakdown ---
// (This component is unchanged)
const BreakdownSection = ({ predictions }) => (
  <div className="mt-4 pt-4 border-t border-white/10">
    <h3 className="font-semibold text-md">Model Confidence Breakdown</h3>
    <div className="grid grid-cols-2 gap-4 mt-3">
      {Object.entries(predictions).map(([modelName, data]) => (
        <div key={modelName} className="bg-black/30 p-3 rounded-lg border border-white/10">
          <span className="text-sm font-semibold text-white/90 uppercase">{modelName}</span>
          
          {data.prediction === "Error" ? (
            <p className="text-red-400 text-xs mt-1">
              Prediction Error.
            </p>
          ) : (
            <>
              <div className="text-lg font-bold text-cosmic-accent mt-1">
                {data.prediction}
              </div>
              <div className="text-xs text-white/70">
                Confidence: {(data.confidence * 100).toFixed(1)}%
              </div>
              <ProbabilityBreakdown probabilities={data.probabilities} />
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);

// --- Helper Component for Model Agreement ---
// (This component is unchanged)
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

// --- 
// --- CORRECTED: Helper Component for Gemini XAI Explanation (with Typewriter) ---
// ---
const ExplanationSection = ({ explanation, isLoading, error }) => {
  // --- This state holds the "typed out" text ---
  const [typedExplanation, setTypedExplanation] = useState('');
  
  // --- Tracks if the typing animation is active ---
  const [isTyping, setIsTyping] = useState(false);

  // --- This effect runs when the final 'explanation' text arrives ---
  useEffect(() => {
    if (explanation) {
      setTypedExplanation(''); // Clear any previous text
      setIsTyping(true);      
      
      // We will not use an external 'index' variable.
      // We will derive the index from the state's previous length.
      
      const intervalId = setInterval(() => {
        
        // ---
        // --- THE REAL FIX: We use the 'prev' state to determine the next character ---
        // ---
        setTypedExplanation((prev) => {
          // 1. Get the current length of the *already typed* text.
          //    On the first run, prev is "", so currentLength is 0.
          const currentLength = prev.length;

          // 2. Check if we've typed the whole string.
          if (currentLength === explanation.length) {
            clearInterval(intervalId);
            setIsTyping(false); 
            return prev; // Return the full text
          }
          
          // 3. Get the *next* character from the full 'explanation' string
          //    On the first run, currentLength is 0, so this gets explanation.charAt(0)
          const nextChar = explanation.charAt(currentLength);
          
          // 4. Return the previous text + the new character
          //    On the first run: "" + "H"
          //    On the second run: "H" + "e"
          return prev + nextChar;
        });
        // --- END FIX ---

      }, TYPEWRITER_SPEED_MS); // Use the speed from our const

      // Cleanup function to stop the interval if the component unmounts
      return () => {
        clearInterval(intervalId);
        setIsTyping(false); 
      };
    }
  }, [explanation]); // Only re-run when the 'explanation' prop changes

  
  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h3 className="font-semibold text-md mb-2">Prediction Explanation</h3>
      {isLoading && (
        <p className="text-sm text-white/50 animate-pulse">
          Generating detailed explanation from Gemini...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400">
          Error generating explanation: {error}
        </p>
      )}
      {explanation && !isLoading && (
        <p className="text-sm text-white/80 whitespace-pre-line">
          {typedExplanation}
          {/* This cursor will now correctly disappear when typing is done */}
          {isTyping && <span className="animate-pulse ml-0.5">|</span>}
        </p>
      )}
    </div>
  );
};


// ---
// --- MODIFIED: Main ResultCard Component ---
// ---
export default function ResultCard({ predictions, modelAgreement, isLoading }) {
  
  // --- State to hold our XAI data from Gemini ---
  const [explanation, setExplanation] = useState(null);
  const [isXaiLoading, setIsXaiLoading] = useState(false);
  const [xaiError, setXaiError] = useState(null);


  // ---
  // MODIFIED: Fetch Gemini explanation when a new prediction is available
  // ---
  useEffect(() => {
    // ---
    // --- MODIFICATION: Check the feature flag first! ---
    // ---
    if (ENABLE_AI_EXPLANATION && modelAgreement && modelAgreement.prediction !== "Error") {
      
      const fetchExplanation = async () => {
        setIsXaiLoading(true);
        setXaiError(null);
        setExplanation(null); // Clear previous explanation
        
        try {
          const requestData = {
            prediction: modelAgreement.prediction,
            confidence: modelAgreement.confidence, 
          };
          
          const response = await axios.post(
            'http://127.0.0.1:8000/get_explanation', 
            requestData
          );

          if (response.data && response.data.explanation) {
            setExplanation(response.data.explanation);
          } else if (response.data.error) {
             setXaiError(response.data.error);
          } else {
            setXaiError("Received an empty explanation.");
          }
        } catch (err) {
          console.error("Error fetching Gemini explanation:", err);
          setXaiError("Failed to fetch explanation from backend.");
        } finally {
          setIsXaiLoading(false);
        }
      };
      
      fetchExplanation();
    } else {
      // If AI is disabled, make sure we clear all state
      setExplanation(null);
      setIsXaiLoading(false);
      setXaiError(null);
    }
  }, [modelAgreement]); // This effect now runs ONLY when 'modelAgreement' changes


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

      {/* 2. XAI Explanation Section
        MODIFICATION: This entire section is now also hidden
        if the feature flag is 'false'.
      */}
      {ENABLE_AI_EXPLANATION && modelAgreement.prediction !== "Error" && (
        <ExplanationSection 
          explanation={explanation}
          isLoading={isXaiLoading}
          error={xaiError}
        />
      )}

      {/* 3. Model Confidence Breakdown */}
      <BreakdownSection predictions={predictions} />

    </div>
  );
}