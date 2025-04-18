# Use Node.js as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files first (to leverage caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the entire backend source code into the container
COPY . .

# Expose the backend port
EXPOSE 5000

# Set environment variables dynamically
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Provide a default port for production or development
ENV BACKEND_PORT=5000

# Command to start the backend server
CMD ["npm", "run", "dev"]
