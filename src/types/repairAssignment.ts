// types/repairAssignment.ts
export interface RepairOrderAssignment {
  id?: string;
  repairOrderId: string;
  technicianId: string;
  assignedAt: string;
  status: "in_progress" | "completed";
  completedAt?: string;
}