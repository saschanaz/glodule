/*
glodule must not return Promise as it will block ES2015 module use case.
*/
function glodule(path) {
    const platformType = getPlatformType();
    const text = getScriptText(path);
    return execute(text);
    function getScriptText(path) {
        if (platformType === "node") {
            const fs = require(`fs${""}`); // use `` to workaround SystemJS prefetching issue
            return fs.readFileSync(path, { encoding: "utf-8" });
        }
        else {
            return synchronousXHR(path);
        }
    }
    /** synchorouns XHR is deprecated and discouraged to use, but no alternative way to support ES2015 use case... */
    function synchronousXHR(path) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send();
        return xhr.responseText;
    }
    function getGlobalObject() {
        return platformType === "node" ? global : self;
    }
    function getPlatformType() {
        if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
            return "node";
        }
        else if (typeof self !== "undefined" && typeof self.fetch === "function") {
            return "browser";
        }
        else {
            throw new Error("Unsupported platform, please file an issue on https://github.com/saschanaz/glodule/issues/");
        }
    }
    function execute(__gloduleExecTextVariable) {
        const global = getGlobalObject();
        // get global variables (browser: window, Node.js: global)
        // get global variables after evalutation. Compare, save and delete new variables
        const storage = Object.create(null);
        with (generateVariableProxy(storage, global)) {
            eval(__gloduleExecTextVariable);
        }
        return storage;
    }
    /** black magic https://stackoverflow.com/a/41704827 */
    function generateVariableProxy(storage, global) {
        return new Proxy(storage, {
            has(storage, prop) { return prop !== "__gloduleExecTextVariable"; },
            get(storage, prop) { return (prop in storage ? storage : global)[prop]; }
        });
    }
    function getAddedItems(x, y) {
        const result = [];
        for (const item of y) {
            if (!x.includes(item)) {
                result.push(item);
            }
        }
        return result;
    }
}

if (typeof module === "object" && typeof module.exports === "object") {
    module.exports.glodule = glodule;
}
else if (typeof define === "function" && typeof require === "function") {
    define(() => ({ glodule }));
}
else if (typeof SystemJS === "object" && typeof SystemJS.register === "function") {
    SystemJS.register([], exports => exports("glodule", glodule));
}
