import axios from 'axios'
import { AxiosResponse } from 'axios'
import { Urls, Endpoints } from './constants'
import { Jurisdiction, JurisdictionVersion, ProductLine } from './interfaces/interfacesAndTypes'

function IsGoodResponse(_responseCode:number) :boolean {
    return _responseCode >= 200 && _responseCode < 300
}

async function GetResponseData(_url:string) :Promise<any> {
    let data:any;

    await axios(_url).then((_response:AxiosResponse<any, any>) => {
        if (IsGoodResponse(_response.status)) {
            data = _response.data;
        }
    });

    return data;
}

export async function HitEndpoint(_baseUrl:Urls, _endpoint:Endpoints) :Promise<string|Jurisdiction[]|JurisdictionVersion[]|ProductLine[]> {
    const url :string = `${_baseUrl}/${_endpoint}`;
    const data :any = await GetResponseData(url);

    return data;
}
