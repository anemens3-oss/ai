import React, { useEffect, useState } from 'react';
import {
  DesignProject,
  GeneratedWebsiteBundle,
  TemplateDefinition,
} from './types/design';
import {
  createBlankProject,
  createProjectFromTemplate,
  TEMPLATES,
} from './data/templates';
import {
  deleteProjectFromStorage,
  loadAllProjects,
  saveProjectToStorage,
} from './utils/storage';
import { compileProjectToCode, generateId } from './utils/designEngine';
import { exportProjectAsZip } from './utils/zipExport';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { VisualEditor } from './components/VisualEditor';
import { LivePreviewModal } from './components/LivePreviewModal';

type AppView = 'landing' | 'dashboard' | 'editor';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [previewState, setPreviewState] = useState<{
    project: DesignProject;
    bundle: GeneratedWebsiteBundle;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deepseekConfigured, setDeepseekConfigured] = useState(false);
  const [activeEngineLabel, setActiveEngineLabel] = useState(
    'Local Deterministic Compiler (DeepSeek API not connected)'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  // Load initial seeded projects from IndexedDB / localStorage and check backend status
  useEffect(() => {
    const initialSeeds: DesignProject[] = [
      createProjectFromTemplate('saas-landing', 'Vectra Cloud Launchpad'),
      createProjectFromTemplate('modern-business', 'Apex Global Advisory'),
      createProjectFromTemplate('creative-portfolio', 'Atelier Kronos Monograph'),
    ];

    loadAllProjects(initialSeeds).then((loaded) => {
      setProjects(loaded);
      if (loaded.length > 0) {
        setActiveProjectId(loaded[0].id);
      }
    });

    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setDeepseekConfigured(Boolean(data.deepseekConfigured));
          if (data.activeEngine) {
            setActiveEngineLabel(data.activeEngine);
          }
        }
      })
      .catch(() => {
        // Offline / local fallback
      });

    // Support ?autostart=1 to open straight into the Visual Editor
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setView('editor');
    }
  }, []);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ||
    projects[0] ||
    createProjectFromTemplate('saas-landing', 'Vectra Cloud Launchpad');

  const handleUpdateProject = (updated: DesignProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      return exists
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [updated, ...prev];
    });
    saveProjectToStorage(updated);
  };

  const handleCreateFromTemplate = (templateId: string, customName?: string) => {
    const created = createProjectFromTemplate(templateId, customName);
    setProjects((prev) => [created, ...prev]);
    saveProjectToStorage(created);
    setActiveProjectId(created.id);
    setView('editor');
    showToast(`Initialized "${created.name}" from ${templateId} template.`);
  };

  const handleCreateBlank = (name: string) => {
    const created = createBlankProject(name);
    setProjects((prev) => [created, ...prev]);
    saveProjectToStorage(created);
    setActiveProjectId(created.id);
    setView('editor');
    showToast(`Created blank project "${created.name}".`);
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const updated: DesignProject = {
      ...target,
      name: newName,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateProject(updated);
    showToast(`Renamed project to "${newName}".`);
  };

  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const cloned: DesignProject = {
      ...structuredClone(target),
      id: generateId('proj'),
      name: `${target.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [cloned, ...prev]);
    saveProjectToStorage(cloned);
    showToast(`Duplicated "${target.name}".`);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    deleteProjectFromStorage(projectId);
    showToast('Project removed from workspace.');
  };

  const handleGenerateWebsite = async (projectToCompile: DesignProject) => {
    setIsGenerating(true);
    showToast('Compiling structured design JSON into responsive code...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectToCompile }),
      });

      if (response.ok) {
        const bundle = (await response.json()) as GeneratedWebsiteBundle;
        const updated: DesignProject = {
          ...projectToCompile,
          updatedAt: new Date().toISOString(),
          lastGeneratedBundle: bundle,
        };
        handleUpdateProject(updated);
        setPreviewState({ project: updated, bundle });
        showToast(bundle.providerMessage);
      } else {
        const fallback = compileProjectToCode(projectToCompile);
        setPreviewState({ project: projectToCompile, bundle: fallback });
      }
    } catch {
      const fallback = compileProjectToCode(projectToCompile);
      setPreviewState({ project: projectToCompile, bundle: fallback });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenLivePreview = (projectToPreview: DesignProject) => {
    const bundle =
      projectToPreview.lastGeneratedBundle || compileProjectToCode(projectToPreview);
    setPreviewState({ project: projectToPreview, bundle });
  };

  const handlePreviewTemplate = (tpl: TemplateDefinition) => {
    const tempProject = createProjectFromTemplate(tpl.id, tpl.name);
    const bundle = compileProjectToCode(tempProject);
    setPreviewState({ project: tempProject, bundle });
  };

  const handleExportZip = async (projectToExport: DesignProject, bundle?: GeneratedWebsiteBundle) => {
    const result = await exportProjectAsZip(projectToExport, bundle);
    showToast(
      `Exported ${result.filename} (${result.fileCount} files, ${(result.byteSize / 1024).toFixed(
        1
      )} KB)`
    );
  };

  const handleSwitchTemplateInEditor = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl || !activeProject) return;
    const clonedPages = structuredClone(tpl.pages);
    const updated: DesignProject = {
      ...activeProject,
      templateId: tpl.id,
      category: tpl.category,
      updatedAt: new Date().toISOString(),
      pages: clonedPages,
      activePageId: clonedPages[0].id,
    };
    handleUpdateProject(updated);
    showToast(`Loaded "${tpl.name}" template into current project.`);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F6]">
      {/* Non-intrusive notification banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#14141D] border border-blue-500/50 text-xs font-medium text-zinc-100 rounded-lg shadow-2xl flex items-center gap-2.5"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {view === 'landing' && (
        <LandingPage
          onStartBuilding={() => {
            if (projects.length === 0) {
              handleCreateFromTemplate('saas-landing', 'Vectra Cloud Launchpad');
            } else {
              setView('editor');
            }
          }}
          onOpenDashboard={() => setView('dashboard')}
          onSelectTemplate={(tplId) => handleCreateFromTemplate(tplId)}
          onPreviewTemplate={handlePreviewTemplate}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          projects={projects}
          activeEngineLabel={activeEngineLabel}
          onBackToLanding={() => setView('landing')}
          onOpenProject={(id) => {
            setActiveProjectId(id);
            setView('editor');
          }}
          onCreateBlank={handleCreateBlank}
          onCreateFromTemplate={handleCreateFromTemplate}
          onRenameProject={handleRenameProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onPreviewProject={handleOpenLivePreview}
          onExportProjectZip={(proj) => handleExportZip(proj)}
        />
      )}

      {view === 'editor' && activeProject && (
        <VisualEditor
          project={activeProject}
          activeEngineLabel={activeEngineLabel}
          deepseekConfigured={deepseekConfigured}
          onUpdateProject={handleUpdateProject}
          onBackToDashboard={() => setView('dashboard')}
          onGenerateWebsite={handleGenerateWebsite}
          onOpenLivePreview={handleOpenLivePreview}
          onExportZip={(proj) => handleExportZip(proj)}
          onSwitchTemplate={handleSwitchTemplateInEditor}
        />
      )}

      {previewState && (
        <LivePreviewModal
          project={previewState.project}
          bundle={previewState.bundle}
          isGenerating={isGenerating}
          onClose={() => setPreviewState(null)}
          onRegenerate={() => handleGenerateWebsite(previewState.project)}
          onExportZip={() =>
            handleExportZip(previewState.project, previewState.bundle)
          }
        />
      )}
    </div>
  );
}
