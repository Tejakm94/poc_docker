FROM node:20-bookworm-slim AS build

WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:5000
ARG VITE_DB_RESTORE_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DB_RESTORE_API_KEY=$VITE_DB_RESTORE_API_KEY

COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
