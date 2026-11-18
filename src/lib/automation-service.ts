export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'premium';
    timestamp: string;
    read: boolean;
    actionLink?: string;
    icon?: any;
}

export interface AutomationLog {
    id: string;
    trigger: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    status: 'success' | 'failed';
}

// Nota (18 Nov 2026): los datos de ejemplo MOCK_* que vivían aquí se retiraron.
// Eran código muerto (ningún dashboard los importaba desde el commit 10a3290 del remoto);
// los dashboards leen de Postgres real vía /api/*. Las interfaces de arriba se conservan.
