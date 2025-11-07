import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// (The chart components RadarChart, FeatureImportanceChart, etc. are all 
// the same as in the previous step. I'm omitting them here for brevity, 
// just scroll down to the main component.)

// ... (RadarChart component code is unchanged) ...
// ... (FeatureImportanceChart component code is unchanged) ...
// ... (PerformanceBarChart component code is unchanged) ...

// (Mock data for the charts, same as before)
const performanceMetrics = {
  svm: { accuracy: 0.92, precision: 0.91, recall: 0.92, f1_score: 0.91 },
  mlp: { accuracy: 0.95, precision: 0.94, recall: 0.95, f1_score: 0.94 },
  knn: { accuracy: 0.89, precision: 0.88, recall: 0.89, f1_score: 0.88 },
  rf: { accuracy: 0.97, precision: 0.97, recall: 0.97, f1_score: 0.97 }
};

// --- (All the chart components like RadarChart, FeatureImportanceChart go here) ---
// (Copy-paste them from your existing file)

// --- NEW: RadarChart component (same as before) ---
const RadarChart = () => {
  const data = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: [
      {
        label: 'Random Forest',
        data: [performanceMetrics.rf.accuracy, performanceMetrics.rf.precision, performanceMetrics.rf.recall, performanceMetrics.rf.f1_score],
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        borderColor: 'rgba(234, 179, 8, 1)',
        borderWidth: 2,
      },
      // ... (other model datasets: mlp, svm, knn) ...
       {
        label: 'MLP',
        data: [performanceMetrics.mlp.accuracy, performanceMetrics.mlp.precision, performanceMetrics.mlp.recall, performanceMetrics.mlp.f1_score],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'SVM',
        data: [performanceMetrics.svm.accuracy, performanceMetrics.svm.precision, performanceMetrics.svm.recall, performanceMetrics.svm.f1_score],
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
      },
      {
        label: 'KNN',
        data: [performanceMetrics.knn.accuracy, performanceMetrics.knn.precision, performanceMetrics.knn.recall, performanceMetrics.knn.f1_score],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255, 255, 255, 0.8)' } },
      title: { display: true, text: 'Model Profile Comparison', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
        grid: { color: 'rgba(255, 255, 255, 0.2)' },
        pointLabels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 12 } },
        ticks: { color: 'rgba(255, 255, 255, 0.7)', backdropColor: 'rgba(0, 0, 0, 0.5)', backdropPadding: 2, stepSize: 0.1, },
        min: 0.8, max: 1.0,
      }
    }
  };
  return <Radar data={data} options={options} />;
};

// --- NEW: FeatureImportanceChart component (same as before) ---
const FeatureImportanceChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/feature_importance');
        if (response.data.error) { setError(response.data.error); return; }
        const data = response.data;
        setChartData({
          labels: Object.keys(data),
          datasets: [{
            label: 'Feature Importance (from Random Forest)',
            data: Object.values(data),
            backgroundColor: 'rgba(234, 179, 8, 0.7)',
            borderColor: 'rgba(234, 179, 8, 1)',
            borderWidth: 1,
          }]
        });
      } catch (err) { setError("Failed to fetch feature importance."); }
    };
    fetchData();
  }, []);
  const options = {
    indexAxis: 'y', responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Which Features Matter Most?', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      y: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };
  if (error) return <p className="text-red-400 text-center">{error}</p>;
  if (!chartData) return <p className="text-white/70 text-center">Loading feature importance...</p>;
  return <Bar options={options} data={chartData} />;
};

// --- NEW: PerformanceBarChart component (same as before) ---
const PerformanceBarChart = () => {
  const labels = Object.keys(performanceMetrics);
  const performanceChartData = {
    labels,
    datasets: [
      {
        label: 'Accuracy',
        data: labels.map(model => performanceMetrics[model].accuracy),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
      {
        label: 'F1-Score',
        data: labels.map(model => performanceMetrics[model].f1_score),
        backgroundColor: 'rgba(234, 179, 8, 0.7)',
      },
    ],
  };
  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255, 255, 255, 0.8)' } },
      title: { display: true, text: 'Model Performance Comparison (Test Set)', color: 'rgba(255, 255, 255, 0.9)', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, max: 1.0, ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    }
  };
  return <Bar options={performanceChartOptions} data={performanceChartData} />;
};


// --- Main Page Component ---
export default function Visualizer() {
  
  // --- NEW: Print Handler Function ---
  const handlePrint = () => {
    window.print(); // This triggers the browser's print dialog
  };
  
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
      
      {/* --- NEW: Page Header with Print Button --- */}
      <div className="flex justify-between items-center no-print">
        <h1 className="text-4xl font-bold text-center text-cosmic-accent">
          Data Visualizer
        </h1>
        <button 
          onClick={handlePrint}
          className="bg-cosmic-accent text-black px-5 py-2 rounded-lg font-semibold hover:shadow-glow transition"
        >
          Export as PDF
        </button>
      </div>
      
      {/* --- NEW: Report Content Wrapper --- */}
      {/* This div wraps all the charts we want in our PDF report */}
      <div id="report-content">
        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <RadarChart />
        </div>

        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <FeatureImportanceChart />
        </div>

        <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 chart-container">
          <PerformanceBarChart />
        </div>
      </div>
    </div>
  );
}