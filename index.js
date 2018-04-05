"use strict";

const { utils } = require("merapi");

module.exports = function (container) {
    return {
        dependencies: [],

        *onAfterPluginInit() {
            container.register("aop", require("./lib/aspect"));
        },

        *onComponentInstantiate(name, component) {
            if (name !== "aop") {
                let aop = yield container.resolve("aop");
                let matches = aop.matchComponent(name);
                if ( matches && !(aop.getAllHandlerClass().includes(name)) ) {
                    for (let i = 0; i < matches.length; i++) {
                        let props = utils.getAllPropertyNames(component);
                        for (let j = 0; j < props.length; j++) {
                            if ((matches[i].methodName === "*" || props[j] === matches[i].methodName) && typeof component[props[j]] === "function") {
                                let handler = yield container.injector.resolveMethod(matches[i].handler);
                                component[props[j]] = aop.wrapMethod(handler, component, props[j], matches[i].options);
                            }
                        }
                    }
                }
            }
        }

    };
}
