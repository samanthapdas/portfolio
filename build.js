// Monta a pasta "dist" que o Cloudflare publica.
// Junta todos os projetos de content/projetos/*.json num arquivo só (content/projetos.json),
// tirando os que estão com "Publicado" desmarcado e ordenando pelo campo "Ordem".
const fs = require("fs");
const path = require("path");

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "content"), { recursive: true });

fs.copyFileSync("index.html", path.join(out, "index.html"));
fs.copyFileSync("content/site.json", path.join(out, "content/site.json"));
if (fs.existsSync("media")) fs.cpSync("media", path.join(out, "media"), { recursive: true });
for (const f of ["favicon.ico", "favicon.png", "favicon.svg"]) if (fs.existsSync(f)) fs.copyFileSync(f, path.join(out, f));

const dir = "content/projetos";
const projetos = fs.readdirSync(dir)
  .filter(f => f.endsWith(".json"))
  .map(f => {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (!p.slug) p.slug = f.replace(/\.json$/, "");
      return p;
    } catch (e) { console.warn("Ignorando arquivo com erro:", f, e.message); return null; }
  })
  .filter(p => p && p.publicado !== false)
  .sort((a, b) => (Number(a.ordem) || 999) - (Number(b.ordem) || 999) || String(b.ano).localeCompare(String(a.ano)));

fs.writeFileSync(path.join(out, "content/projetos.json"), JSON.stringify(projetos));
console.log(`Pronto: ${projetos.length} projetos publicados.`);
