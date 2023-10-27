import { ComparisonObject, DataDifference, KeyValueDifferences, WbpDifferenceObject, KeyDifferenceTotalObject } from "./wbpTypes"
import path from 'path'
import axios from 'axios'
import { AxiosResponse } from 'axios'
import { IsGoodResponse } from '../dataCollection'
import { writeFileSync } from 'fs'
import { CONSTANTS } from './wbpConstants'

/*
    Compares 2 values and poplates a DifferenceObject with info about how the 2 values differ.
    If the 2 values are the identical, the DifferenceObject will be empty.

    Returns the DifferenceObject.
*/
function compareData(value1:any, value2:any):DataDifference {
    const dataDifferenceObject:DataDifference = {} as DataDifference
    const value1IsArray:boolean = Array.isArray(value1)
    const value2IsArray:boolean = Array.isArray(value2)

    // Type comparison
    const type1:string = value1IsArray ? "array" : typeof(value1)
    const type2:string = value2IsArray ? "array" : typeof(value2)
    if (type1 !== type2) {
        dataDifferenceObject.typeDiff = {expected: type1, actual: type2} as ComparisonObject
    }

    // Value comparison
    if (JSON.stringify(value1) != JSON.stringify(value2)) {
        dataDifferenceObject.valueDiff = {expected: value1, actual: value2} as ComparisonObject
    }

    return dataDifferenceObject
}

/*
    The missingKeys and extraKeys arguments are expected to be empty at the start.
    missingKeys will be populated with keys from object1 that are missing from object2.
    extraKeys will be populated with keys from object2 that are not present in object1.
    matchingKeys will be populated with all keys from object1 that are present in object2.

    Returns true if object1's keys and object2's keys are the same. False otherwise.
*/
function compareObjectKeys(object1:object, object2:object, missingKeys:string[], extraKeys:string[], matchingKeys:string[]):boolean {
    const objectKeys1:string[] = Object.keys(object1)
    const objectKeys2:string[] = Object.keys(object2)
    const numberOfKeysMatch:boolean = objectKeys1.length === objectKeys2.length
   
    objectKeys1.forEach((element) => {
        const keyIsShared:boolean = objectKeys2.includes(element)
        const wbpKeysToIgnore:string[] = [] // These keys will NOT count as missing keys.
        if (!keyIsShared && !wbpKeysToIgnore.includes(element)) {
            missingKeys.push(element)
        } else if (keyIsShared) {
            matchingKeys.push(element)
        }
    })
    
    objectKeys2.forEach((element) => {
        const keyIsShared:boolean = objectKeys1.includes(element)
        const localKeysToIgnore:string[] = ["UW selector"] // These keys will NOT count as extra keys.
        if (!keyIsShared && !localKeysToIgnore.includes(element)) {
            extraKeys.push(element)
        }
    })

    const object2HasAllObject1Keys:boolean = missingKeys.length === 0
    const object1HasAllObject2Keys:boolean = extraKeys.length === 0
    const allKeysShared:boolean = object2HasAllObject1Keys && object1HasAllObject2Keys

    return numberOfKeysMatch && allKeysShared
}

/*
    Find all discrepancies between the WBP data and the local data.

    wbpObjects is the "limits_raw" wbp data from the input file.
    localObjects is the "limits_raw" local data from the input file.

    The input file is generated with the getWbpData() function.
*/
export function compareWbpDataToLocalData(wbpObjects:object[], localObjects:object[]):WbpDifferenceObject[] {
    const wbpDifferences:WbpDifferenceObject[] = [] as WbpDifferenceObject[]
    const keyDifferenceTotals:KeyDifferenceTotalObject = {} as KeyDifferenceTotalObject

    for (let i = 0; i < wbpObjects.length; i++) {
        const ithWbpObject:any = wbpObjects[i]
        const localObjectsThatMatchThePrimaryKey:any = localObjects.filter((localObject:any) => {
            const matchingProductTag:boolean = localObject["Product Tag"] === ithWbpObject["Product Tag"]
            const matchingCoverageTag:boolean = localObject["Coverage Tag"] === ithWbpObject["Coverage Tag"]
            const matchingLimitKey:boolean = localObject["Limit Key"] === ithWbpObject["Limit Key"]
            const matchingState:boolean = localObject["State"] === ithWbpObject["State"]

            const matchingPrimaryKey:boolean = matchingProductTag && matchingCoverageTag && matchingLimitKey && matchingState

            return matchingPrimaryKey
        })

        //testing
        // console.log(`localObjectsThatMatchThePrimaryKey length: ${localObjectsThatMatchThePrimaryKey.length}`)
        // writeFileSync("deleteme.localObjectsThatMatchThePrimaryKey.json", JSON.stringify(localObjectsThatMatchThePrimaryKey))
        // throw "throwing for testing purposes"

        let matchingLocalObject:any = localObjectsThatMatchThePrimaryKey[0]

        // If there is no match, represent the 'matching local object' as an emptyy object.
        if (matchingLocalObject == undefined) {
            matchingLocalObject = {}
        }

        const keyValueDifferences:KeyValueDifferences = {} as KeyValueDifferences
    
        const missingKeys:string[] = []
        const extraKeys:string[] = []
        const matchingKeys:string[] = []
        const keysMatch:boolean = compareObjectKeys(ithWbpObject, matchingLocalObject, missingKeys, extraKeys, matchingKeys)
    
        matchingKeys.forEach((matchingKey:string) => {
            let localObjectMatchingValue:any
            switch (matchingKey) {
                case "Limit":
                case "MIN":
                case "MAX":
                    localObjectMatchingValue = matchingLocalObject[matchingKey]/100 // The local object has these values in cents. Here we convert them to dollars, to match the wbp object.
                    break
                default:
                    localObjectMatchingValue = matchingLocalObject[matchingKey]
            }

            const dataDifference:DataDifference = compareData(ithWbpObject[matchingKey], localObjectMatchingValue)
            const differencesDetected:boolean = Object.keys(dataDifference).length > 0
            if (differencesDetected) {
                switch (matchingKey) {
                    case "Limit":
                    case "MIN":
                    case "MAX":
                        // Communicate that these are dollar amounts being compared.
                        dataDifference.valueDiff.expected = CONSTANTS.DOLLAR_FORMATTER.format(dataDifference.valueDiff.expected)
                        dataDifference.valueDiff.actual = CONSTANTS.DOLLAR_FORMATTER.format(dataDifference.valueDiff.actual)
                        break
                }

                keyValueDifferences[matchingKey] = dataDifference
                
                keyDifferenceTotals[matchingKey] ??= 0 // Defaults the value to 0 if the key does not yet exist.
                keyDifferenceTotals[matchingKey] += 1  // Increments the value.
            }
        })
    
        if (!keysMatch) {
            wbpDifferences.push({
                wbpObject: ithWbpObject,
                localObject: matchingLocalObject,
                missingKeys,
                extraKeys,
                keyValueDifferences
            } as WbpDifferenceObject)
        }
    }

    return wbpDifferences
}

/*
    Get the WBP & local data that corresponds to the appID argument.
    The appID is the applicatino ID for an application. Simple as.

    Generates and populates the input file, which will be used for the data comparison.
*/
export async function getWbpData(appId:string):Promise<void> {
    const url:string = `${CONSTANTS.WBP_DATA_BASE_URL}${appId}`

    await axios(url)
    .then((response:AxiosResponse<any, any>) => {
        // Check response status.
        const statusIsGood:boolean = IsGoodResponse(response.status)
        if (!statusIsGood) {throw `!!! Error retrieving WBP data from url: ${url}.\n\n Bad status code: ${response.status}`}

        // Write data to file, if response was good.
        const data = response.data
        const filePath = path.join(CONSTANTS.WBP_DIRECTORY, CONSTANTS.WBP_TEST_DATA_FILE)
        writeFileSync(filePath, JSON.stringify(data))
    }).catch((error:Error) => {
        throw(`!!! Error retrieving WBP data from url: ${url}.\n\nThe Error: ${error}`)
    })
}