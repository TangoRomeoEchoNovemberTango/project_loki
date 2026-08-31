import React from 'react';
import { PhoneOff, ShieldAlert } from 'lucide-react';
import type { Contact } from '@/types/dealflow';

interface DncToggleProps {
  contact: Contact;
  onToggleDnc: (contact: Contact) => Promise<void> | void;
}

export const DncToggle = ({ contact, onToggleDnc }: DncToggleProps) => {
  const isDnc = Boolean(contact.dnc);
  
  const formatDncDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <button
      type="button"
      title={isDnc ? 'Remove from Do-Not-Call list' : 'Mark as Do-Not-Call'}
      onClick={(e) => {
        e.stopPropagation();
        onToggleDnc(contact);
      }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium
        transition-all duration-200 group
        ${
          isDnc
            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50'
        }
      `}
    >
      {isDnc ? (
        <ShieldAlert className="w-4 h-4" />
      ) : (
        <PhoneOff className="w-4 h-4" />
      )}
      <span>{isDnc ? 'Do Not Call' : 'Mark DNC'}</span>
      {isDnc && contact.dncDate && (
        <span className="text-[10px] opacity-75 ml-1">
          {formatDncDate(contact.dncDate)}
        </span>
      )}
    </button>
  );
};