FROM python:3.9-slim-buster

RUN apt-get update && apt-get install -y cowsay curl && rm -rf /var/lib/apt/lists/*

# Add /usr/games to PATH so cowsay can be found
ENV PATH="/usr/games:${PATH}"

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 80

CMD ["python", "app.py"]
