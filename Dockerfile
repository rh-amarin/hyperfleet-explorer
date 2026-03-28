# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config template — only ${API_URL} is substituted at runtime
RUN mkdir -p /etc/nginx/templates && printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location /api/ {\n\
        proxy_pass ${API_URL};\n\
        proxy_set_header Host $http_host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/templates/default.conf.template

EXPOSE 80

ENV API_URL=http://localhost:8080

# envsubst with explicit variable list so nginx vars ($http_host, $remote_addr) are preserved
CMD ["/bin/sh", "-c", "envsubst '${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
