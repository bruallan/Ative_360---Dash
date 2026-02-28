

import { CLICKUP_LISTS } from '../config/clickupIds';

const API_BASE = '/api/clickup';


export interface ClickUpTask {
    id: string;
    name: string;
    status: { status: string; color: string };
    assignees: { id: number; username: string; profilePicture: string; initials?: string; color?: string }[];
    due_date: string | null;
    custom_fields?: { 
        id: string; 
        name: string; 
        type: string; 
        value?: any; 
        type_config?: { 
            options?: { id: string; name: string; orderindex: number; color?: string }[] 
        } 
    }[];
    list?: { id: string; name: string };
}

export interface ClickUpList {
    id: string;
    name: string;
}


export async function fetchLists(folderId: string): Promise<ClickUpList[]> {
    try {
        const response = await fetch(`${API_BASE}/folder/${folderId}/list?archived=false`);
        if (!response.ok) {
            throw new Error(`Failed to fetch lists for folder ${folderId}`);
        }
        const data = await response.json();
        return data.lists;
    } catch (error) {
        console.error('Error fetching lists:', error);
        return [];
    }
}

export interface ClickUpMember {
    id: number;
    username: string;
    email: string;
    color: string;
    profilePicture: string;
    initials: string;
    role: number;
    custom_role?: string;
    last_active?: string;
    date_joined?: string;
    date_invited?: string;
}

export interface ClickUpTeam {
    id: string;
    name: string;
    members: ClickUpMember[];
}

/**
 * Helper to fetch all tasks with pagination (The "Sync" Logic)
 * Matches the Python guide's "Sistema Completo: Paginação"
 */
async function fetchPaginatedTasks(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<ClickUpTask[]> {
    let allTasks: ClickUpTask[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        // Construct query params
        // Note: We explicitly set subtasks and include_closed to true as per the guide
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            queryParams.append(key, String(value));
        });
        queryParams.set('page', String(page));
        queryParams.set('subtasks', 'true');
        queryParams.set('include_closed', 'true');

        try {
            const response = await fetch(`${API_BASE}${endpoint}?${queryParams.toString()}`);
            if (!response.ok) {
                console.error(`Failed to fetch page ${page} from ${endpoint}: ${response.statusText}`);
                throw new Error(`Failed to fetch tasks from ${endpoint}`);
            }

            const data = await response.json();
            const tasks = data.tasks || [];

            if (tasks.length === 0) {
                hasMore = false;
            } else {
                allTasks = [...allTasks, ...tasks];
                page++;
            }
        } catch (error) {
            console.error(`Error fetching paginated tasks from ${endpoint}:`, error);
            hasMore = false; // Stop on error to return what we have
        }
    }

    return allTasks;
}


export async function fetchWorkspaceMembers(): Promise<ClickUpMember[]> {
    try {
        const response = await fetch(`${API_BASE}/team`);
        if (!response.ok) {
            throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        // Assuming the first team is the target workspace
        if (data.teams && data.teams.length > 0) {
            return data.teams[0].members;
        }
        return [];
    } catch (error) {
        console.error('Error fetching workspace members:', error);
        return [];
    }
}

export async function fetchMemberTasks(memberId: number): Promise<ClickUpTask[]> {
    try {
        // First, we need the team ID. We can cache it or fetch it again.
        // For simplicity, we'll fetch teams again or hardcode if known.
        // Better to fetch teams to get the ID dynamically.
        const teamsResponse = await fetch(`${API_BASE}/team`);
        const teamsData = await teamsResponse.json();
        const teamId = teamsData.teams[0].id;

        // Fetch tasks for the member across the workspace
        // We include subtasks and closed tasks to get a full picture if needed, 
        // but for "Active Tasks" we might want to filter.
        // The user wants "A fazer", "Fazendo", "Feito", "Entregue".
        // So we need all statuses.
        const response = await fetch(`${API_BASE}/team/${teamId}/task?assignees[]=${memberId}&include_closed=true&subtasks=true`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch tasks for member ${memberId}`);
        }
        const data = await response.json();
        return data.tasks;
    } catch (error) {
        console.error(`Error fetching tasks for member ${memberId}:`, error);
        return [];
    }
}


export async function fetchTasks(listId: string, includeCustomFields = false): Promise<ClickUpTask[]> {
    try {
        // Use fetchPaginatedTasks to ensure we get ALL tasks including closed ones if needed
        // For specific lists, we might want to be careful about "include_closed", but the guide suggests fetching everything.
        // However, for "Active" counts, we filter in memory.
        const params: Record<string, string | boolean> = {
            archived: 'false'
        };
        if (includeCustomFields) {
            params.include_custom_fields = 'true';
        }
        
        return await fetchPaginatedTasks(`/list/${listId}/task`, params);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function fetchListCount(listId: string): Promise<number> {
    try {
        const tasks = await fetchTasks(listId);
        return tasks.length;
    } catch (error) {
        console.error('Error fetching list count:', error);
        return 0;
    }
}

export async function fetchActiveClientsCount(): Promise<number> {
    return fetchListCount(CLICKUP_LISTS.ACC_OPERACAO_MACRO);
}

export async function fetchPendingMeetingsCount(): Promise<number> {
    const tasks = await fetchTasks(CLICKUP_LISTS.ACC_REUNIOES_PESQUISAS);
    return tasks.filter(t => t.status.status !== 'complete' && t.status.status !== 'closed').length;
}

export async function fetchDemandsFilterCount(): Promise<number> {
    const tasks = await fetchTasks(CLICKUP_LISTS.ACC_FILTRO_DEMANDAS);
    return tasks.filter(t => t.status.status !== 'complete' && t.status.status !== 'closed').length;
}

export async function fetchTrafficPipeline(): Promise<ClickUpTask[]> {
    return fetchTasks(CLICKUP_LISTS.GT_GESTAO_TRAFEGO);
}

export async function fetchClientTasks(listId: string): Promise<ClickUpTask[]> {
    return fetchTasks(listId);
}

export async function fetchMacroOperationTasks(): Promise<ClickUpTask[]> {
    return fetchTasks(CLICKUP_LISTS.ACC_OPERACAO_MACRO, true);
}

export async function fetchAllOpenTasks(): Promise<ClickUpTask[]> {
    // Fetch from main operational lists to aggregate per user
    const listIds = [
        CLICKUP_LISTS.ACC_FILTRO_DEMANDAS,
        CLICKUP_LISTS.GT_GESTAO_TRAFEGO,
        CLICKUP_LISTS.GC_GESTAO_CONTEUDO,
        CLICKUP_LISTS.TICKETS,
        CLICKUP_LISTS.DSN_ATIVE_CONECTA,
        CLICKUP_LISTS.ACAO_METEORICA
    ];

    const allTasks: ClickUpTask[] = [];
    for (const id of listIds) {
        const tasks = await fetchTasks(id);
        // Add list info to task if needed for context
        allTasks.push(...tasks);
    }
    return allTasks;
}

/**
 * Helper to extract "Cliente" custom field value from a task.
 * Matches Python guide Point 4 logic.
 */
export function getClientNameFromTask(task: ClickUpTask): string | null {
    if (!task.custom_fields) return null;

    const clientField = task.custom_fields.find(f => f.name === 'Cliente');
    if (!clientField || clientField.value === undefined || clientField.value === null) return null;

    // Handle dropdown/label type fields (common for "Cliente")
    if (clientField.type_config && clientField.type_config.options) {
        const selectedOption = clientField.type_config.options.find(
            opt => opt.orderindex === clientField.value || opt.id === clientField.value
        );
        return selectedOption ? selectedOption.name : null;
    }

    // Handle text fields
    return String(clientField.value);
}

