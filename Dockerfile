FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY index.js .
# you can change the port if needed, make sure it matches your index.js configuration
EXPOSE 3000
CMD ["node", "index.js"]