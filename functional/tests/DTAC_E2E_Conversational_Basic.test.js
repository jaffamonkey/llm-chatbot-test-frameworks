import * as dotenv from "dotenv";
dotenv.config();
import { sendMessage, resetSendMessageState } from "./test_utils/SendMessage.js";
import { contains, expectResponse } from "./test_utils/expectResponse.js";

before(() => resetSendMessageState());

beforeEach(async function () {
    console.log("⏳ Waiting 10s between tests to avoid API overload...");
    await new Promise(r => setTimeout(r, 10_000));
});

describe("🧠 DTAC End-to-End Conversational Tests Basic", function () {
    this.timeout(90000); // Give Mocha some breathing room

    it("should summarise DTAC and its main sections", async function () {
        const botReply = await sendMessage("Can you summarise DTAC and its main sections?");
        const expected = contains("DTAC", "section", "governance", "clinical", "data");
        expectResponse(botReply, expected);
    });

    it("should link organisation governance (Section A) with assurance responsibilities", async function () {
        const botReply = await sendMessage("How does our governance structure relate to DTAC assurance?");
        const expected = contains("governance", "assurance", "responsibility", "accountability", "contact");
        expectResponse(botReply, expected);
    });

    it("should explain how product purpose (Section B) supports clinical safety (Section C)", async function () {
        const botReply = await sendMessage("How does our product’s purpose link to clinical safety expectations in DTAC?");
        const expected = contains("clinical", "safety", "design", "risk", "intended");
        expectResponse(botReply, expected);
    });

    it("should connect user needs (Section B) with accessibility (Section D)", async function () {
        const botReply = await sendMessage("How do user needs influence our accessibility and usability requirements?");
        const expected = contains("user", "need", "accessible", "usability", "design");
        expectResponse(botReply, expected);
    });

    it("should ensure data protection (Section E) relates to governance and risk management", async function () {
        const botReply = await sendMessage("How does DTAC Section E on data protection link with our governance and risk management?");
        const expected = contains("data", "protection", "governance", "risk", "policy");
        expectResponse(botReply, expected);
    });

    it("should describe how evidence across DTAC sections builds overall assurance", async function () {
        const botReply = await sendMessage("How do we show that our evidence across all DTAC sections builds overall assurance?");
        const expected = contains("evidence", "traceability", "matrix", "consistency", "assurance");
        expectResponse(botReply, expected);
    });

    it("should maintain context when continuing the conversation", async function () {
        // Simulate conversation continuity
        await sendMessage("We’ve talked about data protection. What comes next in DTAC?");
        const botReply = await sendMessage("And how should we prepare that section?");
        const expected = contains("section", "preparation", "submission", "evidence");
        expectResponse(botReply, expected);
    });

    it("should recommend improvement actions if any DTAC gaps are identified", async function () {
        const botReply = await sendMessage("What should we do if we find gaps in our DTAC evidence?");
        const expected = contains("gap", "action", "plan", "improvement", "review");
        expectResponse(botReply, expected);
    });

    it("should summarise how to prepare for a DTAC audit", async function () {
        const botReply = await sendMessage("How should we prepare for an external DTAC audit?");
        const expected = contains("audit", "checklist", "evidence", "verification", "submission");
        expectResponse(botReply, expected);
    });

    it("should conclude with next steps and ongoing review advice", async function () {
        const botReply = await sendMessage("Once DTAC is completed, what ongoing actions should we take?");
        const expected = contains("review", "monitor", "update", "compliance", "annual");
        expectResponse(botReply, expected);
    });

});

after(async function () {
    console.log("🧹 Finished suite — giving API a breather...");
    await new Promise(r => setTimeout(r, 10_000));
    process.exit(0); // ensure Node fully quits
});
