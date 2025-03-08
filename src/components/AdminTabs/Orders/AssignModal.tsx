"use client";

import React from 'react';
import Select from 'react-select';

interface TechnicianOption {
  value: string;
  label: string;
}

interface AssignModalProps {
  selectedOrder: string;
  setSelectedOrder: (orderId: string) => void;
  selectedTechnicianOption: TechnicianOption | null;
  setSelectedTechnicianOption: (option: TechnicianOption | null) => void;
  technicianOptions: TechnicianOption[];
  handleReassign: () => void;
}

const AssignModal: React.FC<AssignModalProps> = ({
  selectedOrder,
  setSelectedOrder,
  selectedTechnicianOption,
  setSelectedTechnicianOption,
  technicianOptions,
  handleReassign
}) => {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder("")}></div>
      <div className="bg-[#1F2937] rounded-lg shadow-lg max-w-md w-full border border-gray-700 relative">
        {/* Header */}
        <div className="bg-[#111827] px-6 py-4 border-b border-gray-700 rounded-t-lg">
          <h3 className="text-lg font-semibold text-white">Assign Technician</h3>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Technician Selection with react-select */}
          <div className="mb-4">
            <label htmlFor="technician-select" className="block text-sm font-medium text-gray-300 mb-1">
              Select Technician
            </label>
            <Select
              id="technician-select"
              options={technicianOptions}
              value={selectedTechnicianOption}
              onChange={setSelectedTechnicianOption}
              placeholder="Search for a technician..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <p className="mt-2 text-xs text-gray-400">
              Technicians can have up to{" "}
              <span className="text-indigo-400 font-semibold">3 active orders</span>{" "}
              at once.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedOrder("")}
              className="px-4 py-2 border border-gray-500 rounded-md shadow-sm 
                text-sm font-medium text-gray-300 bg-[#374151] hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={!selectedTechnicianOption}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm 
                text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;