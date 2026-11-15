import React, { useEffect, useState } from 'react';
import {
  AssetItem,
  DesignProject,
  GeneratedWebsiteBundle,
  TemplateDefinition,
} from './types/design';
import {
  createBlankProject,
  createProjectFromTemplate,
  STUDIO_ASSETS,
  TEMPLATES,
} from './data/templates';
import {
  deleteCustomAsset,
  deleteCustomTemplate,
  deleteProjectFromStorage,
  loadAllProjects,
  loadCustomAssets,
  loadCustomTemplates,
  saveCustomAsset,
  saveCustomTemplate,
  saveProjectToStorage,
} from './utils/storage';
import { compileProjectToCode, generateId } from './utils/designEngine';
import { exportProjectAsZip } from './utils/zipExport';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { VisualEditor } from './components/VisualEditor';
import { LivePreviewModal } from './components/LivePreviewModal';

type AppView = 'landing' | 'dashboard' | 'editor';

function SitecraftStudioApp() {
  const { t } = useI18n();

  const [view, setView] = useState<AppView>('landing');
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [customAssets, setCustomAssets] = useState<AssetItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<TemplateDefinition[]>([]);
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

  // Load initial seeded projects, custom assets, and custom templates from IndexedDB
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

    loadCustomAssets().then((loadedAssets) => {
      setCustomAssets(loadedAssets);
    });

    loadCustomTemplates().then((loadedTpls) => {
      setCustomTemplates(loadedTpls);
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

  const allTemplates: TemplateDefinition[] = [...customTemplates, ...TEMPLATES];
  const allAssets: AssetItem[] = [...customAssets, ...STUDIO_ASSETS];

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
    const foundTpl = allTemplates.find((tpl) => tpl.id === templateId);
    const created = foundTpl
      ? {
          id: generateId('proj'),
          name: customName || `${foundTpl.name} Project`,
          description: foundTpl.description,
          templateId: foundTpl.id,
          category: foundTpl.category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activePageId: foundTpl.pages[0].id,
          pages: structuredClone(foundTpl.pages),
          aiHistory: [],
        }
      : createProjectFromTemplate(templateId, customName);

    setProjects((prev) => [created, ...prev]);
    saveProjectToStorage(created);
    setActiveProjectId(created.id);
    setView('editor');
    showToast(`${t.toasts.projectCreatedTpl} "${created.name}".`);
  };

  const handleCreateBlank = (name: string) => {
    const created = createBlankProject(name);
    setProjects((prev) => [created, ...prev]);
    saveProjectToStorage(created);
    setActiveProjectId(created.id);
    setView('editor');
    showToast(`${t.toasts.projectCreatedBlank} "${created.name}".`);
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
    showToast(`${t.toasts.projectRenamed} "${newName}".`);
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
    showToast(`${t.toasts.projectDuplicated}: "${target.name}".`);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    deleteProjectFromStorage(projectId);
    showToast(t.toasts.projectDeleted);
  };

  // Custom Asset handlers
  const handleAddAsset = (asset: AssetItem) => {
    setCustomAssets((prev) => [asset, ...prev]);
    saveCustomAsset(asset);
  };

  const handleRenameAsset = (assetId: string, newName: string) => {
    setCustomAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        const updated = { ...a, name: newName };
        saveCustomAsset(updated);
        return updated;
      })
    );
  };

  const handleDeleteAsset = (assetId: string) => {
    setCustomAssets((prev) => prev.filter((a) => a.id !== assetId));
    deleteCustomAsset(assetId);
  };

  // Save current project as a reusable Custom Template
  const handleSaveAsTemplate = () => {
    if (!activeProject) return;
    const newTpl: TemplateDefinition = {
      id: generateId('custom_tpl'),
      name: `${activeProject.name} Template`,
      category: activeProject.category || 'Custom Studio Template',
      tagline: 'User-saved custom architectural layout',
      description:
        activeProject.description || 'Custom template saved from SITECRAFT Visual Editor.',
      accentColor: '#3B82F6',
      previewImage: '/src/assets/images/template_modern_business_1794725846334.jpg',
      pages: structuredClone(activeProject.pages),
      isCustom: true,
    };
    setCustomTemplates((prev) => [newTpl, ...prev]);
    saveCustomTemplate(newTpl);
    showToast(t.toasts.templateSaved);
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates((prev) => prev.filter((tpl) => tpl.id !== templateId));
    deleteCustomTemplate(templateId);
  };

  const handleGenerateWebsite = async (projectToCompile: DesignProject) => {
    setIsGenerating(true);
    showToast(t.toasts.compiling);

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
    const tempProject: DesignProject = {
      id: generateId('preview_proj'),
      name: tpl.name,
      description: tpl.description,
      templateId: tpl.id,
      category: tpl.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activePageId: tpl.pages[0].id,
      pages: structuredClone(tpl.pages),
      aiHistory: [],
    };
    const bundle = compileProjectToCode(tempProject);
    setPreviewState({ project: tempProject, bundle });
  };

  const handleExportZip = async (
    projectToExport: DesignProject,
    bundle?: GeneratedWebsiteBundle
  ) => {
    const result = await exportProjectAsZip(projectToExport, bundle);
    showToast(
      `${t.toasts.zipExported}: ${result.filename} (${result.fileCount} files, ${(
        result.byteSize / 1024
      ).toFixed(1)} KB)`
    );
  };

  const handleSwitchTemplateInEditor = (templateId: string) => {
    const tpl = allTemplates.find((item) => item.id === templateId);
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
    showToast(`${t.toasts.projectCreatedTpl} "${tpl.name}".`);
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
          templates={allTemplates}
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
          templates={allTemplates}
          activeEngineLabel={activeEngineLabel}
          onBackToLanding={() => setView('landing')}
          onOpenProject={(id) => {
            setActiveProjectId(id);
            setView('editor');
          }}
          onCreateBlank={handleCreateBlank}
          onCreateFromTemplate={handleCreateFromTemplate}
          onDeleteCustomTemplate={handleDeleteCustomTemplate}
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
          assets={allAssets}
          templates={allTemplates}
          onAddAsset={handleAddAsset}
          onRenameAsset={handleRenameAsset}
          onDeleteAsset={handleDeleteAsset}
          onSaveAsTemplate={handleSaveAsTemplate}
          onShowToast={showToast}
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

export default function App() {
  return (
    <I18nProvider>
      <SitecraftStudioApp />
    </I18nProvider>
  );
}
