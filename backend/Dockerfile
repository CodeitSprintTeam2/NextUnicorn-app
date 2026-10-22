FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN npm ci

COPY backend ./backend

RUN npm run prisma:generate --workspace backend

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "backend"]
