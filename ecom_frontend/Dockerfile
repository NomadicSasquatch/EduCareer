# /frontend/Dockerfile
# Step 1: Use Node.js to build the React app
FROM node:16 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json ./
RUN npm install

# Copy the source code and build the React app
COPY . .

# Set NODE_ENV for production during build
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Step 2: Use Nginx to serve the built files
FROM nginx:alpine

# Copy built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
