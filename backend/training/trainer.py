from pathlib import Path
from typing import Optional
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from utils import path as paths



def train_and_save_model(model_path: Optional[Path] = None) -> Path:
    
    # Load diabetes data
    data_path = paths.DATA_DIR / "diabetes.csv"
    data = pd.read_csv(data_path)
    
    # X: features (first 8 columns)
    x = data.iloc[:, 0:8]
    # y: target (last column)
    y = data.iloc[:, 8]

    # Split data into training and testing sets
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    # Create a Pipeline: StandardScaler + LogisticRegression
    print("Creating and training pipeline...")
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LogisticRegression(solver='liblinear', random_state=42))
    ])
    
    pipeline.fit(x_train, y_train)
    print("Pipeline training complete.")

    # Save pipeline (scaler + model together)
    pipeline_filename = 'diabetes_pipeline.joblib'
    pipeline_path = paths.SAVED_MODELS_DIR / pipeline_filename

    print(f"Saving pipeline to {pipeline_filename}...")
    joblib.dump(pipeline, pipeline_path)
    print("Pipeline saved.")

    if model_path is None:
        return pipeline_path
    return model_path


