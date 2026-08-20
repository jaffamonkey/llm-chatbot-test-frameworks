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

describe("DTAC Advanced Audit & Evidence Verification Tests", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should show DPIA expectations for audits", async () => {
    const botReply = await sendMessage("What would an auditor look for in our DPIA when checking DTAC compliance?");
    const expected = contains("DPIA", "data", "risk", "GDPR", "mitigation");
    expectResponse(botReply, expected);
  });

  it("should include security testing evidence", async () => {
    const botReply = await sendMessage("What kind of security testing evidence would satisfy DTAC auditors?");
    const expected = contains("penetration", "cyber", "OWASP", "remediation", "test");
    expectResponse(botReply, expected);
  });

  it("should include clinical safety evidence for audits", async () => {
    const botReply = await sendMessage("During an audit, how can we show that we meet DTAC clinical safety requirements?");
    const expected = contains("clinical", "safety", "DCB0129", "hazard", "evidence");
    expectResponse(botReply, expected);
  });

  it("should include accessibility conformance evidence", async () => {
    const botReply = await sendMessage("What would an auditor expect to see in our accessibility evidence for DTAC?");
    const expected = contains("WCAG", "accessibility", "testing", "conformance", "feedback");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS

  it("should describe how post-market surveillance is evidenced", async () => {
    const botReply = await sendMessage("How can we show evidence of post-market surveillance to auditors?");
    const expected = contains("post[- ]market", "monitoring", "incident", "review", "update");
    expectResponse(botReply, expected);
  });

  it("should confirm what documentation auditors expect overall", async () => {
    const botReply = await sendMessage("What documents would an auditor expect to review for full DTAC evidence?");
    const expected = contains("policy", "procedure", "certificate", "report", "evidence");
    expectResponse(botReply, expected);
  });

  it("should explain how to show continuous improvement during audits", async () => {
    const botReply = await sendMessage("How do we demonstrate continuous improvement during a DTAC audit?");
    const expected = contains("continuous", "improvement", "iteration", "quality", "review");
    expectResponse(botReply, expected);
  });
});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
