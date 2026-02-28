






import React, { useState, useEffect } from 'react';
import { fetchClientTasks, fetchLists, fetchMacroOperationTasks, ClickUpTask, ClickUpList } from '../services/clickup';
import { CLIENT_LIST_MAP } from '../config/clickupIds';

// Folder ID for "CLIENTES MACRO" - Using the one previously identified or fallback to known lists
const CLIENTS_FOLDER_ID = '901317092786';

const ClientView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'donut' | 'kanban'>('donut');
    const [selectedClientName, setSelectedClientName] = useState<string>('');
    const [clients, setClients] = useState<ClickUpList[]>([]);
    const [macroTasks, setMacroTasks] = useState<ClickUpTask[]>([]); // For metadata
    const [clientInfo, setClientInfo] = useState<any>(null);
    const [operationalTasks, setOperationalTasks] = useState<ClickUpTask[]>([]);

    useEffect(() => {
        // 1. Fetch Clients (Lists) for the Dropdown
        fetchLists(CLIENTS_FOLDER_ID).then(lists => {
            if (lists && lists.length > 0) {
                setClients(lists);
                setSelectedClientName(lists[0].name);
            } else {
                // Fallback to hardcoded map if API fails or empty
                const fallbackClients = Object.keys(CLIENT_LIST_MAP).map(name => ({ id: CLIENT_LIST_MAP[name], name }));
                setClients(fallbackClients);
                if (fallbackClients.length > 0) setSelectedClientName(fallbackClients[0].name);
            }
        });

        // 2. Fetch Macro Tasks for Metadata
        fetchMacroOperationTasks().then(setMacroTasks);
    }, []);

    useEffect(() => {
        if (selectedClientName) {
            // 1. Find Client Info from Macro Task (Metadata)
            // We look for a task that contains the client name
            const infoTask = macroTasks.find(t => t.name.toLowerCase().includes(selectedClientName.toLowerCase()) || selectedClientName.toLowerCase().includes(t.name.toLowerCase()));
            
            if (infoTask) {
                const onboardingField = infoTask.custom_fields?.find(f => f.name.toLowerCase().includes('onboarding'));
                const accountField = infoTask.custom_fields?.find(f => f.name.toLowerCase().includes('account'));
                const gtField = infoTask.custom_fields?.find(f => f.name.toLowerCase().includes('tráfego') || f.name.toLowerCase().includes('gt'));
                const gcField = infoTask.custom_fields?.find(f => f.name.toLowerCase().includes('conteúdo') || f.name.toLowerCase().includes('gc'));

                setClientInfo({
                    onboarding: onboardingField?.type === 'drop_down' ? 
                        (onboardingField.type_config.options.find((o: any) => o.orderindex === onboardingField.value)?.name || 'N/A') : 
                        (onboardingField?.value || 'Ongoing'),
                    account: accountField?.value?.map((u: any) => u.username).join(', ') || 'N/A',
                    gt: gtField?.value?.map((u: any) => u.username).join(', ') || 'N/A',
                    gc: gcField?.value?.map((u: any) => u.username).join(', ') || 'N/A'
                });
            } else {
                setClientInfo(null);
            }

            // 2. Fetch Operational Tasks
            // First try to find the list ID from the fetched clients list
            let listId = clients.find(c => c.name === selectedClientName)?.id;
            
            // If not found (e.g. name mismatch), try the map
            if (!listId) {
                listId = CLIENT_LIST_MAP[selectedClientName];
            }

            if (listId) {
                fetchClientTasks(listId).then(setOperationalTasks);
            } else {
                setOperationalTasks([]);
            }

        } else {
            setOperationalTasks([]);
            setClientInfo(null);
        }
    }, [selectedClientName, macroTasks, clients]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClientName(e.target.value);
    };
    

    return (
        <div id="tab-clientes" className="tab-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', height: 'calc(100vh - 60px)' }}>
            <div className="header" style={{ flexShrink: 0 }}>
                <div className="page-title">
                    <h1>Lupa por Cliente</h1>
                </div>
            </div>

            <select className="client-selector" value={selectedClientName} onChange={handleClientChange} style={{ flexShrink: 0 }}>
                <option value="" disabled>Selecione um Cliente</option>
                {clients.map(client => (
                    <option key={client.id} value={client.name}>{client.name}</option>
                ))}
            </select>

            {clientInfo && (
                <div className="client-info-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                    <div><strong>Status:</strong> <span style={{ color: 'var(--primary)' }}>{clientInfo.onboarding}</span></div>
                    <div><strong>Account:</strong> {clientInfo.account}</div>
                    <div><strong>GT:</strong> {clientInfo.gt}</div>
                    <div><strong>GC:</strong> {clientInfo.gc}</div>
                </div>
            )}

            {/* Layout changed to grid for 16:9 optimization */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', flex: 1, minHeight: 0 }}>
                
                {/* Card 1: Saúde do Cliente */}
                <div className="card" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #10b981', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                        <h3 style={{ margin: 0 }}>Saúde do Cliente por Etapa</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setViewMode('donut')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: viewMode === 'donut' ? 'none' : '1px solid #e5e7eb',
                                    background: viewMode === 'donut' ? 'var(--primary)' : 'white',
                                    color: viewMode === 'donut' ? 'white' : 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                <i className="fa-solid fa-chart-pie" style={{ marginRight: '5px' }}></i>
                                Resumo
                            </button>
                            <button 
                                onClick={() => setViewMode('kanban')}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: viewMode === 'kanban' ? 'none' : '1px solid #e5e7eb',
                                    background: viewMode === 'kanban' ? 'var(--primary)' : 'white',
                                    color: viewMode === 'kanban' ? 'white' : 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                <i className="fa-solid fa-list-check" style={{ marginRight: '5px' }}></i>
                                Kanban
                            </button>
                        </div>
                    </div>

                    {viewMode === 'donut' ? (
                        <div className="donut-container" style={{ flex: 1, alignItems: 'center', display: 'flex', justifyContent: 'space-around' }}>
                            <div className="donut-wrapper">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#3b82f6 0% 70%, #e5e7eb 70% 100%)' }}>
                                    <div className="donut-inner">70%</div>
                                </div>
                                <div className="donut-legend">Account & Estratégia</div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>7 Feitas / 3 Pendentes</div>
                            </div>
                            <div className="donut-wrapper">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#f59e0b 0% 40%, #e5e7eb 40% 100%)' }}>
                                    <div className="donut-inner">40%</div>
                                </div>
                                <div className="donut-legend">Conteúdo</div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>Aguardando Aprovação</div>
                            </div>
                            <div className="donut-wrapper">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#10b981 0% 90%, #e5e7eb 90% 100%)' }}>
                                    <div className="donut-inner">90%</div>
                                </div>
                                <div className="donut-legend">Tráfego & Performance</div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>Campanhas Rodando</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                                <h4 style={{ margin: '0 0 15px', fontSize: '14px', color: '#1f2937', borderBottom: '2px solid #3b82f6', paddingBottom: '8px' }}>
                                    Tarefas Operacionais (ClickUp)
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {operationalTasks.length === 0 && <p style={{ fontSize: '12px', color: '#6b7280' }}>Nenhuma tarefa encontrada ou lista não mapeada.</p>}
                                    {operationalTasks.map(task => (
                                        <div key={task.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '5px' }}>{task.name}</div>
                                            <div style={{ color: task.status.color, fontSize: '10px' }}>● {task.status.status.toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Card 2: Looker Studio */}
                <div className="card" style={{ width: '100%', boxSizing: 'border-box', border: '2px solid #f59e0b', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3>Performance Tráfego (Looker)</h3>
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

export default ClientView;
