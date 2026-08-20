import { expect } from "chai";

/**
 * Make expected phrase lists easy to define.
 * Example: const expected = contains("organisation", "governance", "assurance");
 */
export function contains(...phrases) {
  return phrases.map((p) => p.trim()).filter(Boolean);
}

/**
 * Assert that all expected phrases appear in the chatbot response.
 * Automatically attaches the reply to Allure (if available).
 */
export function expectResponse(response, expectedPhrases) {
  // 🧩 Normalize response: handle string, object, or Buffer
  let text;
  if (typeof response === "string") {
    text = response;
  } else if (response && typeof response === "object") {
    text =
      response.body ||
      JSON.stringify(response, null, 2) ||
      String(response);
  } else if (Buffer.isBuffer(response)) {
    text = response.toString("utf8");
  } else {
    text = String(response || "");
  }

  // Attach to Allure (if reporter is active)
  if (global.allure && typeof global.allure.attachment === "function") {
    global.allure.attachment("Chatbot Reply", text, "text/plain");
  }

  // 🧠 Check each expected phrase
  const missing = expectedPhrases.filter(
    (term) => !new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(text)
  );

  const message = missing.length
    ? `❌ Missing expected terms: ${missing.join(", ")}\n\nFull response:\n${text}`
    : "";

  expect(missing.length, message).to.equal(0);
}

/** Safely escape regex special characters */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
