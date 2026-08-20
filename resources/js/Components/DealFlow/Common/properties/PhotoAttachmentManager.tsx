import React from 'react';
import { Maximize2, X } from 'lucide-react';
import type { PropertyAttachment } from '@/types/dealflow';

interface PhotoAttachmentManagerProps {
  images: string[];
  attachments: PropertyAttachment[];
  onAddImage: (url: string) => void;
  onRemoveImage: (index: number) => void;
  onAddAttachment: (name: string, url: string) => void;
  onRemoveAttachment: (id: string) => void;
}

export const PhotoAttachmentManager: React.FC<PhotoAttachmentManagerProps> = ({
  images, attachments, onAddImage, onRemoveImage, onAddAttachment, onRemoveAttachment
}) => {
  const [newImageUrl, setNewImageUrl] = React.useState('');
  const [newDocName, setNewDocName] = React.useState('');
  const [newDocUrl, setNewDocUrl] = React.useState('');

  return (
    <div className="space-y-3 pt-2 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> 📸 Photos & 📄 Documents
        </label>
        <span className="text-[10px] text-slate-400">
          {images.length} Photos • {attachments.length} Documents
        </span>
      </div>

      {/* Images */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Property Photos (URLs)</span>
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="Paste image URL..."
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (newImageUrl.trim()) {
                onAddImage(newImageUrl.trim());
                setNewImageUrl('');
              }
            }}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-12 h-12 rounded border border-slate-700 overflow-hidden group shrink-0">
              <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute inset-0 bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Documents & Contracts</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Document Name (e.g. Agreement.pdf)"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Document URL"
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (newDocName.trim()) {
                  onAddAttachment(newDocName.trim(), newDocUrl.trim() || '#');
                  setNewDocName('');
                  setNewDocUrl('');
                }
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              + Attach
            </button>
          </div>
        </div>
        <div className="space-y-1 pt-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="px-2.5 py-1 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs"
            >
              <span className="font-mono text-slate-200 text-[11px] truncate">
                📄 {att.name} <span className="text-[9px] text-amber-400 font-bold">({att.fileType})</span>
              </span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
