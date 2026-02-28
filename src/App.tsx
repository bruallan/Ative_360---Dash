
import React, { useState } from 'react';
import Layout from './components/Layout';
import ExecutiveView from './pages/ExecutiveView';
import ClientView from './pages/ClientView';
import TeamPerformance from './pages/TeamPerformance';
import AccountManager from './pages/AccountManager';
import TrafficManagement from './pages/TrafficManagement';
import './index.css';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <ExecutiveView />;
            case 'clientes':
                return <ClientView />;
            case 'performance':
                return <TeamPerformance />;
            case 'account':
                return <AccountManager />;
            case 'trafego':
                return <TrafficManagement />;
            default:
                return <ExecutiveView />;
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </Layout>
    );
};

export default App;
