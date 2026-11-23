import useSwingStore from '../../stores/swingStore';
import useReplayStore from '../../stores/replayStore';
import useChartStore from '../../stores/chartStore';
import useAnalysisStore from '../../stores/analysisStore';
import SwingsIdentifier from './identifySwings';

function getOffset(tf, minuteCursor){
      if (tf.startsWith("1m")){
        return minuteCursor
      } else if (tf.startsWith("5m")){
        return Math.floor(minuteCursor/5)
      } else if (tf.startsWith("15m")){
        return Math.floor(minuteCursor/15)
      } else if (tf.startsWith("30m")){
        return Math.floor(minuteCursor/30)
      } else if (tf.startsWith("1h")){
        return Math.floor(minuteCursor/60)
      } else if (tf.startsWith("4h")){
        return Math.floor(minuteCursor/240)
      }

}




const swingsIdentifier = new SwingsIdentifier(useSwingStore);


function handleGroups(groupName, group, swings){
    //console.log(groupName, group, swings)
    //console.log("Entered handleGroups");
    if (swings.length < 4){
      return
    }

    //console.log("Passed length check");
    const [ first, second, third, 
    fourth ] = swings.slice(-4);
    //console.log("Extracted swings");
    
    const firstSetHigh = [ first, second 
    ].find(swing=>swing.type == "high");
    //console.log("Found first high");
  
    const firstSetLow = [ first, second
    ].find(swing=>swing.type == "low");
    //console.log("Found first low");
    
    const secondSetHigh = [ third, fourth
    ].find(swing=>swing.type == "high");
    //console.log("Found second high");
  
    const secondSetLow = [ third, fourth
    ].find(swing=>swing.type == "low");
    //console.log("Found second low");
  
    const tf = group.match(/(?<=group)|\d+\w+/)[0];
    function addTrend(trend){
      //window.ms = useSwingStore.getState().marketState
      console.log(groupName,tf)
      const currTrend = useSwingStore.getState()?.marketState?.[group]?.[tf] ?? null;
      if (currTrend == trend) return;
     useSwingStore.getState().setMarketState(groupName, tf, trend);
    }
    
    if (
    (secondSetHigh && firstSetHigh &&
        secondSetHigh.high > firstSetHigh.high) ||

    (secondSetLow && firstSetLow &&
        secondSetLow.low < firstSetLow.low)
){
        if (first.type == "low"){
            if (third.low < first.low &&
            fourth.high < second.high){
                (third.close < first.low) ? 
                addTrend("downtrend") : addTrend("failed downtrend")
            } else if (third.low > first.low &&
            fourth.high > second.high){
                (fourth.close > second.high) ? 
                addTrend("uptrend") : addTrend(" failed uptrend")
            }else {
                addTrend("range")
            }
        } else {
            if (third.high < first.high &&
            fourth.low < second.low){
                (fourth.close < second.low) ? 
                addTrend("downtrend") : addTrend(" failed downtrend")
            } else if (third.high > first.high &&
            fourth.low > second.low){
                (third.close > first.high) ? 
                addTrend("uptrend") : addTrend(" failed uptrend")
            }else {
                addTrend("range")
            }
        }
    } else {
        addTrend("range")
    }
}


function marketState(groups, swings){
    
    Object.keys(groups).forEach(groupName=>{
        groups[groupName].forEach(group=>{
            handleGroups(groupName, group, swings[group])
        })
    })
    
}


export default function inferTrend(){
  const unsubRp= useReplayStore.subscribe(state=>{
    if (state.replayActive){
      const analysisSelection = useAnalysisStore.getState().selection;
      const timeframes = useAnalysisStore.getState().timeframes;
      const data = useChartStore.getState().data;
      //window.sd1 = data;
      
      const replayKey = useReplayStore.getState().replayKey;
      const replayKeyJoin = `${replayKey.platform}|${replayKey.trade}|${replayKey.symbol}`;

      const cursor = useReplayStore.getState().replayState[replayKeyJoin].cursor;
      //console.log("cursor:",cursor)

      for (const tf of timeframes){
        const offset = getOffset(tf, cursor);
        
        //console.log(data[replayKeyJoin][tf])
        const marketSpecificData = data[replayKeyJoin][tf]
        //window.sd = marketSpecificData;
        //window.ot = offset;
        const replayData = marketSpecificData.data.slice(0, offset);
        //console.log(replayData);

        const swingKey = `${replayKeyJoin}|${tf}`;
        //console.log("swingKey:",swingKey)
        swingsIdentifier.findSwings(swingKey, replayData);
      }

      /*const keysToAnalyse = []
      for (const key of Object.keys(analysisSelection)){
        for (const symbol of analysisSelection[key]){
          if (!symbol) continue;
          keysToAnalyse.push(`${key}|${symbol})`)
          
        }
      }

      if (keysToAnalyse.length ==0) return;
      */
    } 
  })

  const unsubSg = useSwingStore.subscribe(
    state => state.swings,
    currSwings => {
       //console.log("new swing")
        const swingKeys = Object.keys(currSwings);

        if (swingKeys.length === 0) return;

        const noDigReg = new RegExp("[^0-9]+");
        const analysisGroups = {};

        swingKeys.forEach(swingKey => {
            const swingKeyNoTf = swingKey.match(noDigReg)[0];

            if (!analysisGroups[swingKeyNoTf]) {
                analysisGroups[swingKeyNoTf] = [];
            }

            analysisGroups[swingKeyNoTf].push(swingKey);
        });

        marketState(analysisGroups, currSwings);
    }
);
  return ()=>{
    unsubRp();
    unsubSg();
  }
}