import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const token = process.env.CLICKUP_API_TOKEN;
    const maskedToken = token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "MISSING";
    
    console.log(`[Debug Structure] Token: ${maskedToken}`);
    
    try {
      console.log("[Debug Structure] Fetching Teams...");
      const teamsResponse = await fetch("https://api.clickup.com/api/v2/team", {
        headers: { "Authorization": token || "" }
      });
      
      if (!teamsResponse.ok) {
        const text = await teamsResponse.text();
        console.error(`[Debug Structure] Failed to fetch teams: ${teamsResponse.status} - ${text}`);
        return res.status(teamsResponse.status).json({ error: "Failed to fetch teams", details: text });
      }

      const teamsData: any = await teamsResponse.json();
      const teams = teamsData.teams || [];
      const structure: any[] = [];

      for (const team of teams) {
        const teamNode: any = { id: team.id, name: team.name, type: "team", children: [] };
        
        console.log(`[Debug Structure] Fetching Spaces for Team ${team.name} (${team.id})...`);
        const spacesResponse = await fetch(`https://api.clickup.com/api/v2/team/${team.id}/space`, {
          headers: { "Authorization": token || "" }
        });

        if (spacesResponse.ok) {
          const spacesData: any = await spacesResponse.json();
          const spaces = spacesData.spaces || [];

          for (const space of spaces) {
            const spaceNode: any = { id: space.id, name: space.name, type: "space", children: [] };
            
            console.log(`[Debug Structure] Fetching Folders for Space ${space.name} (${space.id})...`);
            const foldersResponse = await fetch(`https://api.clickup.com/api/v2/space/${space.id}/folder`, {
              headers: { "Authorization": token || "" }
            });

            if (foldersResponse.ok) {
              const foldersData: any = await foldersResponse.json();
              const folders = foldersData.folders || [];

              for (const folder of folders) {
                const folderNode: any = { id: folder.id, name: folder.name, type: "folder", children: [] };
                
                // Folders contain lists directly in the response usually, but let's check
                if (folder.lists) {
                    folderNode.children = folder.lists.map((l: any) => ({ id: l.id, name: l.name, type: "list" }));
                }
                spaceNode.children.push(folderNode);
              }
            }
            
            // Spaces can also have folderless lists
            console.log(`[Debug Structure] Fetching Folderless Lists for Space ${space.name} (${space.id})...`);
            const listsResponse = await fetch(`https://api.clickup.com/api/v2/space/${space.id}/list`, {
                headers: { "Authorization": token || "" }
            });
            
            if (listsResponse.ok) {
                const listsData: any = await listsResponse.json();
                const lists = listsData.lists || [];
                lists.forEach((l: any) => {
                    spaceNode.children.push({ id: l.id, name: l.name, type: "list" });
                });
            }

            teamNode.children.push(spaceNode);
          }
        }
        structure.push(teamNode);
      }

      res.json({ structure });
    } catch (error) {
      console.error("[Debug Structure] Error:", error);
      res.status(500).json({ error: String(error) });
    }
}
