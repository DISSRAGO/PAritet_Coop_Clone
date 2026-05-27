FROM python:3.13-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV COGI_PROJECT_DIR=/app
ENV COGI_DATA_DIR=/app/data

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]