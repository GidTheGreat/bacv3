/*

* parseSwings(key) — NOT CONTAINED BRANCH
* 
* Purpose:
* Identify contained price-action structures using four consecutive
* swings while maintaining continuity through a sliding window.
* 
* STEP 1: ENTRY CONDITION
* If this.contained[key] is false, execute notContained(key).
* 
* STEP 2: RETRIEVE FOUR SWINGS
* Retrieve four consecutive swings starting at ammendPos[key]:
* 
* S1 = First swing (seed)
* S2 = Second swing (seed)
* S3 = Third swing (comparison)
* S4 = Fourth swing (comparison)
* 
* If fewer than four swings are available from the current iteration
* position, terminate execution and wait for additional swings.
* 
* STEP 3: VALIDATE SWING SEQUENCE
* Ensure the four swings alternate between highs and lows:
* 
* Low -> High -> Low -> High
* High -> Low -> High -> Low
* 
* If the sequence is invalid, do not perform containment analysis.
* 
* STEP 4: TEST FOR CONTAINMENT
* 
* Case A: S1 is a LOW.
* The second pair is contained within the first pair if:
* 
* S3.low > S1.low && S4.high < S2.high
* 
* Case B: S1 is a HIGH.
* The second pair is contained within the first pair if:
* 
* S3.high < S1.high && S4.low > S2.low
* 
* STEP 5: APPEND SEED SWINGS
* Regardless of the containment outcome, append S1 and S2 to
* parsedSwings.
* 
* S3 and S4 are deliberately excluded because they will become
* the seed pair in the next iteration.
* 
* STEP 6: HANDLE CONTAINMENT
* 
* If containment is detected:
* 
* 1. Record the four relevant boundaries in priceActionSwings:
* 
*  refHigh = Upper boundary of the seed pair.
*  refLow  = Lower boundary of the seed pair.
*  high    = Upper boundary of the comparison pair.
*  low     = Lower boundary of the comparison pair.
* 
* 2. Set this.contained[key] = true.
* 
* 3. This activates the contained branch during the next
*  iteration of parseSwings().
* 
* If containment is NOT detected:
* 
* - Leave this.contained[key] = false.
* - Continue analysis through the not-contained branch.
* 
* STEP 7: ADVANCE ITERATION POSITION
* 
* Regardless of the containment outcome:
* 
* this.ammendPos[key] += 2;
* 
* Advancing by two preserves continuity by making S3 and S4
* the seed pair for the next comparison.
* 
* SLIDING-WINDOW EXAMPLE:
* 
* Iteration 1: S1, S2, S3, S4
* Iteration 2:         S3, S4, S5, S6
* Iteration 3:                 S5, S6, S7, S8
* 
* IMPORTANT INVARIANTS:
* 
* 1. Each successful analysis appends exactly two swings.
* 2. The iteration position advances by exactly two.
* 3. Overlapping seed swings are not duplicated in parsedSwings.
* 4. When containment is detected, all four reference boundaries
*  are recorded before activating the contained state.
* 5. When containment is not detected, the next comparison
*  continues through the same branch.

*/

/*

* contained(key)
* 
* PURPOSE:
* Monitor an established contained price-action structure and determine
* whether price eventually escapes its original reference boundaries.
* 
* The procedure operates in two stages:
* 
* STAGE 1: Monitor each new swing for a reference boundary breakout.
* STAGE 2: Verify a failed breakout attempt using the next two swings.
* 
* ---
* STAGE 1: INITIAL CONTAINMENT BREAK TEST
* ---
* 
* 1. Retrieve the latest swing.
* 
* 2. Compare it against the ORIGINAL reference boundaries:
* 
* If the latest swing is a LOW:
*   latest.low < refLow.low
* 
* If the latest swing is a HIGH:
*   latest.high > refHigh.high
* 
* 3. IF A REFERENCE BOUNDARY IS BROKEN:
* 
* - Append the latest swing to parsedSwings.
* - Reset contained[key] to false.
* - Reset failBreakContained[key] to false.
* - Reset priceActionSwings[key].
* - Advance ammendPos[key] by one.
* 
* The next parseSwings iteration resumes through notContained().
* 
* 4. IF NO REFERENCE BOUNDARY IS BROKEN:
* 
* - Do not append the latest swing.
* - Set failBreakContained[key] to true.
* - Advance ammendPos[key] by one.
* 
* The next iteration activates STAGE 2.
* 
* ---
* STAGE 2: FAILED CONTAINMENT BREAK VERIFICATION
* ---
* 
* ENTRY CONDITION:
* 
* This stage executes when failBreakContained[key] is true.
* 
* At this point, two new swings exist following the original
* contained structure:
* 
* S5 = Failed breakout attempt.
* S6 = Confirmation candidate.
* 
* 1. Retrieve the two latest swings.
* 
* 2. Identify their high and low swings.
* 
* 3. Test S6 against the ORIGINAL reference boundaries.
* 
* If S6 is a HIGH:
*   S6.high > refHigh.high
* 
* If S6 is a LOW:
*   S6.low < refLow.low
* 
* ---
* OUTCOME A: CONFIRMED CONTAINMENT BREAK
* ---
* 
* If S6 breaks an original reference boundary:
* 
* UPWARD BREAKOUT:
* 
*   Append:
*      [priceActionSwings.low, S6]
* 
* DOWNWARD BREAKOUT:
* 
*   Append:
*      [priceActionSwings.high, S6]
* 
* Then:
* 
*   - Reset contained[key] to false.
*   - Reset failBreakContained[key] to false.
*   - Reset priceActionSwings[key].
*   - Advance ammendPos[key] by one.
* 
* S6 remains available for subsequent analysis.
* 
* The next iteration resumes through notContained().
* 
* NOTE:
* The original reference boundary is the breakout threshold.
* Since the inner boundaries are already inside the original
* reference boundaries, breaking the original boundary necessarily
* exceeds the corresponding inner boundary as well.
* 
* ---
* OUTCOME B: NO CONFIRMED CONTAINMENT BREAK
* ---
* 
* If S6 does not break either original reference boundary:
* 
* - Do not append either new swing.
* 
* - Update the INNER HIGH if either new high exceeds the
*  previously recorded inner high.
* 
* - Update the INNER LOW if either new low falls below the
*  previously recorded inner low.
* 
* - Preserve refHigh and refLow unchanged.
* 
* - Reset failBreakContained[key] to false.
* 
* - Advance ammendPos[key] by two.
* 
* The next iteration resumes ordinary containment monitoring.
* 
* ---
* STATE AND ITERATION INVARIANTS
* ---
* 
* 1. Original reference boundaries remain unchanged throughout
* containment monitoring.
* 
* 2. Inner boundaries may expand but must remain within the
* original reference boundaries.
* 
* 3. A confirmed breakout discards the intervening contained
* swings and preserves the relevant inner boundary and breakout
* swing in parsedSwings.
* 
* 4. A failed breakout verification retains the containment
* structure and updates its inner boundaries where necessary.
* 
* 5. Successful breakout advances the iteration position by one.
* 
* 6. Failed breakout verification advances the iteration
* position by two.
* 
* 7. After either outcome, failBreakContained[key] must be false.
* 
* 8. A confirmed breakout resets containment state so that the
* next iteration executes notContained().
  */



class SwingsIdentifier {
    constructor(swingsStore) {
        this.pos = {};
        this.swings = {};
        this.parsedSwings = {};
        this.swingsStore = swingsStore;
        this.ammendPos = {};

        this.contained = {};
        this.failBreakContained = {};
        this.priceActionSwings={key:{high:null,low:null,refHigh:null, refLow:null}};
      
    }

    removeLatestSwing(key, typeOfSwings="normal") {
        if (this.swingsStore) {
            this.swingsStore.getState().removeLatestSwing(key);
        } else {
            this.swings[key]?.pop();
        }
    }
  
    getSwingsLength(key, typeOfSwings="normal"){
      if (typeOfSwings == "normal"){
        const swings = this.swingsStore
            ? this.swingsStore.getState().swings
            : this.swings;

        return swings[key].length
      } else {
        const swings = this.swingsStore
            ? this.swingsStore.getState().parseSwings
            : this.parsedSwings;

        return swings[key].length
      }
      
    }

    getSwings(key, typeOfSwings="normal") {
      if (typeOfSwings=="normal"){
        const swings = this.swingsStore
            ? this.swingsStore.getState().swings
            : this.swings;

        return key === undefined ? swings : swings[key] ?? [];
      } else {
        const swings = this.swingsStore
            ? this.swingsStore.getState().parsedSwings
            : this.parsedSwings;

        return key === undefined ? swings : swings[key] ?? [];
      }
        
    }

    addSwings(key, swing, typeOfSwings="normal") {
      if (typeOfSwings=="normal"){
        if  (this.swingsStore) {
            this.swingsStore.getState().addSwings(key, swing);
        } else {
            if (!this.swings[key]) this.swings[key] = [];
            this.swings[key].push(swing);
        }
      } else {
        if  (this.swingsStore) {
            this.swingsStore.getState().addParsedSwings(key, swing);
        } else {
            if (!this.parsedSwings[key]) this.parsedSwings[key] = [];
            swing.forEach(swing=>this.parsedSwings[key].push(swing));
        }
      }
        
    }
 
    
   notContained(key) {
    const swings = this.getSwings(key);
    const pos = this.ammendPos[key];

    if (swings.length - pos < 4) return;

    const [first, second, third, fourth] =
        swings.slice(pos, pos + 4);

    // Validate alternating swing sequence.
    if (
        first.type !== third.type ||
        second.type !== fourth.type ||
        first.type === second.type
    ) {
        return;
    }

    let isContained = false;

    if (first.type === "low") {
        isContained =
            third.low > first.low &&
            fourth.high < second.high;
    } else {
        isContained =
            third.high < first.high &&
            fourth.low > second.low;
    }

    // Append only the seed pair.
    this.addSwings(key, [first, second], "parsed");

    if (isContained) {
        this.priceActionSwings[key] = {
            refHigh: first.type === "low" ? second : first,
            refLow: first.type === "low" ? first : second,
            high: first.type === "low" ? fourth : third,
            low: first.type === "low" ? third : fourth
        };

        this.contained[key] = true;
    }

    this.ammendPos[key] += 2;
   }

   
contained(key) {
    const priceAction = this.priceActionSwings[key];

    // Validate containment state.
    if (!priceAction?.refHigh || !priceAction?.refLow ||
        !priceAction.high || !priceAction.low) {
        throw new Error(`Invalid containment state for ${key}`);
    }

    // STAGE 2: Failed containment breakout verification.
    if (this.failBreakContained[key]) {

        const [secondLast, last] = this.getSwings(key).slice(-2);

        if (!secondLast || !last) return;

        const high = [secondLast, last].find(
            swing => swing.type === "high"
        );

        const low = [secondLast, last].find(
            swing => swing.type === "low"
        );

        if (!high || !low) {
            throw new Error(`Invalid swing sequence during containment verification: ${key}`);
        }

        // S6 is the confirmation candidate.
        const referenceBreak =
            last.type === "high"
                ? last.high > priceAction.refHigh.high
                : last.type === "low"
                    ? last.low < priceAction.refLow.low
                    : false;

        if (referenceBreak) {

            // Confirmed upward breakout.
            if (last.type === "high") {
                this.addSwings(key, [priceAction.low, last], "parsed");

            // Confirmed downward breakout.
            } else {
                this.addSwings(key, [priceAction.high, last], "parsed");
            }

            // Reset containment state.
            this.failBreakContained[key] = false;
            this.contained[key] = false;

            this.priceActionSwings[key] = {
                high: null,
                low: null,
                refHigh: null,
                refLow: null
            };

            // S6 remains available for the next analysis.
            this.ammendPos[key] += 1;

        } else {

            // No breakout: update inner containment boundaries.
            if (high.high > priceAction.high.high) {
                priceAction.high = high;
            }

            if (low.low < priceAction.low.low) {
                priceAction.low = low;
            }

            // Resume ordinary containment monitoring.
            this.failBreakContained[key] = false;
            this.ammendPos[key] += 2;
        }

        return;
    }

    // STAGE 1: Test the latest swing against original references.
    const latest = this.getSwings(key).at(-1);

    if (!latest) return;

    const containmentBroken =
        latest.type === "low"
            ? latest.low < priceAction.refLow.low
            : latest.type === "high"
                ? latest.high > priceAction.refHigh.high
                : false;

    if (containmentBroken) {

        // Append the breakout swing.
        this.addSwings(key, [latest], "parsed");

        // Reset containment state.
        this.contained[key] = false;
        this.failBreakContained[key] = false;

        this.priceActionSwings[key] = {
            high: null,
            low: null,
            refHigh: null,
            refLow: null
        };

    } else {

        // No reference boundary broken: initiate verification.
        this.failBreakContained[key] = true;
    }

    this.ammendPos[key] += 1;
}

  
   parseSwings(key){
     if (!this.ammendPos[key]){
       this.ammendPos[key] = 0
     }
     if (!this.priceActionSwings[key]){
       this.priceActionSwings[key]={high:null,low:null,refHigh:null, refLow:null};
     }

     if (!this.contained[key]){
       this.contained[key] = false;
     }
     if (!this.failBreakContained[key]){
       this.failBreakContained[key] = false;
     }
     
     const swings = this.getSwings(key);
     for (; this.ammendPos[key] < swings.length; ){
       if (!this.contained[key]){
         this.notContained(key)
       } else {
         this.contained(key)
       }
       
     }
   }
    
    processSwing(key, candle, type, last) {
        const swing = {
            type,
            low: candle.low,
            high: candle.high,
            open: candle.open,
            close: candle.close,
            time: candle.time
        };
        /*const isValid = this.validateSwing(key, candle, type, last);
        if (!isValid) return;*/
      
        if (!last || last.type !== type) {
            this.addSwings(key, swing);
        } else if (
            type === "high" && last.high < candle.high ||
            type === "low" && last.low > candle.low
        ) {
            this.removeLatestSwing(key);
            this.addSwings(key, swing);
        }
        this.parseSwings(key)
    }

    findSwings(key, data) {
        //console.log("in findwings, pos:",JSON.stringify(this.pos))
        if (data.length < 3) return;

        if (this.pos[key] === undefined) {
            this.pos[key] = 0;
        }

        for (; this.pos[key] < data.length - 2; this.pos[key]++) {

            const candle_one = data[this.pos[key]];
            const candle_two = data[this.pos[key] + 1];
            const candle_three = data[this.pos[key] + 2];

            const last = this.getSwings(key).at(-1);

            const isHigh =
                candle_two.high >= candle_one.high &&
                candle_two.high >= candle_three.high;

            const isLow =
                candle_two.low <= candle_one.low &&
                candle_two.low <= candle_three.low;

            // Both conditions qualify on the same candle.
            if (isHigh && isLow) {

                // Discard dual swing if no previous swing exists.
                if (!last) continue;

                // Alternate against the previous swing.
                const type = last.type === "high" ? "low" : "high";

                this.processSwing(key, candle_two, type, last);

            } else if (isHigh) {

                this.processSwing(key, candle_two, "high", last);

            } else if (isLow) {

                this.processSwing(key, candle_two, "low", last);
            }
          //console.log("new pos:", this.pos[key])
        }
      //
    }
}

export default SwingsIdentifier;
