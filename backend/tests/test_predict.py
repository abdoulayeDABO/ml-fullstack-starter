import app.main as main_module
from fastapi.testclient import TestClient
import numpy as np

from app.main import app


class DummyScaler:
    def transform(self, features: np.ndarray) -> np.ndarray:
        return features


class DummyModel:
    def predict(self, features: np.ndarray) -> np.ndarray:
        return np.array([1])

    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        return np.array([[0.2, 0.8]])


def test_predict(monkeypatch) -> None:

    def fake_get_models() -> dict:
        return {
            "scaler": DummyScaler(),
            "model": DummyModel(),
        }

    monkeypatch.setattr(main_module, "get_models", fake_get_models)

    payload = {
        "pregnancies": 2,
        "glucose": 120,
        "blood_pressure": 70,
        "skin_thickness": 20,
        "insulin": 85,
        "bmi": 28.5,
        "diabetes_pedigree_function": 0.5,
        "age": 33,
    }

    with TestClient(app) as client:
        response = client.post("/api/v1/predict", json=payload)
        body = response.json()

    assert response.status_code == 200
    assert "prediction" in body
    assert "probability" in body
    assert isinstance(body["prediction"], int)
    assert isinstance(body["probability"], float)
    assert 0.0 <= body["probability"] <= 1.0
