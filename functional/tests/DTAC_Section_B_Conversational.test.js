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

// 🧪 Mocha test suite (with Mochawesome context)
describe("DTAC Section B — Product Purpose, Value & User Needs", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should describe product purpose and context", async function () {
    const botReply = await sendMessage("How do we describe our product in DTAC?");
    const expected = contains("purpose", "users", "benefit", "context", "function");
    expectResponse(botReply, expected);
  });

  it("should show evidence for product benefits", async function () {
    const botReply = await sendMessage("What kind of information shows the product’s benefits for DTAC?");
    const expected = contains("benefits", "evidence", "outcomes", "value", "users");
    expectResponse(botReply, expected);
  });

  it("should reference user research and needs", async function () {
    const botReply = await sendMessage("How do we show that our product meets user needs for DTAC?");
    const expected = contains("user", "needs", "research", "feedback", "requirements");
    expectResponse(botReply, expected);
  });

  it("should include case study or clinical evidence", async function () {
    const botReply = await sendMessage("What kind of evidence can we provide for the benefits our product delivers?");
    const expected = contains("clinical", "evidence", "case", "study", "impact");
    expectResponse(botReply, expected);
  });

  it("should show stakeholder engagement", async function () {
    const botReply = await sendMessage("How do we show that stakeholders were involved in our product’s development?");
    const expected = contains("stakeholder", "co[- ]?design", "engagement", "consultation", "feedback");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS

  it("should demonstrate how the product meets NHS priorities", async function () {
    const botReply = await sendMessage("How do we show our product supports NHS priorities in DTAC?");
    const expected = contains("NHS", "priority", "benefit", "patient", "value");
    expectResponse(botReply, expected);
  });

  it("should identify intended users and settings", async function () {
    const botReply = await sendMessage("Who are the intended users and what settings should we mention in DTAC?");
    const expected = contains("intended", "user", "clinical", "setting", "context");
    expectResponse(botReply, expected);
  });

});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
