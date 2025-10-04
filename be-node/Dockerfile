# Use an official Node runtime as a parent image
FROM node:22.19.0

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy necessary directory contents into the container
COPY . .

# TODO: copy and build frontend directory, bake it into backend static ruotes
# Install dependencies and build /dist to be run with "npm start";
# after building, dev dependancies and source are no longer needed - delete
RUN npm install &&\
    #npm test &&\
    #rm -rf test &&\
    #rm -rf .env-test &&\
    npm run build &&\
    #rm -rf src &&\
    #rm -rf tsconfig.json &&\
    npm prune --production

CMD ["npm", "run", "start"]