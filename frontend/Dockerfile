# Use Node.js LTS version
FROM node:20.11.1-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on, here, I was using port 3333
EXPOSE 5173

# Command to run the app
CMD [  "npm", "run", "dev" ]

