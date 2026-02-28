
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });


  // ClickUp Proxy
  app.use("/api/clickup", async (req, res) => {
    const token = process.env.CLICKUP_API_TOKEN;
    const url = `https://api.clickup.com/api/v2${req.url}`;

    console.log(`[ClickUp API] Request: ${req.method} ${url}`);
    console.log(`[ClickUp API] Token present: ${!!token}`);

    if (!token) {
      console.error('[ClickUp API] Error: Token missing');
      return res.status(500).json({ error: "ClickUp API token not configured" });
    }

    try {
      const response = await fetch(url, {
        method: req.method,
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      });

      console.log(`[ClickUp API] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ClickUp API] Error response: ${errorText}`);
        return res.status(response.status).json({ error: 'ClickUp API Error', details: errorText });
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[ClickUp API] Network Error:", error);
      res.status(500).json({ error: "Failed to fetch from ClickUp", details: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
