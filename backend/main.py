import joblib
import numpy as np
from fastapi import FastAPI
from fastapi import Request
from fastapi.responses import Response
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from collections import Counter
import google.generativeai as genai
from dotenv import load_dotenv
# uvicorn main:app --reload -- TERMINAL
# --- NEW IMPORTS FOR DEEP LEARNING ---
from keras.models import load_model

# TO START THE BACKEND, RUN "uvicorn main:app --reload"

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
@app.api_route("/health", methods=["GET", "HEAD"], status_code=200)
async def health_check(request: Request):
    if request.method == "HEAD":
        # For HEAD, return empty body but success status
        return Response(status_code=200)
    return {"status": "online"}
# --- 3. Gemini API Setup ---
load_dotenv() 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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

class ExplanationRequest(BaseModel):
    prediction: str
    confidence: float

# --- 5. Load The Models AND THE SCALER ---
models_path = "./models/"
try:
    # Load Scaler
    scaler_path = os.path.join(models_path, 'star_classifier_scaler.joblib')
    scaler = joblib.load(scaler_path)
    
    # Load Scikit-Learn Models
    model_svm = joblib.load(os.path.join(models_path, 'model_svm.joblib'))
    model_mlp = joblib.load(os.path.join(models_path, 'model_mlp.joblib'))
    model_knn = joblib.load(os.path.join(models_path, 'model_knn.joblib'))
    model_rf = joblib.load(os.path.join(models_path, 'model_rf.joblib'))
    
    # --- NEW: Load Deep Learning Model & Encoder ---
    # We use 'try-except' specifically for DL in case the file hasn't been moved yet
    try:
        model_dl = load_model(os.path.join(models_path, 'model_dl.h5'))
        dl_encoder = joblib.load(os.path.join(models_path, 'dl_label_encoder.joblib'))
        dl_loaded = True
        print("Deep Learning model loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not load Deep Learning model: {e}")
        model_dl = None
        dl_encoder = None
        dl_loaded = False

    models = {
        "svm": model_svm,
        "mlp": model_mlp,
        "knn": model_knn,
        "rf": model_rf,
    }
    
    # Add DL to the dictionary if it loaded
    if dl_loaded:
        models["dl"] = model_dl

    print("Scaler and standard models loaded successfully.")

except Exception as e:
    print(f"CRITICAL ERROR loading models or scaler: {e}")
    scaler = None
    models = {}

# --- 6. Define the Prediction Endpoint ---
@app.post("/predict")
async def predict(features: CosmicFeatures):
    if not models or not scaler:
        return {"error": "Models or Scaler are not loaded. Check backend server logs."}

    # 1. Prepare Input
    try:
        input_data = [
            features.u, features.g, features.r,
            features.i, features.z, features.redshift
        ]
        input_array = np.array(input_data).reshape(1, -1)
    except Exception as e:
        return {"error": f"Error creating input array: {e}"}

    # 2. Scale Input
    try:
        input_scaled = scaler.transform(input_array)
    except Exception as e:
        return {"error": f"Error during data scaling: {e}"}

    # 3. Run Predictions
    predictions = {}
    for model_name, model in models.items():
        try:
            # --- NEW: Special Logic for Deep Learning (Keras) ---
            if model_name == "dl":
                # Keras .predict returns probabilities directly [[0.1, 0.8, 0.1]]
                raw_probabilities = model.predict(input_scaled, verbose=0)[0]
                
                # Get the index of the highest probability (0, 1, or 2)
                predicted_index = np.argmax(raw_probabilities)
                
                # Use the encoder to turn (0, 1, 2) back into ("STAR", etc.)
                main_prediction = dl_encoder.inverse_transform([predicted_index])[0]
                
                # Create the probabilities dictionary manually using encoder classes
                # dl_encoder.classes_ gives us ['GALAXY', 'QSO', 'STAR']
                probabilities = {
                    cls: float(prob) 
                    for cls, prob in zip(dl_encoder.classes_, raw_probabilities)
                }

            # --- Standard Logic for Scikit-Learn Models ---
            else:
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

    # --- 4. Model Agreement ---
    prediction_list = [result["prediction"] for result in predictions.values() if "Error" not in result["probabilities"]]
    
    if prediction_list:
        most_common = Counter(prediction_list).most_common(1)[0]
        winning_prediction = most_common[0]
        
        confidences = [
            result["confidence"] 
            for result in predictions.values() 
            if result.get("prediction") == winning_prediction
        ]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        model_agreement = {
            "prediction": winning_prediction,
            "count": most_common[1],
            "total": len(prediction_list),
            "confidence": avg_confidence 
        }
    else:
        model_agreement = {"prediction": "Error", "count": 0, "total": 0, "confidence": 0}

    # --- 5. Performance Metrics (Updated with DL) ---
    performance_metrics = {
        "Random Forest (RF)": {"accuracy": 0.97, "f1_score": 0.97},
        "Deep Learning (DL)": {"accuracy": 0.97, "f1_score": 0.97}, # NEW!
        "Multi-Layer Perceptron (MLP)": {"accuracy": 0.95, "f1_score": 0.94},
        "Support Vector Machine (SVM)": {"accuracy": 0.92, "f1_score": 0.91},
        "K-Nearest Neighbours (KNN)": {"accuracy": 0.89, "f1_score": 0.88},
    }

    return {
        "predictions": predictions,
        "performance": performance_metrics,
        "model_agreement": model_agreement,
        "input_features": features.dict()
    }

# --- 7. Gemini Explanation Endpoint (Unchanged) ---
@app.post("/get_explanation")
async def get_gemini_explanation(request: ExplanationRequest):
    if not gemini_model:
        return {"error": "Gemini model is not initialized. Check API key."}
    
    try:
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
        response = gemini_model.generate_content(prompt)
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