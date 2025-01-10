# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx's web root
COPY --from=builder /app/.next /usr/share/nginx/html/.next
COPY --from=builder /app/public /usr/share/nginx/html/public

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy .env file for environment variables
COPY .env /etc/nginx/.env

# Expose port 80
EXPOSE 80

# Expose port 3000
EXPOSE 3000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
