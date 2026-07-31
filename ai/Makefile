.PHONY: install dev run test lint docker

install:
	python -m pip install -r requirements-dev.txt

# 포트는 .env 의 PORT 가 정합니다(기본 8080). 여기에 하드코딩해 두면 .env 를
# 고쳐도 안 바뀌어서, 로그는 8081 인데 8080 에 붙는 상황이 생깁니다.
dev:
	python -m app --reload

run:
	python -m app

test:
	pytest -q

lint:
	ruff check app tests

docker:
	docker compose up --build
