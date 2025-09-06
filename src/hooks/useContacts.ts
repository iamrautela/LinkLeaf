import { useState, useEffect } from 'react';
import { apiClient, Contact } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const response = await apiClient.getContacts({
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (response.success) {
        setContacts(response.data.contacts);
      } else {
        throw new Error(response.error || 'Failed to fetch contacts');
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Partial<Contact>) => {
    if (!user) return;

    try {
      const response = await apiClient.createContact({
        name: contactData.name || '',
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        jobTitle: contactData.jobTitle,
        avatarUrl: contactData.avatarUrl,
        notes: contactData.notes,
        website: contactData.website,
        address: contactData.address,
        birthday: contactData.birthday,
        isFavorite: contactData.isFavorite || false,
        tags: contactData.tags?.map(tag => tag.name) || []
      });

      if (response.success) {
        setContacts(prev => [response.data.contact, ...prev]);
        return response.data.contact;
      } else {
        throw new Error(response.error || 'Failed to create contact');
      }
    } catch (error: any) {
      console.error('Error creating contact:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      const response = await apiClient.updateContact(id, {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        jobTitle: contactData.jobTitle,
        avatarUrl: contactData.avatarUrl,
        notes: contactData.notes,
        website: contactData.website,
        address: contactData.address,
        birthday: contactData.birthday,
        isFavorite: contactData.isFavorite,
        tags: contactData.tags?.map(tag => tag.name)
      });

      if (response.success) {
        setContacts(prev => prev.map(contact => 
          contact.id === id ? response.data.contact : contact
        ));
        return response.data.contact;
      } else {
        throw new Error(response.error || 'Failed to update contact');
      }
    } catch (error: any) {
      console.error('Error updating contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const response = await apiClient.deleteContact(id);

      if (response.success) {
        setContacts(prev => prev.filter(contact => contact.id !== id));
        toast.success('Contact deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete contact');
      }
    } catch (error: any) {
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