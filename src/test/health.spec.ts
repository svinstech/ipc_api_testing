import { expect } from "chai";
import { describe, it } from "mocha"
import { Url, Endpoint } from "../constants";
import { HitEndpoint } from "../dataCollection";

describe("~~~ HEALTH ~~~", () => {
    it("Ensure that the /health endpoint works and is ok.", async () => {
        const health:string = await HitEndpoint(Url.Stg, Endpoint.Health) as string

        //testing
        console.log(`health: ${health}`)

        expect(health.toLowerCase()).to.equal("ok")
    });
})

