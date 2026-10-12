import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Bug, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  X, 
  ShieldAlert
} from 'lucide-react';
import { fetchPests } from '../services/api';
import type { PestItem } from '../types';

export const PestLibraryPage: React.FC = () => {
  const [pests, setPests] = useState<PestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePest, setActivePest] = useState<PestItem | null>(null);

  useEffect(() => {
    loadPests();
  }, []);

  const loadPests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPests();
      setPests(data.items);
    } catch (err: any) {
      console.error('Failed to load pest catalog:', err);
      setError(err.message || 'Could not load pest catalog from backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique groups
  const groups = ['All', ...Array.from(new Set(pests.map((p) => p.group))).filter(Boolean)];

  // Filtered list
  const filteredPests = pests.filter((p) => {
    const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.common_name.toLowerCase().includes(q) ||
      p.dataset_name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.symptoms.toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-agri-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-agri-leaf font-display">
            Taxonomic Reference
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 mt-1 font-display">
            102 Pest Catalogue
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            Verified agricultural species index from the IP102 dataset benchmark. Includes English common names, biological groupings, visible signs of damage, and management notes.
          </p>
        </div>

        <div className="text-xs text-gray-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-agri-border self-start md:self-auto shadow-xs">
          Showing <strong>{filteredPests.length}</strong> of <strong>{pests.length}</strong> species
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-agri-border shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by common name, crop damage symptoms, or scientific label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-agri-border text-sm focus:outline-none focus:ring-2 focus:ring-agri-leaf/30 focus:border-agri-leaf transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={loadPests}
            title="Refresh catalog"
            className="px-3.5 py-2.5 rounded-xl border border-agri-border hover:bg-agri-cream text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Group:
          </span>
          {groups.slice(0, 10).map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedGroup === grp
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'bg-agri-cream text-gray-700 hover:bg-stone-200 border border-agri-border'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Grid of Pests */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-agri-leaf mx-auto" />
          <p className="text-sm text-gray-600 font-medium">Loading 102 pest classes from database...</p>
        </div>
      ) : filteredPests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-agri-border text-center space-y-3 shadow-soft">
          <Bug className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-forest-950 font-display">No matching pests found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different biological group filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPests.map((pest) => (
            <div
              key={pest.class_id}
              onClick={() => setActivePest(pest)}
              className="bg-white rounded-2xl border border-agri-border p-5 shadow-soft hover:shadow-card hover:border-forest-700/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-agri-cream text-forest-900 border border-agri-border">
                    Class #{pest.class_id}
                  </span>
                  <span className="text-[11px] font-semibold text-agri-leaf bg-agri-leaf/10 px-2 py-0.5 rounded-full">
                    {pest.group}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-forest-950 group-hover:text-agri-leaf transition-colors font-display">
                    {pest.common_name}
                  </h3>
                  <div className="text-xs text-gray-500 italic mt-0.5">
                    Dataset ID: {pest.dataset_name}
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {pest.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-agri-border/70 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  {pest.verified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Entry
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" /> Standard Label
                    </>
                  )}
                </span>
                <span className="text-agri-leaf font-semibold group-hover:underline flex items-center gap-0.5">
                  View Biology &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pest Modal Detail View */}
      {activePest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-agri-border max-w-xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-forest-950 text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-forest-800 text-agri-lime font-mono">
                    Class ID {activePest.class_id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-forest-800 text-gray-300">
                    {activePest.group}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display text-white">
                  {activePest.common_name}
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  IP102 Dataset Name: {activePest.dataset_name}
                </p>
              </div>
              <button
                onClick={() => setActivePest(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-forest-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-forest-950 text-sm mb-1 font-display">
                  Description & Biology
                </h4>
                <p className="p-3 bg-agri-cream/60 rounded-xl border border-agri-border text-gray-700 leading-relaxed">
                  {activePest.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest-950 text-sm mb-1 font-display">
                  Crop Damage & Diagnostic Symptoms
                </h4>
                <p className="p-3 bg-agri-cream/60 rounded-xl border border-agri-border text-gray-700 leading-relaxed">
                  {activePest.symptoms}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest-950 text-sm mb-1 font-display">
                  Agricultural Relevance & Threshold
                </h4>
                <p className="p-3 bg-agri-cream/60 rounded-xl border border-agri-border text-gray-700 leading-relaxed">
                  {activePest.relevance}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Field verification notice:</strong> Economic thresholds dictate intervention. The presence of an insect alone does not warrant prophylactic spraying.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-agri-cream/50 border-t border-agri-border flex justify-end">
              <button
                onClick={() => setActivePest(null)}
                className="px-5 py-2 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition"
              >
                Close Catalogue Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
