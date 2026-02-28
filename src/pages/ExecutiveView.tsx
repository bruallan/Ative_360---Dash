

import React, { useEffect, useState } from 'react';
import TimeFilter from '../components/TimeFilter';
import { fetchActiveClientsCount } from '../services/clickup';

const ExecutiveView: React.FC = () => {
    const [activeClients, setActiveClients] = useState<number | null>(null);

    useEffect(() => {
        fetchActiveClientsCount().then(setActiveClients);
    }, []);

    return (
        <div id="tab-home" className="tab-content">
            <div className="header">
                <div className="page-title">
                    <h1 id="page-heading">Visão Geral</h1>
                    <p>Dados sincronizados via API ClickUp</p>
                </div>
                <TimeFilter />
            </div>

            <div className="grid-container">
                <div className="card border-2 border-green-500">
                    <div className="kpi-label">Ativas</div>
                    <div className="kpi-value">{activeClients !== null ? activeClients : '...'}</div>
                </div>
                <div className="card border-2 border-yellow-500"><div className="kpi-label">Confiabilidade</div><div className="kpi-value" style={{ color: 'var(--success)' }}>94%</div></div>
                <div className="card border-2 border-yellow-500"><div className="kpi-label">Críticos</div><div className="kpi-value" style={{ color: 'var(--danger)' }}>8</div></div>
                <div className="card border-2 border-yellow-500"><div className="kpi-label">Gargalo</div><div className="kpi-value" style={{ fontSize: '22px' }}>Aprovação (ACC)</div></div>


                <div className="card half-width border-2 border-yellow-500">
                    <h3 style={{ marginTop: 0, fontSize: '16px' }}>Distribuição e Status (Período Selecionado)</h3>
                    <div className="stacked-bar-container">
                        <div className="stacked-column">
                            <div className="bar-done" style={{ height: '60%', background: 'var(--purple-clickup)' }}></div>
                            <div className="bar-label">ACC</div>
                        </div>
                        <div className="stacked-column">
                            <div className="bar-done" style={{ height: '80%', background: '#10b981' }}></div>
                            <div className="bar-label">GT</div>
                        </div>
                        <div className="stacked-column">
                            <div className="bar-done" style={{ height: '40%', background: '#f59e0b' }}></div>
                            <div className="bar-label">GC</div>
                        </div>
                        <div className="stacked-column">
                            <div className="bar-done" style={{ height: '70%', background: '#ef4444' }}></div>
                            <div className="bar-label">CRI</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#e5e7eb', marginRight: '5px' }}></span>Pendentes (Cinza)
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--text-main)', marginLeft: '10px', marginRight: '5px' }}></span>Concluídas (Cor)
                    </div>
                </div>
            </div>

            <div className="card full-width" style={{ height: '800px', padding: 0, overflow: 'hidden' }}>
                <iframe 
                    src="https://lookerstudio.google.com/embed/reporting/fe045f5b-e1e8-4105-acaf-56f759367bb4/page/E5RwD" 
                    frameBorder="0" 
                    style={{ width: '100%', height: '100%', border: 0 }} 
                    allowFullScreen
                    title="Looker Studio Dashboard"
                ></iframe>
            </div>
        </div>
    );
};


export default ExecutiveView;
