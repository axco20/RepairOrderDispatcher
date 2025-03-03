export interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'technician';
}

export interface RepairOrder {
  id: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  priorityType?: 'WAIT' | 'VALET' | 'LOANER'; // Add this line
  assignedTo?: string;
  assignedAt?: string;
  completedAt?: string;
}
export interface RepairOrderAssignment {
  repairOrderId: string;
  technicianId: string;
  assignedAt: string;
  status: 'in_progress' | 'completed';
  completedAt?: string;
}