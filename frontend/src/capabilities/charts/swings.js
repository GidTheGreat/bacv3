import useSwingStore from "../../stores/swingStore";

class SwingGen{
    constructor(confirmationCount=3){
        this.pos = {};
        this.swings = {};
        this.pendingSwings = {};
        this.confirmationCount = confirmationCount;
        
        
    }
    
    determineTrend(key, tf){
        const swingsList = swings?.[key]?.[tf];
        if (!swingsList.length || swingsList.length < 4) return;
        
        const latestSwings = swingsList.slice(-4);
        
        
    }

    addSwing(key, tf, swingType, swingValue){
        const latestSwing = this.swings?.[key]?.[tf].slice(-1)[0];
        console.log("latest swing:",latestSwing,
            "islatestSwing ==swingType:",latestSwing?.swingType == swingType)

        if (!latestSwing || latestSwing.swingType != swingType){
            this.swings[key][tf].push({
                        swingType,
                        value: swingValue
                    });
            useSwingStore.getState().addSwing(key, tf, { swingType, value: swingValue });
        
        } else if (latestSwing && latestSwing.swingType==swingType){
            if (swingType == 'low'){
                if (swingValue.low < latestSwing.value.low){
                    this.swings?.[key]?.[tf].pop();
                    this.swings[key][tf].push({
                        swingType,
                        value: swingValue
                    });
                    useSwingStore.getState().replaceLatest(key, tf, { swingType, value: swingValue });
                    console.log("new low warrants replacing existing")
                }
                

            } else if (swingType == 'high'){
                if (swingValue.high > latestSwing.value.high){
                    this.swings?.[key]?.[tf].pop();
                    this.swings[key][tf].push({
                        swingType,
                        value: swingValue
                    });
                    useSwingStore.getState().replaceLatest(key, tf, { swingType, value: swingValue });
                    console.log("new high warrants replacing existing")
                }
                
            } else {
                console.log("new lows/highs dont warrant replacing existing")
            }
        }
        
    }
    
    findSwings(key, tf, candleData){
        if (!this.pendingSwings[key]) {
            this.pendingSwings[key] = {};
        }
        
        if (!this.pendingSwings[key][tf]) {
            this.pendingSwings[key][tf] = {
                max: { value: null, confirmed: 0 },
                min: { value: null, confirmed: 0 }
            };
        }
        
        if (!this.swings[key]){
            this.swings[key] = {};
        }
        
        if (!this.swings[key][tf]){
            this.swings[key][tf] = []
        }
        
        if (!this.pos[key]){
            this.pos[key] = {};
            
        }
        
        if (this.pos[key][tf] === undefined){
            this.pos[key][tf] = 0;
        }
        
        //console.log(this.swings)
        if (candleData?.length < 3) return;
        
        for (;this.pos[key][tf]+2 < candleData.length; this.pos[key][tf]++){
            const curr_three = [ candleData[this.pos[key][tf]],
            candleData[this.pos[key][tf]+1], candleData[this.pos[key][tf]+2] ]
            
            const maxCandle = curr_three.reduce((max,candle)=>{
                if (max==0){
                    return candle
                } else if (candle.high > max.high){
                    return candle
                } else {
                    return max
                }
            },0)
            
            const minCandle = curr_three.reduce((min,candle)=>{
                if (min==0){
                    return candle
                } else if (candle.low < min.low){
                    return candle
                } else {
                    return min
                }
            },0)
            
            
            if (!this.pendingSwings[key][tf]["max"]["value"]){
                this.pendingSwings[key][tf]["max"]["value"] = {
                    time:maxCandle.time,
                    high:maxCandle.high,
                    low:maxCandle.low,
                    open:maxCandle.open,
                    close:maxCandle.close
                };
                
            } else if (this.pendingSwings[key][tf]["max"]["value"] &&
            this.pendingSwings[key][tf]["max"]["value"].high > maxCandle.high){
                this.pendingSwings[key][tf]["max"]["confirmed"] += 1;
                
            } else if (this.pendingSwings[key][tf]["max"]["value"] &&
            this.pendingSwings[key][tf]["max"]["value"].high < maxCandle.high){
                this.pendingSwings[key][tf]["max"]["confirmed"] = 0;
                this.pendingSwings[key][tf]["max"]["value"] = {
                    time:maxCandle.time,
                    high:maxCandle.high,
                    low:maxCandle.low,
                    open:maxCandle.open,
                    close:maxCandle.close
                };
                
            }
            
            if (!this.pendingSwings[key][tf]["min"]["value"]){
                this.pendingSwings[key][tf]["min"]["value"] = {
                    time:minCandle.time,
                    high:minCandle.high,
                    low:minCandle.low,
                    open:minCandle.open,
                    close:minCandle.close
                };
                
            } else if (this.pendingSwings[key][tf]["min"]["value"] &&
            this.pendingSwings[key][tf]["min"]["value"].low < minCandle.low){
                this.pendingSwings[key][tf]["min"]["confirmed"] += 1;
                
            } else if (this.pendingSwings[key][tf]["min"]["value"] &&
            this.pendingSwings[key][tf]["min"]["value"].low > minCandle.low){
                this.pendingSwings[key][tf]["min"]["confirmed"] = 0;
                this.pendingSwings[key][tf]["min"]["value"] = {
                    time:minCandle.time,
                    high:minCandle.high,
                    low:minCandle.low,
                    open:minCandle.open,
                    close:minCandle.close
                };  
                
            }
            
            if (this.pendingSwings[key][tf]["max"]["confirmed"] >=this.confirmationCount ||
            this.pendingSwings[key][tf]["min"]["confirmed"] >=this.confirmationCount){
                if (this.pendingSwings[key][tf]["min"]["confirmed"] >=this.confirmationCount){
                    this.addSwing(key, tf, "low", this.pendingSwings[key][tf]["min"]["value"]);
                    this.pendingSwings[key][tf]["min"] = {value:null,confirmed:0};
                }
                if (this.pendingSwings[key][tf]["max"]["confirmed"] >=this.confirmationCount){
                    this.addSwing(key, tf, "high", this.pendingSwings[key][tf]["max"]["value"]);
                    this.pendingSwings[key][tf]["max"] = {value:null,confirmed:0};
                } 
                
            } 
        }
    }
}

//sg = new SwingGen;
//sg.findSwings("um")

export default new SwingGen();