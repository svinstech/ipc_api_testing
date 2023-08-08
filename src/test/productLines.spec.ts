import { expect } from "chai";
import { describe, it, before } from "mocha"
import { Endpoint, ENVIRONMENT } from "../constants";
import { GetTestData, IsGoodResponse } from "../dataCollection";
import { GetUniqueArrayOfPaShimProducts, ArrayDifference } from "../dataManipulation";
import { TestData, ProductLine, UsStateMapping, DataAndStatus } from "../interfaces/interfacesAndTypes";

let PA_SHIM_STATES_RESPONSE:DataAndStatus<UsStateMapping>;
let PRODUCT_LINE_RESPONSE:DataAndStatus<ProductLine[]>

describe("~~~ PRODUCT LINES ~~~", () => {
    before("Get the test data.", async () => {
        const testData:TestData = await GetTestData(ENVIRONMENT, Endpoint.ProductLines)
        PA_SHIM_STATES_RESPONSE = testData.paShimStatesData
        PRODUCT_LINE_RESPONSE = testData.ipcData as DataAndStatus<ProductLine[]>
    });

    it("Verify that the PA_SHIM data was retrieved.", () => {
        expect(IsGoodResponse(PA_SHIM_STATES_RESPONSE.status)).to.be.true
    })

    it("Verify that the JURISDICTION data was retrieved.", () => {
        expect(IsGoodResponse(PRODUCT_LINE_RESPONSE.status)).to.be.true
    })

    describe("[CM-730] - Product Lines - IPC matches pa_shim.", () => {
        it("Verify that the IPC products match the pa_shim products.", () => {
            const ipcProductLineUniqueNames:string[] = PRODUCT_LINE_RESPONSE.data.map((entry) => {return entry.unique_name})
            const paShimProductsUniqueNames:string[] = GetUniqueArrayOfPaShimProducts(PA_SHIM_STATES_RESPONSE.data)
    
            console.log("ipcProductLineUniqueNames")
            console.log(ipcProductLineUniqueNames)
            console.log("paShimProductsUniqueNames")
            console.log(paShimProductsUniqueNames)
    
            // If the difference between the arrays is 0, then they contain an identical set of jurisdictions.
            const productArrayDifference:string[] = ArrayDifference(ipcProductLineUniqueNames, paShimProductsUniqueNames)//ipcProductLineUniqueNames.filter((product) => !paShimProductsUniqueNames.includes(product));
    
            const errorMessage:any = productArrayDifference
            expect(productArrayDifference.length, errorMessage).to.equal(0)
        })
    })
})