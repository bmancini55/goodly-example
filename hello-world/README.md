# goodly hello world
This project will help you get familiar with writing goodly servics.

## Getting started

From the `hello-world` directory, start by installing the node dependencies
```sh
npm install
```

Once the node dependencies are installed, and with RabbitMQ running, you can start the services from NPM scripts. Pass the IP address / host of RabbitMQ as the first argument.

```sh
npm run example1 192.168.99.100
npm run example2 192.168.99.100
npm run example2 192.168.99.100
npm run example2 192.168.99.100
npm run example2 192.168.99.100
```

For additional logging, you can use set the environment variable DEBUG=goodly* when executing the script
```sh
DEBUG=goodly* npm run example1 192.168.99.100
```

## Examples

1. [view](https://github.com/bmancini55/goodly-example/blob/master/hello-world/example1.js) - Basics of goodly, listening to a message and emitting a message
2. [view](https://github.com/bmancini55/goodly-example/blob/master/hello-world/example2.js) - Two servics interacting by listening to messages and emitting messages
3. [view](https://github.com/bmancini55/goodly-example/blob/master/hello-world/example3.js) - Request/response of a service calling out to another service
4. [view](https://github.com/bmancini55/goodly-example/blob/master/hello-world/example4.js) - Use of middleware when listening to messages
5. [view](https://github.com/bmancini55/goodly-example/blob/master/hello-world/example5.js) - Using the HTTP Transport mechanism to avoid sending data through RabbitMQ
