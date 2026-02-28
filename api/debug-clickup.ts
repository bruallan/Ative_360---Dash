import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const token = process.env.CLICKUP_API_TOKEN;
    const maskedToken = token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : "MISSING";
    
    console.log(`[Debug] Token: ${maskedToken}`);
    
    try {
      // Test outbound connectivity first
      console.log("[Debug] Testing outbound connectivity to httpbin.org...");
      const probe = await fetch("https://httpbin.org/get");
      console.log(`[Debug] Probe status: ${probe.status}`);
      
      console.log("[Debug] Fetching ClickUp User...");
      const response = await fetch("https://api.clickup.com/api/v2/user", {
        headers: { "Authorization": token || "" }
      });
      
      console.log(`[Debug] ClickUp Response Status: ${response.status}`);
      // console.log(`[Debug] ClickUp Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log(`[Debug] ClickUp Response Body Preview: ${text.substring(0, 200)}`);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: "Failed to parse JSON", rawText: text };
      }

      res.json({ 
        tokenStatus: maskedToken, 
        clickupStatus: response.status, 
        probeStatus: probe.status,
        // responseHeaders: Object.fromEntries(response.headers.entries()),
        userData: data 
      });
    } catch (error) {
      console.error("[Debug] Error:", error);
      res.status(500).json({ error: String(error) });
    }
}
