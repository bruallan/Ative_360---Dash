



import React, { useState, useEffect } from 'react';
import TimeFilter from '../components/TimeFilter';
import { fetchWorkspaceMembers, fetchMemberTasks, ClickUpMember, ClickUpTask } from '../services/clickup';

const TeamPerformance: React.FC = () => {
    const [members, setMembers] = useState<ClickUpMember[]>([]);
    const [memberTasks, setMemberTasks] = useState<Record<number, ClickUpTask[]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedCollab, setSelectedCollab] = useState<any | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const fetchedMembers = await fetchWorkspaceMembers();
                setMembers(fetchedMembers);

                const tasksData: Record<number, ClickUpTask[]> = {};
                await Promise.all(fetchedMembers.map(async (member) => {
                    const tasks = await fetchMemberTasks(member.id);
                    tasksData[member.id] = tasks;
                }));
                setMemberTasks(tasksData);
            } catch (error) {
                console.error("Failed to load team data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getTaskStatusCategory = (status: string, dueDate: string | null) => {
        const now = Date.now();
        const isOverdue = dueDate && parseInt(dueDate) < now && status !== 'complete' && status !== 'closed';
        
        if (status === 'complete' || status === 'closed') return 'done';
        if (isOverdue) return 'overdue';
        if (status === 'in progress' || status === 'doing') return 'in_progress';
        return 'todo';
    };

    const getMemberStats = (memberId: number) => {
        const tasks = memberTasks[memberId] || [];
        const stats = {
            done: 0,
            overdue: 0,
            in_progress: 0,
            todo: 0,
            total: tasks.length,
            active: 0
        };

        tasks.forEach(task => {
            const category = getTaskStatusCategory(task.status.status, task.due_date);
            if (category === 'done') stats.done++;
            else if (category === 'overdue') stats.overdue++;
            else if (category === 'in_progress') stats.in_progress++;
            else stats.todo++;

            if (category !== 'done') stats.active++;
        });

        return stats;
    };

    const renderDonutChart = (stats: any) => {
        const total = stats.total || 1; // Avoid division by zero
        const radius = 38;
        const circumference = 2 * Math.PI * radius;
        
        const doneOffset = circumference - (stats.done / total) * circumference;
        const overdueOffset = circumference - (stats.overdue / total) * circumference;
        const inProgressOffset = circumference - (stats.in_progress / total) * circumference;
        const todoOffset = circumference - (stats.todo / total) * circumference;

        // Calculate segments
        // We need cumulative offsets for SVG stroke-dasharray
        // But simple way is to use segments with offsets
        
        let currentOffset = 0;
        const segments = [
            { color: '#10b981', value: stats.done },       // Green
            { color: '#ef4444', value: stats.overdue },    // Red
            { color: '#f59e0b', value: stats.in_progress }, // Yellow
            { color: '#9ca3af', value: stats.todo }        // Gray
        ];

        return (
            <svg width="90" height="90" viewBox="0 0 100 100" style={{ position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%) rotate(-90deg)' }}>
                {segments.map((seg, i) => {
                    const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
                    const strokeDashoffset = -currentOffset;
                    currentOffset += (seg.value / total) * circumference;
                    return (
                        <circle
                            key={i}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="6"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                        />
                    );
                })}
            </svg>
        );
    };

    const openCollabModal = (member: ClickUpMember) => {
        setSelectedCollab({
            ...member,
            tasks: memberTasks[member.id] || []
        });
    };

    const closeCollabModal = () => {
        setSelectedCollab(null);
    };

    const groupTasksByStatus = (tasks: ClickUpTask[]) => {
        const groups = {
            'A fazer': [] as ClickUpTask[],
            'Fazendo': [] as ClickUpTask[],
            'Feito': [] as ClickUpTask[],
            'Entregue': [] as ClickUpTask[]
        };

        tasks.forEach(task => {
            const status = task.status.status.toLowerCase();
            if (status === 'complete') groups['Feito'].push(task);
            else if (status === 'closed') groups['Entregue'].push(task);
            else if (status === 'in progress' || status === 'doing') groups['Fazendo'].push(task);
            else groups['A fazer'].push(task);
        });

        return groups;
    };

    return (
        <div id="tab-performance" className="tab-content">
            <div className="header">
                <div className="page-title">
                    <h1>Performance Time</h1>
                </div>
                <TimeFilter />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="spinner"></div>
                </div>

            ) : (
                <div className="collab-grid" id="team-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {members.map(member => {
                        const stats = getMemberStats(member.id);

                        
                        return (
                            <div key={member.id} className="collab-card high" onClick={() => openCollabModal(member)} style={{ position: 'relative', overflow: 'visible', paddingTop: '30px' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 15px' }}>
                                    {renderDonutChart(stats)}
                                    <div className="collab-avatar-placeholder" style={{ 
                                        background: member.color, 
                                        color: 'white', 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '24px', 
                                        fontWeight: 'bold',
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        zIndex: 1
                                    }}>
                                        {member.profilePicture ? (
                                            <img src={member.profilePicture} alt={member.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                        ) : (
                                            member.initials
                                        )}
                                    </div>
                                </div>
                                
                                <h3 style={{ margin: 0 }}>{member.username}</h3>
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{member.custom_role || 'Membro'}</p>
                                
                                <div style={{ marginTop: '15px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: stats.active > 0 ? 'var(--primary)' : 'var(--success)' }}>
                                        {stats.active}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Tarefas Ativas</div>
                                </div>
                                <small style={{ color: '#6b7280', fontSize: '10px', marginTop: '10px', display: 'block' }}>Clique para ver tarefas</small>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedCollab && (
                <div id="modal-overlay" className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCollabModal(); }}>
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        <span className="close-btn" onClick={closeCollabModal}>&times;</span>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                background: selectedCollab.color, 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                marginRight: '15px',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                {selectedCollab.profilePicture ? (
                                    <img src={selectedCollab.profilePicture} alt={selectedCollab.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                ) : (
                                    selectedCollab.initials
                                )}
                            </div>
                            <div>
                                <h2 id="modal-title" style={{ margin: 0 }}>{selectedCollab.username}</h2>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{selectedCollab.custom_role || 'Membro'}</p>
                            </div>
                        </div>

                        <div className="task-columns" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {Object.entries(groupTasksByStatus(selectedCollab.tasks)).map(([status, tasks]) => (
                                <div key={status} className="task-column">
                                    <h4 style={{ 
                                        borderBottom: `2px solid ${
                                            status === 'A fazer' ? '#9ca3af' : 
                                            status === 'Fazendo' ? '#f59e0b' : 
                                            status === 'Feito' ? '#10b981' : '#3b82f6'
                                        }`,
                                        paddingBottom: '8px',
                                        marginBottom: '10px'
                                    }}>
                                        {status} ({tasks.length})
                                    </h4>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {tasks.map(t => (
                                            <div key={t.id} className="modal-task-item" style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e5e7eb' }}>
                                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '5px' }}>{t.name}</div>
                                                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                                                    {t.due_date && <span>{new Date(parseInt(t.due_date)).toLocaleDateString('pt-BR')}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamPerformance;
