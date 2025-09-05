import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContactList from '@/components/contacts/ContactList';
import ContactModal from '@/components/contacts/ContactModal';
import { useContacts } from '@/hooks/useContacts';
import { Contact } from '@/lib/supabase';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts();

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => contact.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [contacts, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    return [...new Set(contacts.flatMap(contact => contact.tags))];
  }, [contacts]);

  const handleAddContact = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (contactData: Partial<Contact>) => {
    if (editingContact) {
      await updateContact(editingContact.id, contactData);
    } else {
      await createContact(contactData);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const recentContacts = contacts.filter(contact => 
      new Date(contact.created_at) > thisMonth
    ).length;

    return {
      total: contacts.length,
      growth: contacts.length > 0 ? Math.round((recentContacts / contacts.length) * 100) : 0,
      recent: recentContacts,
    };
  }, [contacts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddContact={handleAddContact} />
      
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onAddContact={handleAddContact}
          contactCount={contacts.length}
        />

        <main className="flex-1 p-6">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-primary">
                  <Users className="w-4 h-4 mr-2" />
                  Total Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Active contacts</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-success">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.growth}%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-accent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent}</div>
                <p className="text-xs text-muted-foreground">New this month</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact List */}
          <ContactList
            contacts={filteredContacts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            allTags={allTags}
            onEditContact={handleEditContact}
            onDeleteContact={deleteContact}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />
    </div>
  );
};

export default Dashboard;