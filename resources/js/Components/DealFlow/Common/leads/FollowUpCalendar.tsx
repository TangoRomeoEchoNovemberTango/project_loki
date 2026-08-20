import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarRange, CalendarDays, Clock, PhoneCall } from 'lucide-react';
import type { Lead } from '@/types/dealflow';

type CalendarView = 'year' | 'month' | 'day';

interface FollowUpCalendarProps {
  leads: Lead[];
  onOpenDialer?: (lead: Lead) => void;
  onOpenDetail?: (lead: Lead) => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtHour = (h: number) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${((d.getHours() + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
};

export const FollowUpCalendar: React.FC<FollowUpCalendarProps> = ({ leads, onOpenDialer, onOpenDetail }) => {
  const [view, setView] = useState<CalendarView>('month');
  const [cursor, setCursor] = useState<Date>(new Date());

  const datedLeads = useMemo(() => leads.filter((l) => !!l.nextFollowUpDate), [leads]);

  // Group leads by day (sorted by time) and by month
  const byDay = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    datedLeads.forEach((l) => {
      const k = dayKey(new Date(l.nextFollowUpDate as string));
      if (!map[k]) map[k] = [];
      map[k].push(l);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(a.nextFollowUpDate as string).getTime() - new Date(b.nextFollowUpDate as string).getTime()));
    return map;
  }, [datedLeads]);

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    datedLeads.forEach((l) => {
      const d = new Date(l.nextFollowUpDate as string);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [datedLeads]);

  const move = (dir: 1 | -1) => {
    setCursor((prev) => {
      const d = new Date(prev);
      if (view === 'year') d.setFullYear(d.getFullYear() + dir);
      else if (view === 'month') d.setMonth(d.getMonth() + dir);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  };

  // 6-week grid (42 cells) for the 30-day view
  const monthCells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const todayKey = dayKey(new Date());
  const headerLabel =
    view === 'year' ? `${cursor.getFullYear()}` :
    view === 'month' ? `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}` :
    `${DAY_LABELS[cursor.getDay()]}, ${MONTH_SHORT[cursor.getMonth()]} ${cursor.getDate()}, ${cursor.getFullYear()}`;
  const dayLeads = byDay[dayKey(cursor)] || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {/* Toolbar: nav + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => move(-1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
          <button type="button" onClick={() => setCursor(new Date())} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-bold text-amber-300 cursor-pointer">Today</button>
          <button type="button" onClick={() => move(1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          <h3 className="ml-2 text-sm font-extrabold text-white">{headerLabel}</h3>
        </div>
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
          {([
            { v: 'year', label: 'Year', Icon: CalendarRange },
            { v: 'month', label: '30-Day', Icon: CalendarDays },
            { v: 'day', label: 'Hours', Icon: Clock },
          ] as { v: CalendarView; label: string; Icon: any }[]).map(({ v, label, Icon }) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${view === v ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* YEAR VIEW: 12 month tiles, click → drill into 30-day */}
      {view === 'year' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {MONTH_NAMES.map((name, mi) => {
            const count = byMonth[`${cursor.getFullYear()}-${mi}`] || 0;
            const isCurrent = new Date().getMonth() === mi && new Date().getFullYear() === cursor.getFullYear();
            return (
              <button key={name} type="button" onClick={() => { setCursor(new Date(cursor.getFullYear(), mi, 1)); setView('month'); }} className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${isCurrent ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{name}</span>
                  {count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{count}</span>}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{count > 0 ? `${count} follow-up${count > 1 ? 's' : ''}` : 'No follow-ups'}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* 30-DAY VIEW: month grid, click a day → drill into hours */}
      {view === 'month' && (
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1">
            {DAY_LABELS.map((d) => <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((d) => {
              const k = dayKey(d);
              const items = byDay[k] || [];
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = k === todayKey;
              return (
                <button key={k} type="button" onClick={() => { setCursor(d); setView('day'); }} className={`min-h-[72px] p-1 rounded-lg border text-left transition-colors cursor-pointer ${isToday ? 'bg-amber-500/10 border-amber-400' : inMonth ? 'bg-slate-950 border-slate-800 hover:border-slate-600' : 'bg-slate-950/40 border-slate-800/50 opacity-40'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold ${isToday ? 'text-amber-300' : 'text-slate-300'}`}>{d.getDate()}</span>
                    {items.length > 0 && <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-bold">{items.length}</span>}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {items.slice(0, 2).map((l) => (
                      <div key={l.id} className="truncate text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">{l.propertyAddress}</div>
                    ))}
                    {items.length > 2 && <div className="text-[9px] text-slate-500">+{items.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY / HOURS VIEW: 24 hour slots with follow-up cards */}
      {view === 'day' && (
        <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
          {Array.from({ length: 24 }, (_, h) => {
            const items = dayLeads.filter((l) => new Date(l.nextFollowUpDate as string).getHours() === h);
            return (
              <div key={h} className={`flex gap-2 rounded-lg border p-1.5 ${items.length ? 'bg-slate-950 border-amber-500/30' : 'bg-slate-950/40 border-slate-800/50'}`}>
                <div className="w-16 shrink-0 text-[10px] font-mono font-bold text-slate-400 pt-1">{fmtHour(h)}</div>
                <div className="flex-1 space-y-1">
                  {items.length ? items.map((l) => (
                    <div key={l.id} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
                      <button type="button" onClick={() => onOpenDetail?.(l)} className="text-left cursor-pointer">
                        <span className="block text-[11px] font-extrabold text-white hover:text-amber-300">{l.propertyAddress}</span>
                        <span className="block text-[10px] text-slate-400">{fmtTime(l.nextFollowUpDate as string)} • {l.contactName} • {String(l.stage).replace(/_/g, ' ')}</span>
                      </button>
                      <button type="button" onClick={() => onOpenDialer?.(l)} className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shrink-0">
                        <PhoneCall className="w-3 h-3" /> Call
                      </button>
                    </div>
                  )) : <div className="text-[10px] text-slate-600 italic">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
