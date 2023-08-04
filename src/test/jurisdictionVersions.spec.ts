import { assert } from "chai"
import { describe, it, before } from "mocha" //node:test
import { GetPaShimUsStateData } from '../dataCollection'
import { UsState, UsStateMapping, JurisdictionVersion } from '../interfaces/interfacesAndTypes'
import { HitEndpoint } from '../endpoints'
import { Urls, Endpoints } from '../constants'

let PA_SHIM_STATES_DATA:UsStateMapping|undefined;
let JURISDICTION_VERSION_DATA:JurisdictionVersion[]

describe("[CM-726] - Jurisdiction Versions - Endpoint should return all sets of products and states.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        JURISDICTION_VERSION_DATA = await HitEndpoint(Urls.Dev, Endpoints.JurisdictionVersions) as JurisdictionVersion[];
    });

    it("Verify that pa_shim and IPC use the exact same set of states.", async () => {
        const paShimStates:UsState[] = Object.keys(PA_SHIM_STATES_DATA as object) as UsState[];

        console.log("pa shim states")
        console.log(paShimStates)

        const jurisdictionUniqueNames:UsState[] = JURISDICTION_VERSION_DATA.map((jvData) => {
            return jvData.jurisdiction_unique_name.replace("US-","")
        }) as UsState[];

        const ipcStates:UsState[] = [...new Set(jurisdictionUniqueNames)]

        console.log("IPC states")
        console.log(ipcStates)

        const stateArrayDifference:UsState[] = paShimStates.filter((state) => !ipcStates.includes(state));

        assert(stateArrayDifference.length === 0);
    })

    it ("Verify that each state in IPC has the same products as listed in pa_shim.", () => {
        const jurisdictionUniqueNames:UsState[] = JURISDICTION_VERSION_DATA.map((jvData) => jvData.jurisdiction_unique_name.replace("US-","")) as UsState[];
        const ipcStates:UsState[] = [...new Set(jurisdictionUniqueNames)]

        ipcStates.forEach((state) => {
            const ipcJurisdictionVersionDataForThisState:JurisdictionVersion[] = JURISDICTION_VERSION_DATA.filter((jvData) => {
                return jvData.jurisdiction_unique_name === `US-${state}`;
            })

            const ipcProductsForThisState = ipcJurisdictionVersionDataForThisState.map((jvData) => {
                return jvData.product_line_unique_name;
            })

            const paShimProductsForThisState:string[] = (PA_SHIM_STATES_DATA as UsStateMapping)[state].products
            const productArrayDifference:string[] = paShimProductsForThisState.filter((product) => !ipcProductsForThisState.includes(product));

            assert(productArrayDifference.length === 0)
        })

    })
})



