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
     * Check matches Component
     * 
     * @param {String} name
     *      Component name
     * @return {Array}
     *      Matches Component
     */
    matchComponent(name) {
        let matchedAspects = [];
        let aspects = this.aspects;
        if (aspects) {
            for (let key in aspects) {
                if (aspects.hasOwnProperty(key)) {
                    let condition = this._getAspectCondition(aspects[key]);
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
        let wrappedMethod;
        if (utils.isPromise(handler)) {
            wrappedMethod = yield handler(component, methodName, component[methodName], options);
        } else {
            wrappedMethod = handler(component, methodName, component[methodName], options);
        }
        return wrappedMethod;
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
