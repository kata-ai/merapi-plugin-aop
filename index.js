"use strict";

const { utils } = require("merapi");

module.exports = function (container) {
    return {
        dependencies: [],

        *onBeforeComponentsRegister() {
            container.register("aop", require("./lib/aop"));
        },

        *onComponentInstantiate(name, component) {
            let aop = yield container.resolve("aop");
            let matches = aop.matchComponent(name);
            if (matches) {
                for (let i = 0; i < matches; i++) {
                    utils.getAllPropertyNames(component).forEach(prop => {
                        if ((matches[i].methodName === "*" || prop === matches[i].methodName)
                            && typeof component[prop] === "function") {
                                let handler = yield container.injector.resolveMethod(matches[i].handler);
                                component[prop] = aop.wrapMethod(handler, component, prop, matches[i].options);
                            }
                    });
                }
            }
        }
    };
}
