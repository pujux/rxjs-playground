export async function loadRxjsTypes(js: any) {
  const baseImport = "https://cdn.jsdelivr.net/npm/rxjs@7/dist/types/index.d.ts";

  const importPattern = /from ["'](\.\/[^"']+)["'];?|import ["'](\.\/[^"']+)["']/g;
  const visited = new Set<string>();

  async function loadDts(url: string) {
    if (visited.has(url)) {
      return;
    }

    visited.add(url);

    let content: string;
    try {
      const response = await fetch(url);
      content = await response.text();
    } catch (err) {
      console.warn("Failed to load RxJS typings:", url, err);
      return;
    }

    const localUri = "file:///node_modules/rxjs/" + url.split("dist/types/")[1];
    js.addExtraLib(content, localUri);

    const importRegex = new RegExp(importPattern.source, "g");
    const imports = Array.from(content.matchAll(importRegex))
      .map((match) => match[1] || match[2])
      .filter((importPath): importPath is string => Boolean(importPath))
      .map((importPath) => new URL(importPath + ".d.ts", url).href);

    const results = await Promise.allSettled(
      imports.map((resolvedUrl) => loadDts(resolvedUrl))
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn("Failed to load RxJS typings:", imports[index], result.reason);
      }
    });
  }

  await loadDts(baseImport);

  console.log("Loaded RxJS typings:", visited.size);
}
