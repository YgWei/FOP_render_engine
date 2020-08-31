# Render Adapter

## Description

This is a Base code of render engine.

## 映射目錄

- logs: /home/node/app/logs。存放 log 的目錄

## Swagger API

- `${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/api-docs/index.html` . Default is http://localhost:8080/api-docs/index.html

1. Install dependency

```
  npm install
```

2. Add enviroment file. File name is .env

```
APP_NAME= Name of the App. Default is render_engine
APP_PORT= Port for this App. Default is 8080
APP_HOST= Host for the App. Default is localhost

# Log
LOG_FILENAME= Log's save directory. Default is logs
LOG_DIRECTORY= Log's base file name. Default is render_engine
LOG_LEVEL= Log's level. Default is info

# Kafka
CLIENT_ID= kafka's client id. Default is kafka-node-app
BROKER_HOST= kafka's internet host. Default is 192.168.20.62
BROKER_PORT= kafka's internet port. Default is 31090
SUBSCRIBE_TOPIC= kafka's subscribe topic. Default is kafka-testing
PUBLISH_TOPIC= kafka's publish topic. Default is kafka-publish-testing
GROUP_ID= kafka's group id. Default is werry

# Engine
ENGINE_VERSION= engine's version. Default is v1
ENGINE_SUPPORT_INPUT= engine's support input. Default is html,xml
ENGINE_SUPPORT_OUTPUT= engine's output support. Default is pdf
ENGINE_ADDRESS= engine's address. Default is 127.0.0.1

# Dispatch
DISPATCH_PROTOCOL= engine's register platform protocol. Default is http
DISPATCH_HOST= engine's register platform host. Default is localhost
DISPATCH_PORT= engine's register platform port. Default is 80
REGISTER_PATH= engine's register platform path
UNREGISTER_PATH= engine's unregister platform path

# cloud storage
CS_PROTOCOL= cloud storage's internet protocol. Default is http
CS_HOST= cloud storage's host. Default is 192.168.20.62
CS_PORT= cloud storage's port. Default is 5000
CS_COLLECTION= cloud storage's collection. Default is werrykafka
TIMEOUT= cloud storage's connect timeout. Default is 5000
UPLOAD_EXPIRE_TIME= cloud storage's upload file expire time in hours. Default is 24 hours
RETRY_TIMES= cloud storage's retry limit. Default is 2
RETRY_DELAY= cloud storage's retry delay. Default is 1000

# folder
OUTPUT_FOLDER= output folder for render pdf. Default is output
STORAGE_FOLDER= folder to save engineId json file. Default is storage

```

3. Run the app

```
# Run with development mode
  - npm run dev

#Compiles and minifies for production
  - npm run build
  - npm run start
```
