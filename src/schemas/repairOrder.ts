export interface RepairOrder {
    id: string;
    description: string;
    createdAt: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: number;
    priorityType?: 'WAIT' | 'VALET' | 'LOANER'; // Add this line
    position?: number; 
    assignedTo?: string;
    assignedAt?: string;
    completedAt?: string;
  }