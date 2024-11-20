# Use the official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including nodemon
RUN npm install

# Copy the rest of your application code
COPY . .

# Use nodemon to run your application
CMD ["npm", "run", "dev"]

