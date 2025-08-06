# 1. Usa un'immagine Node ufficiale (buster-slim include librerie grafiche base)
FROM node:20-buster-slim

# 2. Crea la cartella di lavoro
WORKDIR /app

# 3. Copia solo le dipendenze e installa
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# 4. Installa solo le librerie di sistema necessarie a far girare Chromium
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
    libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 \
 && rm -rf /var/lib/apt/lists/*

# 5. Copia il resto dell’app
COPY . .

# 6. Espone la porta (Railway lo mappa automaticamente)
EXPOSE 8080

# 7. Avvia il server
CMD ["npm","start"]
