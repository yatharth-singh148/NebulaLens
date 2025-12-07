// src/pages/Models.jsx
import React from 'react';

const modelData = [
  {
    name: "Deep Neural Network (DNN)",
    description: "A powerful Deep Learning model built with TensorFlow and Keras. It uses a multi-layer architecture (128-64-32 neurons) with ReLU activation and Dropout regularization. It excels at learning complex, non-linear hierarchies in spectral data.",
    pros: ["State-of-the-art accuracy (~97%)", "Probability-based confidence scores", "Learns complex feature interactions"],
    cons: ["Requires large datasets to train", "Computationally intensive", "Acts as a 'Black Box' (less interpretable)"]
  },
  {
    name: "Random Forest (RF)",
    description: "An ensemble learning method that operates by constructing a multitude of decision trees at training time. For classification tasks, the output of the random forest is the class selected by most trees.",
    pros: ["High accuracy", "Robust to outliers", "Handles non-linear data"],
    cons: ["Can be slow to train", "Less interpretable than a single tree"]
  },
  {
    name: "Support Vector Machine (SVM)",
    description: "A supervised learning model that uses a non-linear kernel to find an optimal hyperplane that categorizes new examples. It's highly effective in high-dimensional spaces.",
    pros: ["Effective in high dimensions", "Memory efficient"],
    cons: ["Can be slow on large datasets", "Hard to tune (kernel/parameter choice)"]
  },
  {
    name: "Multi-Layer Perceptron (MLP)",
    description: "A classical feedforward artificial neural network. While similar to our Deep Learning model, this is a shallower implementation using Scikit-Learn, serving as a baseline for neural performance.",
    pros: ["Can learn complex non-linear patterns", "Highly flexible"],
    cons: ["Prone to overfitting", "Computationally expensive", "Requires careful tuning"]
  },
  {
    name: "K-Nearest Neighbors (KNN)",
    description: "A non-parametric, instance-based learning algorithm. It classifies a data point based on how its neighbors are classified. The 'K' in KNN is the number of neighbors it checks.",
    pros: ["Simple to implement", "Adapts easily to new data"],
    cons: ["Slow prediction speed on large datasets", "Requires good feature scaling"]
  }
];

export default function Models() {
  return (
    <div className="max-w-6xl mx-auto py-20 px-6 text-white/90 animate-fade-in">
      <h1 className="text-4xl font-bold text-center text-cosmic-accent mb-12">
        Meet the Models
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        {modelData.map((model) => (
          <div 
            key={model.name} 
            className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-colors"
          >
            <h2 className={`text-2xl font-semibold mb-3 ${model.name.includes("Deep") ? "text-cyan-400" : "text-cosmic-accent"}`}>
              {model.name}
            </h2>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">{model.description}</p>
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <div className="flex-1">
                <h3 className="font-semibold text-white/90 mb-2 text-xs uppercase tracking-wider">Pros</h3>
                <ul className="list-disc list-inside text-xs text-green-300/80 space-y-1">
                  {model.pros.map(pro => <li key={pro}>{pro}</li>)}
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white/90 mb-2 text-xs uppercase tracking-wider">Cons</h3>
                <ul className="list-disc list-inside text-xs text-red-300/80 space-y-1">
                  {model.cons.map(con => <li key={con}>{con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}