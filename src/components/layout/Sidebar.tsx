import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Archive, Settings, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onAddContact: () => void;
  contactCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  onAddContact, 
  contactCount 
}) => {
  const menuItems = [
    { id: 'all', label: 'All Contacts', icon: Users, count: contactCount },
    { id: 'favorites', label: 'Favorites', icon: Star, count: 0 },
    { id: 'archived', label: 'Archived', icon: Archive, count: 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-[calc(100vh-4rem)] bg-card border-r flex flex-col"
    >
      <div className="p-4 border-b">
        <Button onClick={onAddContact} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={activeView === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  activeView === item.id && 'bg-primary text-primary-foreground'
                )}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
                {item.count !== undefined && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.count}
                  </Badge>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-1">Upgrade to Pro</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Unlock unlimited contacts and advanced features
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Upgrade Now
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;