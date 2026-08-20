import { expect } from "chai";
import * as dotenv from "dotenv";
dotenv.config();
import { sendMessage, resetSendMessageState } from "./test_utils/SendMessage.js";
import { contains, expectResponse } from "./test_utils/expectResponse.js";

before(() => resetSendMessageState());

// before(() => resetSendMessageState());

beforeEach(async function () {
  console.log("⏳ Waiting 10s between tests to avoid API overload...");
  await new Promise(r => setTimeout(r, 10_000));
});

// 🧠 Mocha test suite
describe("DTAC Section A — Organisation & Governance", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should mention organisation details and governance contacts", async () => {
    const botReply = await sendMessage(
      "What company details do we need to include for DTAC?"
    );
    const expected = contains("Company Details", "Company Name", "Address", "Product Name", "Product Version", "Primary Contact Name", "Primary Contact Email", "Primary Contact Phone Number", "Primary Contact Job Title", "Product Type");
    expectResponse(botReply, expected);
  });

  it("should identify responsible governance leads", async () => {
    const botReply = await sendMessage(
      "Who should we list as responsible for governance in DTAC?"
    );
    const expected = contains("responsibility", "named", "individual", "governance", "structure");
    expectResponse(botReply, expected);
  });

  it("should describe required governance policies", async () => {
    const botReply = await sendMessage(
      "What kind of governance policies should we show to meet DTAC requirements?"
    );
    const expected = contains("policy", "risk", "information", "governance", "accountability");
    expectResponse(botReply, expected);
  });

  it("should reference certifications or audits", async () => {
    const botReply = await sendMessage(
      "Does DTAC need us to provide any quality assurance certifications or audits?"
    );
    const expected = contains("ISO", "audit", "certification", "quality", "assurance");
    expectResponse(botReply, expected);
  });

  it("should show governance evidence examples", async () => {
    const botReply = await sendMessage(
      "What’s an example of evidence we can provide about our organisation’s governance?"
    );
    const expected = contains("organisation", "chart", "governance", "structure", "responsibilities", "oard", "documentation");
    expectResponse(botReply, expected);
  });
});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
