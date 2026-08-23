import { IconButton } from "@mui/material";
import Replay from '@mui/icons-material/Replay';
import { useEffect, useState } from "react";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { Popover, Box, Typography, Button  } from '@mui/material';

import useReplayStore from "../../stores/replayStore";
import useChartStore from "../../stores/chartStore";

export default function ReplayButton() {
  const replayState = useReplayStore(s=>s.replayState);
  const setReplayState = useReplayStore(s=>s.setReplayState);
  const selection = useChartStore(s=>s.selection);

  const [ replayKey, setReplayKey] = useState({
    platform: "binance", symbol: "BTCUSDT", trade: "futures trade"
  })
  const platforms= new Set();
  const symbols = new Set();
  const trade_types = new Set();
  
  for (const chart of Object.keys(selection)){
    selection[chart].platform ? platforms.add(selection[chart].platform) : null;
    selection[chart].symbol ? symbols.add(selection[chart].symbol) : null;
    selection[chart].trade ? trade_types.add(selection[chart].trade) : null;
  }

  //console.log(platforms,symbols,trade_types)

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const replayKeyJoin = `${replayKey.platform}|${replayKey.trade}|${replayKey.symbol}`
  const activeIcon = replayState[replayKeyJoin].playing ? <PauseIcon/> : <PlayArrowIcon/>
  

  useEffect(()=>{
    //console.log(replayState[replayKeyJoin].cursor)
},[replayState])
  return (
    <div>
      <IconButton aria-describedby={id} variant="contained" onClick={handleClick}>
        <Replay />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{
            
            display: "flex",
            flexDirection: "column"
        }}>
            <Box sx={{
                display:"flex",
                flexDirection:"row"
            }}>
                <select style={{
                    backgroundColor:"blue"
                }} onChange={(e)=>{
                        setReplayKey(replayKey=>({
                            ...replayKey,
                            platform: e.target.value
                        }))
                    }}
                    value={replayKey.platform ?? ""}
                    >
                {Array.from(platforms).map(
                    platform=><option value={platform} 
                    key={platform}>{platform}</option>)}
                
                </select>

                <select onChange={(e)=>{
                        setReplayKey(replayKey=>({
                            ...replayKey,
                            trade: e.target.value
                        }))
                    }}
                    value={replayKey.trade ?? ""}
                    >
                    {Array.from(trade_types).map(
                    trade=><option value={trade} 
                    key={trade}>{trade}</option>)}
                </select>

                <select onChange={(e)=>{
                        setReplayKey(replayKey=>({
                            ...replayKey,
                            symbol: e.target.value
                        }))
                    }}
                    value={replayKey.symbol ?? ""}>
                    {Array.from(symbols).map(
                    symbol=><option value={symbol} 
                    key={symbol}>{symbol}</option>)}
                </select>
            </Box>
           
            <Box  sx={{
                display:"flex",
                flexDirection:"row",
                alignItems: "center",
                justifyContent: "space-evenly"
            }}>
                <IconButton onClick={()=>{
                    setReplayState(replayKeyJoin, "cursor",
                         Math.max(0,replayState[replayKeyJoin].cursor-1)) 
                }}>
                    <SkipPreviousIcon/>
                </IconButton>
                
                <IconButton onClick={()=>{
                    const value = replayState[replayKeyJoin].playing ? false : true;
                    //console.log("changing playing state to:", value)
                    setReplayState(replayKeyJoin, "playing", value) 
                }}>
                    {activeIcon}
                </IconButton>
                
                
                <IconButton onClick={()=>{
                    setReplayState(replayKeyJoin, "cursor",
                         Math.min(300,replayState[replayKeyJoin].cursor+1)) 
                }}>
                    <SkipNextIcon/>
                </IconButton>
                

            </Box>

            <Box sx={{
                display:"flex",
                flexDirection:"row",
                alignItems: "center",
                justifyContent: "space-evenly",
                border: "2px red"
            }}>
                
              
            </Box>
            
        </Box>
        
      </Popover>
    </div>
  );
}
