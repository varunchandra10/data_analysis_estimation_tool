FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app/backend

# Install system build deps required for SciPy and numeric libs
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gfortran \
       libopenblas-dev \
       liblapack-dev \
       libpq-dev \
       pkg-config \
       git \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt ./requirements.txt

RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
