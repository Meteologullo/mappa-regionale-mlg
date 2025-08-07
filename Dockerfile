# Node 20 slim
FROM node:20-bullseye-slim

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# dipendenze Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 \
    libxss1 libxshmfence1 libasound2 libpangocairo-1.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 8080
CMD ["npm", "start"]
