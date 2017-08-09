"use strict";

const { Component, utils } = require("merapi");

module.exports = class Aspect extends Component {
    constructor(config, logger) {
        super();
        this.config = config;
        this.logger = logger;
        this.aspects = config.default("aspects", []);
    }

    /**
     * Add new aspect
     *
     * @param {String} name
     *      Aspect name
     * @param {JSON} aspect
     *      Aspect JSON
     * @return {void}
     */
    createAspect(name, aspect) {
        this.aspects[name] = aspect;
    }

    /**
     * Check matches Component
     * 
     * @param {String} name
     *      Component name
     * @return {Array}
     *      Matches Component
     */
    matchComponent(name) {
        let matchedAspects = [];
        if (this.aspects) {
            for (let key in this.aspects) {
                if (this.aspects.hasOwnProperty(key)) {
                    let condition = this._getAspectCondition(this.aspects[key]);
                    if (condition.componentName === name || condition.componentName === "*")
                        matchedAspects.push(condition);
                }
            }
        }
        return matchedAspects;
    }

    /**
     * Wrap Method
     * 
     * @param {Function} handler
     *      Handler Function
     * @param {Object} component
     *      Component
     * @param {String} methodName
     *      Method name
     * @param {Object} options
     *      Optional parameter
     * @return {Function}
     *      Wrapped method
     */
    *wrapMethod(handler, component, methodName, options) {
        return handler(component, methodName, component[methodName], options);
    }

    /**
     * Return all handler class
     * 
     * @return {Array}
     *      Array of handler class name
    */
    getAllHandlerClass() {
        let handlers = []
        for (let key in this.aspects) {
            if (this.aspects.hasOwnProperty(key)) {
                handlers.push(this.aspects[key].handler.split(".", 2)[0]);
            }
        }
        return handlers;
    }

    /**
     * Parse aspect condition
     * 
     * @param {Object} condition
     *      Object to be parsed
     * @return {Object}
     *      Parsed Object
     */
    _getAspectCondition(condition) {
        let splittedMatch = condition.match.split(".", 2);
        return {
            handler: condition.handler,
            componentName: splittedMatch[0],
            methodName: splittedMatch[1],
            options: condition.options
        }
    }
}
