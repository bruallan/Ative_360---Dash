import React, { useEffect, useState } from 'react';

const DebugPage: React.FC = () => {
    const [health, setHealth] = useState<any>(null);
    const [debugClickup, setDebugClickup] = useState<any>(null);
    const [structure, setStructure] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const healthRes = await fetch('/api/health');
                const healthData = await healthRes.json().catch(e => ({ error: 'Failed to parse JSON', details: String(e) }));
                setHealth(healthData);

                const debugRes = await fetch('/api/debug-clickup');
                const debugData = await debugRes.json().catch(e => ({ error: 'Failed to parse JSON', details: String(e) }));
                setDebugClickup(debugData);

                const structureRes = await fetch('/api/debug-clickup-structure');
                const structureData = await structureRes.json().catch(e => ({ error: 'Failed to parse JSON', details: String(e) }));
                setStructure(structureData);
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading debug info...</div>;

    return (
        <div className="p-8 overflow-auto h-full bg-white text-black">
            <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}
            
            <div className="grid gap-6">
                <div className="border rounded-lg p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">1. API Server Status</h2>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                        {JSON.stringify(health, null, 2)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Should return <code>{`{"status": "ok"}`}</code>. If not, the backend server is not running correctly.</p>
                </div>

                <div className="border rounded-lg p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">2. ClickUp Token & Connectivity</h2>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                        {JSON.stringify(debugClickup, null, 2)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Checks if <code>CLICKUP_API_TOKEN</code> is set and if we can reach ClickUp API.
                        <br/>Status 200 = OK. Status 401 = Invalid Token. Status 404 = Endpoint not found (proxy issue).
                    </p>
                </div>

                <div className="border rounded-lg p-4 shadow-sm">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">3. ClickUp Workspace Structure</h2>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto max-h-96">
                        {JSON.stringify(structure, null, 2)}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Lists all Teams, Spaces, Folders, and Lists accessible by the token.
                        <br/>Use this to verify if the List IDs in <code>src/config/clickupIds.ts</code> match what ClickUp actually returns.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DebugPage;
