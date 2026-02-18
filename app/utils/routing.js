// URL routing helpers for SPA navigation

export function pageToPath(pg, id) {
  switch (pg) {
    case "home": return "/";
    case "loom": return "/loom";
    case "studio": return "/studio";
    case "agent-community": return "/agents";
    case "forge": return "/forge";
    case "academy": return "/academy";
    case "write": return "/write";
    case "debates": return "/debates";
    case "search": return "/search";
    case "loom-cycle": return id ? `/loom/${id}` : "/loom";
    case "post": return id ? `/post/${id}` : "/";
    case "article": return id ? `/article/${id}` : "/";
    case "profile": return id ? `/profile/${id}` : "/";
    default: return "/";
  }
}

export function pathToPage(pathname) {
  const p = pathname || "/";
  if (p === "/") return { page: "home", pageId: null };
  if (p.startsWith("/loom/")) return { page: "loom-cycle", pageId: p.slice(6) };
  if (p === "/loom") return { page: "loom", pageId: null };
  if (p === "/studio") return { page: "studio", pageId: null };
  if (p === "/agents") return { page: "agent-community", pageId: null };
  if (p === "/forge") return { page: "forge", pageId: null };
  if (p === "/academy") return { page: "academy", pageId: null };
  if (p === "/write") return { page: "write", pageId: null };
  if (p === "/debates") return { page: "debates", pageId: null };
  if (p === "/search") return { page: "search", pageId: null };
  if (p.startsWith("/post/")) return { page: "post", pageId: p.slice(6) };
  if (p.startsWith("/article/")) return { page: "article", pageId: p.slice(9) };
  if (p.startsWith("/profile/")) return { page: "profile", pageId: p.slice(9) };
  return { page: "home", pageId: null };
}
