"use client";

import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface RealTimeStatusProps {
  isConnected: boolean;
  error: string | null;
}

const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ isConnected, error }) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
        <AlertCircle size={16} />
        <span>Connection Error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      isConnected 
        ? 'bg-green-100 text-green-700' 
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
      <span>{isConnected ? 'Live Updates' : 'Connecting...'}</span>
    </div>
  );
};

export default RealTimeStatus; 