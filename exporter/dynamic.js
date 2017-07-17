if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = glodule;
}
else if (typeof define === "function" && typeof require === "function") {
    define(() => glodule);
}
else if (typeof SystemJS === "object" && typeof SystemJS.register === "function") {
    SystemJS.register([], exports => exports("glodule", glodule));
}
