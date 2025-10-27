"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getStageLibrary,
  deleteStage,
  duplicateStage,
  exportStageAsJSON,
  generateShareCode,
  importFromShareCode,
  searchStages,
  sortStages,
  type StageLibraryEntry,
} from "@/lib/stageStorage";

export default function StageManager() {
  const router = useRouter();
  const [stages, setStages] = useState<StageLibraryEntry[]>([]);
  const [filteredStages, setFilteredStages] = useState<StageLibraryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "difficulty" | "plays" | "newest">("newest");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importCode, setImportCode] = useState("");

  useEffect(() => {
    loadStages();
  }, []);

  useEffect(() => {
    let result = stages;
    if (searchQuery) {
      result = searchStages(searchQuery);
    }
    result = sortStages(result, sortBy);
    setFilteredStages(result);
  }, [stages, searchQuery, sortBy]);

  const loadStages = () => {
    const library = getStageLibrary();
    setStages(library);
  };

  const handlePlay = (id: string) => router.push(`/play?custom=${id}`);
  const handleEdit = (id: string) => router.push(`/build?id=${id}`);

  const handleDuplicate = (id: string) => {
    const dup = duplicateStage(id);
    if (dup) loadStages();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this stage?")) {
      deleteStage(id);
      loadStages();
    }
  };

  const handleExport = (id: string) => {
    const json = exportStageAsJSON(id);
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parabola-stage-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (id: string) => {
    const code = generateShareCode(id);
    if (code) navigator.clipboard.writeText(code);
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    const imported = importFromShareCode(importCode);
    if (imported) {
      loadStages();
      setShowImportDialog(false);
      setImportCode("");
    } else {
      alert("Invalid share code");
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xs font-mono uppercase tracking-widest text-[#1e40af]">Stage Library</h1>
          <p className="text-[12px] text-gray-400">User-authored configurations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name or tag"
            className="flex-1 min-w-[220px] px-3 py-2 rounded-md bg-black/40 text-white border border-[#1e40af] placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-md bg-black/40 text-white border border-[#1e40af]"
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="difficulty">Difficulty</option>
            <option value="plays">Most Played</option>
          </select>
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
          >
            [ IMPORT ]
          </button>
          <button
            onClick={() => router.push("/build")}
            className="px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
          >
            [ NEW STAGE ]
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStages.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-10 text-sm font-mono">
              No stages available.
            </div>
          ) : (
            filteredStages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                onPlay={() => handlePlay(stage.id)}
                onEdit={() => handleEdit(stage.id)}
                onDuplicate={() => handleDuplicate(stage.id)}
                onDelete={() => handleDelete(stage.id)}
                onExport={() => handleExport(stage.id)}
                onShare={() => handleShare(stage.id)}
              />
            ))
          )}
        </div>
      </div>

      {showImportDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 rounded-md border border-[#1e40af] w-full max-w-md p-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Import Stage</h2>
            <p className="text-gray-400 text-xs mb-3">Paste a share code or JSON.</p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="w-full h-32 bg-black/40 text-white p-3 rounded-md border border-[#1e40af] mb-3"
              placeholder="Share code or JSON"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportDialog(false)}
                className="flex-1 px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
              >
                [ CANCEL ]
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
              >
                [ IMPORT ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StageCardProps {
  stage: StageLibraryEntry;
  onPlay: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onShare: () => void;
}

function StageCard({ stage, onPlay, onEdit, onDuplicate, onDelete, onExport, onShare }: StageCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative border border-[#1e40af] bg-black/40 rounded-md p-4 text-xs sm:text-sm">
      {stage.thumbnail ? (
        <div className="w-full h-36 bg-black/40 rounded-md mb-3 overflow-hidden border border-[#1e40af]">
          <img src={stage.thumbnail} alt={stage.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-36 bg-black/40 rounded-md mb-3 border border-[#1e40af] flex items-center justify-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400">No Thumbnail</span>
        </div>
      )}

      <h3 className="text-white text-sm font-semibold truncate">{stage.name}</h3>
      <p className="text-gray-400 text-[11px] mb-3">Author: {stage.creator}</p>

      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-300 mb-3">
        <div><span className="text-[#06b6d4]">DIFF:</span> {stage.difficulty}/5</div>
        <div><span className="text-[#06b6d4]">PAR:</span> {stage.parScore}</div>
        <div><span className="text-[#06b6d4]">PLAYS:</span> {stage.plays}</div>
      </div>

      <div className="flex gap-2 items-center">
        <button onClick={onPlay} className="px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10">[ LAUNCH ]</button>
        <button onClick={onEdit} className="px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5">[ EDIT ]</button>
        <button onClick={() => setOpen(!open)} className="px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5">[ MORE ]</button>
      </div>

      {open && (
        <div className="absolute right-4 top-48 bg-black/90 rounded-md border border-[#1e40af] z-10 min-w-[160px]">
          <button onClick={() => { onDuplicate(); setOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-mono text-gray-200 hover:bg-white/5">[ DUPLICATE ]</button>
          <button onClick={() => { onShare(); setOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-mono text-gray-200 hover:bg-white/5">[ SHARE CODE ]</button>
          <button onClick={() => { onExport(); setOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-mono text-gray-200 hover:bg-white/5">[ EXPORT JSON ]</button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-mono text-orange-400 hover:bg-white/5">[ DELETE ]</button>
        </div>
      )}

      {open && <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />}
    </div>
  );
}

