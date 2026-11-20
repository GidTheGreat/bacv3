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

function determineState(group,swingKey,latest4Swings){
  const firstSwing = latest4Swings[0];
  const secondSwing = latest4Swings[1];
  const thirdSwing = latest4Swings[2];
  const fourthSwing = latest4Swings[3];

  const tf = swingKey.match(/(?<=group)|\d+\w+/)[0];
  function addTrend(trend){
    window.ms = useSwingStore.getState().marketState
    //console.log(group,tf)
    const currTrend = useSwingStore.getState()?.marketState?.[group]?.[tf] ?? null;
    if (currTrend == trend) return;
    useSwingStore.getState().setMarketState(group, tf, trend);
  }
  
  if (firstSwing.type == "low"){
    if (thirdSwing.low > firstSwing.low && fourthSwing.high > secondSwing.high){
      addTrend("uptrend")
    } else if (thirdSwing.low < firstSwing.low && fourthSwing.high < secondSwing.high){
      addTrend("downtrend")
    } else {
      addTrend("range")
    }
  } else if (firstSwing.type == "high"){
    if (fourthSwing.low > secondSwing.low && thirdSwing.high > firstSwing.high){
      addTrend("uptrend")
    } else if (fourthSwing.low < secondSwing.low && thirdSwing.high < firstSwing.high){
      addTrend("downtrend")
    } else {
      addTrend("range")
    }
  }
}

function marketState(analysisGroups, currSwings){
  Object.keys(analysisGroups).forEach(group=>analysisGroups[group].forEach(
    swingKey=>{
      const swingData = currSwings[swingKey];
      if (swingData.length < 4){
        return
      } else {
        const latest4Swings = swingData.slice(swingData.length-4,swingData.length);
        determineState(group, swingKey, latest4Swings)
        
      }
    }
  ))
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
    state=>{
      //console.log(state.swings)
      const currSwings = state.swings;
      const swingKeys = Object.keys(currSwings);
      if (swingKeys.length==0) return;
      const noDigReg = new RegExp("[^0-9]+");

      const analysisGroups = {};
      swingKeys.forEach(swingKey=>{
        const swingKeyNoTf = swingKey.match(noDigReg)[0];
        if (!Object.keys(analysisGroups).includes(swingKeyNoTf)){
          analysisGroups[swingKeyNoTf]=[];
        }
        analysisGroups[swingKeyNoTf].push(swingKey);
      })
      marketState(analysisGroups, currSwings);
      
    }
  )
  return ()=>{
    unsubRp();
    unsubSg();
  }
}