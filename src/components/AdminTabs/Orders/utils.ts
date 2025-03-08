// Define priority types
export type PriorityType = 'WAIT' | 'VALET' | 'LOANER';

// Get priority numeric value based on type
export const getPriorityValue = (priorityType: PriorityType): number => {
  switch (priorityType) {
    case 'WAIT': return 1;
    case 'VALET': return 2;
    case 'LOANER': return 3;
    default: return 2; // Default to medium priority
  }
};

// Get priority label for display
export const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1: return 'WAIT';
    case 2: return 'VALET';
    case 3: return 'LOANER';
    default: return 'VALET';
  }
};

// Get CSS class for priority label
export const getPriorityClass = (priority: number): string => {
  switch (priority) {
    case 1: return 'bg-red-100 text-red-800'; // High priority - WAIT
    case 2: return 'bg-yellow-100 text-yellow-800'; // Medium priority - VALET
    case 3: return 'bg-green-100 text-green-800'; // Low priority - LOANER
    default: return 'bg-gray-100 text-gray-800';
  }
};