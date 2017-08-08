# Merapi Plugin: AOP

## Introduction

This plugin will wrap selected method with specified handler method.

## Installation

Add plugin to dependency list in `package.json`

```
npm install merapi-plugin-aop
```

## Configuration

```
{
    name: "gogon-service",
    version: "1.0.0",
    plugins: [
        "aop"
        "aop-logger"
    ],
    aspects: {
        logging: {
            handler: aopLogger.logMethod,
            match: "*.*",
            options: {
                output: "test log [methodName]: [params] [result]"
            }
        },
        kafka: {
            handler: aopCom.kafkaPublish
            match: "*.create"
        }
    }
}
```

All configuration for AOP plugin are listed in `aspects`. Defined what kind of aspect you want to create as a key then set which handler you want to use in `handler` and which component you want to apply with in `match`. `options` is optional.
To use handler from another AOP plugin simply state camel case version of plugin name as component name and available method in that plugin.
