import React from 'react';
import { PhoneOff } from 'lucide-react';
import type { Contact } from '@/types/dealflow';

interface DncToggleProps {
    contact: Contact;
    onToggleDnc: (contact: Contact) => Promise<void> | void;
}

export const DncToggle = ({ contact, onToggleDnc }: DncToggleProps) => {
    const isDnc = Boolean(contact.dnc);

    return (
        <button
            type="button"
            title={isDnc ? 'Remove from Do-Not-Call list' : 'Mark as Do-Not-Call'}
            onClick={(e) => {
                e.stopPropagation();
                onToggleDnc(contact);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                isDnc
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-red-400 hover:border-red-500/40'
            }`}
        >
            <PhoneOff className="w-3 h-3" />
            <span>DNC</span>
        </button>
    );
};
