export interface RepairOrderAssignment {
    repairOrderId: string;
    technicianId: string;
    assignedAt: string;
    status: "in_progress" | "completed";
    completedAt?: string;
  }
  