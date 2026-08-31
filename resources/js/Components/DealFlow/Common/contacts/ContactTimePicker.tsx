import React, { useState } from 'react';
import { Clock, Plus, Trash2, AlertCircle, Pencil, Eye } from 'lucide-react';
import { SectionCard, TextArea } from './ContactFieldPrimitives';
import type { ContactAvailability, ContactDay } from '@/types/dealflow';

interface ContactTimePickerProps {
  availability: ContactAvailability[];
  onAvailabilityChange: (availability: ContactAvailability[]) => void;
  availabilityNotes?: string;
  onNotesChange?: (notes: string) => void;
  label?: string;
}

const DAY_OPTIONS: { value: ContactDay; label: string; short: string }[] = [
  { value: 'MON', label: 'Monday', short: 'Mon' },
  { value: 'TUE', label: 'Tuesday', short: 'Tue' },
  { value: 'WED', label: 'Wednesday', short: 'Wed' },
  { value: 'THU', label: 'Thursday', short: 'Thu' },
  { value: 'FRI', label: 'Friday', short: 'Fri' },
  { value: 'SAT', label: 'Saturday', short: 'Sat' },
  { value: 'SUN', label: 'Sunday', short: 'Sun' },
];
const DAY_ORDER: ContactDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const generateId = () => `avail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatTime12Hour = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDaysSummary = (days: ContactDay[]) => {
  if (days.length === 0) return 'No days';
  if (days.length === 7) return 'Every Day';
  const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  const short = (d: ContactDay) => DAY_OPTIONS.find((o) => o.value === d)!.short;
  const result: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (DAY_ORDER.indexOf(sorted[i]) === DAY_ORDER.indexOf(prev) + 1) {
      prev = sorted[i];
    } else {
      result.push(start === prev ? short(start) : `${short(start)} – ${short(prev)}`);
      start = sorted[i];
      prev = sorted[i];
    }
  }
  result.push(start === prev ? short(start) : `${short(start)} – ${short(prev)}`);
  return result.join(', ');
};

export const ContactTimePicker: React.FC<ContactTimePickerProps> = ({
  availability = [],
  onAvailabilityChange,
  availabilityNotes = '',
  onNotesChange,
  label = 'Contact Availability',
}) => {
  // ✅ NEW: collapsed by default — only the actual available times show
  const [isEditing, setIsEditing] = useState(false);

  const addSlot = () => {
    onAvailabilityChange([
      ...availability,
      { id: generateId(), days: ['MON'], startTime: '09:00', endTime: '17:00' },
    ]);
  };

  const updateSlot = (id: string, patch: Partial<ContactAvailability>) =>
    onAvailabilityChange(availability.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));

  const toggleDayInSlot = (slotId: string, day: ContactDay) => {
    const slot = availability.find((s) => s.id === slotId);
    if (!slot) return;
    const days = slot.days.includes(day) ? slot.days.filter((d) => d !== day) : [...slot.days, day];
    updateSlot(slotId, { days });
  };

  const removeSlot = (id: string) => onAvailabilityChange(availability.filter((slot) => slot.id !== id));

  // ✅ copy-before-sort (never mutate the parent's array during render)
  const sortedSlots = [...availability].sort((a, b) => {
    const firstDayA = [...a.days].sort((x, y) => DAY_ORDER.indexOf(x) - DAY_ORDER.indexOf(y))[0];
    const firstDayB = [...b.days].sort((x, y) => DAY_ORDER.indexOf(x) - DAY_ORDER.indexOf(y))[0];
    if (!firstDayA) return -1;
    if (!firstDayB) return 1;
    return DAY_ORDER.indexOf(firstDayA) - DAY_ORDER.indexOf(firstDayB);
  });

  return (
    <SectionCard title={label} accent="text-amber-400">
      {/* Header row with the collapse toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {isEditing ? 'Editing availability windows' : 'Available times only — tap Edit to change'}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
            isEditing
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* ── COLLAPSED (default): ONLY the actual available times ── */}
      {!isEditing && (
        availability.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No specific times set. Tap Edit to add availability.</p>
        ) : (
          <div className="space-y-2">
            {sortedSlots.map((slot) => (
              <div
                key={slot.id}
                onClick={() => setIsEditing(true)}
                title="Tap to edit"
                className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 text-xs font-bold rounded-md border border-emerald-500/20">
                  {formatDaysSummary(slot.days)}
                </span>
                <span className="text-sm font-extrabold text-slate-100 tracking-wide">
                  {formatTime12Hour(slot.startTime)} <span className="text-slate-500 font-normal mx-1">to</span> {formatTime12Hour(slot.endTime)}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── EXPANDED: full day/time editors ── */}
      {isEditing && (
        <div className="space-y-4">
          {availability.length === 0 && (
            <p className="text-xs text-slate-500 italic">No specific times set. Click below to add availability.</p>
          )}
          {availability.map((slot) => {
            const isTimeInvalid = !!slot.startTime && !!slot.endTime && slot.startTime >= slot.endTime;
            return (
              <div key={slot.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Select Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_OPTIONS.map((dayOpt) => {
                      const isSelected = slot.days.includes(dayOpt.value);
                      return (
                        <button
                          key={dayOpt.value}
                          type="button"
                          onClick={() => toggleDayInSlot(slot.id, dayOpt.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md border-2 transition-all duration-200 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-300'
                          }`}
                        >
                          {dayOpt.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                        className="w-full pl-8 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">to</span>
                    <div className="relative flex-1">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                        className={`w-full pl-8 bg-slate-800 border text-slate-200 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 ${
                          isTimeInvalid ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove time slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isTimeInvalid && (
                  <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-semibold">
                    <AlertCircle className="w-3 h-3" />
                    End time is before or equal to start time.
                  </div>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addSlot}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-400 hover:text-amber-400 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add Another Time Slot
          </button>
        </div>
      )}

      {/* Notes always visible (read when collapsed, edit when expanded) */}
      <TextArea
        label="Availability Notes / Instructions"
        value={availabilityNotes}
        onChange={(v) => onNotesChange?.(v)}
        placeholder="e.g., 'Leave voicemail OK', 'Don't call during lunch (12-1pm)', 'Gate code is 1234'..."
        rows={2}
        accent="text-amber-300"
      />
    </SectionCard>
  );
};