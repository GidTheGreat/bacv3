import ReplayButton from "./replay";
import Journal from "./journal";
import ChartManager from "./charts"
import ws from "./transport"

//console.log(Journal)
export default [
    ...ReplayButton,
    ...Journal,
    ...ChartManager,
    ...ws
];