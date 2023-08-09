import { expect } from "chai"
import { describe, it, before } from "mocha"
import { GetTestData, HitEndpoint, IsGoodResponse } from '../dataCollection'
import { LogArrayDifference } from '../dataCommunication'
import { GetUniqueArrayOfIpcStates, ArrayDifference, GetUniqueArrayOfPaShimStates } from '../dataManipulation'
import { UsState, UsStateMapping, JurisdictionVersion, TestData, DataAndStatus } from '../interfaces/interfacesAndTypes'
import { Endpoint, ENVIRONMENT } from '../constants'
import shuffle from 'shuffle-array'

let PA_SHIM_STATES_RESPONSE:DataAndStatus<UsStateMapping>;
let JURISDICTION_VERSION_RESPONSE:DataAndStatus<JurisdictionVersion[]>

describe("~~~ JURISDICTION VERSION ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(ENVIRONMENT, Endpoint.JurisdictionVersions)
        PA_SHIM_STATES_RESPONSE = testData.paShimStatesData
        JURISDICTION_VERSION_RESPONSE = testData.ipcData as DataAndStatus<JurisdictionVersion[]>
    });

    it("Verify that the PA_SHIM data was retrieved.", () => {
        expect(IsGoodResponse(PA_SHIM_STATES_RESPONSE.status)).to.be.true
    })

    it("Verify that the JURISDICTION data was retrieved.", () => {
        expect(IsGoodResponse(JURISDICTION_VERSION_RESPONSE.status)).to.be.true
    })

    describe("[CM-726] - Jurisdiction Versions - Endpoint should return all sets of products and states.", () => {
        it("Verify that pa_shim and IPC use the exact same set of states.", () => {
            const paShimStates:UsState[] = GetUniqueArrayOfPaShimStates(PA_SHIM_STATES_RESPONSE.data);
    
            //testing
            console.log("paShimStates")
            console.log(paShimStates)

            const ipcStates:UsState[] = GetUniqueArrayOfIpcStates(JURISDICTION_VERSION_RESPONSE.data);
    
            //testing
            console.log("ipcStates")
            console.log(ipcStates)
            
            // If the difference between the arrays is 0, then they contain an identical set of states.
            const stateArrayDifference:UsState[] = ArrayDifference(paShimStates, ipcStates)
            
            // Log information about failures.
            LogArrayDifference(stateArrayDifference)
    
            const errorMessage:any = stateArrayDifference
            expect(stateArrayDifference.length, errorMessage).to.equal(0);
        })
    
        it("Verify that each state in IPC has the same products as listed in pa_shim.", () => {
            const jurisdictionUniqueNames:UsState[] = JURISDICTION_VERSION_RESPONSE.data.map((jvData) => jvData.jurisdiction_unique_name.replace("US-","")) as UsState[];
            const ipcStates:UsState[] = [...new Set(jurisdictionUniqueNames)]
    
            // For each state, compare their pa_shim product list to their IPC product list.
            ipcStates.forEach((state) => {
                const ipcJurisdictionVersionDataForThisState:JurisdictionVersion[] = JURISDICTION_VERSION_RESPONSE.data.filter((entry) => {
                    return entry.jurisdiction_unique_name === `US-${state}`;
                })
    
                const ipcProductsForThisState = ipcJurisdictionVersionDataForThisState.map((entry) => {
                    return entry.product_line_unique_name;
                })
    
                // If the difference between the arrays is 0, then they contain an identical set of products.
                const paShimProductsForThisState:string[] = (PA_SHIM_STATES_RESPONSE.data as UsStateMapping)[state].products
                const productArrayDifference:string[] = ArrayDifference(paShimProductsForThisState, ipcProductsForThisState)

                // Log information about failures.
                LogArrayDifference(productArrayDifference)

                const errorMessage:any = productArrayDifference
                expect(productArrayDifference.length, errorMessage).to.equal(0)
            })
        })
    })
    
    describe("[CM-727] - Jurisdiction Versions - Live dates should match those in pa_shim.", () => {
        it("Verify that each jurisdiction's effective date in IPIM matches that jurisdiction's live date in pa_shim.", () => {
            type LiveDateMapping = {
                [key in UsState] : string
            }
    
            const paShimLiveDates:LiveDateMapping = {} as LiveDateMapping;
            Object.entries(PA_SHIM_STATES_RESPONSE.data as object).forEach((entry) => {
                const state:UsState = entry[0] as UsState;
                const liveDate:string = entry[1].live_at;

                paShimLiveDates[state] = liveDate;
            })
    
            // Pa shim versions are all implied to be 1.0.0, so we must exclude all ipc jurisdiction versions that differ from that.
            const ipcJurisdictionsVersion1_0_0:JurisdictionVersion[] = JURISDICTION_VERSION_RESPONSE.data.filter((entry) => {
                return entry.version_number === "1.0.0";
            })

            ipcJurisdictionsVersion1_0_0.forEach((entry) => {
                const state:UsState = entry.jurisdiction_unique_name.replace("US-","") as UsState
                const liveDate:string = entry.effective_date

                //testing
                console.log(`State: ${state}`)
                console.log(`Pa_shim live date: ${paShimLiveDates[state]}`)
                console.log(`IPC live date: ${liveDate}`)

                const paShimDateFormatted = new Date(paShimLiveDates[state]).toISOString();
                const ipcDateFormatted = new Date(liveDate).toISOString();

                expect(paShimDateFormatted, state).to.equal(ipcDateFormatted)
            })
        })
    })
    
    describe("[CM-728] - Jurisdiction Versions - No duplicates.", () => {
        it("Verify that there are no duplicate combinations of product, jurisdiction, & date.", () => {
            const productJurisdictionDateStrings:string[] = []
            
            JURISDICTION_VERSION_RESPONSE.data.forEach((entry) => {
                const productJurisdictionDateString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.effective_date)
                productJurisdictionDateStrings.push(productJurisdictionDateString)
            })
    
            //testing
            const subArraySize = 10
            console.log(`${subArraySize} random entries from productJurisdictionDateStrings`)
            console.log(shuffle.pick(productJurisdictionDateStrings, { 'picks': subArraySize }))

            // If the original arrary's length is equal to the number of its unique elements, then the original array only contains unique elements. In other words, no duplicates.
            expect(productJurisdictionDateStrings.length, ).to.equal([...new Set(productJurisdictionDateStrings)].length)
        })
    
        it("Verify that there are no duplicate combinations of product, jurisdiction, & version.", () => {
            const productJurisdictionVersionStrings:string[] = []
            
            JURISDICTION_VERSION_RESPONSE.data.forEach((entry) => {
                const productJurisdictionVersionString:string = entry.product_line_unique_name.concat(entry.jurisdiction_unique_name).concat(entry.version_number)
                productJurisdictionVersionStrings.push(productJurisdictionVersionString)
            })

            //testing
            const subArraySize = 10
            console.log(`${subArraySize} random entries from productJurisdictionVersionStrings`)
            console.log(shuffle.pick(productJurisdictionVersionStrings, { 'picks': subArraySize }))
    
            const stringCount = productJurisdictionVersionStrings.length;
            const uniqueStringCount = [...new Set(productJurisdictionVersionStrings)].length;

            // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
            expect(stringCount, `Number of duplicates: ${Math.abs(stringCount - uniqueStringCount)}`).to.equal(uniqueStringCount)
        })
    })

    describe("[CM-747] - Jurisdiction Version - Query.", () => {
        it("Verify that jurisdition versions can be queried.", () => {
            // Query each jurisdiction version individually.
            JURISDICTION_VERSION_RESPONSE.data.forEach((entry) => {
                const endpoint:string = `${Endpoint.JurisdictionVersions}/${entry.id}`

                HitEndpoint(ENVIRONMENT, endpoint).then((response) => {
                    const specificJurisdictionVersion: DataAndStatus<JurisdictionVersion> = response as DataAndStatus<JurisdictionVersion>
                    expect(specificJurisdictionVersion.data).to.equal(entry)
                })
            })
        })

        it("Verify that multiple jurisdition versions can be queried simultaneously.", () => {
            const jurisdictionVersion0:JurisdictionVersion = JURISDICTION_VERSION_RESPONSE.data[0]
            const jurisdictionVersion1:JurisdictionVersion = JURISDICTION_VERSION_RESPONSE.data[1]
            
            const endpoint:string = `${Endpoint.JurisdictionVersions}?id=${jurisdictionVersion0.id}&id=${jurisdictionVersion1.id}`

            HitEndpoint(ENVIRONMENT, endpoint).then((response) => {
                const specificJurisdictionVersions: DataAndStatus<JurisdictionVersion[]> = response as DataAndStatus<JurisdictionVersion[]>
                expect(specificJurisdictionVersions.data[0]).to.equal(jurisdictionVersion0)
                expect(specificJurisdictionVersions.data[1]).to.equal(jurisdictionVersion1)
            })
            
        })

        it("Verify that fake IDs don't retrieve a jurisdiction version.", () => {
            const endpoint:string = `${Endpoint.JurisdictionVersions}/555555`

            HitEndpoint(ENVIRONMENT, endpoint).then((response) => {
                const specificJurisdictionVersion: DataAndStatus<JurisdictionVersion> = response as DataAndStatus<JurisdictionVersion>
                expect(IsGoodResponse(specificJurisdictionVersion.status)).to.be.false

                expect(JURISDICTION_VERSION_RESPONSE.data).to.not.include(specificJurisdictionVersion.data)
            })
        })
    })
})


