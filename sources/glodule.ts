/*
glodule must not return Promise as it will block ES2015 module use case.
*/

function glodule(path: string) {
    const platformType = getPlatformType();

    const text = getScriptText(path);
    return execute(text);

    function getScriptText(path: string): string {
        if (platformType === "node") {
            const fs = require("fs");
            return fs.readFileSync(path, { encoding: "utf-8" });
        }
        else { // browser
            return synchronousXHR(path);
        }
    }

    /** synchorouns XHR is deprecated and discouraged to use, but no alternative way to support ES2015 use case... */
    function synchronousXHR(path: string) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false);
        xhr.send();
        return xhr.responseText;
    }

    function getGlobalObject(): any {
        return platformType === "node" ? global : self;
    }

    function getPlatformType() {
        if (typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string") {
            return "node"
        }
        else if (typeof self !== "undefined" && typeof self.fetch === "function") {
            return "browser";
        }
        else {
            throw new Error("Unsupported platform, please file an issue on https://github.com/saschanaz/glodule/issues/");
        }
    }

    function execute(text: string) {
        const global = getGlobalObject();

        // get global variables (browser: window, Node.js: global)
        // get global variables after evalutation. Compare, save and delete new variables
        const globalsBefore = Object.getOwnPropertyNames(global);
        (0, eval)(text); // https://stackoverflow.com/questions/19357978
        const globalsAfter = Object.getOwnPropertyNames(global);

        const additions = {} as any;
        for (const added of getAddedItems(globalsBefore, globalsAfter)) {
            additions[added] = global[added];
            delete global[added];
        }

        return additions;
    }

    function getAddedItems(x: string[], y: string[]) {
        const result: string[] = [];
        for (const item of y) {
            if (!x.includes(item)) {
                result.push(item);
            }
        }
        return result;
    }
}

// TODO: module on Node.js shouldn't use network request...
// TODO: test on browser
