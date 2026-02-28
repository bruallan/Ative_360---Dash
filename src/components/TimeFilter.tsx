

import React, { useState } from 'react';

const TimeFilter: React.FC = () => {
    const [startDate, setStartDate] = useState('2026-02-01');
    const [endDate, setEndDate] = useState('2026-02-16');

    const setLastMonth = () => {
        const now = new Date();
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        
        // Format YYYY-MM-DD
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        setStartDate(formatDate(firstDayPrevMonth));
        setEndDate(formatDate(lastDayPrevMonth));
    };

    return (
        <div id="time-filter" className="date-filter-container">
            <button onClick={setLastMonth} style={{ marginRight: '10px', padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '12px' }}>
                Mês Anterior
            </button>
            <i className="fa-regular fa-calendar" style={{ color: '#6b7280' }}></i>
            <input 
                type="date" 
                className="date-input" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
            />
            <span style={{ color: '#9ca3af' }}>-</span>
            <input 
                type="date" 
                className="date-input" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
            />
        </div>
    );
};

export default TimeFilter;
