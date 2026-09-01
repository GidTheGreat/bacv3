import { useEffect, useState } from "react";
import { CloudDownload, X } from "lucide-react";
import { createPortal } from "react-dom";
import ochestrator from "../ochestrator/main";

const toggleStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #353b45",
  background: "#20252d",
  color: "#d0d7de",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: "#20252d",
  border: "1px solid #353b45",
  borderRadius: 8,
  color: "#d0d7de",
  boxSizing: "border-box",
};

const controlBtn = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #353b45",
  background: "#20252d",
  color: "#d0d7de",
  cursor: "pointer",
};

const iconBtn = {
  width: 30,
  height: 30,
  borderRadius: 6,
  border: "1px solid #353b45",
  background: "#20252d",
  color: "#d0d7de",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const panelStyle = {
  width: 420,
  background: "#161b22",
  border: "1px solid #30363d",
  borderRadius: 12,
  padding: 20,
  color: "#d0d7de",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxShadow: "0 15px 50px rgba(0,0,0,.45)",
};

export default function FetchDataButton({
 
}) {
  const [open, setOpen] = useState(false);

  const [exchange, setExchange] = useState("binance");
  const [market, setMarket] = useState("um");
  const [symbol, setSymbol] = useState(()=>{
    if (exchange=="binance" && market=="cm"){
      return "BTCUSD_PERP"
    } else if(exchange=="binance" && market=="um"){
      return "BTCUSDT"
    }
  });
  const [mode, setMode] = useState("daily");

  const [ symbols, setSymbols] = useState(["BTCUSDT"])

  const todayP = new Date()
  todayP.setDate(todayP.getDate()-2)
  const today= todayP.toISOString().slice(0, 10);

  const [dateVals, setDateVals] = useState({
    start: "2026-08-06",
    end: "2026-08-06",
    range: 0
  });

  const [endMonth, setEndMonth] = useState(today.slice(0, 7));

  async function fetchSymbols(){
    //console.log(market, market=="cm")
    if (exchange=="binance"){
      if (market=="um"){
        const resp = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo");
        const exchangeInfo = await resp.json();
        const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
        setSymbol(symbols[0])
        setSymbols(symbols);
      } else if (market=="cm"){
        const resp = await fetch("https://dapi.binance.com/dapi/v1/exchangeInfo");
        
        const exchangeInfo = await resp.json();
        
        const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
        setSymbol(symbols[0])
        setSymbols(symbols);
      }
        
    }
  }
  
  useEffect(()=>{fetchSymbols()},[exchange,market])
  //useEffect(()=>{console.log(symbol)},[symbol])

  function handleDateChange(changed, value){
    if (changed=="start"){
      setDateVals((dateVals)=>{
        const endDate = new Date(value);
        endDate.setDate(new Date(value).getDate()+Number(dateVals.range));
        //console.log(endDate)
        return {
        ...dateVals,
        start: value,
        end: endDate.toISOString().slice(0, 10)
      }
    })
    } else if (changed=="range"){
      setDateVals((dateVals)=>{
        const endDate = new Date(dateVals.start);
        endDate.setDate(new Date(dateVals.start).getDate()+Number(value));
        //console.log(endDate)
        return {
        ...dateVals,
        range: Number(value),
        end: endDate.toISOString().slice(0, 10)
      }
    })
    } else if (changed=="end"){
      setDateVals((dateVals)=>{
        const startDate = new Date(value);
        startDate.setDate(new Date(value).getDate()-Number(dateVals.range));
        //console.log(endDate)
        return {
        ...dateVals,
        start: startDate.toISOString().slice(0, 10),
        end: value
      }
    })
    }
  }

  function handleFetch() {
    if (!exchange || !market || !symbol) {
      alert("Fill all fields");
      return;
    }

    if (mode === "daily") {
      if (!dateVals.start || !dateVals.end) {
        alert("Select dates");
        return;
      }

      const payload = {
        exchange,
        market,
        symbol,
        timeframe: "daily",
        start: dateVals.start,
        end: dateVals.end,
      };

      ochestrator.send("fetch", payload, "http");
      
    } else {
      if (!startMonth || !endMonth) {
        alert("Select months");
        return;
      }

      const payload = {
        exchange,
        market,
        symbol,
        timeframe: "monthly",
        start: startMonth,
        end: endMonth,
      };

      
    }

    setOpen(false);
  }

  return (
    <>
      <button
        style={toggleStyle}
        onClick={() => setOpen(true)}
        title="Fetch Data"
      >
        <CloudDownload size={18} />
      </button>

      {open &&
        createPortal(
          <div style={overlayStyle}>
            <div style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>Fetch Historical Data</h3>

                <button
                  style={iconBtn}
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Exchange */}
              <div>
                <div style={{ marginBottom: 6 }}>Exchange</div>

                <select
                  style={inputStyle}
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                >
                  <option value="binance">Binance</option>
                </select>
              </div>

              {/* Market */}
              <div>
                <div style={{ marginBottom: 6 }}>Market</div>

                <select
                  style={inputStyle}
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                >
                  
                  <option value="um">USD-M</option>
                  <option value="cm">COIN-M</option>
                </select>
              </div>

              {/* Symbol */}
              <div>
                <div style={{ marginBottom: 6 }}>Symbol</div>

                <select
                  style={inputStyle}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                >

                  {symbols.map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode */}
              <div>
                <div style={{ marginBottom: 6 }}>Mode</div>

                <select
                  style={inputStyle}
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  {//<option value="monthly">Monthly</option>
                  }
                </select>
              </div>

              {mode === "daily" ? (
                <>
                  <div>
                    <div style={{ marginBottom: 6 }}>Start Date</div>

                    <input
                      type="date"
                      style={inputStyle}
                      value={dateVals.start}
                      min="2020-01-01"
                      max={today}
                      onChange={(e) => handleDateChange("start", e.target.value)}
                      
                    />
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>Date Range</div>
                    
                    <input
                      type="number"
                      style={inputStyle}
                      value={dateVals.range}
                      min={0}
                      
                      onKeyDown={(e)=>e}
                      onChange={(e) => handleDateChange("range", e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>End Date</div>
                    
                    <input
                      type="date"
                      style={inputStyle}
                      value={dateVals.end}
                      min={dateVals.start}
                      max={today}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ marginBottom: 6 }}>Start Month</div>

                    <input
                      type="month"
                      style={inputStyle}
                      value={startMonth}
                      min="2020-01"
                      max={today.slice(0, 7)}
                      onChange={(e) => setStartMonth(e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ marginBottom: 6 }}>End Month</div>

                    <input
                      type="month"
                      style={inputStyle}
                      value={endMonth}
                      min={startMonth}
                      max={today.slice(0, 7)}
                      onChange={(e) => setEndMonth(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button
                style={controlBtn}
                onClick={handleFetch}
              >
                Fetch
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}