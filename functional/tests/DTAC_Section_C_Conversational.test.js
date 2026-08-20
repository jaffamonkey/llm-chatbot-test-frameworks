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

describe("DTAC Section C — Clinical Safety & Risk Management", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should mention clinical safety evidence and hazard management", async () => {
    const botReply = await sendMessage("What clinical safety evidence should we provide for DTAC?");
    const expected = contains("clinical", "safety", "DCB0129", "hazard", "mitigation");
    expectResponse(botReply, expected);
  });

  it("should cover DCB0160 and responsibilities", async () => {
    const botReply = await sendMessage("Do we need to provide evidence for DCB0160 as part of DTAC?");
    const expected = contains("DCB0160", "responsibility", "clinical", "safety", "evidence");
    expectResponse(botReply, expected);
  });

  it("should include risk assessment and mitigation", async () => {
    const botReply = await sendMessage("How do we show our clinical risk assessment in DTAC evidence?");
    const expected = contains("risk", "assessment", "clinical", "mitigation", "process");
    expectResponse(botReply, expected);
  });

  it("should identify Clinical Safety Officer", async () => {
    const botReply = await sendMessage("Do we need to identify a Clinical Safety Officer for DTAC?");
    const expected = contains("Clinical", "Safety", "Officer", "CSO", "responsibility", "appointment", "governance");
    expectResponse(botReply, expected);
  });

  it("should show incident management and records", async () => {
    const botReply = await sendMessage("What kind of evidence should we show for managing clinical safety incidents?");
    const expected = contains("incident", "management", "record", "clinical", "process");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS

  it("should describe how clinical safety is reviewed and maintained", async () => {
    const botReply = await sendMessage("How do we show that clinical safety is reviewed and maintained over time?");
    const expected = contains("review", "monitor", "clinical", "safety", "process");
    expectResponse(botReply, expected);
  });

  it("should explain how learning from incidents is captured", async () => {
    const botReply = await sendMessage("How do we evidence learning from clinical safety incidents?");
    const expected = contains("incident", "learning", "action", "update", "policy");
    expectResponse(botReply, expected);
  });

});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
