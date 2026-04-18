from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
import joblib
from utils import path as paths
from app.core.logging import get_logger

# Initialize logger
logger = get_logger(__name__)

# Global dictionary to store loaded models
ml_models = {}


def get_models() -> dict:
    """Get the current loaded models dictionary."""
    return ml_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    # Define the filename where the model was saved
    scaler_filename = paths.SAVED_MODELS_DIR / 'standard_scaler.joblib'
    model_filename = paths.SAVED_MODELS_DIR / 'scaled_logistic_regression_model.joblib'

    logger.info(f"Loading scaler from {scaler_filename}...")
    logger.info(f"Loading model from {model_filename}...")
    
    try:
        # Use joblib.load to deserialize the model and scaler
        loaded_scaler = joblib.load(scaler_filename)
        loaded_scaled_model = joblib.load(model_filename)
        logger.info("Model and scaler loaded successfully with joblib.")
        
        # Store models in ml_models dictionary
        ml_models["scaler"] = loaded_scaler
        ml_models["model"] = loaded_scaled_model
        logger.debug("Models stored in ml_models dictionary.")
    except FileNotFoundError as e:
        logger.error(f"Model files not found: {e}")
        logger.warning("API will respond with 503 on prediction requests.")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise
    
    yield
    # Clean up the ML models and release the resources
    logger.info("Cleaning up ML models on shutdown...")
    ml_models.clear()
    logger.debug("Models cleared.")

app = FastAPI(
    # title=settings.app_name,
    # version=settings.app_version,
    description="API de prédiction ML prête pour production",
    lifespan=lifespan,
)

allowed_origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.27:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


        
app.include_router(api_router, prefix="/api/v1")


