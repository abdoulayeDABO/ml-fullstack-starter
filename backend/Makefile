.PHONY: install train run test lint format typecheck check precommit-install

install:
	python -m pip install -e ".[dev]"

train:
	python scripts/train_model.py

run:
	uvicorn app.main:app --reload

test:
	pytest

lint:
	ruff check src app tests scripts

format:
	ruff format src app tests scripts

typecheck:
	mypy src app scripts tests

check: lint typecheck test

precommit-install:
	pre-commit install
