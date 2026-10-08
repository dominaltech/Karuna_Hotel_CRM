import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function CreateNewTableModal({
  isOpen,
  onClose,
  sections,
  tables,
  onCreateTableAndOpenMenu
}) {
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [boxSerialNumber, setBoxSerialNumber] = useState('');
  const [isParcel, setIsParcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to calculate prefix for a section
  const getPrefixForSection = (secId, isP = false) => {
    if (isP) return 'P';
    const secObj = sections.find(
      s => String(s.id) === String(secId)
    );
    const secName = (secObj?.name || '').toLowerCase();
    if (secName.includes('dine') || secName.includes('dining') || secName.includes('ground')) return 'D';
    if (secName.includes('first') || secName.includes('floor')) return 'F';
    if (secName.includes('ac')) return 'AC';
    if (secName.includes('parcel') || secName.includes('takeaway')) return 'P';
    if (secName.includes('roof') || secName.includes('top')) return 'R';
    if (secName.includes('garden')) return 'G';
    const firstChar = (secObj?.name || '').trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : 'T';
  };

  const getNextAvailableName = (secId, isP = false) => {
    const prefix = getPrefixForSection(secId, isP);
    let nextNum = 1;
    let candidate = `${prefix}${nextNum}`;
    while (tables.some(t => t && String(t.sectionId) === String(secId) && String(t.name).toUpperCase().trim() === candidate.toUpperCase())) {
      nextNum += 1;
      candidate = `${prefix}${nextNum}`;
    }
    return candidate;
  };

  // When opened, auto-suggest next box serial number
  useEffect(() => {
    if (isOpen && sections && sections.length > 0) {
      const activeSecId = sections[0].id;
      setSelectedSectionId(activeSecId);
      const isSecParcel = Boolean(sections[0]?.name && sections[0].name.toLowerCase().includes('parcel'));
      setIsParcel(isSecParcel);
      setBoxSerialNumber(getNextAvailableName(activeSecId, isSecParcel));
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSectionSelect = (secId) => {
    setSelectedSectionId(secId);
    const secObj = sections.find(s => String(s.id) === String(secId));
    const isSecParcel = Boolean(secObj?.name && secObj.name.toLowerCase().includes('parcel'));
    setIsParcel(isSecParcel);
    setBoxSerialNumber(getNextAvailableName(secId, isSecParcel));
    setErrorMessage('');
  };

  const handleToggleParcel = (parcelVal) => {
    setIsParcel(parcelVal);
    setBoxSerialNumber(getNextAvailableName(selectedSectionId, parcelVal));
    setErrorMessage('');
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = boxSerialNumber.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a Box Serial Number');
      return;
    }

    if (tables.some(t => t && String(t.sectionId) === String(selectedSectionId) && String(t.name).toUpperCase().trim() === trimmed.toUpperCase())) {
      setErrorMessage(`A card named "${trimmed}" already exists in this area. Please choose a different number.`);
      return;
    }

    onCreateTableAndOpenMenu({
      name: trimmed,
      sectionId: selectedSectionId || sections[0]?.id || 1,
      status: 'empty',
      currentCart: [],
      currentTokenNo: '',
      isParcel: Boolean(isParcel || trimmed.toUpperCase().startsWith('P')),
      createdAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Create New Table / Box
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          
          {/* 1. Select Section */}
          <div>
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-wider mb-2">
              1. Select Area / Section
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((sec, secIdx) => {
                const isSelected = String(selectedSectionId) === String(sec.id);
                return (
                  <button
                    key={`modal-sec-${sec.id || sec.name}-${secIdx}`}
                    type="button"
                    onClick={() => handleSectionSelect(sec.id)}
                    className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {sec.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Card Type */}
          <div>
            <label className="block text-xs font-black text-neutral-900 uppercase tracking-wider mb-2">
              2. Card Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleParcel(false)}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  !isParcel
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
              >
                <span>🍽️ Dining Table</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleParcel(true)}
                className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  isParcel
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
              >
                <span>📦 Parcel / Takeaway</span>
              </button>
            </div>
          </div>

          {/* 3. Box Serial Number */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
              3. Card / Box Name
            </label>
            <input
              type="text"
              autoFocus
              value={boxSerialNumber}
              onChange={(e) => {
                setBoxSerialNumber(e.target.value);
                setErrorMessage('');
              }}
              placeholder="e.g. D9, F7, AC6, P5"
              className="w-full text-center text-xl font-black tracking-wider text-slate-900 bg-white border border-slate-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            />
            {errorMessage && (
              <p className="text-xs font-bold text-rose-600 mt-2 text-center">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-300 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-neutral-900 hover:bg-black text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>✓ Create & Open Menu</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
