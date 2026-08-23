import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationDrawer from './NotificationDrawer';

export default function AppShell({ children, title }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-dark-950 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
