
export type WorkbookProcessorData = {
    wbp:WbpLimitData
    local:WbpLimitData
}

export type WbpLimitData = {
    time:number,
    limits_raw:object[]
}

export type ComparisonObject = {
    expected:any
    actual:any
}

export type DataDifference = {
    typeDiff:ComparisonObject,
    valueDiff:ComparisonObject
}

export type KeyValueDifferences = {
    [key in string]: DataDifference
}

export type WbpDifferenceObject = {
    wbpObject: object,
    localObject: object,
    missingKeys: string[],
    extraKeys: string[],
    keyValueDifferences: KeyValueDifferences
}

export type KeyDifferenceTotalObject = {
    [key in string]: number
}

export type WbpAnalysisObject = {
    keyDifferenceTotals: KeyDifferenceTotalObject,
    wbpDifferences: WbpDifferenceObject[]
}