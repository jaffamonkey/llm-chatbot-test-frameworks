import { curly } from "node-libcurl";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

let lastCallTime = 0;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

export function resetSendMessageState() {
  lastCallTime = 0;
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
}

// Update the default URL to the local Ollama instance
const API_URL =
  process.env.OLLAMA_API_URL ||
  "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";

const LOG_DIR = "./logs";
const LOG_FILE = `${LOG_DIR}/api_health.log`;

// 🧾 Async logger
async function log(line) {
  const ts = new Date().toISOString().replace("T", " ").split(".")[0];
  const msg = `[${ts}] ${line}`;
  await fs.promises.mkdir(LOG_DIR, { recursive: true }).catch(() => {});
  console.log(msg);
  await fs.promises.appendFile(LOG_FILE, msg + os.EOL).catch(console.error);
}

/**
 * Sends a message to the local Ollama Chatbot API and returns full response info.
 * @param {string} message - The message to send
 * @returns {Promise<{statusCode:number, body:string, totalMs:number, timings:object}>}
 */
export async function sendMessage(message) {
  const connectTimeoutMs = 15000; // 15 s to connect
  const timeoutMs = 90000;        // 90 s total (local LLMs may take time)

  try {
    const start = Date.now();
    const {
      data,
      statusCode,
      timeTotal,
      timeConnect,
      timeAppconnect,
      timeStarttransfer,
      timeNamelookup,
    } = await curly.post(API_URL, {
      // Ollama expects 'model', 'prompt', and 'stream: false' for a single response
      postFields: JSON.stringify({ 
        model: OLLAMA_MODEL, 
        prompt: message, 
        stream: false 
      }),
      httpHeader: [
        "Content-Type: application/json",
        "Accept: application/json"
        // Authorization token removed for local Ollama
      ],
      connectTimeoutMs,
      timeoutMs,
    });

    // 🧩 Normalize whatever came back and extract Ollama's 'response' text
    let bodyText;
    if (Buffer.isBuffer(data)) {
      try {
        const parsed = JSON.parse(data.toString("utf8"));
        bodyText = parsed.response || JSON.stringify(parsed);
      } catch {
        bodyText = data.toString("utf8");
      }
    } else if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        bodyText = parsed.response || data;
      } catch {
        bodyText = data;
      }
    } else if (data && typeof data === "object") {
      bodyText = data.response || JSON.stringify(data);
    } else {
      bodyText = "(no response body)";
    }

    const totalMs = Math.round(timeTotal * 1000);
    const timings = {
      dns: Math.round(timeNamelookup * 1000),
      connect: Math.round(timeConnect * 1000),
      ssl: Math.round(timeAppconnect * 1000),
      ttfb: Math.round(timeStarttransfer * 1000),
      total: totalMs,
    };

    const phases = `DNS:${timings.dns}ms CONNECT:${timings.connect}ms SSL:${timings.ssl}ms TTFB:${timings.ttfb}ms TOTAL:${timings.total}ms`;

    if (statusCode >= 200 && statusCode < 300) {
      await log(`✅ OK (${totalMs} ms) [HTTP ${statusCode}] | ${phases}`);
    } else {
      await log(`⚠️ HTTP ${statusCode} | ${phases}`);
    }

    // ✅ Return to tests / Allure
    return { statusCode, body: bodyText, totalMs, timings };

  } catch (err) {
    await log(`❌ API failed: ${err.message}`);
    return {
      statusCode: 0,
      body: `Error: ${err.message}`,
      totalMs: 0,
      timings: {},
    };
  }
}

// 🧠 Optional CLI usage: node SendMessage.js "hello"
if (import.meta.url === `file://${process.argv[1]}`) {
  const msg = process.argv[2] || "ping";
  sendMessage(msg)
    .then((res) => console.log("✅ Done:", res))
    .catch((err) => console.error("❌ Error:", err));
}