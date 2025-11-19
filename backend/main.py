import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from collections import Counter
import google.generativeai as genai
from dotenv import load_dotenv

# --- 1. Initialize FastAPI App ---
app = FastAPI(
    title="Nebula Lens API",
    description="API for cosmic object classification.",
    version="1.0.0"
)

# --- 2. Configure CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Gemini API Setup (NEW) ---
# This will load the .env file from the backend folder
load_dotenv() 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Add a check for the API key
if not GEMINI_API_KEY:
    print("CRITICAL ERROR: GEMINI_API_KEY not found in .env file.")
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        print("Gemini API configured successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to configure Gemini API: {e}")
        gemini_model = None

# --- 4. Define Input Data Models ---
class CosmicFeatures(BaseModel):
    u: float
    g: float
    r: float
    i: float
    z: float
    redshift: float

# This is for the new explanation endpoint (NEW)
class ExplanationRequest(BaseModel):
    prediction: str
    confidence: float
    # You could also add the 'features' here for an even better prompt
    # features: CosmicFeatures 

# --- 5. Load The Models AND THE SCALER ---
models_path = "./models/"
try:
    scaler_path = os.path.join(models_path, 'star_classifier_scaler.joblib')
    scaler = joblib.load(scaler_path)
    
    model_svm = joblib.load(os.path.join(models_path, 'model_svm.joblib'))
    model_mlp = joblib.load(os.path.join(models_path, 'model_mlp.joblib'))
    model_knn = joblib.load(os.path.join(models_path, 'model_knn.joblib'))
    model_rf = joblib.load(os.path.join(models_path, 'model_rf.joblib'))
    
    models = {
        "svm": model_svm,
        "mlp": model_mlp,
        "knn": model_knn,
        "rf": model_rf
    }
    print("Scaler and all models loaded successfully.")

except Exception as e:
    print(f"CRITICAL ERROR loading models or scaler: {e}")
    scaler = None
    models = {}

# --- 6. Define the Prediction Endpoint ---
@app.post("/predict")
async def predict(features: CosmicFeatures):
    if not models or not scaler:
        return {"error": "Models or Scaler are not loaded. Check backend server logs."}

    try:
        input_data = [
            features.u, features.g, features.r,
            features.i, features.z, features.redshift
        ]
        input_array = np.array(input_data).reshape(1, -1)
    except Exception as e:
        return {"error": f"Error creating input array: {e}"}

    try:
        input_scaled = scaler.transform(input_array)
    except Exception as e:
        return {"error": f"Error during data scaling: {e}"}

    predictions = {}
    for model_name, model in models.items():
        try:
            raw_probabilities = model.predict_proba(input_scaled)[0]
            model_classes = model.classes_
            probabilities = {cls: prob for cls, prob in zip(model_classes, raw_probabilities)}
            main_prediction = max(probabilities, key=probabilities.get)
            
            predictions[model_name] = {
                "prediction": main_prediction,
                "confidence": probabilities[main_prediction],
                "probabilities": probabilities
            }
        except Exception as e:
            predictions[model_name] = {
                "prediction": "Error",
                "confidence": 0,
                "probabilities": {"Error": f"{e}"}
            }

    # --- Model Agreement (UPDATED) ---
    prediction_list = [result["prediction"] for result in predictions.values() if "Error" not in result["probabilities"]]
    
    if prediction_list:
        most_common = Counter(prediction_list).most_common(1)[0]
        winning_prediction = most_common[0]
        
        # --- NEW: Calculate average confidence for the consensus prediction ---
        confidences = [
            result["confidence"] 
            for result in predictions.values() 
            if result.get("prediction") == winning_prediction
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        # --- END NEW ---

        model_agreement = {
            "prediction": winning_prediction,
            "count": most_common[1],
            "total": len(prediction_list),
            "confidence": avg_confidence  # <-- ADDED FOR THE FRONTEND
        }
    else:
        model_agreement = {"prediction": "Error", "count": 0, "total": 0, "confidence": 0}

    performance_metrics = {
        "Support Vector Machine (SVM)": {"accuracy": 0.92, "precision": 0.91, "recall": 0.92, "f1_score": 0.91},
        "Multi-Layer Perceptron (MLP)": {"accuracy": 0.95, "precision": 0.94, "recall": 0.95, "f1_score": 0.94},
        "K-Nearest Neighbours (KNN)": {"accuracy": 0.89, "precision": 0.88, "recall": 0.89, "f1_score": 0.88},
        "Random Forest (RF)": {"accuracy": 0.97, "precision": 0.97, "recall": 0.97, "f1_score": 0.97}
    }

    return {
        "predictions": predictions,
        "performance": performance_metrics,
        "model_agreement": model_agreement,
        "input_features": features.dict()
    }

# --- 7. Gemini Explanation Endpoint (NEW) ---
@app.post("/get_explanation")
async def get_gemini_explanation(request: ExplanationRequest):
    if not gemini_model:
        return {"error": "Gemini model is not initialized. Check API key."}
    
    try:
        # Craft a detailed prompt for Gemini
        prompt = f"""
        You are an expert astronomer and data scientist.
        My ensemble model just made a prediction with the following consensus results:

        - Predicted Class: {request.prediction}
        - Model Consensus Confidence: {request.confidence * 100:.2f}%

        Please provide a detailed, two-paragraph explanation for this result,
        formatted for a web UI (use newlines).
        
        Paragraph 1: Start by clearly explaining what a "{request.prediction}" is
        in simple astronomical terms (e.g., "A QSO, or Quasi-Stellar Object, is...").
        
        Paragraph 2: Explain what this specific prediction means. Why might the 
        models have reached this consensus with {request.confidence * 100:.2f}% confidence?
        What makes it different from the other classes (STAR, GALAXY, QSO)?
        
        Keep the tone professional, informative, and accessible.
        """
        
        # Call the Gemini API
        response = gemini_model.generate_content(prompt)
        
        # Return the text from Gemini
        return {"explanation": response.text}

    except Exception as e:
        print(f"Gemini API error: {e}")
        return {"error": "Failed to generate explanation."}

# --- 8. Feature Importance Endpoint (Unchanged) ---
@app.get("/feature_importance")
def get_feature_importance():
    if not models or 'rf' not in models:
        return {"error": "Random Forest model not loaded."}
    
    try:
        rf_model = models['rf']
        importances = rf_model.feature_importances_
        feature_names = ['u', 'g', 'r', 'i', 'z', 'redshift']
        
        zipped_data = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        sorted_importances = {item[0]: item[1] for item in zipped_data}
        
        return sorted_importances
    except Exception as e:
        return {"error": f"Could not get feature importance: {e}"}

# --- 9. Root Endpoint (Unchanged) ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Nebula Lens API!"}