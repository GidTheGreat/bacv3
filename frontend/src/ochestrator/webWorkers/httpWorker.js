console.log("[http worker] loaded")

postMessage(
    {
        type: "status",
        message: "[http worker] ready"
    }
)
//throw("sim error")

onmessage = event => {
    //console.log(`[http worker] data receipt ${JSON.stringify(event.data)}`)
    postMessage(
        {
            type: "[http]confirmation",
            msg:"msg receipt confirmed"
        }
    )
}