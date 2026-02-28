


import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { path } = req.query;
    
    let targetPath = '';
    if (Array.isArray(path)) {
        targetPath = path.join('/');
    } else {
        targetPath = (path as string) || '';
    }

    // Reconstruct query string excluding 'path'
    const queryParams = new URLSearchParams(req.query as any);
    queryParams.delete('path');
    const queryString = queryParams.toString();

    const url = `https://api.clickup.com/api/v2/${targetPath}${queryString ? `?${queryString}` : ''}`;

    const token = process.env.CLICKUP_API_TOKEN;

    if (!token) {
        return res.status(500).json({ 
            error: 'ClickUp API token not configured',
            message: 'Please set CLICKUP_API_TOKEN environment variable in Vercel project settings.'
        });
    }

    try {
        const response = await fetch(url, {
            method: req.method || 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: (req.method !== 'GET' && req.method !== 'HEAD' && req.body) ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('ClickUp API Error:', error);
        res.status(500).json({ error: 'Failed to fetch from ClickUp' });
    }
}
