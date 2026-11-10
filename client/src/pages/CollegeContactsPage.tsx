import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import api from '../api/client';

export const CollegeContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts', {
        params: { search, category: selectedCategory },
      });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedCategory]);

  const categories = [
    'all',
    'Hostel Warden',
    'Hostel Representative',
    'Student Representative',
    'Class Representative',
    'Faculty Advisor',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 bg-slate-900 text-white min-h-[140px] flex flex-col justify-between">
        <img
          src="/images/iiitbh_campus_1.jpg"
          alt="IIIT Bhagalpur Campus Infrastructure"
          className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/50" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Official Institutional Registry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Campus Representatives & Directory
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Verified official contact information for Hostel Wardens, Student Representatives, Department CRs, and Faculty Advisors.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium self-start sm:self-auto shrink-0">
            Updated for Session 2026–27
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, department, or hostel block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Roles & Designations' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
            <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No contacts found
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Try adjusting your query or selecting another designation category.
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {contact.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-900 dark:text-blue-300">
                    <ShieldCheck className="w-3 h-3" /> Authorized
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {contact.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-400 mt-0.5 truncate">
                      {contact.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <Building className="w-3 h-3 shrink-0" />
                      {contact.department_or_hostel}
                    </p>
                  </div>
                </div>

                {/* Details List */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  {contact.contact_number ? (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${contact.contact_number}`} className="hover:underline font-mono text-[11px]">
                        {contact.contact_number}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Phone not published</span>
                    </div>
                  )}

                  {contact.email ? (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${contact.email}`} className="hover:underline truncate text-[11px]">
                        {contact.email}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>Email unavailable</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-slate-500 text-[11px] pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{contact.availability || 'Available during college office hours'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                )}
                {contact.contact_number && (
                  <a
                    href={`tel:${contact.contact_number}`}
                    className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
