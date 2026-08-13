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
import {useEffect, useRef, useState} from 'react'


function Pane({paneArea}){
    const activeLayout = usePanelStore(s=>s.activeLayout);
    const setActiveLayout = usePanelStore(s=>s.setActiveLayout);
    const createChart = useChartStore(s=>s.createChart);
    const destroyChart = useChartStore(s=>s.destroyChart);
    const setActiveSeries = useChartStore(s=>s.setActiveSeries);
    const selection = useChartStore(s=>s.selection);
    const activeChart = useChartStore(s=>s.activeChart[paneArea]);
    const setActiveChart = useChartStore(s=>s.setActiveChart);
    const setDspName = useChartStore(s=>s.setDisplayName)

    const [editingChart, setEditingChart] = useState(null);
    const [chartTitles, setChartTitles] = useState({});

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
    
    function makeCharts(chartPart){
        const paneCharts=[]
        for (const id of Object.keys(selection)){
            if (id!="default" && selection[id].pane===paneArea){
                paneCharts.push(id)
                
            }
        }
        
        if (chartPart.toLowerCase().endsWith("title")) {
            return paneCharts.map(chartId => {
                const active = Number(activeChart) === Number(chartId);
                const editing = editingChart === chartId;

                return editing ? (
                    <TextField
                        key={chartId}
                        autoFocus
                        value={selection[chartId].displayName??chartId}
                        onChange={e =>
                            setDspName(chartId, name)
                        }
                        onBlur={() => setEditingChart(null)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                setEditingChart(null);
                            }
                        }}
                        variant="standard"
                        sx={{
                            width: "60px",
                            "& input": {
                                fontSize: "small",
                                padding: 0,
                            },
                        }}
                    />
                ) : (
                    <IconButton
                        key={chartId}
                        onClick={() => setActiveChart(chartId, paneArea)}
                        onDoubleClick={() => setEditingChart(chartId)}
                        sx={{
                            fontSize: "small",
                            bgcolor: active
                                ? "action.selected"
                                : "transparent",
                            color: active
                                ? "primary.main"
                                : "inherit",
                            maxWidth: "50px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            flexShrink: 0,
                        }}
                    >
                        {selection[chartId].displayName ?? chartId}
                    </IconButton>
                );
            });

        } else {
            return paneCharts.map(chartId => {

                return activeChart === chartId && (
                    <ChartManager
                        key={chartId}
                        chartId={chartId}
                        destroyChart={destroyChart}
                        pane={paneArea}
                    />
                );
            });
        }
    }

    useEffect(() => {
        const hasChart = Object.values(selection).some(
            chart => chart.pane === paneArea
        );

        if (paneArea === "a" && !hasChart) {
            const id = Math.floor(Math.random() * 1_000_000_000);
            createChart(id, paneArea);
        }
    }, [paneArea, selection, createChart]);
    
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
                <Box
                    sx={{
                        display: "flex",
                        overflowX: "auto",
                        overflowY: "hidden",
                        gap: 1,

                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.2) transparent",

                        "&::-webkit-scrollbar": {
                            height: "4px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            background: "rgba(255,255,255,0.4)",
                        },
                    }}
                >
                    {makeCharts("title")}
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
                    onClick={()=>{
                        const id = Math.floor(Math.random()*1_000_000_000);
                        createChart(id,paneArea);
                        //console.log(useChartStore.getState().selection);
                    }}>
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
                    {makeCharts("chart")
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