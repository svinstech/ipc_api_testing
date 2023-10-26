import { readFileSync, writeFileSync, existsSync } from 'fs'
import { WorkbookProcessorData, WbpDifferenceObject } from './wbpTypes'
import { compareWbpDataToLocalData, getWbpData } from './wbpFunctions'
import { CONSTANTS } from './wbpConstants'
import path from 'path'

// Sample app ID: "3f28c18b-e9dc-4eba-811b-056b9ebb269e"
const appId:string = process.argv[2] // index 2 is the first command line argument.
getWbpData(appId)

/*
    TODO - Make the comparison using the primary key below,
           instead of comparing by array index.

    --PRIMARY KEY--
    Product Tag + Coverage Tag + Limit Key + State
*/

// Assemble file paths.
const filePathInput:string = path.join(CONSTANTS.WBP_DIRECTORY, CONSTANTS.WBP_TEST_DATA_FILE)
const filePathOutput:string = path.join(CONSTANTS.WBP_DIRECTORY, CONSTANTS.WBP_COMPARISON_OUTPUT_FILE)

if (!existsSync(filePathInput)) {
    throw(`Input file path doesn't not exist: ${filePathInput}`)
}

// Read input data.
const inputData:string = readFileSync(filePathInput, {encoding: 'utf-8'})
const inputDataObject:WorkbookProcessorData = JSON.parse(inputData)

// Extract the data that will be compared.
const wbpObjects:object[] = inputDataObject.wbp.limits_raw
const localObjects:object[] = inputDataObject.local.limits_raw

// // // // // // // // // // // // // // // // // // // // // // //
//                      TODO - Extra credit                       //
// Highlight discrepancies between these keys: "Available", "MIN" //
// // // // // // // // // // // // // // // // // // // // // // //

// Perform the data comparison.
const wbpDifferences:WbpDifferenceObject[] = compareWbpDataToLocalData(wbpObjects, localObjects)

// Populate output file.
writeFileSync(filePathOutput, JSON.stringify(wbpDifferences))

