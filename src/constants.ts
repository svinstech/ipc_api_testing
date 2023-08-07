

export enum Url {
    Dev = "https://insurance-products-core.vouch-dev.us",
    Stg = "https://insurance-products-core.vouch-stg.us",
    Uat = "https://insurance-products-core.vouch-uat.us",
    Prod = "https://insurance-products-core.vouch.us"
}

export enum Endpoint {
    Health = "health",
    Jurisdictions = "jurisdictions",
    JurisdictionVersions = "jurisdiction-versions",
    ProductLines = "product-lines"
}

export const ENVIRONMENT :Url = Url[process.env.ENV as keyof typeof Url];

