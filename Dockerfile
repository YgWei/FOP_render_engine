FROM node:10.14.2-alpine AS builder
WORKDIR /home/node/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

###############################################################################

FROM node:10.14.2-alpine
ENV NODE_ENV=production
WORKDIR /home/node/app

COPY package.json package-lock.json ./
RUN npm install \
    && npm cache clean --force

# Install python and project's dependencies
RUN apk update \
    && apk --no-cache --virtual build-dependencies add \
        python \
        make \
        g++ \
    && apk fetch openjdk8 \
    && apk add openjdk8 \
    && npm install \
    && npm cache clean --force \
    && rm -rf /var/lib/apt/lists/* \
    && apk del build-dependencies

COPY --from=builder /home/node/app/dist ./dist
COPY .env ./
COPY ./FOP ./FOP

RUN mkdir -p src/controllers
COPY src/controllers/ src/controllers/

# Expose ports (for orchestrators and dynamic reverse proxies)
# EXPOSE 8080

RUN mkdir -p logs storage output download

# Need use node as root. npm does not send signal to child process!
CMD ["node", "dist/index.bundle.js"]
