# ML Starter — Structure ML Pro (API = interface web)

Ce template applique une séparation stricte des responsabilités :

- `app/` : couche interface FastAPI uniquement (routes, schémas HTTP, wiring).
- `src/ml_starter/` : logique métier ML réutilisable (inférence + entraînement).
- `scripts/` : orchestration (commandes CLI du projet).

## Arborescence recommandée

```text
ml-starter/
├── app/                          # Interface web/API seulement
│   ├── api/v1/endpoints/
│   ├── schemas/
│   └── main.py
├── src/ml_starter/               # Coeur métier ML
│   ├── config.py
│   ├── inference/model_service.py
│   └── training/trainer.py
├── scripts/                      # Entrypoints workflows
│   └── train_model.py
├── data/
│   ├── raw/                      # Données brutes immuables
│   ├── interim/                  # Données intermédiaires
│   └── processed/                # Données prêtes modèle
├── models/                       # Modèles entraînés (.joblib, etc.)
├── notebooks/                    # Exploration/expérimentation
├── reports/figures/              # Figures et rapports générés
├── docs/                         # Documentation projet
├── config/                       # Fichiers de configuration YAML/JSON
├── tests/
├── Makefile
└── pyproject.toml
```

## Démarrage rapide

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
python scripts/train_model.py
uvicorn app.main:app --reload
```

Docs API : `http://127.0.0.1:8000/docs`

## API et entraînement séparés

- L’API ne fait pas d’entraînement.
- Si le modèle n’existe pas, `POST /api/v1/predict` retourne `503`.
- L’entraînement se fait via un script dédié.

```bash
python scripts/train_model.py
```

## Qualité et bonnes pratiques

- `ruff` : lint + format
- `mypy` : type-checking strict
- `pytest` + `pytest-cov` : tests + couverture
- `pre-commit` : exécution automatique avant commit

```bash
make install
make format
make lint
make typecheck
make test
make check
make precommit-install
pre-commit run --all-files
```

## Notes données/modèles

- Ne pas committer les gros datasets/modèles dans Git.
- Utiliser Git LFS, DVC, ou un stockage externe (bucket cloud).
- Les dossiers `data/*`, `models/`, `reports/figures/` sont structurés avec `.gitkeep`.

curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "pregnancies": 6,
    "glucose": 148,
    "blood_pressure": 72,
    "skin_thickness": 35,
    "insulin": 0,
    "bmi": 33.6,
    "diabetes_pedigree_function": 0.627,
    "age": 50
  }'