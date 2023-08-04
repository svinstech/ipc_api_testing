import { load } from 'js-yaml'
import { readFileSync, writeFileSync } from 'fs'
import axios from 'axios'
import { AxiosResponse } from 'axios'
import { PaShimUsStatesYaml } from './src/interfaces/interfacesAndTypes'

async function main() :Promise<void> {
    // const healthData :string = await HitEndpoint(Urls.Dev, Endpoints.Health) as string;
    // const jurisdictionData :Jurisdiction[] = await HitEndpoint(Urls.Dev, Endpoints.Jurisdictions) as Jurisdiction[];
    // const jurisdictionVersionData :JurisdictionVersion[] = await HitEndpoint(Urls.Dev, Endpoints.JurisdictionVersions) as JurisdictionVersion[];
    // const productLineData :ProductLine[] = await HitEndpoint(Urls.Dev, Endpoints.ProductLines) as ProductLine[];

    // console.log("HEALTH DATA")
    // console.log(healthData);

    // console.log("JURISDICTION DATA")
    // console.log(jurisdictionData);

    // console.log("JURISDICTION VERSION DATA")
    // console.log(jurisdictionVersionData);

    // console.log("PRODUCT LINE DATA")
    // console.log(productLineData);





    const GITHUB_TOKEN = process.argv[2],
          inputfile = 'paShimUsStates.yml',
          outputfile = 'paShimUsStates.json'

    //testing - get yml from pa_shim
    const yml_url = "https://api.github.com/repos/svinstech/pa_shim/git/blobs/3a81ca37fc0df296ea76e60807b5d6e4a9468b73"
    await axios({
        url : yml_url,
        headers : {
            "Authorization" : `Bearer ${GITHUB_TOKEN}`,
            "X-GitHub-Api-Version" : "2022-11-28",
            "Accept" : "application/vnd.github.raw"
        }
    }).then((response:AxiosResponse<any, any>) => {
        const yaml:string = response.data

        // Convert pa_shim's us_states.yml to json
        writeFileSync(inputfile, yaml);
        const jsonifiedYaml:PaShimUsStatesYaml = load(readFileSync(inputfile, {encoding: 'utf-8'})) as PaShimUsStatesYaml;
        writeFileSync(outputfile, JSON.stringify(jsonifiedYaml, null, 2));

        const paShimUsStatesData:object = jsonifiedYaml.default; // NOTICE: I'm targeting default here.

        //testing
        console.log(paShimUsStatesData)


    })
}

main();
