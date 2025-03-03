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
  assignedTo?: string;
  assignedAt?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  priority: number;
}

export interface RepairOrderAssignment {
  repairOrderId: string;
  technicianId: string;
  assignedAt: string;
  status: 'in_progress' | 'completed';
  completedAt?: string;
}