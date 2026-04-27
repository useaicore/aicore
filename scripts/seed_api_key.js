const crypto = require('crypto');

async function seed() {
  const apiKey = "ak_live_d5065f1e7e1146e4924c3c1969500c0b";
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const body = {
    key_hash: hash,
    key_prefix: apiKey.substring(0, 12),
    name: "E2E Test Key",
    workspace_id: "d5065f1e-7e11-46e4-924c-3c1969500c0b"
  };

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/workspace_api_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.error("Failed:", await res.text());
  } else {
    console.log("Seeded API key:", apiKey);
  }
}

seed();
