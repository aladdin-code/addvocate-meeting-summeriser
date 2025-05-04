# Use Node.js LTS version
FROM node:20.11.1-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

#Install Nodemon
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Generate Prisma Client code
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app with database setup and retry logic
CMD /bin/sh -c "echo 'Setting up database schema...' && \
    npx prisma db push && \
    if [ \$? -ne 0 ]; then \
    echo 'Schema push failed, retrying after a delay...' && \
    sleep 5 && \
    npx prisma db push; \
    fi && \
    echo 'Starting application...' && \
    nodemon --legacy-watch --watch src --ext ts --exec ts-node -r tsconfig-paths/register src/main.ts"