# Usa l'immagine Node 20 basata su Debian Bullseye slim
FROM node:20-bullseye-slim

# Imposta la cartella di lavoro
WORKDIR /app

# Copia soltanto package.json e (se esiste) package-lock.json
COPY package.json package-lock.json* ./

# Installa le dipendenze di produzione
RUN npm install --omit=dev

# Installa le librerie di sistema necessarie per Chromium
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 \
    libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0 libxshmfence1 \
 && rm -rf /var/lib/apt/lists/*

# Copia tutto il resto dell'applicazione
COPY . .

# Espone la porta su cui gira Express
EXPOSE 8080

# Avvia il server
CMD ["npm", "start"]
