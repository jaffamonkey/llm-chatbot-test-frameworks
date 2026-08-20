import { expect } from "chai";
import * as dotenv from "dotenv";
dotenv.config();
import { sendMessage, resetSendMessageState } from "./test_utils/SendMessage.js";
import { contains, expectResponse } from "./test_utils/expectResponse.js";

before(() => resetSendMessageState());

beforeEach(async function () {
  console.log("⏳ Waiting 10s between tests to avoid API overload...");
  await new Promise(r => setTimeout(r, 10_000));
});

describe("DTAC Challenging & Natural-Language Tests", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should cover data protection and privacy", async () => {
    const botReply = await sendMessage("I’m worried about patient privacy — does DTAC cover how we protect user data?");
    const expected = contains("data", "protection", "privacy", "GDPR", "encryption");
    expectResponse(botReply, expected);
  });

  it("should recognise user research as relevant evidence", async () => {
    const botReply = await sendMessage("We’ve done a few interviews with users — is that relevant for DTAC?");
    const expected = contains("user", "research", "usability", "testing", "accessibility");
    expectResponse(botReply, expected);
  });

  it("should mention interoperability and APIs", async () => {
    const botReply = await sendMessage("Do we have to explain all our technical integrations or just mention them?");
    const expected = contains("interoperability", "API", "integration", "FHIR", "documentation");
    expectResponse(botReply, expected);
  });

  it("should show accessibility and inclusivity", async () => {
    const botReply = await sendMessage("We designed our app to be simple for everyone — is that part of DTAC?");
    const expected = contains("accessibility", "usability", "inclusive", "WCAG", "design");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS

  it("should clarify what happens if our product partially meets DTAC", async () => {
    const botReply = await sendMessage("We don’t meet every DTAC question — can we still submit?");
    const expected = contains("partial", "submission", "mitigation", "evidence", "assessment");
    expectResponse(botReply, expected);
  });

  it("should guide how to handle legacy products under DTAC", async () => {
    const botReply = await sendMessage("Our product has been live for years — how does DTAC apply to older systems?");
    const expected = contains("legacy", "existing", "update", "assessment", "standard");
    expectResponse(botReply, expected);
  });

  it("should differentiate DTAC from CE or UKCA marking", async () => {
    const botReply = await sendMessage("Is DTAC the same as CE or UKCA certification?");
    const expected = contains("DTAC", "not", "certification", "CE", "UKCA");
    expectResponse(botReply, expected);
  });

});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
