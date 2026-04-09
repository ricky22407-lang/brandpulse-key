import { Key, History, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: 'keys' | 'logs';
  setActiveTab: (tab: 'keys' | 'logs') => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'keys', label: 'License Keys', icon: Key },
    { id: 'logs', label: 'License Logs', icon: History },
  ];

  return (
    <div className="w-64 bg-white border-r border-zinc-200 flex flex-col h-full">
      <div className="p-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 font-bold text-xl text-zinc-900">
          <LayoutDashboard className="h-6 w-6 text-blue-600" />
          <span>BP Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as 'keys' | 'logs')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-blue-50 text-blue-700"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-blue-600" : "text-zinc-400")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
