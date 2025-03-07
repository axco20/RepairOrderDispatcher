"use client";

import React from "react";
import { HelpCircle, FileText, Clock, AlertTriangle } from "lucide-react";

export default function Help() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <HelpCircle className="mr-2" />
        Help & Support
      </h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium text-indigo-600 mb-2">How do I get a new repair order?</h4>
              <p className="text-gray-700">
                Click the &quot;Get Next Repair Order&quot; button in the header to receive the next order from the queue. Orders are assigned based on priority and creation time.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium text-indigo-600 mb-2">Why can&apos;t I get a new repair order?</h4>
              <p className="text-gray-700">
                There are two possible reasons:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                <li>You already have 3 active orders (the maximum allowed)</li>
                <li>You received an order less than 5 minutes ago</li>
              </ul>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium text-indigo-600 mb-2">How do I mark an order as complete?</h4>
              <p className="text-gray-700">
                Go to the &quot;Active Orders&quot; tab and click the &quot;Mark Complete&quot; button next to the order you&apos;ve finished.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium text-indigo-600 mb-2">What do the different order priorities mean?</h4>
              <p className="text-gray-700">
                Orders are assigned priorities from 1-3:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                <li><span className="font-semibold">Priority 1:</span> Urgent - These orders are processed first</li>
                <li><span className="font-semibold">Priority 2:</span> Normal - Standard priority (default)</li>
                <li><span className="font-semibold">Priority 3:</span> Low - These orders are processed last</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-indigo-600 mb-2">How are repair orders assigned to technicians?</h4>
              <p className="text-gray-700">
                Orders are assigned in a First-In-First-Out (FIFO) order, with consideration for priority. Higher priority orders (lower numbers) are assigned before lower priority orders, regardless of when they were created.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Limitations</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">5-Minute Cooldown:</span> After receiving a new order, you must wait 5 minutes before requesting another one (unless you have zero active orders).
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Maximum Active Orders:</span> You can have up to 3 active repair orders at any given time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-indigo-700">
              For additional support or to report issues with the repair order system, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}