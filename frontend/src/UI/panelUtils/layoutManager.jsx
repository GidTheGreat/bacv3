
import useChartStore from "../../stores/chartStore";
import usePanelStore from "../../stores/panelStore";
import { layouts } from "./layouts";

export default function changeLayout(nextLayout) {
    console.log("=== CHANGE LAYOUT START ===");
    console.log("nextLayout:", nextLayout);

    const nextPanes = new Set(
        layouts[nextLayout].areas.flat()
    );

    const chartState = useChartStore.getState();

    console.log("valid panes:", [...nextPanes]);
    console.log("selection BEFORE:", chartState.selection);

    for (const [chartId, chart] of Object.entries(chartState.selection)) {
        if (
            chartId !== "default" &&
            !nextPanes.has(chart.pane)
        ) {
            console.log("DESTROYING INVALID CHART:", {
                chartId,
                pane: chart.pane,
                activeSeries: chart.activeSeries,
            });

            chartState.destroyChart(chartId, chart.pane);
        }
    }

    console.log(
        "selection AFTER CHART CLEANUP:",
        useChartStore.getState().selection
    );

    usePanelStore.getState().setActiveLayout(nextLayout);

    console.log("=== CHANGE LAYOUT END ===");
}