import React from 'react';
import { Sprout, ShieldCheck, Database, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-forest-950 text-gray-300 border-t border-forest-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center border border-forest-700">
                <Sprout className="w-5 h-5 text-agri-lime" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">
                AgriVision <span className="text-agri-lime">AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Empowering farmers, agronomists, and crop protection researchers with computer vision for field-level pest recognition, rapid scouting, and evidence-conscious guidance.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-agri-lime" /> Ultralytics YOLO11
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-agri-leaf" /> IP102 Benchmark
              </span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Evidence-Conscious
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-agri-lime transition">
                  Overview & Features
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('diagnose')} className="hover:text-agri-lime transition">
                  AI Pest Diagnosis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-agri-lime transition">
                  102 Pest Library
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-agri-lime transition">
                  Diagnosis History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-agri-lime transition">
                  Field Scouting Guide
                </button>
              </li>
            </ul>
          </div>

          {/* College Hackathon & Open Research Note */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
              Research Context
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Built as an applied AI system demonstration for agricultural disease and pest management, powered by PyTorch, FastAPI, React, and MongoDB Atlas.
            </p>
            <div className="p-3 rounded-lg bg-forest-900/60 border border-forest-800 text-xs text-gray-300">
              <span className="font-semibold text-agri-lime">IP102 Benchmark:</span> 102 taxonomic pest classes with calibrated model confidence thresholds.
            </div>
          </div>
        </div>

        {/* Legal & Agronomic Disclaimer */}
        <div className="pt-8 border-t border-forest-800/80 text-xs text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left max-w-3xl leading-relaxed">
            <strong className="text-gray-300">Agronomist Disclaimer:</strong> AgriVision AI is an assistive decision-support tool. Model predictions indicate visual pattern similarity and do not guarantee biological identification. Always corroborate findings with regional agricultural extension officers before pesticide interventions.
          </p>
          <div className="text-gray-400 whitespace-nowrap">
            © {new Date().getFullYear()} AgriVision AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
