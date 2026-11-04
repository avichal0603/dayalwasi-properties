'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useContacts } from '@/hooks/useContacts';
import { Contact, ContactRole } from '@/lib/types';
import { CONTACT_ROLE_LABELS, CONTACT_ROLE_COLORS } from '@/lib/constants';
import { Plus, Search, Phone, Mail, Building2, MapPin, Trash2, Edit2, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const { contacts, loading, createContact, updateContact, deleteContact } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modal State
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

  const roles = ['all', 'broker', 'builder', 'lawyer', 'banker', 'government', 'client', 'other'];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesRole = roleFilter === 'all' || contact.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
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
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required.');
      return;
    }

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        toast.success('Contact updated successfully!');
      } else {
        await createContact(formData as Omit<Contact, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Contact added successfully!');
      }
      handleCloseModal();
    } catch {
      toast.error('Failed to save contact.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        toast.success('Contact deleted successfully!');
      } catch {
        toast.error('Failed to delete contact.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container page-enter">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-brown-900 tracking-tight">
              Business Directory
            </h1>
            <p className="text-brown-600 text-xs sm:text-sm mt-1">
              Brokers, builders, advocates, and key real estate connections in Dayalbagh.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => handleOpenModal()} 
            className="btn-gold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gold-200/60 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-500 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or company..." 
              className="input-field pl-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  roleFilter === role 
                    ? "bg-gold-500 text-white shadow-sm" 
                    : "bg-white text-brown-700 hover:bg-gold-50 border border-beige-300"
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
              <div key={i} className="premium-card animate-pulse h-48 bg-beige-100/60"></div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16 bg-white/70 rounded-2xl border border-dashed border-beige-300">
            <Users className="w-16 h-16 text-brown-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-brown-900 mb-2">No contacts found</h3>
            <p className="text-brown-600 text-sm max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your search criteria or filter options.' 
                : 'No contacts added yet. Add your first Dayalbagh real estate contact.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredContacts.map((contact, index) => {
              const staggerClass = index < 10 ? `stagger-${index + 1}` : '';
              return (
                <div key={contact.id} className={cn("premium-card p-4 sm:p-6 slide-up-fade relative group min-w-0 border border-beige-300", staggerClass)}>
                  <div className="absolute top-4 right-4 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => handleOpenModal(contact)}
                      className="p-2 bg-white text-gold-700 rounded-full shadow-sm hover:bg-gold-50 transition-colors border border-beige-300"
                      title="Edit Contact"
                      aria-label="Edit Contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 bg-white text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-colors border border-beige-300"
                      title="Delete Contact"
                      aria-label="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-3 sm:mb-4 pr-16 sm:pr-0 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-brown-900 mb-1 truncate">{contact.name}</h3>
                      <span className={cn(
                        "badge text-[10px] sm:text-xs", 
                        CONTACT_ROLE_COLORS[contact.role as ContactRole] || 'bg-beige-100 text-brown-800 border-beige-300'
                      )}>
                        {CONTACT_ROLE_LABELS[contact.role as ContactRole] || contact.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <a href={`tel:${contact.phone}`} className="text-brown-800 hover:text-gold-700 font-medium">
                          {contact.phone}
                        </a>
                        {contact.alternate_phone && (
                          <a href={`tel:${contact.alternate_phone}`} className="text-xs text-brown-500 hover:text-gold-700">
                            {contact.alternate_phone} (Alt)
                          </a>
                        )}
                      </div>
                    </div>

                    {contact.company && (
                      <div className="flex items-center gap-3 text-brown-700">
                        <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{contact.company}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center gap-3 text-brown-700">
                        <div className="w-8 h-8 rounded-full bg-beige-200 text-brown-800 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <a href={`mailto:${contact.email}`} className="text-sm hover:text-gold-700 truncate">
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {contact.address && (
                      <div className="flex items-center gap-3 text-brown-700">
                        <div className="w-8 h-8 rounded-full bg-brown-100 text-brown-800 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{contact.address}</span>
                      </div>
                    )}

                    {contact.notes && (
                      <div className="mt-4 p-3 bg-beige-50 rounded-xl border border-beige-200 text-xs sm:text-sm text-brown-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scale-in border border-gold-200/80">
            <div className="sticky top-0 bg-white border-b border-beige-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brown-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button 
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-brown-500 hover:text-brown-800 hover:bg-beige-100 rounded-full transition-colors"
                aria-label="Close Contact Dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Name *</label>
                  <input 
                    type="text" 
                    required
                    className="input-field text-sm" 
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Role *</label>
                  <select 
                    required
                    className="select-field text-sm"
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
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input 
                    type="tel" 
                    required
                    className="input-field text-sm" 
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Alternate Phone</label>
                  <input 
                    type="tel" 
                    className="input-field text-sm" 
                    value={formData.alternate_phone || ''}
                    onChange={e => setFormData({...formData, alternate_phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Company</label>
                  <input 
                    type="text" 
                    className="input-field text-sm" 
                    value={formData.company || ''}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Email</label>
                  <input 
                    type="email" 
                    className="input-field text-sm" 
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Address</label>
                  <input 
                    type="text" 
                    className="input-field text-sm" 
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-brown-700 uppercase tracking-wider mb-1.5">Notes</label>
                  <textarea 
                    rows={3}
                    className="input-field text-sm resize-none" 
                    value={formData.notes || ''}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-beige-200">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-beige-300 text-brown-700 hover:bg-beige-50 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gold px-7 text-sm"
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