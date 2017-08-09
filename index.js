"use strict";

const { utils } = require("merapi");

module.exports = function (container) {
    return {
        dependencies: [],

        *onBeforeComponentsRegister() {
            container.register("aop", require("./lib/aspect"));
        },

        *onComponentInstantiate(name, component) {
            if(name !== "aop") {
                let aop = yield container.resolve("aop");
                let matches = aop.matchComponent(name);
                if (matches) {
                    for (let i = 0; i < matches.length; i++) {
                        let props = utils.getAllPropertyNames(component);
                        for (let j = 0; j < props.length; j++) {
                            if ((matches[i].methodName === "*" || props[j] === matches[i].methodName)
                                && typeof component[props[j]] === "function") {
                                    let handler = yield container.injector.resolveMethod(matches[i].handler);
                                    component[props[j]] = yield aop.wrapMethod(handler, component, props[j], matches[i].options);
                                }
                        }
                    }
                }
            }
        }
    };
}
