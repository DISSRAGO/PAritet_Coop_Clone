# Создание структуры для Docker и Docker Compose
import os

# 1. Dockerfile (для приложения FastAPI)
dockerfile_content = """FROM python:3.13-slim
WORKDIR /srv
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "clone.main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# 2. docker-compose.yml (удобный запуск приложения + БД)
docker_compose_content = """version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/srv
    environment:
      - DATABASE_URL=postgresql://fedorov:mypassword123@db:5432/homonet_clone
    depends_on:
      - db
    command: uvicorn clone.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: fedorov
      POSTGRES_PASSWORD: mypassword123
      POSTGRES_DB: homonet_clone
    ports:
      - "5432:5432"
"""

# 3. requirements.txt
requirements_content = """fastapi[standard]
sqlmodel
psycopg2-binary
"""

# Сохранение
os.makedirs("docker_project", exist_ok=True)
with open("docker_project/Dockerfile", "w") as f:
    f.write(dockerfile_content)
with open("docker_project/docker-compose.yml", "w") as f:
    f.write(docker_compose_content)
with open("docker_project/requirements.txt", "w") as f:
    f.write(requirements_content)

print("Файлы для Docker созданы в папке docker_project/")