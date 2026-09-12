
import useDrawingStore from "../../stores/drawingStore";

export class SyncDrawings {

    constructor(callback ) {
        this.callback = callback;
        this.series = null;

        this.requestUpdate = null;

        this._paneViews = [];
    }

    attached(param) {
        this.series = param.series;
        this.requestUpdate = param.requestUpdate;

        // Create the pane view once.
        this._paneViews = [
            new SyncView(this),
        ];
        this.unsubDs = useDrawingStore.subscribe(
            (state) =>  {
                //console.log("store updated")
                this.requestUpdate?.();
            }
        );
        // Tell the chart that the primitive has something to draw.
        this.requestUpdate();
    }


    detached() {
        this.series = null;
        this.requestUpdate = null;
        this._paneViews = [];
        this.unsubDs();
        
    }


    paneViews() {
        return this._paneViews;
    }


    
    setCb(Cb) {
        this.callback = Cb;

        if (this.requestUpdate) {
            this.requestUpdate();
        }
    }


  

    updateAllViews() {
        this.callback()
        
        for (const view of this._paneViews) {
            view.update();
        }
    }
}




    


class SyncView {

    constructor(source) {
        this._source = source;

        this._renderer = new SyncRenderer(source);
    }

    update() {
       
    }


    renderer() {
        return this._renderer;
    }
}

class SyncRenderer {

    constructor(source) {
        this._source = source;
    }


    
    draw(target) {

        
    }
}