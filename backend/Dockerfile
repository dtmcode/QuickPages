FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=1536"
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=1024"
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/email-templates ./src/email-templates
EXPOSE 3000
CMD ["node", "dist/src/main"]