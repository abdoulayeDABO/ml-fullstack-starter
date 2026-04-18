start:
	docker-compose up -d

start-dev:
	cd backend && .venv/bin/uvicorn main:app --host
	cd ../frontend && npm run dev