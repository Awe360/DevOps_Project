# Use official Node.js image as base (LTS version for stability)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the app code
COPY app.js .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]