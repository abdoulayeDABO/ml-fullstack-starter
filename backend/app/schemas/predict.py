from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Diabetes prediction input: 8 features from the diabetes dataset"""
    pregnancies: float = Field(..., ge=0, description="Number of pregnancies")
    glucose: float = Field(..., gt=0, description="Plasma glucose concentration")
    blood_pressure: float = Field(..., ge=0, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(..., ge=0, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(..., ge=0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(..., gt=0, description="Body mass index")
    diabetes_pedigree_function: float = Field(..., ge=0, description="Diabetes pedigree function")
    age: float = Field(..., gt=0, description="Age (years)")


class PredictionResponse(BaseModel):
    """Diabetes prediction output"""
    prediction: int = Field(..., description="Predicted class (0 or 1)")
    probability: float = Field(..., ge=0, le=1, description="Probability of positive class")
