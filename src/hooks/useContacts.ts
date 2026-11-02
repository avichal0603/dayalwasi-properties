'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/lib/types';
import toast from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'dayalwasi_contacts_store_v1';

// Initial sample contacts if completely fresh
const DEFAULT_SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'sample-1',
    name: 'Rajesh Sharma',
    phone: '9876543210',
    alternate_phone: null,
    role: 'broker',
    company: 'Sharma Properties Dayalbagh',
    email: null,
    address: 'Near Dayalbagh Gate, Agra',
    notes: 'Key broker for Tulsi Vihar and Jeevan Jyoti plots.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Adv. Sunil Gupta',
    phone: '9123456789',
    alternate_phone: null,
    role: 'lawyer',
    company: 'Gupta & Associates',
    email: null,
    address: 'Sanjay Place, Agra',
    notes: 'Handles registry, title verification, and legal deed work.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    name: 'SBI Dayalbagh Branch',
    phone: '0562-2854123',
    alternate_phone: null,
    role: 'banker',
    company: 'State Bank of India',
    email: null,
    address: 'Dayalbagh Road, Agra',
    notes: 'Home loan approvals and property valuation contact.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

function getLocalContacts(): Contact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_CONTACTS));
      return DEFAULT_SAMPLE_CONTACTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read local contacts:', e);
    return DEFAULT_SAMPLE_CONTACTS;
  }
}

function saveLocalContacts(contacts: Contact[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save local contacts:', e);
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCloudReady, setIsCloudReady] = useState<boolean | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to load from Supabase
      const { data, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        // Table not created yet or RLS error
        if (fetchError.code === 'PGRST205' || fetchError.message?.includes('schema cache') || fetchError.message?.includes('does not exist')) {
          console.warn('Supabase contacts table not found, falling back to local storage.');
          setIsCloudReady(false);
          const localData = getLocalContacts();
          setContacts(localData);
          return;
        }
        throw fetchError;
      }

      setIsCloudReady(true);
      const list = data || [];
      setContacts(list);
      saveLocalContacts(list);
    } catch (err: any) {
      console.warn('Error fetching contacts, using local cache:', err);
      setIsCloudReady(false);
      const localData = getLocalContacts();
      setContacts(localData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (contactData: Partial<Contact>) => {
    setLoading(true);
    try {
      if (isCloudReady) {
        const { data, error: createError } = await supabase
          .from('contacts')
          .insert([contactData])
          .select()
          .single();

        if (createError) throw createError;
        setContacts(prev => {
          const updated = [...prev, data].sort((a, b) => a.name.localeCompare(b.name));
          saveLocalContacts(updated);
          return updated;
        });
        toast.success('Contact saved to cloud');
        return data;
      } else {
        // Local fallback creation
        const newContact: Contact = {
          id: 'contact-' + Date.now(),
          name: contactData.name || '',
          phone: contactData.phone || '',
          alternate_phone: contactData.alternate_phone || null,
          role: (contactData.role as any) || 'broker',
          company: contactData.company || null,
          email: contactData.email || null,
          address: contactData.address || null,
          notes: contactData.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updated = [...contacts, newContact].sort((a, b) => a.name.localeCompare(b.name));
        saveLocalContacts(updated);
        setContacts(updated);
        toast.success('Contact saved locally! (Run Supabase SQL to sync across devices)');
        return newContact;
      }
    } catch (err: any) {
      console.error('Error creating contact:', err);
      // Fallback save to local storage so user data is never lost
      const newContact: Contact = {
        id: 'contact-' + Date.now(),
        name: contactData.name || '',
        phone: contactData.phone || '',
        alternate_phone: contactData.alternate_phone || null,
        role: (contactData.role as any) || 'broker',
        company: contactData.company || null,
        email: contactData.email || null,
        address: contactData.address || null,
        notes: contactData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [...contacts, newContact].sort((a, b) => a.name.localeCompare(b.name));
      saveLocalContacts(updated);
      setContacts(updated);
      toast.success('Saved to local contacts');
      return newContact;
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>) => {
    setLoading(true);
    try {
      if (isCloudReady) {
        const { data, error: updateError } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        setContacts(prev => {
          const updated = prev.map(c => c.id === id ? data : c);
          saveLocalContacts(updated);
          return updated;
        });
        toast.success('Contact updated');
        return data;
      } else {
        const updated = contacts.map(c => {
          if (c.id === id) {
            return { ...c, ...contactData, updated_at: new Date().toISOString() };
          }
          return c;
        });
        saveLocalContacts(updated);
        setContacts(updated);
        toast.success('Contact updated');
        return updated.find(c => c.id === id);
      }
    } catch (err: any) {
      console.error('Error updating contact:', err);
      const updated = contacts.map(c => {
        if (c.id === id) {
          return { ...c, ...contactData, updated_at: new Date().toISOString() };
        }
        return c;
      });
      saveLocalContacts(updated);
      setContacts(updated);
      toast.success('Contact updated locally');
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string) => {
    setLoading(true);
    try {
      if (isCloudReady) {
        const { error: deleteError } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
      }
      const updated = contacts.filter(c => c.id !== id);
      saveLocalContacts(updated);
      setContacts(updated);
      toast.success('Contact deleted');
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      const updated = contacts.filter(c => c.id !== id);
      saveLocalContacts(updated);
      setContacts(updated);
      toast.success('Contact deleted locally');
    } finally {
      setLoading(false);
    }
  };

  const syncToCloud = async () => {
    try {
      setLoading(true);
      const currentLocal = getLocalContacts();
      const insertPayload = currentLocal.map(c => ({
        name: c.name,
        phone: c.phone,
        alternate_phone: c.alternate_phone,
        role: c.role,
        company: c.company,
        email: c.email,
        address: c.address,
        notes: c.notes
      }));

      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert(insertPayload)
        .select();

      if (insertError) throw insertError;

      setIsCloudReady(true);
      setContacts(data || []);
      toast.success('All contacts successfully synced to Supabase Cloud! ☁️');
      return true;
    } catch (err: any) {
      console.error('Sync failed:', err);
      toast.error('Sync failed: Make sure you created the contacts table in Supabase first.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    error,
    isCloudReady,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    syncToCloud
  };
}
