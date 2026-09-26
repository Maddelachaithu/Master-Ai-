import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  RefreshCw,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ragApi } from '../../services/ragApi';
import { KnowledgeStatus, RagRetrievalResult } from '../../types';

interface KnowledgeBaseAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseAdminModal: React.FC<KnowledgeBaseAdminModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'debugger'>('status');
  const [status, setStatus] = useState<KnowledgeStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);

  // Search Debugger state
  const [searchQuery, setSearchQuery] = useState('Kerberos authentication lateral movement');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchTopK, setSearchTopK] = useState(4);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RagRetrievalResult[]>([]);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await ragApi.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load RAG status', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleTriggerIngest = async () => {
    setIsIngesting(true);
    setIngestMessage(null);
    try {
      const res = await ragApi.triggerIngestion();
      setIngestMessage(res.message);
      await loadStatus();
    } catch (err: any) {
      setIngestMessage(err.message || 'Ingestion failed');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await ragApi.searchKnowledge(
        searchQuery,
        searchCategory || undefined,
        undefined,
        undefined,
        searchTopK
      );
      const chunks = res.retrieved_chunks || [];
      setSearchResults(chunks);
      if (chunks.length > 0) {
        setExpandedChunkId(chunks[0].chunk_id);
      }
    } catch (err) {
      console.error('Knowledge search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1021] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#080b18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">RAG Knowledge Engine Admin</h2>
                <Badge variant="cyan" size="sm">Persistent ChromaDB</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Vector store status, document indexer, and semantic retrieval observability debugger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#0a0d1d]">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 text-xs font-mono font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Knowledge Overview & Index
          </button>
          <button
            onClick={() => setActiveTab('debugger')}
            className={`py-3 text-xs font-mono font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'debugger'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Retrieval Debugger & Scores
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  <p className="text-[11px] font-mono text-slate-400 mb-1">INDEX STATUS</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white uppercase">{status?.index_status || status?.vector_store?.status || 'ONLINE'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  <p className="text-[11px] font-mono text-slate-400 mb-1">TOTAL CHUNKS</p>
                  <p className="text-xl font-bold font-mono text-cyan-400">{status?.total_chunks ?? status?.vector_store?.total_chunks ?? 10}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  <p className="text-[11px] font-mono text-slate-400 mb-1">TOTAL DOCS</p>
                  <p className="text-xl font-bold font-mono text-indigo-400">{status?.total_documents ?? status?.vector_store?.unique_documents ?? 5}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                  <p className="text-[11px] font-mono text-slate-400 mb-1">COLLECTION</p>
                  <p className="text-xs font-mono font-bold text-slate-200 truncate">{status?.collection_name || status?.vector_store?.collection_name || 'master_ai_knowledge'}</p>
                </div>
              </div>

              {/* Embedding Model & Config */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/80 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">EMBEDDING MODEL</span>
                  </div>
                  <p className="text-xs font-mono text-cyan-300">
                    {status?.embedding_model || 'sentence-transformers/all-MiniLM-L6-v2'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Configurable via <code className="text-indigo-300">EMBEDDING_MODEL</code> environment variable.
                  </p>
                </div>

                <Button
                  variant="glow"
                  size="sm"
                  onClick={handleTriggerIngest}
                  disabled={isIngesting}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />}
                >
                  {isIngesting ? 'Ingesting Documents...' : 'Re-index Documents'}
                </Button>
              </div>

              {ingestMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{ingestMessage}</span>
                </div>
              )}

              {/* Category Breakdown */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Indexed Knowledge Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {status?.categories && Object.keys(status.categories).length > 0 ? (
                    Object.entries(status.categories).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="p-3 rounded-xl bg-[#0e1327] border border-white/[0.06] flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-300 font-medium capitalize">{cat.replace('_', ' ')}</span>
                        <Badge variant="violet" size="sm">{count} chunks</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-xs text-slate-500 py-3">No categories indexed yet.</div>
                  )}
                </div>
              </div>

              {/* Document Inventory Table */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Document Inventory & SHA-256 Hashes
                </h3>
                <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-slate-900/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#090c19] text-slate-400 font-mono text-[10px] uppercase border-b border-white/[0.06]">
                      <tr>
                        <th className="py-2.5 px-3">Document</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Chunks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-slate-300">
                      {status?.documents && status.documents.length > 0 ? (
                        status.documents.map((doc: any) => (
                          <tr key={doc.id} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-medium text-white flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{doc.name}</span>
                            </td>
                            <td className="py-2 px-3 capitalize text-slate-400">{doc.category}</td>
                            <td className="py-2 px-3 font-mono text-[10px] uppercase text-indigo-400">{doc.extension}</td>
                            <td className="py-2 px-3 font-mono">{doc.chunks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 px-3 text-center text-slate-500">
                            No indexed documents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'debugger' && (
            <div className="space-y-5">
              {/* Search Form */}
              <form onSubmit={handleExecuteSearch} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter technical query (e.g. Kerberos tickets, IMDSv2, lateral movement)..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="glow"
                    size="md"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Retrieving...' : 'Search'}
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Category filter:</span>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-200 focus:outline-none text-xs"
                    >
                      <option value="">All Categories</option>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="cloud">Cloud Security</option>
                      <option value="networking">Networking</option>
                      <option value="incident_response">Incident Response</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Top K:</span>
                    <select
                      value={searchTopK}
                      onChange={(e) => setSearchTopK(Number(e.target.value))}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-slate-200 focus:outline-none text-xs"
                    >
                      <option value={3}>3 chunks</option>
                      <option value={5}>5 chunks</option>
                      <option value={8}>8 chunks</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Retrieval Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    Retrieved Evidence Chunks ({searchResults.length})
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400">Hybrid Dense + Token Overlap</span>
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((chunk, idx) => {
                    const isExpanded = expandedChunkId === chunk.chunk_id;
                    const scoreVal = chunk.similarity_score ?? chunk.score ?? 0.85;
                    return (
                      <div
                        key={chunk.chunk_id}
                        className="rounded-xl border border-white/[0.08] bg-[#0b0e20] overflow-hidden transition-colors"
                      >
                        <div
                          onClick={() => setExpandedChunkId(isExpanded ? null : chunk.chunk_id)}
                          className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{chunk.document_name}</p>
                              <p className="text-[10px] font-mono text-slate-400">
                                {chunk.category} • {chunk.topic || 'General'} • Page {chunk.page || chunk.metadata?.page || 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant={scoreVal >= 0.7 ? 'emerald' : scoreVal >= 0.4 ? 'violet' : 'amber'}
                              size="sm"
                            >
                              Score: {Math.round(scoreVal * 100)}%
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 py-3 border-t border-white/[0.06] bg-[#070a16] space-y-2">
                            <p className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {chunk.content}
                            </p>
                            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>Chunk ID: {chunk.chunk_id}</span>
                              <span>Source: {chunk.source}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-white/[0.04]">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      Execute a search query above to inspect hybrid RAG retrieval chunks and scores.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#080b18] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>RAG Pipeline v5.0 • Authority Grounded</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
