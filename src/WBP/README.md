# Workbook Processor: Data Comparison Tool

###### Author: Kellen Kincaid, Senior SDET

### About This Tool
This tool is used to compare the Workbook Processor data to the corresponding Local data. The idea was to find any and all discrepancies, but this ending up being impossible. This is because the Workbook Processor data has pre-underwriting limits and the Local data as post-underwriting limits, meaning that any limit-discrepancies are meaningless.

Nevertheless, this tool could still prove useful in the future for other data-comparison endeavors.

### How To Use

- The file to run is `src/WBP/wbpCompareData.ts`.
- This file takes one command line argument: An application ID.
- Here is an example of how to run this file in the command line:
-- `ts-node src/WBP/wbpCompareData.ts "Your_Desired_Application_ID"` 
-- Here is a sample application ID: `3f28c18b-e9dc-4eba-811b-056b9ebb269e`
- The data retrieved is from UAT, using this URL:
--https://uat-api.vouch-stg.us/v1/insecure_dev_backdoor/wbp_dump?application_id=Your_Desired_Application_ID
