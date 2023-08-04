import { expect } from "chai"
import { describe, it, before } from "mocha" //node:test
import { GetPaShimUsStateData } from '../dataCollection'
import { UsState, UsStateMapping, JurisdictionVersion, Jurisdiction, ProductLine } from '../interfaces/interfacesAndTypes'
import { HitEndpoint } from '../endpoints'
import { Urls, Endpoints } from '../constants'

let PA_SHIM_STATES_DATA:UsStateMapping|undefined;
let JURISDICTION_VERSION_DATA:JurisdictionVersion[]
let JURISDICTION_DATA:Jurisdiction[]
let PRODUCT_LINE_DATA:ProductLine[]

describe("[CM-726] - Jurisdiction Versions - Endpoint should return all sets of products and states.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        JURISDICTION_VERSION_DATA = await HitEndpoint(Urls.Dev, Endpoints.JurisdictionVersions) as JurisdictionVersion[];
    });

    it("Verify that pa_shim and IPC use the exact same set of states.", async () => {
        const paShimStates:UsState[] = Object.keys(PA_SHIM_STATES_DATA as object) as UsState[];

        // Get a list of all the jurisdiction names (with no duplicates)
        const allJurisdictionNames:UsState[] = JURISDICTION_VERSION_DATA.map((jvData) => {
            return jvData.jurisdiction_unique_name.replace("US-","")
        }) as UsState[];
        const ipcStates:UsState[] = [...new Set(allJurisdictionNames)]

        // If the difference between the arrays is 0, then they contain an identical set of states.
        const stateArrayDifference:UsState[] = paShimStates.filter((state) => !ipcStates.includes(state));

        // Log information about failures.
        if (stateArrayDifference.length > 0) {
            const theseOrThis = (stateArrayDifference.length > 1) ? "These states are" : "This state is"
            console.log(`DISCREPANCY: ${theseOrThis} not shared between pa_shim & IPC: `)
            console.log(stateArrayDifference)
        }

        expect(stateArrayDifference.length).to.equal(0);
    })

    it ("Verify that each state in IPC has the same products as listed in pa_shim.", () => {
        const jurisdictionUniqueNames:UsState[] = JURISDICTION_VERSION_DATA.map((jvData) => jvData.jurisdiction_unique_name.replace("US-","")) as UsState[];
        const ipcStates:UsState[] = [...new Set(jurisdictionUniqueNames)]

        // For each state, compare their pa_shim product list to their IPC product list.
        ipcStates.forEach((state) => {
            const ipcJurisdictionVersionDataForThisState:JurisdictionVersion[] = JURISDICTION_VERSION_DATA.filter((jvData) => {
                return jvData.jurisdiction_unique_name === `US-${state}`;
            })

            const ipcProductsForThisState = ipcJurisdictionVersionDataForThisState.map((jvData) => {
                return jvData.product_line_unique_name;
            })

            // If the difference between the arrays is 0, then they contain an identical set of products.
            const paShimProductsForThisState:string[] = (PA_SHIM_STATES_DATA as UsStateMapping)[state].products
            const productArrayDifference:string[] = paShimProductsForThisState.filter((product) => !ipcProductsForThisState.includes(product));

            expect(productArrayDifference.length).to.equal(0)
        })

    })
})

describe("[CM-727] - Jurisdiction Versions - Live dates should match those in pa_shim.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        JURISDICTION_VERSION_DATA = await HitEndpoint(Urls.Dev, Endpoints.JurisdictionVersions) as JurisdictionVersion[];
    });

    it("Verify that each jurisdiction's effective date in IPIM matches that jurisdiction's live date in pa_shim.", async () => {
        type LiveDateMapping = {
            [key in UsState] : string
        }

        const paShimLiveDates:LiveDateMapping = {} as LiveDateMapping;
        Object.entries(PA_SHIM_STATES_DATA as object).forEach((entry) => {
            const state:UsState = entry[0] as UsState;
            const liveDate:string = entry[1].live_at;
            paShimLiveDates[state] = liveDate;
        })

        // console.log(paShimLiveDates)

        // Pa shim versions are all 1.0.0, so we must exclude all ipc jurisdiction versions that differ from that.
        const ipcJurisdictionsVersion1_0_0:JurisdictionVersion[] = JURISDICTION_VERSION_DATA.filter((entry) => {
            return entry.version_number === "1.0.0";
        })

        //testing
        // let failureCount = 0;

        ipcJurisdictionsVersion1_0_0.forEach((entry) => {
            const state:UsState = entry.jurisdiction_unique_name.replace("US-","") as UsState
            const liveDate:string = entry.effective_date

            // console.log("@@@@")
            // console.log(state)
            // console.log(paShimLiveDates[state])
            // console.log(liveDate)
            // console.log("@@ @@")
            // try {
                expect(paShimLiveDates[state]).to.equal(liveDate)
            // } catch {
            //     failureCount++; // testing
            // }
        })

        //testing
        // if (failureCount > 0) {
        //     throw "some tests failed"
        // }
    })
})

describe("[CM-728] - Jurisdiction Versions - No duplicates.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        JURISDICTION_VERSION_DATA = await HitEndpoint(Urls.Dev, Endpoints.JurisdictionVersions) as JurisdictionVersion[];
    });

    it("Verify that there are no duplicate combinations of product, jurisdiction, & date.", () => {
        const productJurisdictionDateStrings:string[] = []
        
        JURISDICTION_VERSION_DATA.forEach((entry) => {
            const productJurisdictionDateString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.effective_date)
            productJurisdictionDateStrings.push(productJurisdictionDateString)
        })

        // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
        expect(productJurisdictionDateStrings.length).to.equal([...new Set(productJurisdictionDateStrings)].length)
    })

    it("Verify that there are no duplicate combinations of product, jurisdiction, & version.", () => {
        const productJurisdictionVersionStrings:string[] = []
        
        JURISDICTION_VERSION_DATA.forEach((entry) => {
            const productJurisdictionVersionString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.version_number)
            productJurisdictionVersionStrings.push(productJurisdictionVersionString)
        })

        // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
        expect(productJurisdictionVersionStrings.length).to.equal([...new Set(productJurisdictionVersionStrings)].length)
    })
})

describe("[CM-729] - Jurisdictions - 1 jurisdiction per state.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        JURISDICTION_DATA = await HitEndpoint(Urls.Dev, Endpoints.Jurisdictions) as Jurisdiction[];
    });

    it("Verify that there is exactly 1 jurisdiction per state.", () => {
        // Get list of unique ipc jurisdictions
        const ipcJurisdictionUniqueNames:string[] = JURISDICTION_DATA.map((entry) => {
            return entry.unique_name.replace("US-","")
        })

        console.log(ipcJurisdictionUniqueNames)
        console.log([...new Set(ipcJurisdictionUniqueNames)])

        // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
        expect(ipcJurisdictionUniqueNames.length).to.equal([...new Set(ipcJurisdictionUniqueNames)].length)
    })

    it("Verify that IPC has the same jurisdictions as pa_shim.", () => {
        // Get list of unique ipc jurisdictions
        const ipcJurisdictionUniqueNames:string[] = JURISDICTION_DATA.map((entry) => {
            return entry.unique_name.replace("US-","")
        })

        // Get list of unique pa_shim jurisdictions
        const paShimJurisdictionUniqueNames:string[] = Object.keys(PA_SHIM_STATES_DATA as UsStateMapping)

        // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
        const jurisdictionArrayDifference:string[] = ipcJurisdictionUniqueNames.filter((jurisdiction) => !paShimJurisdictionUniqueNames.includes(jurisdiction));

        console.log(paShimJurisdictionUniqueNames)
        console.log(ipcJurisdictionUniqueNames)

        expect(jurisdictionArrayDifference.length).to.equal(0)
    })
})

describe("[CM-730] - Jurisdictions - 1 jurisdiction per state.", () => {
    before("Get the test data.", async () => {
        PA_SHIM_STATES_DATA = await GetPaShimUsStateData();
        PRODUCT_LINE_DATA = await HitEndpoint(Urls.Dev, Endpoints.ProductLines) as ProductLine[];
    });

    it("Verify that the IPC products match the pa_shim products.", () => {
        const productLineUniqueNames:string[] = PRODUCT_LINE_DATA.map((entry) => {return entry.unique_name})
        const paShimProducts:string[] = Object.values(PA_SHIM_STATES_DATA as Object).map((entry) => {return entry.products}).flat()
        const paShimProductsUniqueNames:string[] = [...new Set(paShimProducts)]

        console.log("productLineUniqueNames")
        console.log(productLineUniqueNames)
        console.log("paShimProductsUniqueNames")
        console.log(paShimProductsUniqueNames)

        // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
        const productArrayDifference:string[] = productLineUniqueNames.filter((product) => !paShimProductsUniqueNames.includes(product));

        expect(productArrayDifference.length).to.equal(0)
    })
})
