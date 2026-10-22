FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN npm ci

COPY backend ./backend

RUN npm run prisma:generate --workspace backend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "backend"]
