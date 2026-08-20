import * as dotenv from "dotenv";
dotenv.config();
import { sendMessage, resetSendMessageState } from "./test_utils/SendMessage.js";
import { contains, expectResponse } from "./test_utils/expectResponse.js";

before(() => resetSendMessageState());

beforeEach(async function () {
  console.log("⏳ Waiting 10s between tests to avoid API overload...");
  await new Promise(r => setTimeout(r, 10_000));
});

describe("DTAC General Awareness & Cross-Section", function () {
  this.timeout(90000); // Give Mocha some breathing room

  it("should define what DTAC stands for", async () => {
    const botReply = await sendMessage("What does DTAC actually stand for?");
    const expected = contains("Digital", "Technology", "Assessment", "Criteria", "NHS");
    expectResponse(botReply, expected);
  });

  it("should describe the main purpose of DTAC", async () => {
    const botReply = await sendMessage("What is the main purpose of DTAC?");
    const expected = contains("assurance", "standard", "digital", "health", "compliant");
    expectResponse(botReply, expected);
  });

  it("should list the main DTAC sections", async () => {
    const botReply = await sendMessage("What are the main sections included in DTAC?");
    const expected = contains("organisation", "product", "clinical", "security", "usability");
    expectResponse(botReply, expected);
  });

  it("should show how to prove overall DTAC compliance", async () => {
    const botReply = await sendMessage("How can we prove that our product meets all DTAC requirements overall?");
    const expected = contains("evidence", "documentation", "compliance", "assessment", "checklist");
    expectResponse(botReply, expected);
  });

  // EXTRA TESTS

  it("should explain who uses DTAC and why it matters", async () => {
    const botReply = await sendMessage("Who actually uses DTAC and why is it important?");
    const expected = contains("NHS", "commissioners", "developers", "procurement", "assurance");
    expectResponse(botReply, expected);
  });

  it("should outline the benefits of achieving DTAC compliance", async () => {
    const botReply = await sendMessage("What are the main benefits of being DTAC compliant?");
    const expected = contains("trust", "market", "confidence", "procurement", "standard");
    expectResponse(botReply, expected);
  });

  it("should clarify how DTAC links with other NHS frameworks", async () => {
    const botReply = await sendMessage("How does DTAC relate to NHS Digital, NICE, or other NHS frameworks?");
    const expected = contains("NHS", "Digital", "NICE", "alignment", "governance");
    expectResponse(botReply, expected);
  });

});

after(async function () {
  console.log("🧹 Finished suite — giving API a breather...");
  await new Promise(r => setTimeout(r, 10_000));
  process.exit(0); // ensure Node fully quits
});
