


import React, { useEffect, useState } from 'react';
import { fetchTrafficPipeline, ClickUpTask } from '../services/clickup';

const TrafficManagement: React.FC = () => {
    const [tasks, setTasks] = useState<ClickUpTask[]>([]);

    useEffect(() => {
        fetchTrafficPipeline().then(setTasks);
    }, []);

    return (
        <div id="tab-trafego" className="tab-content">
            <div className="header">
                <div className="page-title">
                    <h1>Tráfego</h1>
                </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', height: 'calc(100vh - 150px)' }}>
                <div className="card" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #10b981', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3>Pipeline de Tráfego</h3>
                    <div style={{ marginTop: '20px', overflowY: 'auto', flex: 1 }}>
                        {tasks.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center' }}>Nenhuma tarefa encontrada.</p>}
                        {tasks.map((task) => (
                            <div key={task.id} className="traffic-item">
                                <div>
                                    <div style={{ fontWeight: 600 }}>{task.name}</div>
                                    <div style={{ fontSize: '12px', color: task.status.color, fontWeight: 'bold' }}>Status: {task.status.status.toUpperCase()}</div>
                                </div>
                                <div className="traffic-meta">
                                    <div className="traffic-date">
                                        {task.due_date ? `Vence: ${new Date(parseInt(task.due_date)).toLocaleDateString('pt-BR')}` : 'Sem data'}
                                    </div>
                                    {task.assignees.length > 0 && (
                                        <img 
                                            src={task.assignees[0].profilePicture} 
                                            className="traffic-avatar" 
                                            title={`Responsável: ${task.assignees[0].username}`} 
                                            alt={task.assignees[0].username} 
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                <div className="card" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #f59e0b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h3>Performance Macro (Looker)</h3>
                    <div style={{ flex: 1, width: '100%', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden', position: 'relative', marginTop: '15px' }}>
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="https://lookerstudio.google.com/embed/reporting/fe045f5b-e1e8-4105-acaf-56f759367bb4/page/E5RwD" 
                            frameBorder="0" 
                            style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficManagement;
