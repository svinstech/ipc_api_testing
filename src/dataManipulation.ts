import { Jurisdiction, JurisdictionVersion, ProductLine, UsState, UsStateMapping } from "./interfaces/interfacesAndTypes";


/*
    Returns an array that only contains the elements that are NOT shared between the 2 input arrays.

    NOTE: The 2 input array must share a the same type.
*/
export function ArrayDifference<T>(_array1:T[], _array2:T[]) :T[] {
    return _array1.filter((entry) => !_array2.includes(entry));
}

/*
    Returns an array of all the unique products present in the given ProductLine array.
*/
export function GetUniqueArrayOfIpcProducts(_productLineData:ProductLine[]) {
    return _productLineData.map((entry) => {return entry.unique_name})
}

/*
    Takes the jurisdiction version data and returns an array of its unique states.
*/
export function GetUniqueArrayOfIpcStates(_jurisdictionVersionData:JurisdictionVersion[]|Jurisdiction[]) :UsState[] {
    let returnValue;
    
    try {
        const ipcJurisdictionNames:UsState[] = (_jurisdictionVersionData as JurisdictionVersion[]).map((entry) => {
            return entry.jurisdiction_unique_name.replace("US-","")
        }) as UsState[];

        returnValue = [...new Set(ipcJurisdictionNames)]
    } catch {
        const ipcJurisdictionUniqueNames:UsState[] = (_jurisdictionVersionData as Jurisdiction[]).map((entry) => {
            return entry.unique_name.replace("US-","")
        })  as UsState[]

        returnValue = ipcJurisdictionUniqueNames
    }

    return returnValue
}

/*
    Returns an array of all the unique products present in the given UsStateMapping object.
*/
export function GetUniqueArrayOfPaShimProducts(_paShimStatesData:UsStateMapping) :string[] {
    const paShimProducts:string[] = Object.values(_paShimStatesData as Object).map((entry) => {return entry.products}).flat()
    return [...new Set(paShimProducts)]
}

/*
    Takes the pa_shim version data and returns an array of its unique states.
*/
export function GetUniqueArrayOfPaShimStates(_paShimStatesData:UsStateMapping) :UsState[] {
    return Object.keys(_paShimStatesData as object) as UsState[];
}




