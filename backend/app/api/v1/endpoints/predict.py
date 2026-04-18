from fastapi import APIRouter, HTTPException
import numpy as np
from app.schemas.predict import PredictionRequest, PredictionResponse
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post("/predict", response_model=PredictionResponse)
async def predict(payload: PredictionRequest) -> PredictionResponse:
    """
    Predict diabetes outcome for a patient.
    
    Takes 8 diabetes features and returns prediction (0 or 1).
    """
    logger.debug(f"Prediction request received: pregnancies={payload.pregnancies}, glucose={payload.glucose}")
    
    try:
        # Delayed import to avoid circular dependency during app initialization
        from app.main import get_models
        
        ml_models = get_models()
        
        # Check if models are loaded
        if not ml_models or "model" not in ml_models or "scaler" not in ml_models:
            logger.error("ML models not loaded")
            raise HTTPException(
                status_code=503,
                detail="ML models not loaded. Train the model first using scripts/train_model.py"
            )
        
        # Prepare input features in correct order
        features = np.array([[
            payload.pregnancies,
            payload.glucose,
            payload.blood_pressure,
            payload.skin_thickness,
            payload.insulin,
            payload.bmi,
            payload.diabetes_pedigree_function,
            payload.age,
        ]])
        
        # Scale features
        scaler = ml_models["scaler"]
        features_scaled = scaler.transform(features)
        # logger.debug("Features scaled successfully")
        
        # Make prediction
        model = ml_models["model"]
        prediction = model.predict(features_scaled)[0]
        
        # Get probability
        probabilities = model.predict_proba(features_scaled)[0]
        probability = float(probabilities[int(prediction)])
        
        logger.info(f"Prediction completed: prediction={prediction}, probability={probability:.4f}")
        
        return PredictionResponse(
            prediction=int(prediction),
            probability=probability
        )
    except KeyError as error:
        logger.error(f"Missing model component: {error}")
        raise HTTPException(status_code=500, detail=f"Missing model component: {str(error)}") from error
    except ValueError as error:
        logger.warning(f"Invalid input values: {error}")
        raise HTTPException(status_code=400, detail=f"Invalid input values: {str(error)}") from error
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Prediction failed: {error}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(error)}") from error


@router.get("/")
async def root():
    logger.debug("Health check endpoint called")
    return {
        "Name": "Diabetes Prediction API",
        "description": "This is a diabetes prediction model based on 8 medical features (pregnancies, glucose, blood pressure, skin thickness, insulin, BMI, diabetes pedigree function, age).",
        "endpoints": {
            "GET /": "Health check",
            "POST /predict": "Make a diabetes prediction"
        }
    }
 