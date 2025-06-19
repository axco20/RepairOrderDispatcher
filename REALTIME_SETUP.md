# Real-Time Auto-Refresh Setup for Admin Dashboard

This document explains how the real-time auto-refresh functionality works in your admin dashboard.

## 🚀 How It Works

The admin dashboard now automatically refreshes when changes occur in your Supabase database. Here's what happens:

1. **Centralized Real-Time Hub**: The `useRealTimeUpdates` hook in `src/lib/useRealTimeOrders.ts` establishes a single connection to Supabase's real-time service
2. **Event Broadcasting**: When database changes occur, custom events are dispatched to notify components
3. **Component Updates**: Each admin tab listens for relevant events and refreshes its data automatically

## 📡 Real-Time Events

The system listens for changes in these tables:

- **`repair_orders`** → Dispatches `repairOrdersUpdated` event
- **`users`** → Dispatches `teamMembersUpdated` event  
- **`dealerships`** → Dispatches `dealershipsUpdated` event

## 🎯 Admin Tabs with Auto-Refresh

### ✅ Orders Tab
- **What it refreshes**: Repair orders list, order status, assignments
- **When**: Any change to repair_orders table
- **Visual feedback**: Shows "🔄 Orders updated in real-time" notification

### ✅ Team Members Tab  
- **What it refreshes**: Team member list, skill levels, roles
- **When**: Any change to users table
- **Visual feedback**: Shows "🔄 Team members updated in real-time" notification

### 🔄 Other Tabs
- **Queue Tab**: Will refresh when orders change
- **Performance Tab**: Will refresh when orders or users change
- **Dashboard Tab**: Will refresh when any relevant data changes

## 🛠️ How to Add Real-Time to New Components

### Option 1: Use the Custom Hook (Recommended)

```typescript
import { useAdminRealTime } from "@/lib/useAdminRealTime";

const MyComponent = () => {
  // Listen for repair order updates
  useAdminRealTime({
    eventType: 'repairOrdersUpdated',
    onUpdate: (event) => {
      // Your refresh logic here
      refreshMyData();
    },
    notificationMessage: 'My data updated in real-time'
  });

  return <div>My Component</div>;
};
```

### Option 2: Manual Event Listening

```typescript
useEffect(() => {
  const handleUpdate = (event: CustomEvent) => {
    console.log('Data updated:', event.detail);
    refreshMyData();
  };

  window.addEventListener('repairOrdersUpdated', handleUpdate as EventListener);
  
  return () => {
    window.removeEventListener('repairOrdersUpdated', handleUpdate as EventListener);
  };
}, []);
```

## 🔧 Configuration

### Environment Variables
Make sure your Supabase project has real-time enabled:

1. Go to your Supabase dashboard
2. Navigate to Database → Replication
3. Ensure "Realtime" is enabled for your tables

### Database Permissions
Ensure your RLS (Row Level Security) policies allow real-time subscriptions:

```sql
-- Example policy for repair_orders table
CREATE POLICY "Enable real-time for repair_orders" ON repair_orders
FOR ALL USING (dealership_id = auth.jwt() ->> 'dealership_id');
```

## 🎨 Visual Indicators

### Connection Status
The admin dashboard header shows real-time connection status:
- 🟢 **Live Updates**: Connected and working
- 🟡 **Connecting...**: Attempting to connect
- 🔴 **Connection Error**: Failed to connect

### Notifications
When data updates automatically, users see:
- Brief toast notifications (2 seconds)
- Non-intrusive design
- Clear indication of what was updated

## 🐛 Troubleshooting

### Real-Time Not Working?
1. **Check Supabase Dashboard**: Ensure real-time is enabled for your tables
2. **Check Console**: Look for connection status messages
3. **Check Network**: Ensure no firewall is blocking WebSocket connections
4. **Check Permissions**: Verify RLS policies allow real-time access

### Performance Issues?
1. **Filter Subscriptions**: Use dealership-specific filters to reduce data
2. **Debounce Updates**: Add delays to prevent rapid refreshes
3. **Optimize Queries**: Ensure database queries are efficient

## 📝 Example Usage

Here's how the Orders tab automatically refreshes:

```typescript
// In Orders.tsx
useAdminRealTime({
  eventType: 'repairOrdersUpdated',
  onUpdate: (event) => {
    // This runs whenever repair_orders table changes
    refreshOrders(); // Refreshes the orders list
  },
  notificationMessage: 'Orders updated in real-time'
});
```

When a technician completes an order, the admin dashboard will:
1. ✅ Detect the database change
2. ✅ Automatically refresh the orders list
3. ✅ Show a notification to the admin
4. ✅ Update all relevant tabs

## 🎉 Benefits

- **No Manual Refresh**: Admins see changes instantly
- **Better Collaboration**: Multiple users can work simultaneously
- **Improved UX**: Real-time feedback without page reloads
- **Scalable**: Easy to add real-time to new components
- **Reliable**: Handles connection errors gracefully

The real-time system is now fully integrated into your admin dashboard and will automatically keep all tabs up-to-date with the latest data changes! 