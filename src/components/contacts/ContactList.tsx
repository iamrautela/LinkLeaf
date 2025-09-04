import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactCard from './ContactCard';
import { Contact } from '@/lib/supabase';

interface ContactListProps {
  contacts: Contact[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  allTags,
  onEditContact,
  onDeleteContact,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </motion.div>

      {/* Contact Grid */}
      <AnimatePresence mode="wait">
        {contacts.length > 0 ? (
          <motion.div
            key="contacts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ContactCard
                  contact={contact}
                  onEdit={onEditContact}
                  onDelete={onDeleteContact}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No contacts found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first contact'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactList;