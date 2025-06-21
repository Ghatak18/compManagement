FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN npm install -g nodemon

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm run prisma:generate

COPY . .

EXPOSE 3000

# Use start instead of start:dev for production
CMD ["npm", "run", "start"]