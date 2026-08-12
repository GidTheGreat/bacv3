import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import { layouts } from "./panelUtils/layouts";
import useChartStore from "../stores/chartStore";
import usePanelStore from "../stores/panelStore";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ChartManager from "../capabilities/charts/chartManager";
import {useEffect, useRef} from 'react'


function Pane({paneArea}){
    const activeLayout = usePanelStore(s=>s.activeLayout);
    const setActiveLayout = usePanelStore(s=>s.setActiveLayout);
    const createChart = useChartStore(s=>s.createChart);
    const destroyChart = useChartStore(s=>s.destroyChart);
    const setActiveSeries = useChartStore(s=>s.setActiveSeries);

    function handlePaneRemoval(){
        if (activeLayout=="fourGrid"){
            if (paneArea=="b"){
                    setActiveLayout("flippedTriangle")
            } else {
                setActiveLayout("triangle")
            }
        
        } else if (activeLayout=="triangle"){
            if (paneArea=="b"){
                setActiveLayout("twoRows")
            } else {
                setActiveLayout("twoColumns")
            }
        } else if (activeLayout=="flippedTriangle"){
            if (paneArea=="b"|| paneArea=="c"){
                setActiveLayout("twoRows")
            } else {
                setActiveLayout("twoColumns")
            }
        } else {
            setActiveLayout("monolith")
        }
    
        }
    
    
    return (
        <Box  sx={{
            width:"100%",
            height:"100%",
            border: "2px red dashed",
            gridArea: paneArea,
            display: "flex", 
            flexDirection: "column"
            
        }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    height: "30px",
                    px: 1,
                    boxSizing: "border-box",
                    borderRadius:"90px",
                    border: "2px solid yellow"
                }}
                >
                {/* chart identity */}
                <Box>
                    chartId
                </Box>

                {/* pane controls */}
                <Box
                    sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    }}
                >
                    <IconButton size="small"
                    onClick={createChart}>
                    <AddIcon fontSize="small" />
                    </IconButton>

                    <IconButton size="small" disabled={paneArea==="a"}
                    onClick={handlePaneRemoval}>
                    <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                </Box>
                <Box
                sx={{
                    flex: 1, minHeight: 0
                }}>
                    {paneArea=="a" && <ChartManager/>
                    }

                </Box>
                

        </Box>
    )
}



function getGridStyle(layout) {
    return {
        display: "grid",

        gridTemplateColumns:
            layout.columns
                .map(x => `minmax(0, ${x}fr)`)
                .join(" "),

        gridTemplateRows:
            layout.rows
                .map(x => `minmax(0, ${x}fr)`)
                .join(" "),

        gridTemplateAreas:
            layout.areas
                .map(row => `"${row.join(" ")}"`)
                .join(" "),
    };
}
export default function PanelManager(){
    const activeLayout = usePanelStore(s=>s.activeLayout);
    const panelRef = useRef(null)
    const paneRef = useRef(null)
    const layout = layouts[activeLayout]
    const gridDeets = getGridStyle(layout)
    
    const RenderPanes = ()=> {
        //console.log(layout)
        const areas = new Set();

        for (const row of layout.areas) {
        for (const area of row) {
            areas.add(area);
        }
        }

        return [...areas].map(area => (
        <Pane key={area} paneArea={area} />))
    }
   
    return (
        <Box 
        sx={{
            border: "2px black solid",
            width:"100%",
            height:"100%",
            borderRadius:"10px",
            minWidth: 0,
            minHeight: 0,
            ...gridDeets
        }}>
            <RenderPanes/>
        </Box>
    )
}