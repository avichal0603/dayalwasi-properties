'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useContacts } from '@/hooks/useContacts';
import { Contact, ContactRole } from '@/lib/types';
import { CONTACT_ROLE_LABELS, CONTACT_ROLE_COLORS } from '@/lib/constants';
import { Users, Phone, Building2, Mail, MapPin, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ContactsPage() {
  const { contacts, loading, fetchContacts, createContact, updateContact, deleteContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<ContactRole | 'all'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    phone: '',
    alternate_phone: '',
    role: 'broker',
    company: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesRole = roleFilter === 'all' || contact.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [contacts, searchQuery, roleFilter]);

  const roles: (ContactRole | 'all')[] = ['all', 'broker', 'builder', 'lawyer', 'banker', 'government', 'client', 'other'];

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({ ...contact });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        alternate_phone: '',
        role: 'broker',
        company: '',
        email: '',
        address: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.role) {
      toast.error('Name, Phone, and Role are required');
      return;
    }

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
      } else {
        await createContact(formData);
      }
      handleCloseModal();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container page-enter">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="section-title mb-2">Contacts</h1>
            <p className="text-gray-600">Manage your brokers, builders, and business connections.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-gold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gold-200/50 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or company..." 
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  roleFilter === role 
                    ? "bg-gold-500 text-white shadow-md" 
                    : "bg-white text-gray-600 hover:bg-gold-50 border border-gray-200"
                )}
              >
                {role === 'all' ? 'All' : CONTACT_ROLE_LABELS[role as ContactRole] || role}
              </button>
            ))}
          </div>
        </div>

        {loading && contacts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="premium-card animate-pulse h-48 bg-gray-100/50"></div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-gray-300">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-display text-gray-800 mb-2">No contacts found</h3>
            <p className="text-gray-500">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your search filters.' 
                : 'No contacts yet. Add your first business contact.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContacts.map((contact, index) => {
              const staggerClass = index < 10 ? `stagger-${index + 1}` : '';
              return (
                <div key={contact.id} className={cn("premium-card slide-up-fade relative group", staggerClass)}>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(contact)}
                      className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-brown-900 mb-1">{contact.name}</h3>
                      <span className={cn(
                        "badge text-xs", 
                        CONTACT_ROLE_COLORS[contact.role as ContactRole] || 'bg-gray-100 text-gray-800'
                      )}>
                        {CONTACT_ROLE_LABELS[contact.role as ContactRole] || contact.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <a href={`tel:${contact.phone}`} className="text-gray-700 hover:text-green-600 font-medium">
                          {contact.phone}
                        </a>
                        {contact.alternate_phone && (
                          <a href={`tel:${contact.alternate_phone}`} className="text-sm text-gray-500 hover:text-green-600">
                            {contact.alternate_phone} (Alt)
                          </a>
                        )}
                      </div>
                    </div>

                    {contact.company && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{contact.company}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <a href={`mailto:${contact.email}`} className="hover:text-orange-600">
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {contact.address && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{contact.address}</span>
                      </div>
                    )}

                    {contact.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
                        <p className="line-clamp-2">{contact.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-display font-bold text-brown-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select 
                    required
                    className="select-field"
                    value={formData.role || 'broker'}
                    onChange={e => setFormData({...formData, role: e.target.value as ContactRole})}
                  >
                    {roles.filter(r => r !== 'all').map(role => (
                      <option key={role} value={role}>
                        {CONTACT_ROLE_LABELS[role as ContactRole] || role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input 
                    type="tel" 
                    required
                    className="input-field" 
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={formData.alternate_phone || ''}
                    onChange={e => setFormData({...formData, alternate_phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.company || ''}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    rows={3}
                    className="input-field resize-none" 
                    value={formData.notes || ''}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gold px-8"
                >
                  {loading ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
