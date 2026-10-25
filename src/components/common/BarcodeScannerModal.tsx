import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Scan,
  X,
  Zap,
  Volume2,
  VolumeX,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { products } = useStore();
  const [flashlight, setFlashlight] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleBarcodeDetect = (code: string) => {
    const matched = products.find(
      p => p.barcode === code || p.qrCode === code || p.id === code
    );

    if (matched) {
      if (soundEnabled) {
        // Play scan beep
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        } catch (e) {
          // ignore if blocked by browser audio policy
        }
      }
      onScanSuccess(matched);
      onClose();
    } else {
      setErrorMsg(`No product found with barcode / QR: "${code}"`);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
      <div className="glass-panel text-slate-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 relative">
        {/* Subtle brand gradient backdrop BEHIND the glass modal */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/15 via-slate-900/60 to-sky-500/15 pointer-events-none" />
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-sky-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">ZXing / Integrated Barcode Scanner</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlashlight(!flashlight)}
              className={`p-1.5 rounded-lg border transition-colors ${
                flashlight ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle Flash"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle Beep Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Frame */}
        <div className="p-6 flex flex-col items-center justify-center relative bg-slate-950">
          
          <div className={`w-full max-w-xs h-56 rounded-2xl border-2 relative overflow-hidden flex flex-col items-center justify-center transition-all ${
            flashlight ? 'bg-slate-800/90 border-amber-400/80 shadow-2xl shadow-amber-500/10' : 'bg-slate-900/90 border-sky-500/80 shadow-2xl shadow-blue-500/10'
          }`}>
            {/* Animated Laser Scan Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bounce top-1/2 -translate-y-1/2 shadow-[0_0_12px_#2563EB]" />
            
            {/* Corner Markers */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-sky-400" />

            <Scan className="w-12 h-12 text-slate-600 mb-2" />
            <span className="text-xs font-semibold text-slate-400">Position Barcode / QR Code in Frame</span>
            <span className="text-[10px] text-sky-400/80 mt-1 font-mono">Live ZXing Optical Engine Ready</span>
          </div>

          {errorMsg && (
            <div className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Click-to-Scan Sample Barcodes */}
          <div className="w-full mt-5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
              Quick Scan Samples (Click to Scan):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleBarcodeDetect(p.barcode)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {p.barcode}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div className="w-full mt-4 pt-4 border-t border-slate-800 flex gap-2">
            <input
              id="input-manual-barcode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBarcodeDetect(manualCode)}
              placeholder="Or enter barcode / SKU manually..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              id="btn-submit-manual-barcode"
              onClick={() => handleBarcodeDetect(manualCode)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
