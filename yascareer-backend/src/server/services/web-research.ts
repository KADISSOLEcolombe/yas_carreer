import { env } from "@/server/env";

export type WebSource = {
  title: string;
  url: string;
  snippet: string;
};

export type WebResearchResult = {
  query: string;
  summary: string;
  sources: WebSource[];
  provider: "tavily" | "serper" | "duckduckgo" | "none";
};

function decodeHtml(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildQueries(input: {
  fullName?: string | null;
  email?: string | null;
  skills?: string | null;
  offerTitle?: string | null;
}): string[] {
  const name = (input.fullName || "").trim();
  const email = (input.email || "").trim();
  const local = email.includes("@") ? email.split("@")[0] : "";
  const skillHint = (input.skills || "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  const queries: string[] = [];
  if (name.length >= 3) {
    queries.push(`"${name}" Togo`);
    queries.push(`${name} LinkedIn`);
    if (skillHint) queries.push(`${name} ${skillHint}`);
    if (input.offerTitle) queries.push(`${name} ${input.offerTitle}`);
  } else if (local.length >= 3) {
    queries.push(`${local} Togo`);
  }
  return [...new Set(queries)].slice(0, 3);
}

async function searchTavily(query: string, apiKey: string): Promise<WebSource[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      max_results: 5,
    }),
  });
  if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
  const data = (await res.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };
  return (data.results || [])
    .map((r) => ({
      title: String(r.title || "Résultat"),
      url: String(r.url || ""),
      snippet: String(r.content || "").slice(0, 280),
    }))
    .filter((r) => r.url);
}

async function searchSerper(query: string, apiKey: string): Promise<WebSource[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  if (!res.ok) throw new Error(`Serper HTTP ${res.status}`);
  const data = (await res.json()) as {
    organic?: { title?: string; link?: string; snippet?: string }[];
  };
  return (data.organic || [])
    .map((r) => ({
      title: String(r.title || "Résultat"),
      url: String(r.link || ""),
      snippet: String(r.snippet || "").slice(0, 280),
    }))
    .filter((r) => r.url);
}

async function searchDuckDuckGoInstant(query: string): Promise<WebSource[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`DuckDuckGo HTTP ${res.status}`);
  const data = (await res.json()) as {
    AbstractText?: string;
    AbstractURL?: string;
    Heading?: string;
    RelatedTopics?: { Text?: string; FirstURL?: string }[];
  };
  const sources: WebSource[] = [];
  if (data.AbstractText && data.AbstractURL) {
    sources.push({
      title: data.Heading || "DuckDuckGo",
      url: data.AbstractURL,
      snippet: data.AbstractText.slice(0, 280),
    });
  }
  for (const topic of data.RelatedTopics || []) {
    if (topic.Text && topic.FirstURL) {
      sources.push({
        title: topic.Text.slice(0, 80),
        url: topic.FirstURL,
        snippet: topic.Text.slice(0, 280),
      });
    }
    if (sources.length >= 5) break;
  }
  return sources;
}

async function searchDuckDuckGoHtml(query: string): Promise<WebSource[]> {
  const res = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; YasCareerBot/1.0; +https://yascareer.tg)",
    },
    body: `q=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`DuckDuckGo HTML HTTP ${res.status}`);
  const html = await res.text();
  const sources: WebSource[] = [];
  const blockRe =
    /uddg=([^&"]+)[^>]*>[\s\S]*?class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(html)) && sources.length < 5) {
    try {
      const url = decodeURIComponent(match[1]);
      const title = decodeHtml(match[2]);
      const snippet = decodeHtml(match[3]);
      if (url.startsWith("http")) sources.push({ title: title || url, url, snippet });
    } catch {
      /* ignore */
    }
  }
  if (!sources.length) {
    const simple = /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = simple.exec(html)) && sources.length < 5) {
      let href = match[1];
      const title = decodeHtml(match[2]);
      if (href.includes("uddg=")) {
        const m = href.match(/uddg=([^&]+)/);
        if (m) href = decodeURIComponent(m[1]);
      }
      if (href.startsWith("http"))
        sources.push({ title: title || href, url: href, snippet: "" });
    }
  }
  return sources;
}

function summarizeSources(name: string, sources: WebSource[]): string {
  if (!sources.length) {
    return `Aucune information publique fiable trouvée pour « ${name} » sur le web.`;
  }
  const lines = sources.slice(0, 5).map((s, i) => {
    const bit = s.snippet || s.title;
    return `${i + 1}. ${bit}${s.url ? ` (${s.url})` : ""}`;
  });
  return `Informations publiques trouvées pour « ${name} » :\n${lines.join("\n")}`;
}

export const WebResearchService = {
  isConfigured() {
    return Boolean(env.TAVILY_API_KEY || env.SERPER_API_KEY);
  },

  async researchPerson(input: {
    fullName?: string | null;
    email?: string | null;
    skills?: string | null;
    offerTitle?: string | null;
  }): Promise<WebResearchResult> {
    const name = (input.fullName || input.email || "candidat").trim();
    const queries = buildQueries(input);
    if (!queries.length) {
      return {
        query: "",
        summary: "Nom candidat insuffisant pour une recherche web.",
        sources: [],
        provider: "none",
      };
    }

    const tavily = env.TAVILY_API_KEY;
    const serper = env.SERPER_API_KEY;
    const all: WebSource[] = [];
    let provider: WebResearchResult["provider"] = "none";

    for (const query of queries) {
      try {
        let batch: WebSource[] = [];
        if (tavily) {
          batch = await searchTavily(query, tavily);
          provider = "tavily";
        } else if (serper) {
          batch = await searchSerper(query, serper);
          provider = "serper";
        } else {
          batch = await searchDuckDuckGoInstant(query);
          if (!batch.length) batch = await searchDuckDuckGoHtml(query);
          provider = batch.length ? "duckduckgo" : provider;
        }
        all.push(...batch);
      } catch (error) {
        console.warn("[web-research] query failed:", query, error);
      }
      if (all.length >= 8) break;
    }

    const seen = new Set<string>();
    const sources = all
      .filter((s) => {
        const key = s.url.replace(/\/$/, "").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);

    return {
      query: queries[0],
      summary: summarizeSources(name, sources),
      sources,
      provider,
    };
  },
};
