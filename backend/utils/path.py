from pathlib import Path

# __file__ is the absolute path to THIS paths.py file
# .parent is its directory (src/)
# .parent again is the project root

PROJECT_ROOT = Path(__file__).parent.parent

# Definition of other key directories relative to this stable anchor
CONFIG_DIR = PROJECT_ROOT / "configs"
DATA_DIR = PROJECT_ROOT / "data"
SAVED_MODELS_DIR = PROJECT_ROOT / "models"