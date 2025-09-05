import { useState, useEffect } from 'react';
import { supabase, Contact } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Partial<Contact>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            ...contactData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setContacts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...contactData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setContacts(prev => prev.map(contact => 
        contact.id === id ? data : contact
      ));
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};