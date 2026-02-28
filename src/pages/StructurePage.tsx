
import React, { useEffect, useState } from 'react';
import { fetchFullStructure } from '../services/clickup';

interface List {
    id: string;
    name: string;
}

interface Folder {
    id: string;
    name: string;
    lists: List[];
}

interface Space {
    id: string;
    name: string;
    folders: Folder[];
    lists: List[];
}

interface Team {
    id: string;
    name: string;
    spaces: Space[];
}

const StructurePage: React.FC = () => {
    const [structure, setStructure] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStructure = async () => {
            try {
                const data = await fetchFullStructure();
                setStructure(data);
            } catch (err) {
                setError('Failed to load structure');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStructure();
    }, []);

    if (loading) return <div className="p-8">Loading structure...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Pastas e Subpastas</h1>
            <div className="space-y-8">
                {structure.map((team) => (
                    <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <i className="fa-solid fa-users mr-3 text-gray-500"></i>
                                {team.name} <span className="text-sm font-normal text-gray-500 ml-2">(Team ID: {team.id})</span>
                            </h2>
                        </div>
                        <div className="p-6">
                            {team.spaces.map((space) => (
                                <div key={space.id} className="mb-8 last:mb-0">
                                    <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center">
                                        <i className="fa-solid fa-rocket mr-2"></i>
                                        {space.name} <span className="text-xs text-gray-400 ml-2">({space.id})</span>
                                    </h3>
                                    
                                    <div className="ml-6 border-l-2 border-indigo-100 pl-6 space-y-6">
                                        {/* Folders */}
                                        {space.folders.map((folder) => (
                                            <div key={folder.id} className="relative">
                                                <div className="absolute -left-[33px] top-3 w-4 h-0.5 bg-indigo-100"></div>
                                                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                                                    <i className="fa-regular fa-folder mr-2 text-yellow-500"></i>
                                                    {folder.name} <span className="text-xs text-gray-400 ml-2">({folder.id})</span>
                                                </h4>
                                                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {folder.lists.map((list) => (
                                                        <div key={list.id} className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-600 border border-gray-100 flex items-center">
                                                            <i className="fa-solid fa-list-check mr-2 text-blue-400"></i>
                                                            <span className="truncate" title={list.name}>{list.name}</span>
                                                            <span className="ml-auto text-xs text-gray-400 font-mono">{list.id}</span>
                                                        </div>
                                                    ))}
                                                    {folder.lists.length === 0 && (
                                                        <span className="text-xs text-gray-400 italic">No lists in this folder</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Folderless Lists */}
                                        {space.lists.length > 0 && (
                                            <div className="relative mt-4">
                                                <div className="absolute -left-[33px] top-3 w-4 h-0.5 bg-indigo-100"></div>
                                                <h4 className="font-medium text-gray-500 mb-2 flex items-center italic">
                                                    <i className="fa-regular fa-folder-open mr-2"></i>
                                                    Folderless Lists
                                                </h4>
                                                <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {space.lists.map((list) => (
                                                        <div key={list.id} className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-600 border border-gray-100 flex items-center">
                                                            <i className="fa-solid fa-list-check mr-2 text-blue-400"></i>
                                                            <span className="truncate" title={list.name}>{list.name}</span>
                                                            <span className="ml-auto text-xs text-gray-400 font-mono">{list.id}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StructurePage;
