"use strict";

const chai = require("chai");
const expect = chai.expect;
const Aop = require("../lib/aspect");

const { Config, async } = require("merapi");

describe("aspect", function () {
    let aop, config;

    before(function () {
        config = Config.create({
                name: "test-aop",
                version: "0.0.1",
                aspects: {
                    logging: {
                        handler: "aopLogger.log",
                        match: "daenerys.targaryen"
                    },
                    kafka: {
                        handler: "aopKafka.publish",
                        match: "cersei.lannister"
                    }
                }
        });
        aop = new Aop(config, console);
    });

    describe("matchComponent", function () {
        it("should return empty matches aspect", function () {
            let res = aop.matchComponent("drogon");
            expect(res).to.deep.equal([]);
        });

        it("should return matches aspect", function () {
            let res = aop.matchComponent("daenerys");
            expect(res).to.deep.equal([{
                handler: "aopLogger.log",
                componentName: "daenerys",
                methodName: "targaryen",
                options: undefined
            }]);
        });
    });

    describe("wrapMethod", function () {
        let originalFunction = function(a, b) {
            return a + b;
        }

        let handlerFunction = function(component, methodName, func, options) {
            let output = options.output;
            return (...args) => {
                let result = func(...args);
                let replaceObject = {
                    methodName,
                    result,
                    params: args
                };
                output = output.replace(/\[\w+\]/g, (word) => {
                    return replaceObject[word.replace(/\[|\]/g, "")] || word;
                });
                return "Jon";
            }
        }

        it("should return true", async(function* () {
            let wrappedMethod = aop.wrapMethod(handlerFunction, { targaryen: originalFunction }, "targaryen", { output: "test log [methodName]: [params] [result]" });
            let result = wrappedMethod(1, 2);
            expect(result).to.equal("Jon");
        }));
    });

    describe("getAllHandlerClass", function () {
        it("should return all handler", function () {
            let res = aop.getAllHandlerClass();
            expect(res).to.deep.equal([ "aopLogger", "aopKafka" ]);
        });
    });

    describe("createAspect", function () {
        it("should update aspects", function () {
            aop.createAspect("rabbit", { handler: "aopRabbit", match: "*.*" });
            let res = aop.getAllHandlerClass();
            expect(res).to.deep.equal([ "aopLogger", "aopKafka", "aopRabbit" ]);
        });
    });

    describe("_getAspectCondition", function () {
        it("should parse aspect condition", function () {
            let mockAspect = {
                handler: "gameOf.thrones",
                match: "daenerys.targaryen"
            }

            let res = aop._getAspectCondition(mockAspect);
            expect(res.handler).to.equal("gameOf.thrones");
            expect(res.componentName).to.equal("daenerys");
            expect(res.methodName).to.equal("targaryen");
        });
    });
});
