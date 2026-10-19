# Step 1: Use an official Node.js image as the foundation
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files first to install dependencies
COPY package*.json ./

# Step 4: Install the project dependencies
RUN npm install

# Step 5: Copy the rest of your React project files
COPY . .

# Step 6: Expose the port React runs on
EXPOSE 3000

# Step 7: The command to start your development server
CMD ["npm", "start"]
