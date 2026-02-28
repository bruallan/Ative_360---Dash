
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: { NODE_ENV: process.env.NODE_ENV, HAS_CLICKUP_TOKEN: !!process.env.CLICKUP_API_TOKEN } });
  });


  // ClickUp Proxy
  app.get("/api/debug-clickup", async (req, res) => {
    const token = process.env.CLICKUP_API_TOKEN;
    const maskedToken = token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "MISSING";
    
    console.log(`[Debug] Token: ${maskedToken}`);
    
    try {
      const response = await fetch("https://api.clickup.com/api/v2/user", {
        headers: { "Authorization": token || "" }
      });
      const data = await response.json();
      res.json({ 
        tokenStatus: maskedToken, 
        clickupStatus: response.status, 
        userData: data 
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // ClickUp Structure Debug
  app.get("/api/debug-clickup-structure", async (req, res) => {
    const token = process.env.CLICKUP_API_TOKEN;
    if (!token) return res.status(500).json({ error: "No token" });

    const headers = { "Authorization": token };
    const baseUrl = "https://api.clickup.com/api/v2";

    try {
        // 1. Get Teams
        const teamsRes = await fetch(`${baseUrl}/team`, { headers });
        const teamsData = await teamsRes.json() as any;
        const teams = teamsData.teams || [];

        const structure: any[] = [];

        for (const team of teams) {
            const teamData: any = { id: team.id, name: team.name, spaces: [] };
            
            // 2. Get Spaces
            const spacesRes = await fetch(`${baseUrl}/team/${team.id}/space?archived=false`, { headers });
            const spacesData = await spacesRes.json() as any;
            const spaces = spacesData.spaces || [];

            for (const space of spaces) {
                const spaceData: any = { id: space.id, name: space.name, folders: [], lists: [] };

                // 3. Get Folders
                const foldersRes = await fetch(`${baseUrl}/space/${space.id}/folder?archived=false`, { headers });
                const foldersData = await foldersRes.json() as any;
                const folders = foldersData.folders || [];

                for (const folder of folders) {
                    const folderData: any = { id: folder.id, name: folder.name, lists: [] };
                    
                    // 4. Get Lists in Folder
                    const listsRes = await fetch(`${baseUrl}/folder/${folder.id}/list?archived=false`, { headers });
                    const listsData = await listsRes.json() as any;
                    const lists = listsData.lists || [];
                    
                    folderData.lists = lists.map((l: any) => ({ id: l.id, name: l.name }));
                    spaceData.folders.push(folderData);
                }

                // 5. Get Folderless Lists in Space
                const folderlessListsRes = await fetch(`${baseUrl}/space/${space.id}/list?archived=false`, { headers });
                const folderlessListsData = await folderlessListsRes.json() as any;
                const folderlessLists = folderlessListsData.lists || [];
                
                spaceData.lists = folderlessLists.map((l: any) => ({ id: l.id, name: l.name }));
                
                teamData.spaces.push(spaceData);
            }
            structure.push(teamData);
        }

        res.json(structure);

    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
  });

  app.use("/api/clickup", async (req, res) => {
    const token = process.env.CLICKUP_API_TOKEN;
    
    // Construct the target URL
    // req.url in app.use is relative to the mount point and includes the query string
    const targetUrl = `https://api.clickup.com/api/v2${req.url}`;

    console.log(`[ClickUp Proxy] Incoming Request: ${req.method} ${req.originalUrl}`);
    console.log(`[ClickUp Proxy] Mount Point: ${req.baseUrl}`);
    console.log(`[ClickUp Proxy] Relative URL: ${req.url}`);
    console.log(`[ClickUp Proxy] Target URL: ${targetUrl}`);
    console.log(`[ClickUp Proxy] Token present: ${!!token}`);

    if (!token) {
      console.error('[ClickUp Proxy] Error: Token missing');
      return res.status(500).json({ error: "ClickUp API token not configured" });
    }

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      });

      console.log(`[ClickUp Proxy] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ClickUp Proxy] Error response body: ${errorText}`);
        return res.status(response.status).json({ error: 'ClickUp API Error', details: errorText });
      }

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("[ClickUp Proxy] Network Error:", error);
      res.status(500).json({ error: "Failed to fetch from ClickUp", details: String(error) });
    }
  });

  // Catch-all for API routes to prevent falling through to frontend
  app.all("/api/*", (req, res) => {
    console.log(`[API 404] Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: "API route not found", path: req.path });
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
