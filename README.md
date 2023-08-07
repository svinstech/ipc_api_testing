# IPC API testing
Automated api tests for IPC (Insurance Products Core)

To run the test, enter this in the command line: 
    yarn run test

This will run the corresponding script listed in package.json.

The point of these tests is to verify that the Insurance Product Core (IPC) API endpoints work properly.

RUNNING TESTS LOCALLY
-To run the tests locally, you'll need to create a file at the root of this project called '.env'.
-In that file, add:
    GITHUB_TOKEN=<yourGitHubPersonalAccessToken>
    ENV=Dev
-Replace everything to the right of 'GITHUB_TOKEN=' with your own GitHub personal access token.
-This file is in the .gitignore, so it will not be included in any merges.

RUNNING TESTS IN CIRCLECI
-In the CircleCI config, ensure that you set the ENV variable (seen above) to 'Stg' like this:
    echo "ENV=Stg" > .env.

NOTES:
-As of 8/7/2023:
    -The tests can only be run locally if youre connected to the VPN.
        -And even then, they can only be run in the dev environment.
    -When CircleCI executes the job to run the tests, they must run in the Staging environment.


Author: Kellen Kincaid (Senior SDET)
Cerca: Summer 2023
