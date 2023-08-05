import axios from 'axios'
import { AxiosResponse } from 'axios'
import { load } from 'js-yaml'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { Jurisdiction, JurisdictionVersion, PaShimUsStatesYaml, ProductLine, TestData, UsStateMapping } from './interfaces/interfacesAndTypes'
import { Url, Endpoint } from './constants'

function IsGoodResponse(_responseCode:number) :boolean {
    return _responseCode >= 200 && _responseCode < 300
}

export async function GetPaShimUsStateData() :Promise<UsStateMapping> {
    const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_TOKEN,
          paShimUsStatesYamlFileName = 'paShimUsStates.yml',
          paShimUsStatesJsonFileName = 'paShimUsStates.json',
          yamlUrl = "https://api.github.com/repos/svinstech/pa_shim/git/blobs/3a81ca37fc0df296ea76e60807b5d6e4a9468b73" // Points to the config/us_states.yml in pa_shim.
    
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
        }).then((response:AxiosResponse<any, any>) => {
            const yaml:string = response.data

            // Convert pa_shim's us_states.yml to json
            writeFileSync(paShimUsStatesYamlFileName, yaml);
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

    return paShimUsStatesData as UsStateMapping;
}

async function GetResponseData(_url:string) :Promise<any> {
    let data:any = "";

    await axios(_url).then((_response:AxiosResponse<any, any>) => {
        if (IsGoodResponse(_response.status)) {
            data = _response.data;
        } else {
            console.log(`!!! Bad response status: ${_response.status}`);
        }
    });

    return data;
}

export async function GetTestData(_environment:Url, _endpoint:Endpoint) :Promise<TestData> {
    const paShimStatesData :UsStateMapping = await GetPaShimUsStateData();
    const ipcData :string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[] = await HitEndpoint(_environment, _endpoint) as string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[];

    const testData :TestData = {paShimStatesData, ipcData}

    return testData
}

 export async function HitEndpoint(_baseUrl:Url, _endpoint:Endpoint) :Promise<string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[]> {
    const url :string = `${_baseUrl}/${_endpoint}`;
    const data :any = await GetResponseData(url);

    return data;
}




