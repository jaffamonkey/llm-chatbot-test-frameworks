import { sendMessage, resetSendMessageState } from "./test_utils/SendMessage.js";
import { contains, expectResponse } from "./test_utils/expectResponse.js";

before(() => resetSendMessageState());

// Utility sleep
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// 🔁 Robust message sender with retries + logging
async function safeSend(prompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`\n💬 Sending prompt (attempt ${i + 1}): ${prompt}`);
      const start = Date.now();
      const reply = await sendMessage(prompt);
      const ms = Date.now() - start;
      console.log(`✅ Reply received in ${ms} ms`);
      // console.log(`↳ ${reply.slice(0, 200)}${reply.length > 200 ? "..." : ""}`);
      return reply;
    } catch (err) {
      console.warn(`⚠️ Attempt ${i + 1} failed: ${err.message}`);
      if (i < retries) {
        const backoff = 8000 * (i + 1);
        console.log(`⏳ Backing off for ${backoff} ms…`);
        await sleep(backoff);
      } else {
        console.error("💀 All attempts failed.");
        throw err;
      }
    }
  }
}

// 🧹 Reset DTAC context
async function resetContext() {
  try {
    console.log("\n🧹 Resetting DTAC context...");
    await safeSend("Let's start a new DTAC conversation context.");
    await sleep(4000);
  } catch (err) {
    console.warn("⚠️ Could not reset context (non-fatal).");
  }
}

describe("🧩 DTAC E2E Conversational Advanced Tests", function () {
  this.timeout(240000);

  before(async () => {
    await resetContext();
  });

  after(async () => {
    console.log("\n🏁 Finished DTAC advanced suite.");
  });

  // 1️⃣ Section linkage comprehension
  it("should recognise how different DTAC sections link together", async function () {
    const prompt = "How do the different DTAC sections A to E relate to one another?";
    const reply = await safeSend(prompt);

    const expected = contains("A", "B", "C", "D", "E", "link", "connected", "interdependent");
    expectResponse(reply, expected);
  });

  // 2️⃣ Multi-turn evidence discussion
  it("should maintain understanding of multi-turn DTAC evidence discussion", async function () {
    const turns = [
      "We are preparing DTAC evidence for governance — what should we include?",
      "Now what about product purpose and benefits for Section B?",
      "Ok, and what should we say about clinical safety in Section C?",
      "Good — and Section D on usability?",
      "Finally, how do we show data protection evidence in Section E?"
    ];

    for (const turn of turns) {
      await safeSend(turn);
      await sleep(4000);
    }

    const checkPrompt = "Can you recap the key evidence types we discussed for each DTAC section?";
    const recap = await safeSend(checkPrompt);

    const expected = contains(
      "governance",
      "benefit",
      "clinical",
      "usability",
      "data",
      "evidence"
    );
    expectResponse(recap, expected);
  });

  // 3️⃣ DTAC overview comprehension
  it("should give structured responses mentioning all sections when asked for a full DTAC overview", async function () {
    const q = "Give a full overview of DTAC and briefly explain Sections A through E.";
    const reply = await safeSend(q);

    const expected = contains(
      "section A",
      "section B",
      "section C",
      "section D",
      "section E",
      "summary",
      "overview"
    );
    expectResponse(reply, expected);
  });

  // 4️⃣ Reflection / summary synthesis
  it("should correctly summarise the full DTAC conversation across Sections A–E", async function () {
    const questions = [
      "What governance information do we need for DTAC Section A?",
      "What product purpose evidence do we include in Section B?",
      "How does clinical safety apply in Section C?",
      "What usability and accessibility points go in Section D?",
      "What should we show for data protection in Section E?"
    ];

    const replies = [];
    for (const q of questions) {
      const reply = await safeSend(q);
      replies.push(reply);
      await sleep(4000);
    }

    await safeSend("Let's start a new DTAC conversation summary context.");
    await sleep(3000);

    const summaryQ = "Can you summarise what we just discussed about DTAC Sections A to E?";
    const summary = await safeSend(summaryQ);

    const expected = contains(
      "section A",
      "governance",
      "section B",
      "product",
      "section C",
      "clinical",
      "section D",
      "usability",
      "section E",
      "data",
      "protection"
    );
    expectResponse(summary, expected);
  });

  // 5️⃣ Self-audit / critical reflection
  it("should critically self-audit the DTAC summary and identify any missing evidence", async function () {
    const summaryPrompt = "Summarise what we have discussed about DTAC Sections A to E.";
    const summaryReply = await safeSend(summaryPrompt);
    await sleep(5000);

    const auditPrompt =
      "Now review that summary — are there any DTAC areas or types of evidence we missed or need to strengthen?";
    const auditReply = await safeSend(auditPrompt);

    const expected = contains(
      "missing",
      "gap",
      "improve",
      "strengthen",
      "section",
      "evidence",
      "compliance",
      "assurance"
    );
    expectResponse(auditReply, expected);
  });
});
