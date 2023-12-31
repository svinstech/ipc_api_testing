export interface DataAndStatus<T> {
    data: T,
    status: number
}

export interface Jurisdiction {
    id: string,
    unique_name: string
}

export interface JurisdictionVersion {
    id: string,
    version_number: string,
    effective_date: string,
    approved_date: string,
    product_line_unique_name: string,
    jurisdiction_unique_name: string
}

export interface PaShimUsStatesYaml {
    default: UsStateMapping,
    development: UsStateMapping,
    test: UsStateMapping,
    staging: UsStateMapping,
    uat: UsStateMapping,
    dev: UsStateMapping,
    production: UsStateMapping
}

export interface ProductLine {
    id: string,
    unique_name: string,
    friendly_name: string,
    fronting_carrier_unique_name: string
}

export type Products = "BOP" | "CEM" | "CPP" | "CRIME" | "MPL" | "NY_D_AND_O" | "NY_TPL"

export interface TestData {
    paShimStatesData : DataAndStatus<UsStateMapping>,
    ipcData : DataAndStatus<string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[]>
}

export type UsState = "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA" | "HI" | "ID" | "IL" 
                    | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" 
                    | "NE" | "NV" | "NH" | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" 
                    | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY"

export interface UsStateData {
    full_name: string,
    live_at: string,
    start_hour: number,
    time_zone: string,
    products: Products[]
}

export type UsStateMapping = {
    [key in UsState]: UsStateData
}
