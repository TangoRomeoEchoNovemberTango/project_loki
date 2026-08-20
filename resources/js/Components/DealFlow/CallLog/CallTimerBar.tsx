import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { CallDirection } from '@/types/dealflow';

export interface CallTimerState {
    durationSeconds: number;
    direction: CallDirection;
}

interface CallTimerBarProps {
    value: CallTimerState;
    onChange: (next: CallTimerState) => void;
}

const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
};

export const CallTimerBar: React.FC<CallTimerBarProps> = ({ value, onChange }) => {
    const [timerActive, setTimerActive] = useState(false);
    const [seconds, setSeconds] = useState(value.durationSeconds);
    const [direction, setDirection] = useState<CallDirection>(value.direction);

    // tick
    useEffect(() => {
        if (!timerActive) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [timerActive]);

    // report upward whenever anything changes (this is how any form "gets" its data)
    useEffect(() => {
        onChange({ durationSeconds: seconds, direction });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seconds, direction]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between sm:justify-start space-x-3">
                <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                    {formatTimer(seconds)}
                </div>
                <div className="flex items-center space-x-1.5">
                    {!timerActive ? (
                        <button type="button" onClick={() => setTimerActive(true)}
                            className="p-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer">
                            <Play className="w-3.5 h-3.5 fill-current" /> Start Call
                        </button>
                    ) : (
                        <button type="button" onClick={() => setTimerActive(false)}
                            className="p-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer">
                            <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                        </button>
                    )}
                    <button type="button"
                        onClick={() => { setTimerActive(false); setSeconds(0); }}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                        title="Reset Timer">
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-slate-400 font-medium">Direction:</span>
                <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                    <button type="button" onClick={() => setDirection('OUTBOUND')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            direction === 'OUTBOUND' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}>
                        Outbound
                    </button>
                    <button type="button" onClick={() => setDirection('INBOUND')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            direction === 'INBOUND' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}>
                        Inbound
                    </button>
                </div>
            </div>
        </div>
    );
};
