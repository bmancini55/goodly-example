# goodly-example
Example site for comic books using Goodly microservice communication framework.

## Getting Started

### Docker Setup

This example uses RabbitMQ, Redis, and MongoDB. With Docker installed, you will need to start the following containers:
```bash
# Start RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 --name rabbit1 rabbitmq:management

# Start Redis
docker run -d -p 6379:6379 --name redis1 redis

# Start MongoDB
docker run -d -p 27017:27017 --name mongo1 mongo
```

Ensure that the containers are running
```bash
docker ps
```

### Application Setup

This application requires that you have Node 4.X installed on your machine.  

First you will need to clone the Git repository and install the Node dependencies:
```bash
git clone https://github.com/bmancini55/goodly-example
cd goodly-example
npm install
```

Then copy the configuration file example from `config.json.example` to `config.json`.  Each service will use this file to connect to the sub-elements. In a full microservice architecture you would most likely use a configuration management solution such as Redis or Consul.
```bash
cp config.json.example config.json
```

After copying the file, modify the paths to map to your environment (by default it is configured to work with the default IP from docker-machine, 192.168.99.100).


You can then start the indvidual pieces of the application:
```bash
# start the gateway
DEBUG=goodly*,gateway npm run start:gateway

# start the preview service
DEBUG=goodly*,previews npm run start:previews

# start the item service
DEBUG=goodly*,item npm run start:item
```

###Testing
You can execute a curl command to the endpoint that was just created:
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "stock_no": "STK696381",
  "previews_no": "DEC150718",
  "title": "Invincible Iron Man #6",
  "msrp": "3.99",
  "isbn": "75960608306000611",
  "publisher": "Marvel Comics",
  "author": "Bendis, Brian Michael",
  "artist": "Deodato, Mike",
  "cover_artist": "Deodato, Mike"
}' "http://localhost:5050/api/previews"
```

You should see logging output to the console:
```bash
bmancini@Apple:~/Documents/code/goodly-example$ DEBUG=goodly*,item npm run start:item

> goodly-site@0.1.0 start:item /Users/bmancini/Documents/code/goodly-example
> babel-node item-service

  goodly:core created service item +0ms
  goodly:core connected to RabbitMQ 192.168.99.100 +60ms
  goodly:redis-cache connected to Redis 192.168.99.100 +2ms
  goodly:http-transport express listening on port 56950 +27ms
  goodly:core listens to previews.available +41ms
  goodly:core on previews.available 933f5a24-f636-4c4f-a5bf-872a3490ad85 +5m
  goodly:core emit previews.available.senddata 933f5a24-f636-4c4f-a5bf-872a3490ad85 +1ms
  goodly:http-transport http data received for 933f5a24-f636-4c4f-a5bf-872a3490ad85 +32ms
  goodly:core emit item.available 933f5a24-f636-4c4f-a5bf-872a3490ad85 +9ms
  goodly:core listens to item.available.senddata +4ms
  goodly:redis-cache writing 933f5a24-f636-4c4f-a5bf-872a3490ad85 +0ms

```

You can also drop into your mongo server and check the data
```bash
docker exec -it mongo1 /bin/bash
```

```bash
root@68009c0b3579:/# mongo
```

```bash
> use goodly
switched to db goodly
> db.previews.find().pretty()
{
  "_id" : "DEC150718",
  "stock_no" : "STK696381",
  "previews_no" : "DEC150718",
  "title" : "Invincible Iron Man #6",
  "msrp" : "3.99",
  "isbn" : "75960608306000611",
  "publisher" : "Marvel Comics",
  "author" : "Bendis, Brian Michael",
  "artist" : "Deodato, Mike",
  "cover_artist" : "Deodato, Mike"
}
> db.items.find().pretty()
{
  "_id" : "STK696381",
  "previews" : [
    "DEC150718"
  ],
  "title" : "Invincible Iron Man #6",
  "msrp" : "3.99",
  "isbn" : "75960608306000611",
  "publisher" : "Marvel Comics",
  "author" : "Bendis, Brian Michael",
  "artist" : "Deodato, Mike",
  "cover_artist" : "Deodato, Mike"
}
```
