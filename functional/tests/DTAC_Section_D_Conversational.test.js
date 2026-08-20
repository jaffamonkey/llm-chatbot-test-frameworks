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

describe("DTAC Section D — Usability, Accessibility & Support", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should show usability testing and evidence", async () => {
    const botReply = await sendMessage("What usability evidence should we provide for DTAC?");
    const expected = contains("usability", "user", "research", "testing", "evaluation", "feedback");
    expectResponse(botReply, expected);
  });

  it("should demonstrate accessibility compliance", async () => {
    const botReply = await sendMessage("How do we demonstrate accessibility for DTAC?");
    const expected = contains("accessibility", "WCAG", "inclusive", "testing", "design");
    expectResponse(botReply, expected);
  });

  it("should list performance metrics and monitoring", async () => {
    const botReply = await sendMessage("What performance metrics should we include in DTAC evidence?");
    const expected = contains("performance", "SLA", "uptime", "monitoring", "reliability");
    expectResponse(botReply, expected);
  });

  it("should mention user support and helpdesk", async () => {
    const botReply = await sendMessage("What kind of support information should be available for DTAC?");
    const expected = contains("support", "helpdesk", "training", "user", "guide", "contact");
    expectResponse(botReply, expected);
  });

  it("should confirm reliability and uptime evidence", async () => {
    const botReply = await sendMessage("How do we prove our service is reliable and performant for DTAC?");
    const expected = contains("uptime", "monitoring", "SLA", "availability", "performance");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS 

  it("should describe how user training is delivered", async () => {
  const botReply = await sendMessage("How should we describe our user training in DTAC?");
  const expected = contains("training", "user", "materials", "guide", "resources");
  expectResponse(botReply, expected);
});

it("should explain how feedback informs product updates", async () => {
  const botReply = await sendMessage("How do we show that user feedback leads to product improvements?");
  const expected = contains("feedback", "update", "release", "change", "control", "usability");
  expectResponse(botReply, expected);
});

});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
