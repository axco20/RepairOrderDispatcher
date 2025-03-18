export interface RepairOrder {
  // Standard fields
  id: string;
  description: string;
  orderDescription: string;
  order_description?: string; // Add snake_case version
  createdAt: string;
  created_at?: string; // Add snake_case version
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  difficulty_level: 1 | 2 | 3;
  priority: number;
  priorityType?: 'WAIT' | 'VALET' | 'LOANER';
  priority_type?: 'WAIT' | 'VALET' | 'LOANER'; // Add snake_case version
  position?: number; 
  
  // Assignment fields - include both versions
  assignedTo?: string;
  assigned_to?: string; // Add snake_case version
  
  assignedAt?: string;
  assigned_at?: string; // Add snake_case version
  
  completedAt?: string;
  completed_at?: string; // Add snake_case version
  
  // Other possible fields related to technicians
  technicianId?: string;
  technician_id?: string;
}