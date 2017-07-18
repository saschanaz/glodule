const mz = require("mz/fs");

const jakeExecOptionBag = {
    printStdout: true,
    printStderr: true
};

function asyncExecNoPrint(cmds) {
    return new Promise((resolve, reject) => {
        const exec = jake.createExec(cmds, jakeExecOptionBag);
        exec.addListener("error", reject);
        exec.addListener("cmdEnd", () => resolve());
        exec.run();
    });
}

// desc("buildtest");
// task("buildtest", async () => {
//     await asyncExec(["tsc -p testsources/"]);
// });

// desc("test");
// task("test", ["buildcommonjs", "buildtest"], async () => {
//     await asyncExec(["mocha"]);
// });

desc("buildraw");
task("buildraw", async () => {
    try {
        await asyncExecNoPrint(["tsc"]);
    }
    catch (err) {
        console.log("(Ignoring TS build error)");
    }
});

desc("builddynamic");
task("builddynamic", async () => {
    const raw = await mz.readFile("temp/glodule.js", { encoding: "utf-8" });
    const dynamicExporter = await mz.readFile("exporter/dynamic.js", { encoding: "utf-8" });

    await mz.writeFile("lib/index.js", `${raw}\n${dynamicExporter}`);
});

desc("buildstatic");
task("buildstatic", async () => {
    const raw = await mz.readFile("temp/glodule.js", { encoding: "utf-8" });
    const esmoduleExporter = await mz.readFile("exporter/esmodule.js", { encoding: "utf-8" });

    await mz.writeFile("lib/index.esmodule.js", `${raw}\n${esmoduleExporter}`);
});

desc("build");
task("build", ["buildraw", "builddynamic", "buildstatic"], async () => {
    await mz.unlink("temp/glodule.js");
    await mz.unlink("temp/glodule.d.ts");
    await mz.rmdir("temp/")
});

desc("default");
task("default", ["build"], () => {

});