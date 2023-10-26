import axios from 'axios'
import { AxiosResponse } from 'axios'
import { load } from 'js-yaml'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { Jurisdiction, JurisdictionVersion, PaShimUsStatesYaml, ProductLine, TestData, UsStateMapping, DataAndStatus } from './interfaces/interfacesAndTypes'
import { Url, Endpoint } from './constants'

/*
    Returns true if the given response code is a 2xx code. False otherwse.
*/
export function IsGoodResponse(_responseCode:number) :boolean {
    return _responseCode >= 200 && _responseCode < 300;
}

/*
    Retrieves the data from config/UsStates.yml within the pa_shim repo in GitHub.
    Then that data gets saved to a .yml file.
    Then that yml data gets converted to json and saved to a .json file.
    The name of these files will be the same (excluding the file extension, of course)
    The name of these files may be provided as an input.
    If the name is not provided, then it will default to "paShimUsStates"
    These 
*/
export async function GetPaShimUsStateData(_fileNameWithoutExtension?:string) :Promise<DataAndStatus<UsStateMapping>> {
    _fileNameWithoutExtension ??= "paShimUsStates"

    const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_API_TOKEN,
          collectedDataDirectoryName = "collected_data",
          paShimUsStatesYamlFileName = `${collectedDataDirectoryName}/${_fileNameWithoutExtension}.yml`,
          paShimUsStatesJsonFileName = `${collectedDataDirectoryName}/${_fileNameWithoutExtension}.json`,
          yamlUrl = "https://api.github.com/repos/svinstech/pa_shim/git/blobs/3a81ca37fc0df296ea76e60807b5d6e4a9468b73" // Points to the config/us_states.yml in pa_shim.

    let output:DataAndStatus<any> = {data:{},status:200}
    let paShimUsStatesData:UsStateMapping|undefined;

    // If the pa_shim json file exists, get its data. Otherwise, retrieve it and then get its data.
    if (existsSync(paShimUsStatesJsonFileName)) {
        const paShimUsStatesData_stringified:string = readFileSync(paShimUsStatesJsonFileName, {encoding: 'utf-8'})
        paShimUsStatesData = JSON.parse(paShimUsStatesData_stringified).default; // NOTICE: I'm targeting default here.
    } else {
        await axios({
            url : yamlUrl,
            headers : {
                "Authorization" : `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
                "X-GitHub-Api-Version" : "2022-11-28",
                "Accept" : "application/vnd.github.raw"
            }
        }).then((_response:AxiosResponse<any, any>) => {
            output.status = _response.status
            const yamlData:string = _response.data

            // Create directory for collected data
            mkdirSync(collectedDataDirectoryName)

            // Convert pa_shim's us_states.yml to json
            writeFileSync(paShimUsStatesYamlFileName, yamlData);
            const jsonifiedYaml:PaShimUsStatesYaml = load(readFileSync(paShimUsStatesYamlFileName, {encoding: 'utf-8'})) as PaShimUsStatesYaml;
            writeFileSync(paShimUsStatesJsonFileName, JSON.stringify(jsonifiedYaml, null, 2));

            paShimUsStatesData = jsonifiedYaml.default; // NOTICE: I'm targeting default here.
        }).catch((error) => {
            paShimUsStatesData = undefined
            throw(`!!! Error - pa_shim data retrieval failed! --- ${error}`)
        })
    }

    if (!paShimUsStatesData) {
        throw(`!!! Error - pa_shim data is empty!`)
    }

    output.data = paShimUsStatesData;

    return output
}

/*
    Takes an API endpoint and returns the response data.
*/
export async function GetResponseData(_url:string) :Promise<DataAndStatus<any>> {
    let output:DataAndStatus<any> = {data:{},status:200};

    await axios(_url).then((_response:AxiosResponse<any, any>) => {
        output = _response

        if (!IsGoodResponse(_response.status)) {
            console.log(`! Bad response status: ${_response.status}`);
        }
    }).catch((error) => {
        throw(`!!! Error hitting endpoint: ${error}`)
    });

    return output;
}

/*
    Retrieves and returns the pa_shim UsState.yml data and the IPC data from the provided API endpoint in the provided environment.
*/
export async function GetTestData(_environment:Url, _endpoint:Endpoint) :Promise<TestData> {
    const paShimStatesData :DataAndStatus<UsStateMapping> = await GetPaShimUsStateData();
    const ipcData :DataAndStatus<string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[]> = await HitEndpoint(_environment, _endpoint);

    const testData :TestData = {paShimStatesData, ipcData}

    return testData
}

/*
    Returns the data retrieved from the given endpoint with the given base url.
*/
export async function HitEndpoint(_baseUrl:Url, _endpoint:Endpoint|string) :Promise<DataAndStatus<any>> {
    const url :string = `${_baseUrl}/${_endpoint}`;
    const data :DataAndStatus<any> = await GetResponseData(url);

    return data;
}
