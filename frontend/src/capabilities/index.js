import ReplayButton from "./replay";
import Journal from "./journal";
import ChartManager from "./charts"
//import ws from "./transport"
import dataFeed from "./data"
/*
import WorkerRuntime from "./webWorker/workerRuntime";

const runtime = new WorkerRuntime();

runtime.run("test", "./test.js");

runtime.subscribe("test", (msg) => {
    console.log("Main:", msg);
});

runtime.send("test", {
    hello: "world",
});*/

//console.log(Journal)
export default [
    ...ReplayButton,
    ...Journal,
    ...ChartManager,
    ...dataFeed
];