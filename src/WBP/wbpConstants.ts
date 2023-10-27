
export const CONSTANTS = {
    WBP_DIRECTORY: "src/WBP/",
    WBP_TEST_DATA_FILE: "wbp.testData.json",
    WBP_COMPARISON_OUTPUT_FILE: "wbp.comparison.json",
    WBP_DATA_BASE_URL: "https://uat-api.vouch-stg.us/v1/insecure_dev_backdoor/wbp_dump?application_id=",
    DOLLAR_FORMATTER: new Intl.NumberFormat("en-US", {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
     })
}
