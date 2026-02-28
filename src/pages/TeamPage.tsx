
import React, { useEffect, useState } from 'react';
import { fetchWorkspaceMembers, ClickUpMember } from '../services/clickup';

const TeamPage: React.FC = () => {
    const [members, setMembers] = useState<ClickUpMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const data = await fetchWorkspaceMembers();
                setMembers(data);
            } catch (err) {
                setError('Failed to load team members');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadMembers();
    }, []);

    if (loading) return <div className="p-8">Loading team...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Equipe</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-md transition-shadow">
                        <div 
                            className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
                            style={{ backgroundColor: member.color || '#ccc' }}
                        >
                            {member.profilePicture ? (
                                <img src={member.profilePicture} alt={member.username} className="w-full h-full object-cover" />
                            ) : (
                                member.initials
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{member.username}</h2>
                        <p className="text-sm text-gray-500 mb-2">{member.email}</p>
                        <div className="mt-auto pt-4 w-full border-t border-gray-100 flex justify-between text-xs text-gray-400">
                            <span>Role: {member.role}</span>
                            <span>ID: {member.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPage;
