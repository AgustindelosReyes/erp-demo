FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set host to 0.0.0.0 for Docker
ENV HOST=0.0.0.0

# Run development server
CMD ["npm", "run", "dev"]