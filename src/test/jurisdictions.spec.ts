import { expect } from "chai";
import { describe, it, before } from "mocha"
import { Endpoint, ENVIRONMENT } from "../constants";
import { GetTestData, IsGoodResponse } from "../dataCollection";
import { GetUniqueArrayOfIpcStates, GetUniqueArrayOfPaShimStates, ArrayDifference } from "../dataManipulation";
import { TestData, Jurisdiction, UsState, UsStateMapping, DataAndStatus } from "../interfaces/interfacesAndTypes";

let PA_SHIM_STATES_RESPONSE:DataAndStatus<UsStateMapping>;
let JURISDICTION_RESPONSE:DataAndStatus<Jurisdiction[]>

describe("~~~ JURISDICTIONS ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(ENVIRONMENT, Endpoint.Jurisdictions)
        PA_SHIM_STATES_RESPONSE = testData.paShimStatesData
        JURISDICTION_RESPONSE = testData.ipcData as DataAndStatus<Jurisdiction[]>
    });

    it("Verify that the PA_SHIM data was retrieved.", () => {
        expect(IsGoodResponse(PA_SHIM_STATES_RESPONSE.status)).to.be.true
    })

    it("Verify that the JURISDICTION data was retrieved.", () => {
        expect(IsGoodResponse(JURISDICTION_RESPONSE.status)).to.be.true
    })

    describe("[CM-729] - Jurisdictions - 1 jurisdiction per state.", () => {
        it("Verify that there is exactly 1 jurisdiction per state.", () => {
            // Get list of unique ipc jurisdictions
            const ipcJurisdictionUniqueNames:string[] = JURISDICTION_RESPONSE.data.map((entry) => {
                return entry.unique_name.replace("US-","")
            })
    
            console.log("IPC jurisdiction Names (array)")
            console.log(ipcJurisdictionUniqueNames)

            console.log("IPC jurisdiction Names (set)")
            console.log([...new Set(ipcJurisdictionUniqueNames)])
    
            const nameCount = ipcJurisdictionUniqueNames.length
            const uniqueNameCount = [...new Set(ipcJurisdictionUniqueNames)].length

            // If the original arrary's length is equal to the number of its unique elements, then the original array only contained unique elements. In other words, no duplicates.
            expect(nameCount, `Number of duplicates = ${Math.abs(nameCount - uniqueNameCount)}`).to.equal(uniqueNameCount)
        })
    
        it("Verify that IPC has the same jurisdictions as pa_shim.", () => {
            // Get list of unique ipc jurisdictions
            const ipcJurisdictionUniqueNames:UsState[] = GetUniqueArrayOfIpcStates(JURISDICTION_RESPONSE.data)
    
            // Get list of unique pa_shim jurisdictions
            const paShimJurisdictionUniqueNames:UsState[] = GetUniqueArrayOfPaShimStates(PA_SHIM_STATES_RESPONSE.data)
    
            // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
            const jurisdictionArrayDifference:string[] = ArrayDifference(ipcJurisdictionUniqueNames, paShimJurisdictionUniqueNames)
    
            console.log("paShimJurisdictionUniqueNames")
            console.log(paShimJurisdictionUniqueNames)
            console.log("ipcJurisdictionUniqueNames")
            console.log(ipcJurisdictionUniqueNames)
    
            const errorMessage:any = jurisdictionArrayDifference
            expect(jurisdictionArrayDifference.length, errorMessage).to.equal(0)
        })
    })
})
