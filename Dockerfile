FROM keymetrics/pm2:latest-slim
# FROM node:lts-alpine3.9

# Bundle APP files
COPY src src/
COPY package.json .
COPY webpack.config.js .
COPY pm2.json .

# Install app dependencies
# ENV NPM_CONFIG_LOGLEVEL warn
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
# RUN /bin/bash -c "source ~/.bashrc"
# RUN source ~/.bashrc
# RUN nvm install 12.14.1
# RUN nvm use 12
RUN npm install
RUN npm run build

# Show current folder structure in logs
# RUN ls -al -R
CMD [ "pm2-runtime", "start", "pm2.json" ]