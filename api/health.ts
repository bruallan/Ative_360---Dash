import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({ 
        status: 'ok', 
        message: 'API is working',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_CLICKUP_TOKEN: !!process.env.CLICKUP_API_TOKEN
        }
    });
}
