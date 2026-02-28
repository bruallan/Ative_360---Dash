
export interface Task {
    pending: string[];
    done: string[];
}

export interface Collaborator {
    id: number;
    name: string;
    role: string;
    delivered: number;
    total: number;
    image: string;
    tasks: Task;
}

export const collaborators: Collaborator[] = [
    { 
        id: 1, 
        name: "Matheus Neri", 
        role: "Account", 
        delivered: 45, 
        total: 46, 
        image: "https://i.pravatar.cc/150?u=1", 
        tasks: { 
            pending: ["Reunião Onboarding BP", "Alinhamento LocMoto"], 
            done: ["Checklist Semanal", "Relatório Mensal"] 
        } 
    },
    { 
        id: 2, 
        name: "Ana Silva", 
        role: "Design", 
        delivered: 82, 
        total: 90, 
        image: "https://i.pravatar.cc/150?u=2", 
        tasks: { 
            pending: ["Card Institucional", "Ajuste Logo"], 
            done: ["Campanha Natal", "Vídeo Reels", "Banner Site"] 
        } 
    },
    { 
        id: 3, 
        name: "Carlos GT", 
        role: "Tráfego", 
        delivered: 20, 
        total: 20, 
        image: "https://i.pravatar.cc/150?u=3", 
        tasks: { 
            pending: [], 
            done: ["Subir Campanha", "Otimizar Looker"] 
        } 
    }
];

export const meetings = ["14:00 - Onboarding Botopremium", "16:30 - Alinhamento LocMoto", "Quinta - Review Trimestral"];

export const demands = ["Solicitação de Criativo (BP)", "Ajuste de Orçamento (Tráfego)", "Novo Roteiro (Conteúdo)"];

export const macroTableData = [
    { client: "Botopremium", gt: "Carlos GT", copy: "Beatriz Copy", design: "Ana Design", gtActive: true, copyActive: true, designActive: true },
    { client: "LocMoto", gt: "Carlos GT", copy: "-", design: "Ana Design", gtActive: true, copyActive: false, designActive: true },
    { client: "Atendly", gt: "-", copy: "Beatriz Copy", design: "-", gtActive: false, copyActive: true, designActive: false },
];

export const trafficItems = [
    { title: "Erro na Copy BP Acapulco", status: "ERRO!!!", statusColor: "#ef4444", date: "Hoje", responsible: "Carlos GT", avatar: "https://i.pravatar.cc/150?u=3" },
    { title: "Saldo BP Acapulco", status: "RECARGA", statusColor: "#10b981", date: "20/02", responsible: "Matheus", avatar: "https://i.pravatar.cc/150?u=1" }
];
