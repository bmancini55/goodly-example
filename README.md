# goodly-example
These are examples for using Goodly.

## Getting started

The fastest way to get up and running is via Docker ([linux](https://docs.docker.com/linux/step_one/), [osx](https://docs.docker.com/mac/step_one/), [windows](https://docs.docker.com/windows/step_one/))

Once Docker is installed, you should run RabbitMQ:
```sh
docker run -d --name rabbit1 -p 5672:5672 -p 15672:15672 rabbitmq:management
```

With RabbitMQ running, jump into the [hello world](https://github.com/bmancini55/goodly-example/tree/master/hello-world) examples to get acquanted with writing goodly services.
