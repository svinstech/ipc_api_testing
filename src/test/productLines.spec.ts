import { expect } from "chai";
import { describe, it, before } from "mocha"
import { Url, Endpoint } from "../constants";
import { GetTestData } from "../dataCollection";
import { GetUniqueArrayOfPaShimProducts, ArrayDifference } from "../dataManipulation";
import { TestData, ProductLine, UsStateMapping } from "../interfaces/interfacesAndTypes";

let PA_SHIM_STATES_DATA:UsStateMapping;
let PRODUCT_LINE_DATA:ProductLine[]

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