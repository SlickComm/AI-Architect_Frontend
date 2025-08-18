# 1) Verwende ein aktuelles Node.js-Image
FROM node:20-alpine

# 2) Arbeitsverzeichnis setzen
WORKDIR /app

# 3) Kopiere nur package.json und package-lock.json, um Abhängigkeiten zu installieren
COPY package.json package-lock.json ./

# 4) Installiere alle Abhängigkeiten
RUN npm install --frozen-lockfile

# 5) Kopiere den Rest der Anwendung
COPY . .

# 6) Next.js Build Schritt mit Fehlerbehebung
# RUN npx tailwindcss init && npm run build
RUN npm run build

# 7) Exponiere den Port
EXPOSE 3000

# 8) Starte die Anwendung
CMD ["npm", "run", "start"]
