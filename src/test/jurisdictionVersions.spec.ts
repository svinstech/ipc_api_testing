import { expect } from "chai"
import { describe, it, before } from "mocha"
import { GetTestData, HitEndpoint } from '../dataCollection'
import { LogArrayDifference } from '../dataCommunication'
import { GetUniqueArrayOfIpcStates, ArrayDifference, GetUniqueArrayOfPaShimStates, GetUniqueArrayOfPaShimProducts } from '../dataManipulation'
import { UsState, UsStateMapping, JurisdictionVersion, Jurisdiction, ProductLine, TestData } from '../interfaces/interfacesAndTypes'
import { Url, Endpoint } from '../constants'
import shuffle from 'shuffle-array'

let PA_SHIM_STATES_DATA:UsStateMapping;
let JURISDICTION_VERSION_DATA:JurisdictionVersion[]
let JURISDICTION_DATA:Jurisdiction[]
let PRODUCT_LINE_DATA:ProductLine[]

describe("~~~ HEALTH ~~~", () => {
    it("Get the test data.", async () => {
        const health:string = await HitEndpoint(Url.Dev, Endpoint.Health) as string

        //testing
        console.log(`health: ${health}`)

        expect(health.toLowerCase()).to.equal("ok")
    });
})

describe("~~~ JURISDICTION VERSION ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(Url.Dev, Endpoint.JurisdictionVersions)
        PA_SHIM_STATES_DATA = testData.paShimStatesData
        JURISDICTION_VERSION_DATA = testData.ipcData as JurisdictionVersion[]
    });

    describe("[CM-726] - Jurisdiction Versions - Endpoint should return all sets of products and states.", () => {
        it("Verify that pa_shim and IPC use the exact same set of states.", async () => {
            const paShimStates:UsState[] = GetUniqueArrayOfPaShimStates(PA_SHIM_STATES_DATA);
    
            //testing
            console.log("paShimStates")
            console.log(paShimStates)

            const ipcStates:UsState[] = GetUniqueArrayOfIpcStates(JURISDICTION_VERSION_DATA);
    
            //testing
            console.log("ipcStates")
            console.log(ipcStates)
            
            // If the difference between the arrays is 0, then they contain an identical set of states.
            const stateArrayDifference:UsState[] = ArrayDifference(paShimStates, ipcStates)
            
            // Log information about failures.
            LogArrayDifference(stateArrayDifference)
    
            expect(stateArrayDifference.length).to.equal(0);
        })
    
        it("Verify that each state in IPC has the same products as listed in pa_shim.", () => {
            const jurisdictionUniqueNames:UsState[] = JURISDICTION_VERSION_DATA.map((jvData) => jvData.jurisdiction_unique_name.replace("US-","")) as UsState[];
            const ipcStates:UsState[] = [...new Set(jurisdictionUniqueNames)]
    
            // For each state, compare their pa_shim product list to their IPC product list.
            ipcStates.forEach((state) => {
                const ipcJurisdictionVersionDataForThisState:JurisdictionVersion[] = JURISDICTION_VERSION_DATA.filter((entry) => {
                    return entry.jurisdiction_unique_name === `US-${state}`;
                })
    
                const ipcProductsForThisState = ipcJurisdictionVersionDataForThisState.map((entry) => {
                    return entry.product_line_unique_name;
                })
    
                // If the difference between the arrays is 0, then they contain an identical set of products.
                const paShimProductsForThisState:string[] = (PA_SHIM_STATES_DATA as UsStateMapping)[state].products
                const productArrayDifference:string[] = ArrayDifference(paShimProductsForThisState, ipcProductsForThisState)

                // Log information about failures.
                LogArrayDifference(productArrayDifference)

                expect(productArrayDifference.length).to.equal(0)
            })
    
        })
    })
    
    describe("[CM-727] - Jurisdiction Versions - Live dates should match those in pa_shim.", () => {
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
    
            // Pa shim versions are all implied to be 1.0.0, so we must exclude all ipc jurisdiction versions that differ from that.
            const ipcJurisdictionsVersion1_0_0:JurisdictionVersion[] = JURISDICTION_VERSION_DATA.filter((entry) => {
                return entry.version_number === "1.0.0";
            })
    
            ipcJurisdictionsVersion1_0_0.forEach((entry) => {
                const state:UsState = entry.jurisdiction_unique_name.replace("US-","") as UsState
                const liveDate:string = entry.effective_date
    
                //testing
                console.log(`State: ${state}`)
                console.log(`Pa_shim live date: ${paShimLiveDates[state]}`)
                console.log(`IPC live date: ${liveDate}`)

                expect(paShimLiveDates[state]).to.equal(liveDate)
            })
        })
    })
    
    describe("[CM-728] - Jurisdiction Versions - No duplicates.", () => {
        it("Verify that there are no duplicate combinations of product, jurisdiction, & date.", () => {
            const productJurisdictionDateStrings:string[] = []
            
            JURISDICTION_VERSION_DATA.forEach((entry) => {
                const productJurisdictionDateString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.effective_date)
                productJurisdictionDateStrings.push(productJurisdictionDateString)
            })
    
            //testing
            const subArraySize = 10
            console.log(`${subArraySize} random entries from productJurisdictionDateStrings`)
            console.log(shuffle.pick(productJurisdictionDateStrings, { 'picks': subArraySize }))

            // If the original arrary's length is equal to the number of its unique elements, then the original array only contains unique elements. In other words, no duplicates.
            expect(productJurisdictionDateStrings.length).to.equal([...new Set(productJurisdictionDateStrings)].length)
        })
    
        it("Verify that there are no duplicate combinations of product, jurisdiction, & version.", () => {
            const productJurisdictionVersionStrings:string[] = []
            
            JURISDICTION_VERSION_DATA.forEach((entry) => {
                const productJurisdictionVersionString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.version_number)
                productJurisdictionVersionStrings.push(productJurisdictionVersionString)
            })

            //testing
            const subArraySize = 10
            console.log(`${subArraySize} random entries from productJurisdictionVersionStrings`)
            console.log(shuffle.pick(productJurisdictionVersionStrings, { 'picks': subArraySize }))
    
            // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
            expect(productJurisdictionVersionStrings.length).to.equal([...new Set(productJurisdictionVersionStrings)].length)
        })
    })
})

describe("~~~ JURISDICTION ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(Url.Dev, Endpoint.Jurisdictions)
        PA_SHIM_STATES_DATA = testData.paShimStatesData
        JURISDICTION_DATA = testData.ipcData as Jurisdiction[]
    });

    describe("[CM-729] - Jurisdictions - 1 jurisdiction per state.", () => {
        it("Verify that there is exactly 1 jurisdiction per state.", () => {
            // Get list of unique ipc jurisdictions
            const ipcJurisdictionUniqueNames:string[] = JURISDICTION_DATA.map((entry) => {
                return entry.unique_name.replace("US-","")
            })
    
            console.log("IPC jurisdiction Names (array)")
            console.log(ipcJurisdictionUniqueNames)

            console.log("IPC jurisdiction Names (set)")
            console.log([...new Set(ipcJurisdictionUniqueNames)])
    
            // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
            expect(ipcJurisdictionUniqueNames.length).to.equal([...new Set(ipcJurisdictionUniqueNames)].length)
        })
    
        it("Verify that IPC has the same jurisdictions as pa_shim.", () => {
            // Get list of unique ipc jurisdictions
            const ipcJurisdictionUniqueNames:UsState[] = GetUniqueArrayOfIpcStates(JURISDICTION_DATA)
    
            // Get list of unique pa_shim jurisdictions
            const paShimJurisdictionUniqueNames:UsState[] = GetUniqueArrayOfPaShimStates(PA_SHIM_STATES_DATA)
    
            // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
            const jurisdictionArrayDifference:string[] = ArrayDifference(ipcJurisdictionUniqueNames, paShimJurisdictionUniqueNames)
    
            console.log("paShimJurisdictionUniqueNames")
            console.log(paShimJurisdictionUniqueNames)
            console.log("ipcJurisdictionUniqueNames")
            console.log(ipcJurisdictionUniqueNames)
    
            expect(jurisdictionArrayDifference.length).to.equal(0)
        })
    })
})

describe("~~~ PRODUCT LINES ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(Url.Dev, Endpoint.ProductLines)
        PA_SHIM_STATES_DATA = testData.paShimStatesData
        PRODUCT_LINE_DATA = testData.ipcData as ProductLine[]
    });

    describe("[CM-730] - Product Lines - IPC matches pa_shim.", () => {
        it("Verify that the IPC products match the pa_shim products.", () => {
            const ipcProductLineUniqueNames:string[] = PRODUCT_LINE_DATA.map((entry) => {return entry.unique_name})
            const paShimProductsUniqueNames:string[] = GetUniqueArrayOfPaShimProducts(PA_SHIM_STATES_DATA)
    
            console.log("ipcProductLineUniqueNames")
            console.log(ipcProductLineUniqueNames)
            console.log("paShimProductsUniqueNames")
            console.log(paShimProductsUniqueNames)
    
            // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
            const productArrayDifference:string[] = ArrayDifference(ipcProductLineUniqueNames, paShimProductsUniqueNames)//ipcProductLineUniqueNames.filter((product) => !paShimProductsUniqueNames.includes(product));
    
            expect(productArrayDifference.length).to.equal(0)
        })
    })
})

