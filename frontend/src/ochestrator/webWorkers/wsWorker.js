import {Queue,scheduleConsumer } from './queue'
import { DataFeedPipeline } from '../../capabilities/data/DataFeedPipeline';
console.log("[ws worker] loaded")

const queue = new Queue()
const dfp = new DataFeedPipeline

postMessage(
    {
        type: "status",
        message: "[ws worker] ready"
    }
)

const connections = new Map()
onmessage = event => {
    //console.log(`[ws worker] data receipt ${JSON.stringify(event.data)}`)
    const { type, url, id, msg } = event.data
    switch (type){
        case "connect":{
            //console.log(connections)
            if (!connections.has(id)){
                const socket = new WebSocket(url)
                connections.set(id, socket)
                socket.onopen = ()=>{
                    
                    postMessage(
                        {
                        type: "socket open",
                        id 
                        }
                    )
                }

                socket.onclose = ()=>{
                    connections.delete(id)
                    postMessage(
                        {
                            type: "socket closed",
                            id
                        }
                    )
                }

                socket.onerror = (error)=> {
                    connections.delete(id)
                    postMessage(
                        {
                            type: "socket error",
                            id,
                            msg: error
                        }
                    )
                }

                socket.onmessage = (event)=>{
                    queue.enqueue(event.data);
                    scheduleConsumer(queue, dfp.consume);
                    /*
                    postMessage(
                        {
                            type: "data receipt",
                            id
                        }
                    )*/
                }


            }
            //console.log(connections)
            break;
            
        }

        case "close":{
            //console.log(connections)
            const socket = connections.get(id);
            if (socket){
                socket.close();
            }
            //console.log(connections)
            break;
        }

        case "send":{
            const socket = connections.get(id);
            if (socket){
                socket.send(msg);

            }
            
            break;
        }
    }
}