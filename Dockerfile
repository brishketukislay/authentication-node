# Use official Node.js image as base
FROM node:16-alpine AS build


# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Node.js app code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the Node.js app
CMD ["npm", "start"]
