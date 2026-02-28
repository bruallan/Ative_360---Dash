


import React, { useState, useEffect } from 'react';
import { demands, macroTableData } from '../data/mockData';
import { fetchPendingMeetingsCount, fetchDemandsFilterCount, fetchTasks, ClickUpTask } from '../services/clickup';
import { CLICKUP_LISTS } from '../config/clickupIds';

const AccountManager: React.FC = () => {
    const [view, setView] = useState<'main' | 'macro' | 'calendar'>('main');
    const [modalType, setModalType] = useState<'reunioes' | 'demandas' | null>(null);
    const [meetingsCount, setMeetingsCount] = useState<number | null>(null);
    const [demandsCount, setDemandsCount] = useState<number | null>(null);
    const [meetingTasks, setMeetingTasks] = useState<ClickUpTask[]>([]);
    const [demandTasks, setDemandTasks] = useState<ClickUpTask[]>([]);

    useEffect(() => {
        fetchPendingMeetingsCount().then(setMeetingsCount);
        fetchDemandsFilterCount().then(setDemandsCount);
        // Pre-fetch meetings for calendar
        fetchTasks(CLICKUP_LISTS.ACC_REUNIOES_PESQUISAS).then(setMeetingTasks);
    }, []);

    const toggleView = (viewName: 'main' | 'macro' | 'calendar') => {
        setView(viewName);
    };

    const openModal = async (type: 'reunioes' | 'demandas') => {
        setModalType(type);
        if (type === 'reunioes') {
            // Already fetched in useEffect but good to refresh or ensure
            const tasks = await fetchTasks(CLICKUP_LISTS.ACC_REUNIOES_PESQUISAS);
            setMeetingTasks(tasks);
        } else if (type === 'demandas') {
            const tasks = await fetchTasks(CLICKUP_LISTS.ACC_FILTRO_DEMANDAS);
            setDemandTasks(tasks);
        }
    };

    const closeModal = () => {
        setModalType(null);
    };

    return (
        <div id="tab-account" className="tab-content">
            <div className="header">
                <div className="page-title">
                    <h1>Account</h1>
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => toggleView('main')} style={{ padding: '8px 16px', border: view === 'main' ? 'none' : '1px solid #e5e7eb', background: view === 'main' ? 'var(--primary)' : 'white', color: view === 'main' ? 'white' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Visão Geral</button>
                <button onClick={() => toggleView('macro')} style={{ padding: '8px 16px', border: view === 'macro' ? 'none' : '1px solid #e5e7eb', background: view === 'macro' ? 'var(--primary)' : 'white', color: view === 'macro' ? 'white' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Operação Macro</button>
                <button onClick={() => toggleView('calendar')} style={{ padding: '8px 16px', border: view === 'calendar' ? 'none' : '1px solid #e5e7eb', background: view === 'calendar' ? 'var(--primary)' : 'white', color: view === 'calendar' ? 'white' : 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Calendário</button>
            </div>

            {view === 'main' && (
                <div id="account-main-view">
                    <div className="grid-container">
                        <div className="card clickable-card border-2 border-green-500" onClick={() => openModal('reunioes')}>
                            <h4 style={{ margin: '0 0 10px', color: '#0369a1' }}>Reuniões Pendentes</h4>
                            <div className="kpi-value">{meetingsCount !== null ? meetingsCount : '...'}</div>
                            <small style={{ color: 'var(--text-light)' }}>Clique para ver lista</small>
                        </div>
                        <div className="card clickable-card border-2 border-green-500" onClick={() => openModal('demandas')}>
                            <h4 style={{ margin: '0 0 10px', color: '#c2410c' }}>Filtro de Demandas</h4>
                            <div className="kpi-value">{demandsCount !== null ? demandsCount : '...'}</div>
                            <small style={{ color: 'var(--text-light)' }}>Clique para ver lista</small>
                        </div>
                    </div>
                </div>
            )}

            {view === 'macro' && (
                <div id="account-macro-view">
                    <div className="card full-width border-2 border-yellow-500">
                        <h3>Matriz de Operação Macro</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Mapeamento de Serviços Contratados vs Responsáveis</p>
                        <table className="macro-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Gestão de Tráfego</th>
                                    <th>Gestão de Conteúdo</th>
                                    <th>Design/Criativo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {macroTableData.map((row, index) => (
                                    <tr key={index}>
                                        <td><strong>{row.client}</strong></td>
                                        <td className={row.gtActive ? 'macro-cell-active' : 'macro-cell-inactive'}>{row.gt}</td>
                                        <td className={row.copyActive ? 'macro-cell-active' : 'macro-cell-inactive'}>{row.copy}</td>
                                        <td className={row.designActive ? 'macro-cell-active' : 'macro-cell-inactive'}>{row.design}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'calendar' && (
                <div id="account-calendar-view">
                    <div className="card full-width border-2 border-green-500">
                        <h3>Agenda de Reuniões (ACC)</h3>
                        <div style={{ marginTop: '20px' }}>
                            {meetingTasks.length === 0 && <p style={{ color: '#6b7280' }}>Nenhuma reunião agendada encontrada.</p>}
                            {meetingTasks.map((task) => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: '100px', fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                                        {task.due_date ? new Date(parseInt(task.due_date)).toLocaleDateString('pt-BR') : 'Sem data'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{task.name}</div>
                                        <div style={{ fontSize: '12px', color: task.status.color }}>{task.status.status.toUpperCase()}</div>
                                    </div>
                                    <button style={{ padding: '4px 8px', fontSize: '10px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Ver Detalhes
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modalType && (
                <div id="modal-overlay" className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>&times;</span>
                        <h2 id="modal-title" style={{ marginTop: 0 }}>
                            {modalType === 'reunioes' ? 'Reuniões Pendentes (ACC)' : 'Filtro de Demandas (A Distribuir)'}
                        </h2>
                        <div id="modal-body">
                            {modalType === 'reunioes' && meetingTasks.map((m, i) => (
                                <div key={i} className="modal-task-item">
                                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                                    <span className="tag-acc" style={{ background: m.status.color, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{m.status.status}</span>
                                </div>
                            ))}
                            {modalType === 'demandas' && demandTasks.map((d, i) => (
                                <div key={i} className="modal-task-item">
                                    <span>{d.name}</span>
                                    <button style={{ fontSize: '10px', padding: '4px' }}>Distribuir</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManager;
