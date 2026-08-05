// registry.js

import capabilities from "./capabilities";
//console.log(capabilities)
export function getCapabilities(id) {
    //console.log(id)
    const capabilityNeeded = capabilities.filter(c => c.id === id);
    //console.log(capabilityNeeded)
    return capabilityNeeded;
}