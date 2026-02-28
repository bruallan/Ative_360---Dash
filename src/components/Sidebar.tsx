
import React from 'react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="sidebar">
            <div className="logo">
                <img src="/Logo/logo.png" alt="Ative 360 Logo" style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} />
            </div>
            <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                <i className="fa-solid fa-chart-pie"></i> Visão Executiva
            </div>
            <div className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>
                <i className="fa-solid fa-magnifying-glass"></i> Lupa por Cliente
            </div>
            <div className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
                <i className="fa-solid fa-users"></i> Performance Time
            </div>
            <div className="nav-section-title">Operação</div>
            <div className={`nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                <i className="fa-solid fa-handshake"></i> Account
            </div>
            <div className={`nav-item ${activeTab === 'trafego' ? 'active' : ''}`} onClick={() => setActiveTab('trafego')}>
                <i className="fa-solid fa-arrow-trend-up"></i> Tráfego
            </div>
        </div>
    );
};

export default Sidebar;
