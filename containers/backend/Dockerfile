FROM node:22-alpine

WORKDIR /app

# Copy the whole monorepo (backend + frontend)
COPY . .

WORKDIR /app/containers/backend

RUN npm ci

EXPOSE 1234
CMD ["npm", "run", "start"]
