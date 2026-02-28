
import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
