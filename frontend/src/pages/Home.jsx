import { useState, useEffect } from "react";
import ParameterForm from "../components/ParameterForm";
import MetricsCard from "../components/MetricsCard";
import ResultCard from "../components/ResultCard";
import PredictionLog from "../components/PredictionLog";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [predictionLog, setPredictionLog] = useState([]);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer); 
  }, []); 

  const hasResult = apiResult && !apiResult.error;

  return (
    <section 
      className="flex flex-col items-center text-center px-6 py-16"
    >
      <h1 
        className={`
          text-3xl md:text-4xl font-semibold mb-4 text-white
          transition-all duration-1000 ease-out delay-100
          ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
        `}
      >
        {/* --- THIS IS THE MODIFIED LINE --- */}
        <span className="text-[#00c4ff]">NebulaLens</span>: Decoding the Universe with Machine Learning
      </h1>
      <p 
        className={`
          text-white/70 mb-12 max-w-2xl
          transition-all duration-1000 ease-out delay-200
          ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
        `}
      >
        Enter the 6 object parameters to predict its class, or use the sliders
        to experiment with "what-if" scenarios.
      </p>

      <div className="max-w-5xl w-full space-y-8">
        
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 gap-8
            transition-all duration-1000 ease-out delay-300
            ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
          `}
        >
          <ParameterForm 
            setIsLoading={setIsLoading} 
            setApiResult={setApiResult} 
            setPredictionLog={setPredictionLog}
          />
          <MetricsCard 
            performance={apiResult?.performance} 
            isLoading={isLoading} 
          />
        </div>

        {(isLoading || hasResult) && (
          <div 
            className={`
              w-full
              transition-all duration-1000 ease-out delay-400
              ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
            `}
          >
            <ResultCard 
              predictions={apiResult?.predictions} 
              modelAgreement={apiResult?.model_agreement}
              isLoading={isLoading} 
            />
          </div>
        )}

        <div 
          className={`
            w-full
            transition-all duration-1000 ease-out delay-500
            ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}
          `}
        >
          <PredictionLog log={predictionLog} />
        </div>
        
      </div>
    </section>
  );
}