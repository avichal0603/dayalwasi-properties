'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/lib/types';
import toast from 'react-hot-toast';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setContacts(data || []);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to fetch contacts');
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = async (contactData: Partial<Contact>) => {
    try {
      setLoading(true);
      const { data, error: createError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (createError) throw createError;
      setContacts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Contact created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating contact:', err);
      toast.error('Failed to create contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    try {
      setLoading(true);
      const { data, error: updateError } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setContacts(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Contact updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating contact:', err);
      toast.error('Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      toast.error('Failed to delete contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
  };
}
