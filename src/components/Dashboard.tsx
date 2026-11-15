import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Download,
  Edit3,
  Eye,
  FilePlus,
  FolderOpen,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { DesignProject } from '../types/design';
import { TEMPLATES } from '../data/templates';

interface DashboardProps {
  projects: DesignProject[];
  activeEngineLabel: string;
  onBackToLanding: () => void;
  onOpenProject: (projectId: string) => void;
  onCreateBlank: (name: string) => void;
  onCreateFromTemplate: (templateId: string, customName?: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onPreviewProject: (project: DesignProject) => void;
  onExportProjectZip: (project: DesignProject) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  activeEngineLabel,
  onBackToLanding,
  onOpenProject,
  onCreateBlank,
  onCreateFromTemplate,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onPreviewProject,
  onExportProjectZip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newBlankName, setNewBlankName] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleStartRename = (proj: DesignProject) => {
    setEditingId(proj.id);
    setEditingName(proj.name);
  };

  const handleCommitRename = (projectId: string) => {
    if (editingName.trim()) {
      onRenameProject(projectId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleCreateBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newBlankName.trim() || 'Untitled SITECRAFT Site';
    onCreateBlank(title);
    setNewBlankName('');
    setShowNewModal(false);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F6] flex flex-col">
      {/* Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-10 py-4 bg-[#0D0D11] border-b border-zinc-800/90">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span className="text-zinc-700">/</span>
          <span className="text-base font-extrabold tracking-tight text-white font-display whitespace-nowrap">
            SITECRAFT Workspace
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
          <span>Local Storage & IndexedDB Active</span>
          <span aria-hidden="true">·</span>
          <span>{activeEngineLabel}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Blank Project</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 lg:px-10 py-10 space-y-12">
        {/* Create Blank Modal / Inline Bar */}
        {showNewModal && (
          <form
            onSubmit={handleCreateBlankSubmit}
            className="p-6 bg-[#121218] border border-blue-500/40 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
          >
            <div className="flex-1">
              <label htmlFor="blank-project-name" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                New Blank Project Name
              </label>
              <input
                id="blank-project-name"
                type="text"
                placeholder="e.g., Horizon Robotics Launch Site"
                value={newBlankName}
                onChange={(e) => setNewBlankName(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Create & Open Editor
              </button>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Quick Actions + Search */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-display tracking-tight">
              Your Websites & Visual Projects
            </h1>
            <p className="text-xs text-zinc-400 mt-1 tabular-nums">
              {projects.length} total projects saved locally · Instant restore across sessions
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search projects"
              placeholder="Filter projects by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#111116] border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Recent Projects Strip */}
        {recentProjects.length > 0 && !searchQuery && (
          <section>
            <div className="text-xs font-semibold text-zinc-400 mb-3">
              Recently Opened & Modified
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((proj) => (
                <div
                  key={`recent_${proj.id}`}
                  className="p-4 bg-[#111116] border border-zinc-800/80 hover:border-zinc-700 rounded-xl flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{proj.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                      <span>{proj.category}</span>
                      <span className="mx-1.5">·</span>
                      <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Open ${proj.name} in Studio`}
                    onClick={() => onOpenProject(proj.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    Open Studio
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Projects Grid */}
        <section>
          <div className="text-xs font-semibold text-zinc-400 mb-4">
            All Workspace Projects ({filteredProjects.length})
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-12 bg-[#111116] border border-zinc-800 rounded-xl text-center space-y-3">
              <FolderOpen className="w-8 h-8 text-zinc-500 mx-auto" />
              <div className="text-base font-bold text-white">No matching projects found</div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Create a new blank project or select one of the 6 curated templates below to launch the visual editor.
              </p>
              <button
                type="button"
                onClick={() => onCreateBlank('New Visual Website')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => {
                const tpl = TEMPLATES.find((t) => t.id === proj.templateId);
                const previewImg =
                  tpl?.previewImage ||
                  '/src/assets/images/template_modern_business_1794725846334.jpg';

                return (
                  <div
                    key={proj.id}
                    className="bg-[#111116] border border-zinc-800/90 rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="h-40 bg-zinc-900 relative overflow-hidden border-b border-zinc-800">
                        <img
                          src={previewImg}
                          alt={proj.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-3.5 text-[11px] text-zinc-300 tabular-nums">
                          <span>{proj.category}</span>
                          <span>{proj.pages.length} Page(s)</span>
                        </div>
                      </div>

                      <div className="p-5">
                        {editingId === proj.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              aria-label="Edit project name"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitRename(proj.id);
                              }}
                              autoFocus
                              className="flex-1 px-2.5 py-1 text-sm bg-[#09090B] border border-blue-500 rounded text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitRename(proj.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="text-base font-bold text-white font-display truncate">
                              {proj.name}
                            </h3>
                            <button
                              type="button"
                              aria-label={`Rename ${proj.name}`}
                              onClick={() => handleStartRename(proj)}
                              className="p-1 text-zinc-400 hover:text-white rounded cursor-pointer"
                              title="Rename Project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                          {proj.description}
                        </p>

                        <div className="text-[11px] text-zinc-500 tabular-nums">
                          Updated {new Date(proj.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${proj.name} in Studio`}
                        onClick={() => onOpenProject(proj.id)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Edit in Studio
                      </button>
                      <button
                        type="button"
                        aria-label={`Preview ${proj.name}`}
                        onClick={() => onPreviewProject(proj)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Live Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Export ZIP for ${proj.name}`}
                        onClick={() => onExportProjectZip(proj)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Download ZIP"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Duplicate ${proj.name}`}
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Project"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${proj.name}`}
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-2 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Create Project from Template Section */}
        <section className="pt-6 border-t border-zinc-900">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white font-display">
              Create New Project from Template
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Choose any of the 6 complete industry templates to initialize a new editable document.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEMPLATES.map((tpl) => (
              <div
                key={`dash_tpl_${tpl.id}`}
                className="p-4 bg-[#111116] border border-zinc-800/90 rounded-xl flex flex-col justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-16 rounded-lg object-cover shrink-0 border border-zinc-800"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white font-display truncate">
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{tpl.category}</div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                      {tpl.tagline}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCreateFromTemplate(tpl.id)}
                  className="w-full py-2 px-3 bg-zinc-900 hover:bg-blue-600 text-zinc-200 hover:text-white border border-zinc-800 hover:border-blue-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Use {tpl.name} Template
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
