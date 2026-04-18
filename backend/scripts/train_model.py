from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from training.trainer import train_and_save_model


def main() -> None:
    model_path = train_and_save_model()
    print(f"Modèle entraîné: {model_path}")


if __name__ == "__main__":
    main()
