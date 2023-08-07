import { expect } from "chai";
import { describe, it } from "mocha"
import { Endpoint, ENVIRONMENT } from "../constants";
import { HitEndpoint } from "../dataCollection";

describe("~~~ HEALTH ~~~", () => {
    it("Ensure that the /health endpoint works and is ok.", async () => {
        const health:string = await HitEndpoint(ENVIRONMENT, Endpoint.Health) as string

        //testing
        console.log(`health: ${health}`)

        expect(health.toLowerCase()).to.equal("ok")
    });
})

