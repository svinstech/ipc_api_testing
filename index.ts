import { Endpoints, Urls } from './src/constants'
import { HitEndpoint } from './src/endpoints'
import { GetPaShimUsStateData } from './src/dataCollection'
import { Jurisdiction, JurisdictionVersion, ProductLine, UsStateMapping } from './src/interfaces/interfacesAndTypes'

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


    // const paShimUsStatesData:UsStateMapping|undefined = await GetPaShimUsStateData();

    
}




main();
