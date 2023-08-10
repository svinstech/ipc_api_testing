# # Insurance Products Core (IPC) API test suite

#### Author: Kellen Kincaid, Senior SDET

### RUNNING THE TESTS LOCALLY
Firstly, need to be on the VPN. Follow [these instructions](https://vouchinc.atlassian.net/wiki/spaces/devops/pages/2311979049/VPN+Access) if you need access.
- If you're unable to download the VPN profile, you may need to [submit a Help Desk ticket](https://vouchinc.atlassian.net/servicedesk/customer/portal/1) to get permission. 

Secondly, you'll need a GitHub personal access token. You can learn how to generate one [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
Thirdly, you'll need to create a file at the root of this project called `.env`.
- In that file, add:
    - `GITHUB_TOKEN=<yourGitHubPersonalAccessToken>`
    - `ENV=Dev`
        - For future reference, here are all of the acceptable `ENV` values:
            - `Dev`
            - `Stg`
            - `Uat`
            - `Prod`
- Replace everything to the right of `GITHUB_TOKEN=` with your own GitHub personal access token.
- This file is in the `.gitignore`, so it will not be included in any merges.

To run all the tests, enter this in the command line: `yarn run test`
Otherwise, you can run tests for individual endpoints with one of these commands:
`yarn run test:health`
`yarn run test:jurisdictions`
`yarn run test:jurisdictionVersions`
`yarn run test:productLines`

### RUNNING TESTS IN CIRCLECI
- In the CircleCI config, ensure that the job running the tests has: `resource_class: svinstech/dev`
    - This will fill the same role as being on the VPN when it comes to endpoint access.
- Ensure that you set the target environment to staging, as this is the only environment that `svinstech/dev` has access to.
- The tests are scheduled to automatically run in `main` every Wednesday at midnight EST (4am UTC)
