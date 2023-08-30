import { expect } from "chai";
import { describe, it } from "mocha"
import { Endpoint, ENVIRONMENT } from "../constants";
import { HitEndpoint, IsGoodResponse } from "../dataCollection";
import { DataAndStatus } from "../interfaces/interfacesAndTypes";

describe("~~~ HEALTH ~~~", () => {
    it("Ensure that the /health endpoint works and is ok.", async () => {
        const healthResponse:DataAndStatus<string> = await HitEndpoint(ENVIRONMENT, Endpoint.Health) as DataAndStatus<string>

        //testing
        console.log(`health: ${healthResponse}`)

        expect(IsGoodResponse(healthResponse.status)).to.be.true
        expect(healthResponse.data.toLowerCase()).to.equal("ok")
    });
})

