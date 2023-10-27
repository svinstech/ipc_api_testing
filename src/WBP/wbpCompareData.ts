import { readFileSync, writeFileSync, existsSync } from 'fs'
import { WorkbookProcessorData, WbpAnalysisObject } from './wbpTypes'
import { compareWbpDataToLocalData, getWbpData } from './wbpFunctions'
import { CONSTANTS } from './wbpConstants'
import path from 'path'

async function main() {
            // Sample app ID: "3f28c18b-e9dc-4eba-811b-056b9ebb269e"
    const appId:string = process.argv[2] // index 2 is the first command line argument.
    await getWbpData(appId)

    // Assemble file paths.
    const filePathInput:string = path.join(CONSTANTS.WBP_DIRECTORY, CONSTANTS.WBP_TEST_DATA_FILE)
    const filePathOutput:string = path.join(CONSTANTS.WBP_DIRECTORY, CONSTANTS.WBP_COMPARISON_OUTPUT_FILE)

    if (!existsSync(filePathInput)) {
        throw(`!!! Error: Input file path doesn't not exist: ${filePathInput}`)
    }

    // Read input data.
    const inputData:string = readFileSync(filePathInput, {encoding: 'utf-8'})
    const inputDataObject:WorkbookProcessorData = JSON.parse(inputData)

    // Extract the data that will be compared.
    const wbpObjects:object[] = inputDataObject.wbp.limits_raw
    const localObjects:object[] = inputDataObject.local.limits_raw

    if (wbpObjects == undefined) {
        throw("!!! Error: wbp limits_raw data is undefined.")
    }

    if (localObjects == undefined) {
        throw("!!! Error: local limits_raw data is undefined.")
    }

    // Perform the data comparison.
    const wbpDifferences:WbpAnalysisObject = compareWbpDataToLocalData(wbpObjects, localObjects)

    // Populate output file.
    writeFileSync(filePathOutput, JSON.stringify(wbpDifferences))
}

main();
