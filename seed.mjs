import fs from 'node:fs';

const API_BASE = "http://localhost:8000/api/v1";

const patterns = [
  {
    name: "Credit Card Number",
    description: "Detects standard 13-16 digit credit card numbers.",
    category: "Financial",
    tags: ["PII", "PCI"],
    is_active: true,
    matcher: { kind: "regex", value: "\\b(?:\\d[ -]*?){13,16}\\b" },
    transformation: { mode: "mask", mask_character: "*" }
  },
  {
    name: "Email Address",
    description: "Standard email address pattern.",
    category: "Contact",
    tags: ["PII"],
    is_active: true,
    matcher: { kind: "regex", value: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b" },
    transformation: { mode: "generic", placeholder: "[EMAIL REDACTED]" }
  },
  {
    name: "US Social Security Number",
    description: "Standard US SSN with dashes.",
    category: "Government",
    tags: ["PII", "Sensitive"],
    is_active: true,
    matcher: { kind: "regex", value: "\\b\\d{3}-\\d{2}-\\d{4}\\b" },
    transformation: { mode: "mask", mask_character: "*" }
  },
  {
    name: "AWS Access Key",
    description: "Detects AWS API Keys",
    category: "Security",
    tags: ["Secret", "Cloud"],
    is_active: true,
    matcher: { kind: "regex", value: "\\bAKIA[0-9A-Z]{16}\\b" },
    transformation: { mode: "generic", placeholder: "[REDACTED AWS KEY]" }
  },
  {
    name: "Internal Domain",
    description: "Matches the internal corporate domain.",
    category: "Corporate",
    tags: ["Internal"],
    is_active: true,
    matcher: { kind: "exact", value: "internal.company.corp" },
    transformation: { mode: "generic", placeholder: "internal.redacted.tld" }
  }
];

const entities = [
  {
    name: "Patient Diagnostics Group",
    description: "Combination of patient MRN and specific test flags.",
    category: "Healthcare",
    tags: ["PHI", "HIPAA"],
    is_active: true,
    detection_definitions: [
      { kind: "regex", value: "\\bMRN[- ]\\d{7}\\b" },
      { kind: "value_list", values: ["Bloodwork", "MRI", "CT Scan", "Biopsy"] }
    ],
    transformation: { mode: "generic", placeholder: "[MEDICAL DATA]" }
  },
  {
    name: "Restricted Project Codewords",
    description: "Secret internal project names.",
    category: "Corporate",
    tags: ["Confidential"],
    is_active: true,
    detection_definitions: [
      { kind: "value_list", values: ["Project Apollo", "Titan", "Vanguard", "Project X"] }
    ],
    transformation: { mode: "generic", placeholder: "[RESTRICTED PROJECT]" }
  }
];

async function postData(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Failed to post to ${endpoint}:`, err);
    throw new Error(`API Error: ${res.status}`);
  }
  const json = await res.json();
  return json.data || json; // Backend probably wraps things in {"success": true, "data": {...}}
}

async function seed() {
  console.log("Seeding ObSura Database...");
  const createdPatternIds = [];
  const createdEntityIds = [];

  console.log("\n--- Creating Patterns ---");
  for (const p of patterns) {
    const res = await postData("/studio/patterns", p);
    createdPatternIds.push(res.id);
    console.log(`\u2714 Created Pattern: ${res.name} (${res.id})`);
  }

  console.log("\n--- Creating Entities ---");
  for (const e of entities) {
    const res = await postData("/studio/entities", e);
    createdEntityIds.push(res.id);
    console.log(`\u2714 Created Entity: ${res.name} (${res.id})`);
  }

  console.log("\n--- Creating Configurations ---");
  const config1 = {
    kind: "profile",
    name: "Standard PII Protection Profile",
    description: "Base level PII filtering for general communication.",
    category: "General",
    tags: ["Default", "PII"],
    is_active: true,
    pattern_ids: createdPatternIds.slice(0, 3), // card, email, ssn
    custom_entity_ids: [],
    default_text_transformation: { mode: "mask", mask_character: "*" },
    default_image_transformation: null
  };
  
  const config2 = {
    kind: "pack",
    name: "Strict Corporate / Healthcare Pack",
    description: "Includes API keys, confidential codewords, and medical data.",
    category: "Strict",
    tags: ["PHI", "Secrets", "Internal"],
    is_active: true,
    pattern_ids: createdPatternIds.slice(3), // aws, internal domain
    custom_entity_ids: createdEntityIds,
    default_text_transformation: { mode: "generic", placeholder: "[REDACTED]" },
    default_image_transformation: { mode: "blur", blur_radius: 15 }
  };

  const c1 = await postData("/studio/configurations", config1);
  console.log(`\u2714 Created Config: ${c1.name} (${c1.id})`);

  const c2 = await postData("/studio/configurations", config2);
  console.log(`\u2714 Created Config: ${c2.name} (${c2.id})`);

  console.log("\n\u2728 Seed Complete! You now have real data to test in the Workbench and Studio.");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
