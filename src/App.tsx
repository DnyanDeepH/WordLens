/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Download, Info, CheckCircle2, Puzzle, Settings, MousePointer2, Power } from 'lucide-react';

export default function App() {
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, isAbove: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExtensionActive, setIsExtensionActive] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(isExtensionActive);

  // Keep ref in sync with state for the event listener closure
  useEffect(() => {
    isActiveRef.current = isExtensionActive;
    if (!isExtensionActive) setShowTooltip(false);
  }, [isExtensionActive]);

  // Simulate extension behavior in the React app
  useEffect(() => {
    const handleMouseUp = () => {
      if (!isActiveRef.current) return;

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection) return;
        
        let text = selection.toString().trim();
        
        // Strip punctuation from the beginning and end of the selection
        text = text.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
        
        if (text && text.length > 1 && text.length < 30 && /^[a-zA-Z\s-]+$/.test(text)) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Don't show if clicking inside the tooltip
          if (tooltipRef.current && tooltipRef.current.contains(selection.anchorNode)) return;
          
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          
          let top = rect.bottom + window.scrollY + 10;
          let isAbove = false;
          
          // If less than ~250px below and more space above, place above
          if (spaceBelow < 250 && spaceAbove > spaceBelow) {
            top = rect.top + window.scrollY - 10;
            isAbove = true;
          }
          
          let left = rect.left + window.scrollX + (rect.width / 2);
          
          // Prevent horizontal overflow (approximate tooltip width 300px -> 150px half)
          const maxLeft = document.documentElement.clientWidth - 160;
          if (left > maxLeft) left = maxLeft;
          if (left < 160) left = 160;
          
          setTooltipPos({ top, left, isAbove });
          setShowTooltip(true);
          setLoading(true);
          setError('');
          
          Promise.all([
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text.toLowerCase()}`).then(res => {
              if (!res.ok) throw new Error('Not found');
              return res.json();
            }),
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text.toLowerCase())}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          ])
            .then(([dictData, transData]) => {
              const hindiMeaning = transData && transData[0] && transData[0][0] && transData[0][0][0] ? transData[0][0][0] : '';
              setTooltipData({
                ...dictData[0],
                hindiMeaning
              });
              setLoading(false);
            })
            .catch(err => {
              setError(`No definition found for "${text}".`);
              setLoading(false);
              setTimeout(() => setShowTooltip(false), 3000);
            });
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>WordLens</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setIsExtensionActive(!isExtensionActive)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${isExtensionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
              title="Toggle Extension"
            >
              <Power className="w-4 h-4" />
              <span>{isExtensionActive ? 'ON' : 'OFF'}</span>
              {isExtensionActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </button>
            <a href="#demo" className="hover:text-blue-600 transition-colors hidden sm:block">Live Demo</a>
            <a href="#installation" className="hover:text-blue-600 transition-colors hidden sm:block">Installation</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4 border border-blue-100">
            <Puzzle className="w-4 h-4" />
            Manifest V3 Chrome Extension
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Instant word meanings, <br className="hidden md:block" />
            <span className="text-blue-600">right where you read.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            A lightweight, privacy-friendly Chrome extension that shows definitions, pronunciation, and synonyms the moment you select a word.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#installation" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm shadow-blue-200">
              <Download className="w-5 h-5" />
              Install Extension
            </a>
            <a href="#demo" className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-medium transition-all shadow-sm">
              <MousePointer2 className="w-5 h-5" />
              Try Live Demo
            </a>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="demo" className="scroll-mt-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-2 text-sm font-medium text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Select any word in the text below to see the extension in action
              </span>
            </div>
            <div className="p-8 md:p-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 font-serif">The Enigmatic World of Deep Sea Exploration</h2>
              <div className="space-y-6 text-lg text-slate-700 leading-relaxed font-serif">
                <p>
                  The ocean remains one of the most <span className="font-medium text-slate-900">enigmatic</span> frontiers on our planet. Despite decades of technological advancement, the abyssal depths continue to harbor secrets that baffle even the most seasoned marine biologists.
                </p>
                <p>
                  When submersibles descend into the bathypelagic zone, they enter a realm of perpetual darkness. Here, creatures have evolved extraordinary adaptations to survive. Bioluminescence is ubiquitous, serving as a crucial mechanism for communication, predation, and camouflage. The anglerfish, with its glowing esca, is a quintessential example of this phenomenon.
                </p>
                <p>
                  Furthermore, the immense hydrostatic pressure at these depths would instantly crush a conventional submarine. Yet, delicate organisms thrive, their cellular structures perfectly adapted to the extreme environment. The resilience of life in such inhospitable conditions is truly profound.
                </p>
                <p>
                  As we continue to explore these uncharted territories, we must remain cognizant of the fragility of these ecosystems. Deep-sea mining and climate change pose significant threats, potentially causing irreversible damage before we fully comprehend the biodiversity that exists below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section id="installation" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Installation Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4">How to install in Chrome</h3>
                <ol className="space-y-4 text-slate-600 list-decimal list-inside">
                  <li>Download the project files (using the Export/Download button in AI Studio).</li>
                  <li>Extract the ZIP file to a folder on your computer.</li>
                  <li>Open Google Chrome and navigate to <code className="bg-slate-100 text-pink-600 px-2 py-0.5 rounded text-sm">chrome://extensions/</code></li>
                  <li>Enable <strong>"Developer mode"</strong> using the toggle switch in the top right corner.</li>
                  <li>Click the <strong>"Load unpacked"</strong> button that appears.</li>
                  <li>Select the <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-sm">chrome-extension</code> folder from your extracted files.</li>
                  <li>The extension is now installed! Pin it to your toolbar and try selecting words on any website.</li>
                </ol>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-lg mb-4 text-blue-900">Features Included</h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Manifest V3:</strong> Built with the latest Chrome extension standards for better security and performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Smart Caching:</strong> Uses <code>chrome.storage.local</code> to cache previously searched words, saving API calls.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Debounced Selection:</strong> Prevents excessive API calls when dragging to select text.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Dark Mode Support:</strong> Tooltip automatically adapts to the user's system theme preference.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simulated Tooltip */}
      {showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 w-max max-w-[300px] text-sm transition-all duration-200"
          style={{ 
            top: tooltipPos.top, 
            left: tooltipPos.left,
            transform: tooltipPos.isAbove ? 'translate(-50%, -100%)' : 'translateX(-50%)'
          }}
        >
          {loading ? (
            <div className="flex justify-center p-2">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : tooltipData ? (
            <div className="text-left">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-base capitalize dark:text-white">{tooltipData.word}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">
                  {tooltipData.phonetic || (tooltipData.phonetics?.find((p: any) => p.text)?.text) || ''}
                </span>
              </div>
              {tooltipData.hindiMeaning && (
                <div className="text-[15px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  {tooltipData.hindiMeaning}
                </div>
              )}
              <div className="italic text-blue-500 text-xs mb-1.5">
                {tooltipData.meanings?.[0]?.partOfSpeech}
              </div>
              <div className="mb-1.5 dark:text-slate-200">
                {tooltipData.meanings?.[0]?.definitions?.[0]?.definition}
              </div>
              {(() => {
                let example = '';
                if (tooltipData.meanings) {
                  for (const m of tooltipData.meanings) {
                    for (const d of m.definitions) {
                      if (d.example) {
                        example = d.example;
                        break;
                      }
                    }
                    if (example) break;
                  }
                }
                return example ? (
                  <div className="text-[13px] italic text-slate-600 dark:text-slate-400 mt-1 mb-1.5 border-l-2 border-slate-300 dark:border-slate-600 pl-1.5">
                    "{example}"
                  </div>
                ) : null;
              })()}
              {(() => {
                let allSynonyms: string[] = [];
                if (tooltipData.meanings) {
                  tooltipData.meanings.forEach((m: any) => {
                    if (m.synonyms) allSynonyms.push(...m.synonyms);
                    if (m.definitions) {
                      m.definitions.forEach((d: any) => {
                        if (d.synonyms) allSynonyms.push(...d.synonyms);
                      });
                    }
                  });
                }
                allSynonyms = [...new Set(allSynonyms)].slice(0, 5);
                
                return allSynonyms.length > 0 ? (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                      Synonyms
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allSynonyms.map((syn, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
