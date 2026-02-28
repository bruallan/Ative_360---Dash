
import React, { useEffect, useState } from 'react';
import { fetchAllWorkspaceTasks, ClickUpTask, getClientNameFromTask } from '../services/clickup';

const AllTasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<ClickUpTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await fetchAllWorkspaceTasks();
                setTasks(data);
            } catch (err) {
                setError('Failed to load tasks');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, []);

    const filteredTasks = tasks.filter(task => 
        task.name.toLowerCase().includes(filter.toLowerCase()) ||
        (task.status?.status && task.status.status.toLowerCase().includes(filter.toLowerCase())) ||
        (task.assignees && task.assignees.some(a => a.username.toLowerCase().includes(filter.toLowerCase())))
    );

    if (loading) return <div className="p-8">Loading tasks... (This may take a while)</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-full h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Todas as Tarefas ({tasks.length})</h1>
                <input 
                    type="text" 
                    placeholder="Filtrar tarefas..." 
                    className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsáveis</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTasks.map((task) => {
                                const clientName = getClientNameFromTask(task);
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span 
                                                className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                style={{ backgroundColor: task.status.color, color: '#fff' }}
                                            >
                                                {task.status.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={task.name}>{task.name}</div>
                                            {task.list && <div className="text-xs text-gray-500">{task.list.name}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {clientName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {task.assignees.map((assignee) => (
                                                    <div 
                                                        key={assignee.id} 
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-bold text-white bg-gray-400"
                                                        style={{ backgroundColor: assignee.color }}
                                                        title={assignee.username}
                                                    >
                                                        {assignee.profilePicture ? (
                                                            <img src={assignee.profilePicture} alt={assignee.username} className="h-full w-full object-cover rounded-full" />
                                                        ) : (
                                                            assignee.initials
                                                        )}
                                                    </div>
                                                ))}
                                                {task.assignees.length === 0 && <span className="text-xs text-gray-400">Unassigned</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {task.due_date ? new Date(Number(task.due_date)).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                                            {task.id}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </div>
            </div>
        </div>
    );
};

export default AllTasksPage;
