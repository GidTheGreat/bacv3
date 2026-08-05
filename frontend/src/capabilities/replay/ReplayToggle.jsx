
// ReplayToggle.jsx
// NOTE: Replace your existing component with this skeleton.
// Styles/palette preserved; bottom-sheet behavior and touch dragging added.

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, Play, Pause, SkipBack, SkipForward, X } from "lucide-react";

export default function ReplayToggle({ ctx }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
   
  const drag = useRef({ active:false,startX:0,startY:0,originX:0,originY:0 });
  const progressRef = useRef(null);

  const panelRef = useRef(null);
  const defaultReplay = {
      cursor: 0,
      playing: false,
      speed: 1,
  };
  const replayState = ctx.replayState;
  const setReplayState = ctx.setReplayState;
  const dataset = ctx.dataset;
  const defaultSelection = ctx.defaultSelection;
  const replayOpen = ctx.replayOpen;
  const setReplayOpen = ctx.setReplayOpen;
  const replayOwner = ctx.replayOwner;
  const setReplayOwner = ctx.setReplayOwner;
  const replayBar = replayState.replayBar;
  const pane =ctx.name

  const owner = replayOwner === pane;

  const streamKeys = Object.keys(dataset ?? {});
  let k1 = null;

  if (streamKeys.length === 1) {
      k1 = streamKeys[0];
  } else if (defaultSelection) {
      k1 = `${defaultSelection.platform}|${defaultSelection.trade}|${defaultSelection.symbol}`;
  }

  function updateStream(updater) {

    if (!k1) return;

    setReplayState(prev => {

        const current = prev.streams[k1] ?? defaultReplay;
        return {
            ...prev,
            streams: {
                ...prev.streams,
                [k1]: updater(current),
            },
        };
    });
}
  const stream = k1 ? dataset[k1] : null;
  const chartData = stream?.["1min"]?.data ?? [];
  //console.log(chartData)
    const hasData = chartData.length > 0;

    const startTime = hasData
    ? new Date(chartData[0].time * 1000)
    : null;

    const endTime = hasData
    ? new Date(chartData.at(-1).time * 1000)
    : null;

  const replay =
    k1
        ? (replayState.streams[k1] ?? defaultReplay)
        : defaultReplay;

  const { cursor, playing, speed } = replay;

    const maxCursor = Math.max(0, chartData.length - 1);
    const clampedCursor = Math.min(cursor, maxCursor);

    const progress =
    chartData.length <= 1
        ? 0
        : (clampedCursor / maxCursor) * 100;


  const controls = [
  {
    Icon: SkipBack,
    onClick: () => {
      updateStream(s => ({
          ...s,
          cursor: Math.max(0, s.cursor - 1),
      }));
    },
  },
  {
    Icon: playing ? Pause : Play,
    onClick: () => {
        updateStream(s => ({
            ...s,
            playing: !s.playing,
        }));
    },
},
  {
    Icon: SkipForward,
    onClick: () => {
      updateStream(s => ({
          ...s,
          cursor: Math.min(chartData.length - 1, s.cursor + 1),
      }));
    },
  },
];

  
function handleProgressPointer(e) {
    //console.log(e.pointerType, e.clientX);
    if (!chartData.length) return;
    e.preventDefault();
    const rect = progressRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));

    const cursor = Math.round(ratio * (chartData.length - 1));

    updateStream(s => ({
        ...s,
        cursor,
        playing: false,
    }));
}
    
  
   function closeSheet() {
    //state.syncMode = "append";
    setReplayOpen(false);
    setReplayOwner(null);
    updateStream(s => ({
        ...s,
        playing: false,
    }));

    setReplayState(s => ({
        ...s,
        replayBar: false,
    }));
}

    function openSheet() {
        const w = Math.min(420, window.innerWidth - 20);
        setReplayOwner(pane);
        setReplayOpen(true);
        setPos({
            x: (window.innerWidth - w) / 2,
            y: window.innerHeight - 360,
        });

        //state.syncMode = "replay";

        setReplayState(s => ({
            ...s,
            replayBar: true,
        }));
    }

  function pointerDown(e){
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current={
      active:true,
      startX:e.clientX,
      startY:e.clientY,
      originX:pos.x,
      originY:pos.y
    };
  }

  useEffect(()=>{
    function move(e){
      if(!drag.current.active) return;
      const w = panelRef.current?.offsetWidth ?? 420;
      const h = panelRef.current?.offsetHeight ?? 340;
      let x = drag.current.originX + (e.clientX-drag.current.startX);
      let y = drag.current.originY + (e.clientY-drag.current.startY);
      x=Math.max(10,Math.min(window.innerWidth-w-10,x));
      y=Math.max(10,Math.min(window.innerHeight-h-10,y));
      setPos({x,y});
    }
    function up(){
      if(!drag.current.active) return;
      drag.current.active=false;
      const h = panelRef.current?.offsetHeight ?? 340;
      if(pos.y > window.innerHeight-h-40){
        setPos(p=>({...p,y:window.innerHeight-h-24}));
      }
    }
    window.addEventListener("pointermove",move);
    window.addEventListener("pointerup",up);
    return ()=>{
      window.removeEventListener("pointermove",move);
      window.removeEventListener("pointerup",up);
    };
  },[pos]);

  function cycleSpeed() {

    const i = speeds.indexOf(speed);

    updateStream(s => ({
        ...s,
        speed: speeds[(i + 1) % speeds.length],
    }));

}

  return <>
    <button onClick={() => {
        replayBar ? closeSheet() : openSheet();
    }} style={toggleStyle}
        >
      <RotateCcw size={18}/>
    </button>

    {owner && replayOpen && replayBar && createPortal(
      <div ref={panelRef} style={{
        position:"fixed",
        left:pos.x,
        top:pos.y,
        width:"min(420px, calc(100vw - 20px))",
        background:"rgba(22,27,34,.65)",
        backdropFilter:"blur(20px) saturate(140%)",
        border:"1px solid #353b45",
        borderRadius:18,
        color:"#d0d7de",
        boxShadow:"0 10px 40px rgba(0,0,0,.35)",
        zIndex:100000
      }}>
        <div onPointerDown={pointerDown} style={{
          height:52,display:"flex",alignItems:"center",
          justifyContent:"center",cursor:"grab",touchAction:"none"
        }}>
          <div style={{width:48,height:5,
            borderRadius:99,background:"rgba(255,255,255,.35)"}}/>
        </div>

        <div style={{display:"flex",
          justifyContent:"space-between",
          alignItems:"center",padding:"0 16px 12px",
          borderBottom:"1px solid #353b45"}}>
          <div><strong>Replay</strong>
          <div style={{fontSize:12,color:"#8b949e"}}>
            stream: {k1}</div></div>
          <button style={iconBtn} onClick={closeSheet}
            >
                <X size={16}/></button>
        </div>

        <div style={{padding:16,display:"flex",
          flexDirection:"column",gap:16}}>
          <div
              style={{
                  fontSize: 12,
                  color: "#8b949e",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
              }}
          >
              {startTime?.toLocaleDateString()} {" → "}
              {endTime?.toLocaleDateString()}
          </div>



        <div
            ref={progressRef}
            onPointerDown={handleProgressPointer}
            style={{
                height: 24,           // touch area
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                touchAction: "none",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: 8,        // visible bar
                    background: "#2a2e39",
                    borderRadius: 99,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "#2962ff",
                    }}
                />
            </div>
        </div>
                    
        <div
            style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                gap:10
            }}
        >
        {controls.map(({ Icon, onClick }, i) => (
            <button key={i} style={controlBtn} onClick={onClick}>
            <Icon size={18} />
            </button>
        ))}

        <button
            style={{
                ...controlBtn,
                width: 56,
                fontWeight: 600,
            }}
            onClick={cycleSpeed}
        >
            {speed}×
        </button>
        </div>
          
        </div>
      </div>,document.body)}
  </>
}

const toggleStyle={width:36,height:36,borderRadius:8,border:"1px solid #353b45",background:"#20252d",color:"#d0d7de"};
const inputStyle={width:"100%",padding:"9px 12px",background:"#20252d",border:"1px solid #353b45",borderRadius:8,color:"#d0d7de",boxSizing:"border-box"};
const controlBtn={width:42,height:42,borderRadius:8,border:"1px solid #353b45",background:"#20252d",color:"#d0d7de"};
const iconBtn={width:30,height:30,borderRadius:6,border:"1px solid #353b45",background:"#20252d",color:"#d0d7de"};

const speeds = [0.25, 0.5, 1, 2, 4, 8, 16];