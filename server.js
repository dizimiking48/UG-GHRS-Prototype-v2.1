const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 5000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");
fs.mkdirSync(DATA_DIR, { recursive: true });

const seed = [
  {
    id: "UG-1042", title: "Loose rock observed near access drive", category: "Ground instability",
    severity: "Critical", location: { shaft: "South Shaft", level: "Level 420", section: "Crosscut 7" },
    description: "Freshly loosened rock fragments observed on the hanging wall. Area requires inspection before work continues.",
    reporter: "Demo Miner 01", reportedAt: new Date(Date.now() - 1000*60*42).toISOString(),
    status: "Investigating", assignee: "Shift Supervisor", dueAt: new Date(Date.now() + 1000*60*18).toISOString(),
    actions: ["Supervisor notified"], evidence: [], verifiedBy: null, closedAt: null, escalation: true
  },
  {
    id: "UG-1038", title: "Water seepage increasing", category: "Water inflow",
    severity: "High", location: { shaft: "North Shaft", level: "Level 360", section: "Pump Bay 2" },
    description: "Water seepage appears greater than on the previous shift. Check drainage and report changes.",
    reporter: "Demo Miner 02", reportedAt: new Date(Date.now() - 1000*60*60*4).toISOString(),
    status: "Assigned", assignee: "Geotechnical Team", dueAt: new Date(Date.now() + 1000*60*60*2).toISOString(),
    actions: [], evidence: [], verifiedBy: null, closedAt: null, escalation: false
  },
  {
    id: "UG-1031", title: "Ventilation duct damaged", category: "Ventilation",
    severity: "Medium", location: { shaft: "South Shaft", level: "Level 420", section: "Stope 4 Access" },
    description: "Ventilation duct has a visible tear. Airflow should be checked by the responsible team.",
    reporter: "Demo Miner 03", reportedAt: new Date(Date.now() - 1000*60*60*15).toISOString(),
    status: "Resolved - awaiting verification", assignee: "Ventilation Officer", dueAt: new Date(Date.now() - 1000*60*60).toISOString(),
    actions: ["Repair recorded by assigned team"], evidence: [], verifiedBy: null, closedAt: null, escalation: false
  },
  {
    id: "UG-1024", title: "Damaged cable protection", category: "Electrical",
    severity: "Low", location: { shaft: "North Shaft", level: "Level 360", section: "Workshop Access" },
    description: "Cable protection is damaged. Isolate and inspect in line with site procedures.",
    reporter: "Demo Miner 04", reportedAt: new Date(Date.now() - 1000*60*60*29).toISOString(),
    status: "Closed", assignee: "Electrical Team", dueAt: new Date(Date.now() - 1000*60*60*20).toISOString(),
    actions: ["Inspection completed", "Protection replaced"], evidence: [], verifiedBy: "HSE Officer", closedAt: new Date(Date.now() - 1000*60*60*18).toISOString(), escalation: false
  },
  {
    id: "UG-1019", title: "Rock fragments on footpath", category: "Ground instability",
    severity: "High", location: { shaft: "South Shaft", level: "Level 420", section: "Crosscut 7" },
    description: "Small rock fragments reported on the pedestrian route. Check ground conditions and barricade if required.",
    reporter: "Demo Miner 05", reportedAt: new Date(Date.now() - 1000*60*60*31).toISOString(),
    status: "Closed", assignee: "Shift Supervisor", dueAt: new Date(Date.now() - 1000*60*60*25).toISOString(),
    actions: ["Area inspected", "Loose material removed"], evidence: [], verifiedBy: "Geotechnical Engineer", closedAt: new Date(Date.now() - 1000*60*60*23).toISOString(), escalation: false
  }
];

function loadReports() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch { return seed; }
}
function saveReports(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
let reports = loadReports();
let audit = [];

const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"application/javascript; charset=utf-8", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon", ".webmanifest":"application/manifest+json" };
function send(res, status, data) {
  res.writeHead(status, { "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store", "Access-Control-Allow-Origin":"*" });
  res.end(JSON.stringify(data));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 2e6) reject(new Error("Request too large")); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}
function log(action, reportId, actor) {
  audit.unshift({ id: crypto.randomUUID(), action, reportId, actor: actor || "Prototype user", at: new Date().toISOString() });
  audit = audit.slice(0, 100);
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/report") { res.writeHead(302, { Location: "/reporter.html" }); return res.end(); }
  if (pathname === "/manage") { res.writeHead(302, { Location: "/index.html" }); return res.end(); }
  if (pathname === "/reporter" || pathname === "/reporter.html") {
    const filePath = path.join(PUBLIC, "reporter.html");
    fs.readFile(filePath, (err, content) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream", "Cache-Control":"public, max-age=300" });
      return res.end(content);
    });
    return;
  }
  if (pathname === "/index" || pathname === "/index.html" || pathname === "/") {
    const filePath = path.join(PUBLIC, "index.html");
    fs.readFile(filePath, (err, content) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream", "Cache-Control":"public, max-age=300" });
      return res.end(content);
    });
    return;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET,POST,PATCH,OPTIONS", "Access-Control-Allow-Headers":"Content-Type" }); return res.end();
  }
  if (url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/health") return send(res, 200, { ok:true, prototype:true, reports:reports.length });
    if (url.pathname === "/api/reports" && req.method === "GET") return send(res, 200, { reports });
    if (url.pathname === "/api/reports" && req.method === "POST") {
      try {
        const b = await body(req);
        const payload = b && typeof b === "object" ? b : {};
        const location = payload.location && typeof payload.location === "object" ? payload.location : {};
        const title = String(payload.title ?? "").trim();
        const category = String(payload.category ?? "").trim();
        const severity = String(payload.severity ?? "").trim();
        const description = String(payload.description ?? "").trim();
        const shaft = String(location.shaft ?? "").trim();
        const level = String(location.level ?? "").trim();
        const section = String(location.section ?? "").trim();
        if (payload.clientId) {
          const existing = reports.find(r => r.clientId === String(payload.clientId));
          if (existing) return send(res, 200, { report:existing, duplicate:true, received:true });
        }
        if (!title || !category || !severity || !description || !shaft || !level || !section) {
          return send(res, 400, { error:"Complete all required report fields." });
        }
        const report = {
          id: "UG-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
          clientId:payload.clientId ? String(payload.clientId).slice(0,100) : null,
          clientRef:payload.clientRef ? String(payload.clientRef).slice(0,100) : null,
          title:title.slice(0,120), category:category, severity:severity,
          location:{ shaft, level, section }, description:description.slice(0,1500),
          reporter:String(payload.reporter || "Underground worker").trim().slice(0,80),
          reporterId:String(payload.reporterId || "").trim().slice(0,80),
          contact:String(payload.contact || "").trim().slice(0,80),
          shift:String(payload.shift || "Not specified").trim().slice(0,40),
          reportedAt:payload.reportedAt && !Number.isNaN(Date.parse(payload.reportedAt)) ? new Date(payload.reportedAt).toISOString() : new Date().toISOString(),
          serverReceivedAt:new Date().toISOString(), status:"New", assignee:"Unassigned",
          dueAt:new Date(Date.now() + (severity === "Critical" ? 15 : severity === "High" ? 60 : 240)*60000).toISOString(),
          actions:[], evidence:[], verifiedBy:null, closedAt:null, escalation:false
        };
        reports.unshift(report); saveReports(reports); log("Hazard reported", report.id, report.reporter);
        return send(res, 201, { report });
      } catch (e) { return send(res, 400, { error:e.message }); }
    }
    const match = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
    if (match && req.method === "PATCH") {
      try {
        const b = await body(req);
        const report = reports.find(r => r.id === decodeURIComponent(match[1]));
        if (!report) return send(res, 404, { error:"Report not found." });
        if (b.status) report.status = b.status;
        if (b.assignee !== undefined) report.assignee = String(b.assignee).slice(0,100);
        if (b.action) report.actions.push({ text:String(b.action).slice(0,500), by:String(b.actor || "Prototype user"), at:new Date().toISOString() });
        if (b.verifiedBy) { report.verifiedBy = String(b.verifiedBy); report.status = "Closed"; report.closedAt = new Date().toISOString(); }
        if (b.escalation === true) { report.escalation = true; report.escalatedAt = new Date().toISOString(); report.escalationBy = String(b.actor || "Prototype user"); }
        saveReports(reports); log(b.action ? "Corrective action updated" : "Report updated", report.id, b.actor);
        return send(res, 200, { report });
      } catch (e) { return send(res, 400, { error:e.message }); }
    }
    if (url.pathname === "/api/audit" && req.method === "GET") return send(res, 200, { audit });
    return send(res, 404, { error:"API route not found." });
  }
  let filePath = path.join(PUBLIC, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type":mime[path.extname(filePath)] || "application/octet-stream", "Cache-Control":filePath.endsWith("service-worker.js") ? "no-cache" : "public, max-age=300" });
    res.end(content);
  });
});
server.listen(PORT, () => console.log(`UG-GHRS prototype running at http://localhost:${PORT}`));
