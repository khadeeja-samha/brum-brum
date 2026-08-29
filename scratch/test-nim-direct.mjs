import fs from "fs";

const envLocal = fs.readFileSync(".env.local", "utf8");
const apiKeyMatch = envLocal.match(/NVIDIA_NIM_API_KEY=([^\r\n]+)/);
const modelMatch = envLocal.match(/NVIDIA_NIM_MODEL=([^\r\n]+)/);

const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : "";
const model = modelMatch ? modelMatch[1].trim() : "nvidia/nemotron-3-ultra-550b-a55b";

console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE");
console.log("Using Model:", model);

async function test() {
  const start = Date.now();
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Solve 2+2. Output JSON: {\"answer\": 4}" }],
        temperature: 0.1,
        chat_template_kwargs: { enable_thinking: false },
      }),
    });
    console.log("Status:", res.status, res.statusText);
    const data = await res.json();
    console.log(`Success in ${Date.now() - start}ms:`, JSON.stringify(data).substring(0, 300));
  } catch (e) {
    console.error(`Failed in ${Date.now() - start}ms:`, e.message);
  }
}

test();
