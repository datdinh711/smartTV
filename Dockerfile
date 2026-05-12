FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/smart-tv/browser /usr/share/nginx/html

VOLUME /usr/share/nginx/html/assets/videos

EXPOSE 9877

CMD ["nginx", "-g", "daemon off;"]
