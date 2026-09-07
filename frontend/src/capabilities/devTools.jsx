import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Divider,
} from "@mui/material";

import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import { useState,useEffect,Fragment } from "react";

import useAppStore from "../stores/appStore";
import useChartStore from "../stores/chartStore";

function roughSize(obj) {
    const seen = new WeakSet();

    function size(value) {
        if (value === null) return 8;

        switch (typeof value) {
            case "boolean":
                return 8;

            case "number":
                return 8;

            case "bigint":
                return 16;

            case "string":
                return 2 * value.length + 16;

            case "object": {
                if (seen.has(value)) return 0;
                seen.add(value);

                let total = 32; // object overhead

                for (const key of Object.keys(value)) {
                    total += 2 * key.length + 16; // property/key overhead
                    total += size(value[key]);
                }

                return total;
            }

            default:
                return 0;
        }
    }

    return size(obj);
}

export default function DevTools() {
  const notif = useAppStore(s=>s.notification);
  const storage = useAppStore(s=>s.storage);

  const data = useChartStore(s=>s.data);

  const candleDataRAM = `${(roughSize(data)/(1024*1024)).toFixed(2)}MB`

  const [state, setState] = useState(false);
  const [notification, setNotification] = useState([]);

  const [ramType, setRamType] = useState("zustand");
  const [hddType, setHddType] = useState("zustand");

  const tickDataRAM = `${(storage[ramType]/(1024*1024)).toFixed(2)} MB`
  //useEffect(()=>console.log("loaded"),[])

  useEffect(()=>{
    //console.log(ramType)
    setNotification(prev=>{
      return [...prev,notif]
    })
  },[notif])

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState(open);
  };

  const selectSx = {
    minWidth: 90,
    height: 30,
    fontSize: "0.75rem",
  };

  const rowSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    flexWrap: "wrap",
  };

  const sectionSx = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    minWidth: 0,
  };

  const labelSx = {
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "text.secondary",
  };

  return (
    <>
      <Tooltip title="Developer Tools">
        <IconButton onClick={toggleDrawer("bottom", true)}>
          <DeveloperModeIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="bottom"
        open={state}
        onClose={toggleDrawer("bottom", false)}
      >
        <Box
            sx={{
                p: 1.5,
                display: "grid",
                gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1.3fr 1fr 1fr 1.5fr",
                },
                gap: 2,
                backgroundColor: "background.default",
            }}
            >
          {/* ================= NOTIFICATIONS ================= */}

          <Box sx={sectionSx}>
            <Typography sx={labelSx}>
              Notifications
            </Typography>

            <Box
              sx={{
                flex: 1,
                minHeight: 55,
                p: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
                fontSize: "0.75rem",
                color: "text.secondary",
                overflow: "auto",
                maxHeight: 60,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.2) transparent",

                
              }}
            > 
              <ul>
                  {notification.map(n=><li key={n+Math.random()}>{n}</li>)}
              </ul>
              
            </Box>
          </Box>

          {/* ================= CONNECTION ================= */}

          <Box sx={sectionSx}>
            <Typography sx={labelSx}>
              Connection Status
            </Typography>

            <Box sx={rowSx}>
              <FormControl size="small">
                <Select defaultValue="exchange" sx={selectSx}>
                  <MenuItem value="exchange">exchange</MenuItem>
                  <MenuItem value="binance">binance</MenuItem>
                  <MenuItem value="deriv">deriv</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select defaultValue="trade" sx={selectSx}>
                  <MenuItem value="trade">trade</MenuItem>
                  <MenuItem value="spot">spot</MenuItem>
                  <MenuItem value="futures">futures</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select defaultValue="symbol" sx={selectSx}>
                  <MenuItem value="symbol">symbol</MenuItem>
                  <MenuItem value="BTCUSDT">BTCUSDT</MenuItem>
                  <MenuItem value="ETHUSDT">ETHUSDT</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                sx={{
                  height: 30,
                  textTransform: "none",
                }}
              >
                Connected
              </Button>
            </Box>
          </Box>

          {/* ================= HAS DATA ================= */}

          <Box sx={sectionSx}>
            <Typography sx={labelSx}>
              Has Data
            </Typography>

            <Box sx={rowSx}>
              <FormControl size="small">
                <Select defaultValue="exchange" sx={selectSx}>
                  <MenuItem value="exchange">exchange</MenuItem>
                  <MenuItem value="binance">binance</MenuItem>
                  <MenuItem value="deriv">deriv</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select defaultValue="trade" sx={selectSx}>
                  <MenuItem value="trade">trade</MenuItem>
                  <MenuItem value="spot">spot</MenuItem>
                  <MenuItem value="futures">futures</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select defaultValue="symbol" sx={selectSx}>
                  <MenuItem value="symbol">symbol</MenuItem>
                  <MenuItem value="BTCUSDT">BTCUSDT</MenuItem>
                  <MenuItem value="ETHUSDT">ETHUSDT</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <Select defaultValue="tf" sx={selectSx}>
                  <MenuItem value="tf">tf</MenuItem>
                  <MenuItem value="1m">1m</MenuItem>
                  <MenuItem value="5m">5m</MenuItem>
                  <MenuItem value="1h">1h</MenuItem>
                  <MenuItem value="4h">4h</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                sx={{
                  height: 30,
                  textTransform: "none",
                }}
              >
                checkbox
              </Button>
            </Box>
          </Box>

          {/* ================= STORAGE ================= */}

          <Box sx={sectionSx}>
            <Typography sx={labelSx}>
              Storage
            </Typography>

            {/* RAM */}

            <Box sx={rowSx}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, minWidth: 30 }}
              >
                RAM
              </Typography>

              <FormControl size="small">
                <Select sx={selectSx} defaultValue={ramType}
                onChange={(e)=>{
                  setRamType(e.target.value);
                }}>
                  
                  {Object.keys(storage).map((storageKey)=>(
                        <MenuItem  value={storageKey}>{storageKey}</MenuItem>
                  ))}
                  <MenuItem value="zustand">Zustand</MenuItem>
                  
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flex: 1 }}
              >
                
                {ramType=="zustand" && candleDataRAM }
                {ramType!="zustand" && tickDataRAM}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                sx={{ height: 30, textTransform: "none" }}
              >
                delete
              </Button>

              <Button
                variant="contained"
                size="small"
                sx={{ height: 30, textTransform: "none" }}
              >
                persist
              </Button>
            </Box>

            <Divider />

            {/* HDD */}

            <Box sx={rowSx}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, minWidth: 30 }}
              >
                HDD
              </Typography>

              <FormControl size="small">
                <Select defaultValue="zustand" sx={selectSx}>
                  <MenuItem value="zustand">Zustand</MenuItem>
                  <MenuItem value="typed">Typed Arrays</MenuItem>
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flex: 1 }}
              >
                size&nbsp;&nbsp; preview
              </Typography>

              <Button
                variant="outlined"
                size="small"
                sx={{ height: 30, textTransform: "none" }}
              >
                delete
              </Button>

              <Button
                variant="contained"
                size="small"
                sx={{ height: 30, textTransform: "none" }}
              >
                restore
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}