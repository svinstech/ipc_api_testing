import { ComparisonObject, DataDifference, KeyValueDifferences, WbpDifferenceObject } from "./wbpTypes"
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
        // dataDifferenceObject.typeDiff = `Expected type: ${type1}. Actual type: ${type2}.`
        dataDifferenceObject.typeDiff = {expected: type1, actual: type2} as ComparisonObject
    }

    // Value comparison
    if (JSON.stringify(value1) != JSON.stringify(value2)) {
        // value1 = Array.isArray(value1) ? `[${value1}]` : value1
        // value2 = Array.isArray(value2) ? `[${value2}]` : value2
        // dataDifferenceObject.valueDiff = `Expected value: ${value1}. Actual value: ${value2}.`
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
        if (!keyIsShared) {
            missingKeys.push(element)
        } else {
            matchingKeys.push(element)
        }
    })
    
    objectKeys2.forEach((element) => {
        const keyIsShared:boolean = objectKeys1.includes(element)
        if (!keyIsShared) {
            extraKeys.push(element)
        }
    })

    const object2HasAllObject1Keys:boolean = missingKeys.length === 0
    const object1HasAllObject2Keys:boolean = extraKeys.length === 0
    const allKeysShared:boolean = object2HasAllObject1Keys && object1HasAllObject2Keys

    return numberOfKeysMatch && allKeysShared
}

/*

*/
export function compareWbpDataToLocalData(wbpObjects:object[], localObjects:object[]):WbpDifferenceObject[] {
    const wbpDifferences:WbpDifferenceObject[] = [] as WbpDifferenceObject[]

    for (let i = 0; i < wbpObjects.length; i++) {
        const ithWbpObject:any = wbpObjects[i]
        const ithLocalObject:any = localObjects[i]
        const keyValueDifferences:KeyValueDifferences = {} as KeyValueDifferences
    
        const missingKeys:string[] = []
        const extraKeys:string[] = []
        const matchingKeys:string[] = []
        const keysMatch:boolean = compareObjectKeys(ithWbpObject, ithLocalObject, missingKeys, extraKeys, matchingKeys)
    
        matchingKeys.forEach((matchingKey:string) => {
            const dataDifference:DataDifference = compareData(ithWbpObject[matchingKey], ithLocalObject[matchingKey])
            const differencesDetected:boolean = Object.keys(dataDifference).length > 0
            if (differencesDetected) {
                keyValueDifferences[matchingKey] = dataDifference
            }
        })
    
        if (!keysMatch) {
            wbpDifferences.push({
                wbpObject: ithWbpObject,
                localObject: ithLocalObject,
                missingKeys,
                extraKeys,
                keyValueDifferences
            } as WbpDifferenceObject)
        }
    }

    return wbpDifferences
}

/*

*/
export function getWbpData(appId:string):void {
    const url:string = `${CONSTANTS.WBP_DATA_BASE_URL}${appId}`

    axios(url)
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