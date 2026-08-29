async function verifyPages(baseUrl = "http://localhost:3000") {
  console.log(`\n======================================================`);
  console.log(`🧪 TESTING FRONTEND PAGE ROUTES INTEGRATION`);
  console.log(`Target: ${baseUrl}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(cond, name, details = "") {
    if (cond) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} — ${details}`);
      failed++;
    }
  }

  // 1. Landing Page (/)
  try {
    const res = await fetch(`${baseUrl}/`);
    assert(res.status === 200, "Landing page returns HTTP 200");
    const html = await res.text();
    assert(html.includes("Mirror Mode"), "Landing page contains 'Mirror Mode' link");
    assert(html.includes("/mirror"), "Landing page links to '/mirror'");
    assert(html.includes("CogniTrace"), "Landing page contains brand headline");
  } catch (e) {
    assert(false, "Landing page fetch error", e.message);
  }

  // 2. Curriculum Page (/topics)
  try {
    const res = await fetch(`${baseUrl}/topics`);
    assert(res.status === 200, "Topics page returns HTTP 200");
    const html = await res.text();
    assert(html.includes("Mirror Mode"), "Topics page contains 'Mirror Mode' button");
    assert(html.includes("/mirror"), "Topics page links to '/mirror'");
    assert(html.includes("Audit Your Own Handwritten Homework"), "Topics page contains Mirror Mode banner");
  } catch (e) {
    assert(false, "Topics page fetch error", e.message);
  }

  // 3. Mirror Mode Page (/mirror)
  try {
    const res = await fetch(`${baseUrl}/mirror`);
    assert(res.status === 200, "Mirror page returns HTTP 200");
    const html = await res.text();
    assert(html.includes("Mirror Mode: Multimodal Self-Audit"), "Mirror page title rendered");
    assert(html.includes("Audit Your"), "Mirror page value proposition rendered");
    assert(html.includes("Handwritten Solution Ingestion"), "Upload component rendered");
    assert(html.includes("Instant 1-Click Test Library"), "Sample presets library rendered");
    assert(html.includes("sample-alg-001") || html.includes("Algebra: Linear Distribution"), "Presets rendered");
  } catch (e) {
    assert(false, "Mirror page fetch error", e.message);
  }

  console.log(`\n======================================================`);
  console.log(`📊 PAGES TEST SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total Assertions: ${passed + failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

verifyPages();
