const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasRealSupabaseUrl = supabaseUrl && !supabaseUrl.includes("your-project-ref");
const hasRealSupabaseKey = supabaseAnonKey && !supabaseAnonKey.includes("your-supabase-anon-key");

const supabaseHeaders = {
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

export const supabaseConfigured = Boolean(hasRealSupabaseUrl && hasRealSupabaseKey);

async function supabaseRequest(path, options = {}) {
  if (!supabaseConfigured) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: { ...supabaseHeaders, ...options.headers },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase request failed.");
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export function saveEarlyAccessEmail(email) {
  return supabaseRequest("early_access_signups", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function saveVote(choice) {
  return supabaseRequest("landing_votes", {
    method: "POST",
    body: JSON.stringify({ choice }),
  });
}

export async function getVoteCounts() {
  const rows = await supabaseRequest("landing_votes?select=choice");
  return rows.reduce(
    (counts, row) => {
      if (row.choice in counts) counts[row.choice] += 1;
      return counts;
    },
    { yes: 0, maybe: 0, no: 0 },
  );
}
