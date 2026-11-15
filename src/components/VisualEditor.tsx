import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookmarkPlus,
  Box,
  Check,
  Clipboard,
  Copy,
  Crop,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Frame,
  Grid,
  Hand,
  Image as ImageIcon,
  Layers,
  Layout,
  Lock,
  Monitor,
  MousePointer,
  Plus,
  Redo2,
  RotateCcw,
  Ruler,
  Search,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  Trash2,
  Type as TypeIcon,
  Undo2,
  Unlock,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  AIChangeRecord,
  AssetItem,
  DesignElement,
  DesignPage,
  DesignProject,
  ElementType,
  TemplateDefinition,
  ViewportMode,
} from '../types/design';
import {
  addElementToPage,
  applyLocalAIAssistantCommand,
  createDefaultElement,
  deleteElementFromPage,
  duplicateElementInPage,
  generateId,
  groupElementsInPage,
  isImageReplaceCommand,
  reorderElementInParent,
  resolveElementForViewport,
  updateElementInPage,
} from '../utils/designEngine';
import { COMPONENT_PRESETS } from '../data/templates';
import {
  createAssetFromUrl,
  formatBytes,
  processUploadedImageFile,
} from '../utils/assetUpload';
import { LanguageSwitcher, useI18n } from '../i18n/I18nContext';

interface VisualEditorProps {
  project: DesignProject;
  activeEngineLabel: string;
  deepseekConfigured: boolean;
  assets: AssetItem[];
  templates: TemplateDefinition[];
  onAddAsset: (asset: AssetItem) => void;
  onRenameAsset: (assetId: string, newName: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onSaveAsTemplate: () => void;
  onShowToast: (msg: string) => void;
  onUpdateProject: (updated: DesignProject) => void;
  onBackToDashboard: () => void;
  onGenerateWebsite: (project: DesignProject) => void;
  onOpenLivePreview: (project: DesignProject) => void;
  onExportZip: (project: DesignProject) => void;
  onSwitchTemplate: (templateId: string) => void;
}

type LeftTab = 'layers' | 'pages' | 'assets' | 'components' | 'templates';
type RightTab = 'inspector' | 'ai';

export const VisualEditor: React.FC<VisualEditorProps> = ({
  project,
  deepseekConfigured,
  assets,
  templates,
  onAddAsset,
  onRenameAsset,
  onDeleteAsset,
  onSaveAsTemplate,
  onShowToast,
  onUpdateProject,
  onBackToDashboard,
  onGenerateWebsite,
  onOpenLivePreview,
  onExportZip,
  onSwitchTemplate,
}) => {
  const { lang, t } = useI18n();

  const [leftTab, setLeftTab] = useState<LeftTab>('layers');
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [activeTool, setActiveTool] = useState<'select' | 'move' | ElementType>('select');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [zoom, setZoom] = useState<number>(0.6);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activePage: DesignPage =
    project.pages.find((p) => p.id === project.activePageId) || project.pages[0];

  const [selectedIds, setSelectedIds] = useState<string[]>([
    activePage.elements[activePage.rootId]?.children[0] || activePage.rootId,
  ]);
  const primarySelectedId = selectedIds[0] || activePage.rootId;
  const rawSelectedElement: DesignElement =
    activePage.elements[primarySelectedId] || activePage.elements[activePage.rootId];
  const selectedElement: DesignElement = resolveElementForViewport(rawSelectedElement, viewport);

  // Undo / Redo stacks of pages state
  const [undoStack, setUndoStack] = useState<DesignPage[][]>([]);
  const [redoStack, setRedoStack] = useState<DesignPage[][]>([]);
  const [clipboardElement, setClipboardElement] = useState<DesignElement | null>(null);

  // Inline layer rename state
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
  const [renamingLayerValue, setRenamingLayerValue] = useState<string>('');

  // Asset Library state
  const [assetSearch, setAssetSearch] = useState('');
  const [customAssetUrl, setCustomAssetUrl] = useState('');
  const [renamingAssetId, setRenamingAssetId] = useState<string | null>(null);
  const [renamingAssetValue, setRenamingAssetValue] = useState('');
  const [isDraggingOverAssets, setIsDraggingOverAssets] = useState(false);
  const [isDraggingOverCanvas, setIsDraggingOverCanvas] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  // New page name input
  const [newPageName, setNewPageName] = useState('');

  // Right-click Context Menu on Canvas
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elementId: string;
  } | null>(null);

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<AIChangeRecord | null>(null);
  const [aiImageUrlInput, setAiImageUrlInput] = useState('');

  // Drag & resize interaction ref
  const dragStateRef = useRef<{
    mode: 'move' | 'resize';
    handle?: string;
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    snapshotSaved: boolean;
  } | null>(null);

  const [snapGuide, setSnapGuide] = useState<{ x?: number; y?: number }>({});

  const commitPageChange = (nextPage: DesignPage, recordHistory = true) => {
    if (recordHistory) {
      setUndoStack((prev) => [...prev.slice(-24), structuredClone(project.pages)]);
      setRedoStack([]);
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 550);
    }
    const nextPages = project.pages.map((p) => (p.id === nextPage.id ? nextPage : p));
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: nextPages,
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousPages = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, structuredClone(project.pages)]);
    setUndoStack((prev) => prev.slice(0, -1));
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: previousPages,
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextPages = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, structuredClone(project.pages)]);
    setRedoStack((prev) => prev.slice(0, -1));
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: nextPages,
    });
  };

  const handleAddElement = (type: ElementType, customParentId?: string) => {
    const targetParent =
      customParentId ||
      (rawSelectedElement &&
      (rawSelectedElement.type === 'frame' ||
        rawSelectedElement.type === 'section' ||
        rawSelectedElement.type === 'container')
        ? rawSelectedElement.id
        : activePage.rootId);

    const existingCount = Object.keys(activePage.elements).length;
    const offset = (existingCount % 6) * 24;

    const created = createDefaultElement(type, targetParent, {
      position: { x: 56 + offset, y: 96 + offset },
    });

    const nextPage = addElementToPage(activePage, created, targetParent);
    commitPageChange(nextPage, true);
    setSelectedIds([created.id]);
    setActiveTool('select');
  };

  const handleDeleteSelected = () => {
    let nextPage = activePage;
    let changed = false;
    for (const id of selectedIds) {
      if (id !== activePage.rootId && nextPage.elements[id]) {
        nextPage = deleteElementFromPage(nextPage, id);
        changed = true;
      }
    }
    if (changed) {
      commitPageChange(nextPage, true);
      setSelectedIds([activePage.rootId]);
    }
  };

  const handleDuplicateSelected = () => {
    if (primarySelectedId === activePage.rootId) return;
    const { page: nextPage, newId } = duplicateElementInPage(activePage, primarySelectedId);
    if (newId) {
      commitPageChange(nextPage, true);
      setSelectedIds([newId]);
    }
  };

  const handleCopySelected = () => {
    if (rawSelectedElement && rawSelectedElement.id !== activePage.rootId) {
      setClipboardElement(structuredClone(rawSelectedElement));
    }
  };

  const handlePasteClipboard = () => {
    if (!clipboardElement) return;
    const pasted = createDefaultElement(clipboardElement.type, activePage.rootId, {
      ...structuredClone(clipboardElement),
      id: generateId(clipboardElement.type),
      name: `${clipboardElement.name} Copy`,
      parentId: activePage.rootId,
      children: [],
      position: {
        x: clipboardElement.position.x + 28,
        y: clipboardElement.position.y + 28,
      },
    });
    const nextPage = addElementToPage(activePage, pasted, activePage.rootId);
    commitPageChange(nextPage, true);
    setSelectedIds([pasted.id]);
  };

  const handleGroupSelected = () => {
    if (selectedIds.length < 1) return;
    const { page: nextPage, groupId } = groupElementsInPage(activePage, selectedIds);
    if (groupId) {
      commitPageChange(nextPage, true);
      setSelectedIds([groupId]);
    }
  };

  const handleAlignSelected = (
    mode: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom'
  ) => {
    const rootW = activePage.elements[activePage.rootId]?.dimensions.width || 1200;
    const rootH = activePage.elements[activePage.rootId]?.dimensions.height || 780;

    let nextPage = activePage;
    for (const id of selectedIds) {
      if (id === activePage.rootId) continue;
      nextPage = updateElementInPage(nextPage, id, (el) => {
        let nextX = el.position.x;
        let nextY = el.position.y;
        if (mode === 'left') nextX = 40;
        if (mode === 'center-x') nextX = Math.round((rootW - el.dimensions.width) / 2);
        if (mode === 'right') nextX = Math.max(0, rootW - el.dimensions.width - 40);
        if (mode === 'top') nextY = 32;
        if (mode === 'center-y') nextY = Math.round((rootH - el.dimensions.height) / 2);
        if (mode === 'bottom') nextY = Math.max(0, rootH - el.dimensions.height - 32);
        return {
          ...el,
          position: { x: nextX, y: nextY },
        };
      });
    }
    commitPageChange(nextPage, true);
  };

  // Update selected element (supports responsive overrides when viewport !== 'desktop')
  const updateSelectedElement = (updater: (el: DesignElement) => DesignElement) => {
    if (!rawSelectedElement) return;
    const nextPage = updateElementInPage(activePage, rawSelectedElement.id, (baseEl) => {
      if (viewport === 'desktop') {
        return updater(baseEl);
      }
      // Compute what updater produces on the resolved viewport element, and save overrides
      const resolved = resolveElementForViewport(baseEl, viewport);
      const modified = updater(resolved);
      return {
        ...baseEl,
        name: modified.name,
        metadata: modified.metadata,
        assets: modified.assets,
        responsive: {
          ...baseEl.responsive,
          [viewport]: {
            position: modified.position,
            dimensions: modified.dimensions,
            styles: modified.styles,
            typography: modified.typography,
          },
        },
      };
    });
    commitPageChange(nextPage, true);
  };

  // Apply an AssetItem to either replace the currently selected Image element or insert a new Image element
  const applyAssetToCanvas = (
    asset: AssetItem,
    options?: { forceReplaceSelected?: boolean; dropX?: number; dropY?: number }
  ) => {
    const shouldReplace =
      options?.forceReplaceSelected ||
      (rawSelectedElement && rawSelectedElement.type === 'image');

    if (shouldReplace && rawSelectedElement) {
      updateSelectedElement((el) => ({
        ...el,
        type: 'image',
        assets: {
          ...el.assets,
          src: asset.src,
          alt: asset.name,
          assetId: asset.id,
        },
      }));
      onShowToast(t.assets.replacedSuccess);
    } else {
      const targetW = asset.width ? Math.min(480, Math.max(160, asset.width)) : 360;
      const targetH =
        asset.width && asset.height
          ? Math.round((targetW * asset.height) / asset.width)
          : 240;

      const imgEl = createDefaultElement('image', activePage.rootId, {
        name: asset.name,
        position: {
          x: options?.dropX ?? 80,
          y: options?.dropY ?? 120,
        },
        dimensions: {
          width: targetW,
          height: Math.min(420, Math.max(120, targetH)),
          widthMode: 'fixed',
          heightMode: 'fixed',
        },
        assets: {
          src: asset.src,
          alt: asset.name,
          objectFit: 'cover',
          aspectRatio: 'auto',
          cropZoom: 1,
          cropX: 50,
          cropY: 50,
          assetId: asset.id,
        },
      });
      const nextPage = addElementToPage(activePage, imgEl, activePage.rootId);
      commitPageChange(nextPage, true);
      setSelectedIds([imgEl.id]);
      onShowToast(t.assets.uploadedSuccess);
    }
  };

  // Process uploaded files from input, drag-and-drop, or clipboard paste
  const handleProcessFiles = async (
    fileList: FileList | File[],
    options?: { replaceSelected?: boolean; dropX?: number; dropY?: number }
  ) => {
    const files = Array.from(fileList);
    for (const file of files) {
      const result = await processUploadedImageFile(file);
      if (result.error || !result.asset) {
        onShowToast(
          result.error === 'size'
            ? t.assets.fileTooLargeError
            : t.assets.invalidFormatError
        );
        continue;
      }

      const uploadedAsset = result.asset;
      onAddAsset(uploadedAsset);

      // If uploaded from AI Assistant pending image replacement, update pendingProposal
      if (pendingProposal?.requiresImageSelection) {
        setPendingProposal({
          ...pendingProposal,
          after: {
            ...pendingProposal.after,
            type: 'image',
            assets: {
              ...pendingProposal.after.assets,
              src: uploadedAsset.src,
              alt: uploadedAsset.name,
              assetId: uploadedAsset.id,
            },
          },
        });
        onShowToast(t.assets.uploadedSuccess);
      } else if (options?.replaceSelected || options?.dropX !== undefined) {
        applyAssetToCanvas(uploadedAsset, {
          forceReplaceSelected: options?.replaceSelected,
          dropX: options?.dropX,
          dropY: options?.dropY,
        });
      } else {
        onShowToast(t.assets.uploadedSuccess);
      }
    }
  };

  // Add image via URL
  const handleAddAssetByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const asset = await createAssetFromUrl(customAssetUrl);
    if (!asset) {
      onShowToast(t.assets.invalidFormatError);
      return;
    }
    onAddAsset(asset);
    setCustomAssetUrl('');
    onShowToast(t.assets.uploadedSuccess);
  };

  // Keyboard shortcuts + Clipboard image paste (Ctrl+V)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopySelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        // Note: if clipboard has an element, paste it; if clipboard has an image file, 'paste' listener handles it
        if (clipboardElement) {
          e.preventDefault();
          handlePasteClipboard();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        handleProcessFiles(imageFiles, {
          replaceSelected: rawSelectedElement?.type === 'image',
          dropX: 96,
          dropY: 120,
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('paste', onPaste);
    };
  });

  // Mouse move / up handlers for canvas dragging & resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const state = dragStateRef.current;
      if (!state) return;

      const dx = Math.round((e.clientX - state.startX) / zoom);
      const dy = Math.round((e.clientY - state.startY) / zoom);

      if (!state.snapshotSaved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        setUndoStack((prev) => [...prev.slice(-24), structuredClone(project.pages)]);
        setRedoStack([]);
        state.snapshotSaved = true;
      }

      if (state.mode === 'move') {
        let nextX = Math.max(0, state.origX + dx);
        let nextY = Math.max(0, state.origY + dy);

        if (showGrid) {
          nextX = Math.round(nextX / 8) * 8;
          nextY = Math.round(nextY / 8) * 8;
        }

        // Check center snap guide
        const rootW = activePage.elements[activePage.rootId]?.dimensions.width || 1200;
        const elCenterX = nextX + state.origW / 2;
        if (showGuides && Math.abs(elCenterX - rootW / 2) < 10) {
          nextX = Math.round(rootW / 2 - state.origW / 2);
          setSnapGuide({ x: rootW / 2 });
        } else {
          setSnapGuide({});
        }

        const nextPage = updateElementInPage(activePage, state.elementId, (el) => {
          if (viewport === 'desktop') {
            return { ...el, position: { x: nextX, y: nextY } };
          }
          return {
            ...el,
            responsive: {
              ...el.responsive,
              [viewport]: {
                ...el.responsive[viewport],
                position: { x: nextX, y: nextY },
              },
            },
          };
        });
        commitPageChange(nextPage, false);
      } else if (state.mode === 'resize') {
        const h = state.handle || 'se';
        let nextX = state.origX;
        let nextY = state.origY;
        let nextW = state.origW;
        let nextH = state.origH;

        if (h.includes('e')) nextW = Math.max(40, state.origW + dx);
        if (h.includes('s')) nextH = Math.max(28, state.origH + dy);
        if (h.includes('w')) {
          const proposedW = Math.max(40, state.origW - dx);
          nextX = state.origX + (state.origW - proposedW);
          nextW = proposedW;
        }
        if (h.includes('n')) {
          const proposedH = Math.max(28, state.origH - dy);
          nextY = state.origY + (state.origH - proposedH);
          nextH = proposedH;
        }

        const nextPage = updateElementInPage(activePage, state.elementId, (el) => {
          if (viewport === 'desktop') {
            return {
              ...el,
              position: { x: nextX, y: nextY },
              dimensions: { ...el.dimensions, width: nextW, height: nextH },
            };
          }
          return {
            ...el,
            responsive: {
              ...el.responsive,
              [viewport]: {
                ...el.responsive[viewport],
                position: { x: nextX, y: nextY },
                dimensions: {
                  ...(el.responsive[viewport]?.dimensions || el.dimensions),
                  width: nextW,
                  height: nextH,
                },
              },
            },
          };
        });
        commitPageChange(nextPage, false);
      }
    };

    const onMouseUp = () => {
      if (dragStateRef.current) {
        dragStateRef.current = null;
        setSnapGuide({});
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activePage, project, zoom, showGrid, showGuides, viewport]);

  // Run AI Assistant transformation
  const handleRunAIAssistant = async (commandToRun?: string) => {
    const finalPrompt = (commandToRun || aiPrompt).trim();
    if (!finalPrompt || !rawSelectedElement) return;

    // Fast path for image replacement commands so the user immediately sees the Asset Picker
    if (isImageReplaceCommand(finalPrompt)) {
      const local = applyLocalAIAssistantCommand(rawSelectedElement, finalPrompt, lang);
      setPendingProposal({
        id: generateId('ai_diff'),
        timestamp: new Date().toISOString(),
        elementId: rawSelectedElement.id,
        elementName: rawSelectedElement.name,
        prompt: finalPrompt,
        summary: local.summary,
        provider: 'local-engine',
        status: 'pending',
        before: structuredClone(rawSelectedElement),
        after: local.updated,
        requiresImageSelection: true,
      });
      return;
    }

    setIsAiRunning(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element: rawSelectedElement,
          prompt: finalPrompt,
          lang,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const proposal: AIChangeRecord = {
          id: generateId('ai_diff'),
          timestamp: new Date().toISOString(),
          elementId: rawSelectedElement.id,
          elementName: rawSelectedElement.name,
          prompt: finalPrompt,
          summary: data.summary,
          provider: data.provider || 'local-engine',
          status: 'pending',
          before: structuredClone(rawSelectedElement),
          after: data.updated,
          requiresImageSelection: Boolean(data.requiresImageSelection),
        };
        setPendingProposal(proposal);
      } else {
        const local = applyLocalAIAssistantCommand(rawSelectedElement, finalPrompt, lang);
        setPendingProposal({
          id: generateId('ai_diff'),
          timestamp: new Date().toISOString(),
          elementId: rawSelectedElement.id,
          elementName: rawSelectedElement.name,
          prompt: finalPrompt,
          summary: local.summary,
          provider: 'local-engine',
          status: 'pending',
          before: structuredClone(rawSelectedElement),
          after: local.updated,
          requiresImageSelection: local.requiresImageSelection,
        });
      }
    } catch {
      const local = applyLocalAIAssistantCommand(rawSelectedElement, finalPrompt, lang);
      setPendingProposal({
        id: generateId('ai_diff'),
        timestamp: new Date().toISOString(),
        elementId: rawSelectedElement.id,
        elementName: rawSelectedElement.name,
        prompt: finalPrompt,
        summary: local.summary,
        provider: 'local-engine',
        status: 'pending',
        before: structuredClone(rawSelectedElement),
        after: local.updated,
        requiresImageSelection: local.requiresImageSelection,
      });
    } finally {
      setIsAiRunning(false);
    }
  };

  const handleAcceptProposal = () => {
    if (!pendingProposal) return;
    const acceptedRecord: AIChangeRecord = {
      ...pendingProposal,
      status: 'accepted',
    };
    const nextPage = updateElementInPage(
      activePage,
      pendingProposal.elementId,
      () => pendingProposal.after
    );
    const nextPages = project.pages.map((p) => (p.id === nextPage.id ? nextPage : p));
    setUndoStack((prev) => [...prev.slice(-24), structuredClone(project.pages)]);
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: nextPages,
      aiHistory: [acceptedRecord, ...(project.aiHistory || [])],
    });
    setPendingProposal(null);
    setAiPrompt('');
  };

  const handleRejectProposal = () => {
    if (!pendingProposal) return;
    const rejectedRecord: AIChangeRecord = {
      ...pendingProposal,
      status: 'rejected',
    };
    onUpdateProject({
      ...project,
      aiHistory: [rejectedRecord, ...(project.aiHistory || [])],
    });
    setPendingProposal(null);
  };

  // Multi-page management
  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newPageName.trim() || `Page ${project.pages.length + 1}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-');
    const pageId = generateId('page');
    const rootId = `${pageId}_root`;
    const rootFrame = createDefaultElement('frame', null, {
      id: rootId,
      name: `${title} Frame`,
      dimensions: { width: 1200, height: 780, widthMode: 'fixed', heightMode: 'fixed' },
    });
    const heading = createDefaultElement('text', rootId, {
      id: generateId('text'),
      name: `${title} Heading`,
      position: { x: 48, y: 80 },
      metadata: { content: `${title} — Visual Section`, semanticTag: 'h1' },
    });
    rootFrame.children = [heading.id];

    const createdPage: DesignPage = {
      id: pageId,
      name: title,
      slug,
      rootId,
      elements: {
        [rootId]: rootFrame,
        [heading.id]: heading,
      },
    };

    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: [...project.pages, createdPage],
      activePageId: createdPage.id,
    });
    setSelectedIds([heading.id]);
    setNewPageName('');
  };

  const handleDeletePage = (pageId: string) => {
    if (project.pages.length <= 1) return;
    const remaining = project.pages.filter((p) => p.id !== pageId);
    const nextActive =
      project.activePageId === pageId ? remaining[0].id : project.activePageId;
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString(),
      pages: remaining,
      activePageId: nextActive,
    });
  };

  const filteredAssets = assets.filter((a) => {
    const q = assetSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.format.toLowerCase().includes(q)
    );
  });

  // Render recursive layer tree in Left Panel
  const renderLayerNode = (elId: string, depth = 0): React.ReactNode => {
    const el = activePage.elements[elId];
    if (!el) return null;
    const isSelected = selectedIds.includes(el.id);
    const isRoot = el.id === activePage.rootId;
    const isContainerLike =
      el.type === 'frame' || el.type === 'section' || el.type === 'container';

    return (
      <div key={el.id} className="select-none">
        <div
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.shiftKey && !isRoot) {
              setSelectedIds((prev) =>
                prev.includes(el.id) ? prev.filter((i) => i !== el.id) : [...prev, el.id]
              );
            } else {
              setSelectedIds([el.id]);
            }
          }}
          onDoubleClick={() => {
            setRenamingLayerId(el.id);
            setRenamingLayerValue(el.name);
          }}
          className={`group flex items-center justify-between pr-1.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-600/25 text-blue-200 border border-blue-500/40'
              : el.metadata.hidden
              ? 'text-zinc-600 hover:bg-zinc-900'
              : 'text-zinc-300 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0 w-8">
              {el.type.slice(0, 4)}
            </span>
            {renamingLayerId === el.id ? (
              <input
                type="text"
                aria-label="Rename Layer"
                value={renamingLayerValue}
                onChange={(e) => setRenamingLayerValue(e.target.value)}
                onBlur={() => {
                  if (renamingLayerValue.trim()) {
                    const nextPage = updateElementInPage(activePage, el.id, (item) => ({
                      ...item,
                      name: renamingLayerValue.trim(),
                    }));
                    commitPageChange(nextPage, true);
                  }
                  setRenamingLayerId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                className="w-full px-1.5 py-0.5 text-xs bg-[#09090B] border border-blue-500 rounded text-white focus:outline-none"
              />
            ) : (
              <span className="truncate font-medium">{el.name}</span>
            )}
          </div>

          {!isRoot && (
            <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 ml-1">
              {isContainerLike && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddElement('text', el.id);
                  }}
                  className="p-0.5 text-zinc-400 hover:text-blue-400 cursor-pointer"
                  title={t.editor.addChildText}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                aria-label={`Lock ${el.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const nextLocked = !el.metadata.locked;
                  commitPageChange(
                    updateElementInPage(activePage, el.id, (item) => ({
                      ...item,
                      metadata: { ...item.metadata, locked: nextLocked },
                    })),
                    true
                  );
                  onShowToast(nextLocked ? t.toasts.layerLocked : t.toasts.layerUnlocked);
                }}
                className={`p-0.5 cursor-pointer ${
                  el.metadata.locked
                    ? 'text-amber-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={t.editor.lockLayer}
              >
                {el.metadata.locked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
              </button>
              <button
                type="button"
                aria-label={`Hide ${el.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  commitPageChange(
                    updateElementInPage(activePage, el.id, (item) => ({
                      ...item,
                      metadata: { ...item.metadata, hidden: !item.metadata.hidden },
                    })),
                    true
                  );
                }}
                className={`p-0.5 cursor-pointer ${
                  el.metadata.hidden ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                }`}
                title={t.editor.hideLayer}
              >
                {el.metadata.hidden ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
              <button
                type="button"
                aria-label={`Move ${el.name} Up`}
                onClick={(e) => {
                  e.stopPropagation();
                  commitPageChange(reorderElementInParent(activePage, el.id, 'up'), true);
                }}
                className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                title={t.editor.moveUp}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                aria-label={`Move ${el.name} Down`}
                onClick={(e) => {
                  e.stopPropagation();
                  commitPageChange(reorderElementInParent(activePage, el.id, 'down'), true);
                }}
                className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                title={t.editor.moveDown}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${el.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  commitPageChange(deleteElementFromPage(activePage, el.id), true);
                  setSelectedIds([activePage.rootId]);
                }}
                className="p-0.5 text-zinc-400 hover:text-red-400 cursor-pointer"
                title={t.editor.deleteLayer}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {el.children.length > 0 && (
          <div className="space-y-0.5 mt-0.5">
            {el.children.map((cid) => renderLayerNode(cid, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render element on the central interactive canvas
  const renderCanvasElement = (elId: string): React.ReactNode => {
    const rawEl = activePage.elements[elId];
    if (!rawEl || rawEl.metadata.hidden) return null;

    // If there is a pending AI Assistant proposal for this element, preview the proposed 'after' state live!
    const effectiveRaw =
      pendingProposal && pendingProposal.elementId === elId ? pendingProposal.after : rawEl;

    const el = resolveElementForViewport(effectiveRaw, viewport);
    const isRoot = el.id === activePage.rootId;
    const isSelected = selectedIds.includes(el.id);

    const shadowCss: Record<string, string> = {
      none: 'none',
      sm: '0 2px 6px rgba(0,0,0,0.25)',
      md: '0 8px 20px rgba(0,0,0,0.35)',
      lg: '0 16px 36px rgba(0,0,0,0.5)',
      xl: '0 24px 48px rgba(0,0,0,0.65)',
    };

    const styleObj: React.CSSProperties = isRoot
      ? {
          position: 'relative',
          width: `${el.dimensions.width}px`,
          minHeight: `${el.dimensions.height}px`,
          background: el.styles.background,
          color: el.styles.color,
        }
      : {
          position: 'absolute',
          left: `${el.position.x}px`,
          top: `${el.position.y}px`,
          width: `${el.dimensions.width}px`,
          height: `${el.dimensions.height}px`,
          background: el.styles.background,
          color: el.styles.color,
          paddingTop: `${el.styles.paddingTop}px`,
          paddingRight: `${el.styles.paddingRight}px`,
          paddingBottom: `${el.styles.paddingBottom}px`,
          paddingLeft: `${el.styles.paddingLeft}px`,
          marginTop: `${el.styles.marginTop}px`,
          marginRight: `${el.styles.marginRight}px`,
          marginBottom: `${el.styles.marginBottom}px`,
          marginLeft: `${el.styles.marginLeft}px`,
          borderWidth: `${el.styles.borderWidth}px`,
          borderStyle: el.styles.borderStyle,
          borderColor: el.styles.borderColor,
          borderRadius: `${el.styles.borderRadius}px`,
          boxShadow: shadowCss[el.styles.shadow] || 'none',
          opacity: el.styles.opacity,
          display: el.styles.display,
          flexDirection: el.styles.flexDirection,
          justifyContent: el.styles.justifyContent,
          alignItems: el.styles.alignItems,
          gap: `${el.styles.gap}px`,
          gridTemplateColumns:
            el.styles.display === 'grid'
              ? `repeat(${el.styles.gridColumns || 3}, minmax(0, 1fr))`
              : undefined,
          fontFamily: `'${el.typography.fontFamily}', sans-serif`,
          fontSize: `${el.typography.fontSize}px`,
          fontWeight: el.typography.fontWeight,
          lineHeight: el.typography.lineHeight,
          letterSpacing: el.typography.letterSpacing,
          textAlign: el.typography.textAlign,
          userSelect: 'none',
          cursor: el.metadata.locked
            ? 'not-allowed'
            : activeTool === 'select'
            ? 'move'
            : 'crosshair',
          overflow: el.type === 'image' ? 'hidden' : 'visible',
        };

    const cropZoom = el.assets.cropZoom && el.assets.cropZoom > 1 ? el.assets.cropZoom : 1;
    const cropX = el.assets.cropX ?? 50;
    const cropY = el.assets.cropY ?? 50;

    return (
      <div
        key={el.id}
        data-testid={`canvas-el-${el.id}`}
        style={styleObj}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isRoot) {
            setSelectedIds([el.id]);
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              elementId: el.id,
            });
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setContextMenu(null);
          if (activeTool !== 'select' && activeTool !== 'move') {
            handleAddElement(activeTool, isRoot ? el.id : activePage.rootId);
            return;
          }

          if (e.shiftKey && !isRoot) {
            setSelectedIds((prev) =>
              prev.includes(el.id) ? prev.filter((i) => i !== el.id) : [...prev, el.id]
            );
          } else {
            setSelectedIds([el.id]);
          }

          if (!isRoot && !el.metadata.locked && e.button === 0) {
            dragStateRef.current = {
              mode: 'move',
              elementId: el.id,
              startX: e.clientX,
              startY: e.clientY,
              origX: el.position.x,
              origY: el.position.y,
              origW: el.dimensions.width,
              origH: el.dimensions.height,
              snapshotSaved: false,
            };
          }
        }}
        className={`transition-shadow ${
          isSelected && !isRoot
            ? 'ring-2 ring-blue-500 z-20'
            : !isRoot
            ? 'hover:ring-1 hover:ring-blue-400/50'
            : ''
        }`}
      >
        {/* Inner Content */}
        {el.type === 'image' ? (
          <img
            src={
              el.assets.src ||
              '/src/assets/images/template_modern_business_1794725846334.jpg'
            }
            alt={el.assets.alt || el.name}
            referrerPolicy="no-referrer"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: el.assets.objectFit || 'cover',
              objectPosition: `${cropX}% ${cropY}%`,
              transform: cropZoom !== 1 ? `scale(${cropZoom})` : undefined,
              transformOrigin: `${cropX}% ${cropY}%`,
              borderRadius: `${Math.max(0, el.styles.borderRadius - 1)}px`,
              pointerEvents: 'none',
            }}
          />
        ) : (
          el.metadata.content && (
            <div className="pointer-events-none w-full break-words">{el.metadata.content}</div>
          )
        )}

        {/* Child Elements */}
        {el.children.map((cid) => renderCanvasElement(cid))}

        {/* Selection Coordinates Pill & 8 Resize Handles */}
        {isSelected && !isRoot && (
          <>
            <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-mono rounded whitespace-nowrap pointer-events-none shadow tabular-nums z-30 flex items-center gap-1">
              {el.metadata.locked && <Lock className="w-2.5 h-2.5" />}
              <span>
                {el.name} · {el.dimensions.width} × {el.dimensions.height} ({el.position.x},{' '}
                {el.position.y})
              </span>
            </div>

            {!el.metadata.locked &&
              (['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => {
                const posClasses: Record<string, string> = {
                  nw: '-top-1.5 -left-1.5 cursor-nwse-resize',
                  n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                  ne: '-top-1.5 -right-1.5 cursor-nesw-resize',
                  e: 'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize',
                  se: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
                  s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize',
                  sw: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
                  w: 'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize',
                };
                return (
                  <div
                    key={handle}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      dragStateRef.current = {
                        mode: 'resize',
                        handle,
                        elementId: el.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        origX: el.position.x,
                        origY: el.position.y,
                        origW: el.dimensions.width,
                        origH: el.dimensions.height,
                        snapshotSaved: false,
                      };
                    }}
                    className={`absolute w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-xs z-30 ${posClasses[handle]}`}
                  />
                );
              })}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#09090B] text-[#F4F4F6] flex flex-col select-none"
      onClick={() => setContextMenu(null)}
    >
      {/* Hidden System File Inputs for Image Upload & Direct Image Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFiles(e.target.files, { replaceSelected: true });
            e.target.value = '';
          }
        }}
      />

      {/* TOP STUDIO TOOLBAR */}
      <header className="h-13 px-3 bg-[#101015] border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Back to Dashboard + Project Name + Undo/Redo/Save Template */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.editor.dashboardBtn}</span>
          </button>

          <input
            type="text"
            aria-label="Project Name"
            value={project.name}
            onChange={(e) =>
              onUpdateProject({
                ...project,
                name: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            className="px-2 py-1 text-xs font-bold text-white bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent focus:border-zinc-700 rounded focus:outline-none w-36 truncate font-display"
          />

          {/* Micro-Animated Save Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/70 border border-zinc-800/80 text-[10px] font-mono text-zinc-400 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span>{isSaving ? t.editor.savingBadge : t.editor.savedBadge}</span>
          </div>

          {/* Undo / Redo / Copy / Duplicate / Delete / Save as Template */}
          <div className="hidden xl:flex items-center gap-0.5 pl-2 border-l border-zinc-800 shrink-0">
            <button
              type="button"
              aria-label="Undo"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.undo}
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.redo}
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Duplicate Selected Element"
              onClick={handleDuplicateSelected}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.duplicate}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Paste Element"
              onClick={handlePasteClipboard}
              disabled={!clipboardElement}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.paste}
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Delete Selected Element"
              onClick={handleDeleteSelected}
              className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label={t.editor.saveAsTemplate}
              onClick={onSaveAsTemplate}
              className="p-1.5 text-zinc-400 hover:text-blue-400 rounded hover:bg-zinc-900 cursor-pointer"
              title={t.editor.saveAsTemplate}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Element Creation Toolbelt */}
        <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-zinc-800 shrink-0">
          {(
            [
              { id: 'select', label: t.editor.toolSelect, icon: MousePointer },
              { id: 'section', label: t.editor.toolSection, icon: Layout },
              { id: 'container', label: t.editor.toolContainer, icon: Box },
              { id: 'text', label: t.editor.toolText, icon: TypeIcon },
              { id: 'button', label: t.editor.toolButton, icon: Square },
              { id: 'image', label: t.editor.toolImage, icon: ImageIcon },
              { id: 'rectangle', label: t.editor.toolCard, icon: Frame },
            ] as const
          ).map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                aria-label={tool.label}
                title={tool.label}
                onClick={() => {
                  if (tool.id === 'select') {
                    setActiveTool('select');
                  } else {
                    handleAddElement(tool.id);
                  }
                }}
                className={`px-2 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Language Switcher + Viewport Breakpoints + Preview + Generate Website + Export ZIP */}
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher />

          {/* Responsive Switcher */}
          <div className="hidden lg:flex items-center gap-0.5 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              aria-label="Desktop Viewport"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Desktop (1200px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Tablet Viewport"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewport === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Mobile Viewport"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Mobile (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenLivePreview(project)}
            className="px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.editor.previewBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateWebsite(project)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-blue-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.editor.generateBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => onExportZip(project)}
            className="px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.editor.exportZipBtn}</span>
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Layers, Pages, Assets, Components, Templates */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="w-72 bg-[#0E0E13] border-r border-zinc-800 flex flex-col shrink-0"
        >
          {/* Left Panel Tabs */}
          <div className="grid grid-cols-5 border-b border-zinc-800 bg-[#0A0A0E] p-1 gap-0.5 text-[11px] font-medium">
            {(
              [
                { id: 'layers', label: t.editor.tabLayers },
                { id: 'pages', label: t.editor.tabPages },
                { id: 'assets', label: t.editor.tabAssets },
                { id: 'components', label: t.editor.tabBlocks },
                { id: 'templates', label: t.editor.tabThemes },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeftTab(tab.id)}
                className={`py-1.5 rounded text-center transition-all duration-200 cursor-pointer truncate ${
                  leftTab === tab.id
                    ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Left Panel Content */}
          <motion.div
            key={leftTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-y-auto p-3 space-y-3"
          >
            {leftTab === 'layers' && (
              <>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800/80">
                  <span>{t.editor.docHierarchy}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGroupSelected}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 cursor-pointer"
                      title={t.editor.groupBtn}
                    >
                      {t.editor.groupBtn}
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5">{renderLayerNode(activePage.rootId, 0)}</div>
              </>
            )}

            {leftTab === 'pages' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    {t.editor.projectPages} ({project.pages.length})
                  </div>
                  {project.pages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onUpdateProject({ ...project, activePageId: p.id });
                        setSelectedIds([p.rootId]);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        p.id === activePage.id
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                          : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500">/{p.slug}</span>
                        {project.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(p.id);
                            }}
                            className="p-0.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title={t.editor.deletePage}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddPage} className="pt-3 border-t border-zinc-800 space-y-2">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    {t.editor.addNewPage}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder={t.editor.newPagePlaceholder}
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      {t.editor.addBtn}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {leftTab === 'assets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-300">{t.assets.title}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{assets.length}</span>
                </div>

                {/* Upload Button & Drag-and-Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverAssets(true);
                  }}
                  onDragLeave={() => setIsDraggingOverAssets(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverAssets(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleProcessFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`p-3 rounded-lg border border-dashed text-center transition-colors ${
                    isDraggingOverAssets
                      ? 'border-blue-500 bg-blue-600/15'
                      : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer mb-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.assets.uploadBtn}</span>
                  </button>
                  <p className="text-[10px] text-zinc-400 leading-snug">{t.assets.dropzoneHint}</p>
                </div>

                {/* Direct Image URL Input */}
                <form onSubmit={handleAddAssetByUrl} className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder={t.assets.addUrlPlaceholder}
                    value={customAssetUrl}
                    onChange={(e) => setCustomAssetUrl(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-[11px] bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium rounded cursor-pointer shrink-0"
                  >
                    {t.assets.addUrlBtn}
                  </button>
                </form>

                {/* Search Assets */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t.assets.searchPlaceholder}
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-[11px] bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Asset Items List */}
                {filteredAssets.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-zinc-500 border border-zinc-800/80 rounded-lg">
                    {t.assets.emptyAssets}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/x-sitecraft-asset', asset.id);
                        }}
                        className="p-2 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-left transition-colors group"
                      >
                        <div className="relative h-24 w-full rounded overflow-hidden bg-zinc-950 mb-2">
                          <img
                            src={asset.src}
                            alt={asset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-mono uppercase bg-black/75 text-zinc-200 rounded">
                            {asset.format}
                          </span>
                          <span
                            className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-mono rounded ${
                              !asset.isBuiltIn
                                ? 'bg-blue-600/90 text-white'
                                : 'bg-zinc-900/80 text-zinc-400'
                            }`}
                          >
                            {!asset.isBuiltIn ? t.assets.customBadge : t.assets.builtInBadge}
                          </span>
                        </div>

                        {/* Asset Name / Inline Rename */}
                        {renamingAssetId === asset.id ? (
                          <div className="flex gap-1 mb-1">
                            <input
                              type="text"
                              value={renamingAssetValue}
                              onChange={(e) => setRenamingAssetValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && renamingAssetValue.trim()) {
                                  onRenameAsset(asset.id, renamingAssetValue.trim());
                                  setRenamingAssetId(null);
                                }
                              }}
                              autoFocus
                              className="flex-1 px-1.5 py-0.5 text-xs bg-[#09090B] border border-blue-500 rounded text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (renamingAssetValue.trim()) {
                                  onRenameAsset(asset.id, renamingAssetValue.trim());
                                }
                                setRenamingAssetId(null);
                              }}
                              className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded cursor-pointer"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="text-xs font-semibold text-zinc-200 truncate">
                              {asset.name}
                            </div>
                            {!asset.isBuiltIn && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingAssetId(asset.id);
                                    setRenamingAssetValue(asset.name);
                                  }}
                                  className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                                  title={t.assets.rename}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteAsset(asset.id)}
                                  className="p-0.5 text-zinc-400 hover:text-red-400 cursor-pointer"
                                  title={t.assets.delete}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-[10px] font-mono text-zinc-500 mb-2 flex items-center justify-between">
                          <span>
                            {asset.width && asset.height
                              ? `${asset.width}×${asset.height}`
                              : asset.category}
                          </span>
                          <span>{formatBytes(asset.sizeBytes)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              applyAssetToCanvas(asset, { forceReplaceSelected: false })
                            }
                            className="py-1 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium rounded cursor-pointer truncate"
                          >
                            + {t.assets.useOnCanvas}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              applyAssetToCanvas(asset, { forceReplaceSelected: true })
                            }
                            className="py-1 px-2 bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 text-[10px] font-medium rounded cursor-pointer truncate"
                          >
                            {t.assets.replaceSelected}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'components' && (
              <div className="space-y-2.5">
                {COMPONENT_PRESETS.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/x-sitecraft-block', comp.id);
                    }}
                    onClick={() => {
                      const el = comp.create(activePage.rootId);
                      const nextPage = addElementToPage(activePage, el, activePage.rootId);
                      commitPageChange(nextPage, true);
                      setSelectedIds([el.id]);
                    }}
                    className="w-full p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                      <span>{comp.name}</span>
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{comp.description}</p>
                  </button>
                ))}
              </div>
            )}

            {leftTab === 'templates' && (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={onSaveAsTemplate}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mb-2"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{t.editor.saveAsTemplate}</span>
                </button>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onSwitchTemplate(tpl.id)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      project.templateId === tpl.id
                        ? 'bg-blue-600/15 border-blue-500/50 text-white'
                        : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold font-display truncate">{tpl.name}</span>
                      {tpl.isCustom && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{tpl.category}</div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.aside>

        {/* CENTER INTERACTIVE CANVAS */}
        <main
          className="flex-1 bg-[#070709] relative overflow-auto flex flex-col"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOverCanvas(true);
          }}
          onDragLeave={() => setIsDraggingOverCanvas(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOverCanvas(false);

            // 1. Check if dropping an Asset from Left Panel
            const assetId = e.dataTransfer.getData('application/x-sitecraft-asset');
            if (assetId) {
              const foundAsset = assets.find((a) => a.id === assetId);
              if (foundAsset) {
                applyAssetToCanvas(foundAsset, { dropX: 80, dropY: 110 });
              }
              return;
            }

            // 2. Check if dropping a Block Preset from Left Panel
            const blockId = e.dataTransfer.getData('application/x-sitecraft-block');
            if (blockId) {
              const foundBlock = COMPONENT_PRESETS.find((b) => b.id === blockId);
              if (foundBlock) {
                const el = foundBlock.create(activePage.rootId);
                const nextPage = addElementToPage(activePage, el, activePage.rootId);
                commitPageChange(nextPage, true);
                setSelectedIds([el.id]);
              }
              return;
            }

            // 3. Check if dropping image files from OS File Manager directly onto Canvas
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleProcessFiles(e.dataTransfer.files, { dropX: 80, dropY: 110 });
            }
          }}
        >
          {/* Sub-toolbar for Zoom, Grid, Guides & Alignment */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-[#0B0B0F]/90 backdrop-blur border-b border-zinc-800/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Zoom Out"
                  onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(0.64)}
                  className="px-2 py-0.5 font-mono text-[11px] text-zinc-300 hover:text-white cursor-pointer tabular-nums"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  aria-label="Zoom In"
                  onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer ${
                  showGrid ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>{t.editor.grid}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuides((g) => !g)}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer ${
                  showGuides ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Ruler className="w-3 h-3" />
                <span>{t.editor.guides}</span>
              </button>
            </div>

            {/* Alignment Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Align Left"
                onClick={() => handleAlignSelected('left')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignLeft}
              >
                <AlignStartVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Center Horizontally"
                onClick={() => handleAlignSelected('center-x')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignCenterX}
              >
                <AlignCenterVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Right"
                onClick={() => handleAlignSelected('right')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignRight}
              >
                <AlignEndVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Top"
                onClick={() => handleAlignSelected('top')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignTop}
              >
                <AlignStartHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Center Vertically"
                onClick={() => handleAlignSelected('center-y')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignCenterY}
              >
                <AlignCenterHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Bottom"
                onClick={() => handleAlignSelected('bottom')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title={t.editor.alignBottom}
              >
                <AlignEndHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pending AI Proposal Banner on Canvas */}
          {pendingProposal && (
            <div className="mx-6 mt-3 p-3 bg-blue-950/80 border border-blue-500/60 rounded-lg flex items-center justify-between gap-4 z-30">
              <div className="text-xs">
                <span className="font-semibold text-blue-200">{t.ai.previewBanner} </span>
                <span className="text-zinc-200">{pendingProposal.summary}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAcceptProposal}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.ai.accept}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectProposal}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.ai.reject}</span>
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Artboard Stage */}
          <div
            className={`flex-1 overflow-auto p-6 flex justify-center items-start transition-colors ${
              isDraggingOverCanvas ? 'bg-blue-950/20' : ''
            }`}
            style={{
              backgroundImage: showGrid
                ? 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)'
                : 'none',
              backgroundSize: '20px 20px',
            }}
            onMouseDown={() => setSelectedIds([activePage.rootId])}
          >
            {(() => {
              const rootEl = resolveElementForViewport(
                activePage.elements[activePage.rootId],
                viewport
              );
              const artW = rootEl?.dimensions.width || 1200;
              const artH = rootEl?.dimensions.height || 780;
              return (
                <div
                  style={{
                    width: `${Math.round(artW * zoom)}px`,
                    height: `${Math.round(artH * zoom)}px`,
                  }}
                  className="relative shrink-0 transition-all duration-300 ease-out"
                >
                  <div
                    style={{
                      width: `${artW}px`,
                      minHeight: `${artH}px`,
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                    }}
                    className="relative shadow-2xl border border-zinc-800 rounded-sm transition-all duration-300 ease-out"
                  >
                    {/* Snap Guide Line */}
                    {showGuides && snapGuide.x !== undefined && (
                      <div
                        style={{ left: `${snapGuide.x}px` }}
                        className="absolute top-0 bottom-0 w-px bg-pink-500 z-40 pointer-events-none"
                      />
                    )}

                    {renderCanvasElement(activePage.rootId)}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right-Click Context Menu */}
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-50 w-48 py-1 bg-[#121218]/95 backdrop-blur-md border border-zinc-700 rounded-lg shadow-2xl text-xs text-zinc-200"
            >
              <button
                type="button"
                onClick={() => {
                  handleCopySelected();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
              >
                <span>{t.editor.contextMenu.copy}</span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+C</span>
              </button>
              <button
                type="button"
                disabled={!clipboardElement}
                onClick={() => {
                  handlePasteClipboard();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 disabled:opacity-40 flex items-center justify-between cursor-pointer"
              >
                <span>{t.editor.contextMenu.paste}</span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+V</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDuplicateSelected();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
              >
                <span>{t.editor.contextMenu.duplicate}</span>
                <span className="text-[10px] font-mono text-zinc-500">Ctrl+D</span>
              </button>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={() => {
                  commitPageChange(
                    reorderElementInParent(activePage, contextMenu.elementId, 'down'),
                    true
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 cursor-pointer"
              >
                {t.editor.contextMenu.moveUp}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitPageChange(
                    reorderElementInParent(activePage, contextMenu.elementId, 'up'),
                    true
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 cursor-pointer"
              >
                {t.editor.contextMenu.moveDown}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitPageChange(
                    updateElementInPage(activePage, contextMenu.elementId, (item) => ({
                      ...item,
                      metadata: { ...item.metadata, locked: !item.metadata.locked },
                    })),
                    true
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 cursor-pointer"
              >
                {t.editor.contextMenu.lock}
              </button>
              <button
                type="button"
                onClick={() => {
                  commitPageChange(
                    updateElementInPage(activePage, contextMenu.elementId, (item) => ({
                      ...item,
                      metadata: { ...item.metadata, hidden: !item.metadata.hidden },
                    })),
                    true
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 cursor-pointer"
              >
                {t.editor.contextMenu.hide}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleGroupSelected();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 cursor-pointer"
              >
                {t.editor.contextMenu.group}
              </button>
              <div className="my-1 border-t border-zinc-800" />
              <button
                type="button"
                onClick={() => {
                  handleDeleteSelected();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 cursor-pointer"
              >
                {t.editor.contextMenu.delete}
              </button>
            </motion.div>
          )}
        </main>

        {/* RIGHT PANEL: Dynamic Properties Inspector & AI Assistant */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="w-80 bg-[#0E0E13] border-l border-zinc-800 flex flex-col shrink-0"
        >
          {/* Right Panel Mode Switcher */}
          <div className="grid grid-cols-2 border-b border-zinc-800 bg-[#0A0A0E] p-1 gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={`py-1.5 rounded text-center transition-all duration-200 cursor-pointer ${
                rightTab === 'inspector'
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {t.editor.tabProperties}
            </button>
            <button
              type="button"
              onClick={() => setRightTab('ai')}
              className={`py-1.5 rounded text-center flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                rightTab === 'ai'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.editor.tabAi}</span>
            </button>
          </div>

          {/* RIGHT PANEL BODY */}
          {rightTab === 'inspector' ? (
            <motion.div
              key="inspector"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 overflow-y-auto p-4 space-y-5 text-xs"
            >
              {/* Active Breakpoint Banner */}
              {viewport !== 'desktop' && (
                <div className="px-2.5 py-1.5 bg-blue-600/15 border border-blue-500/40 rounded text-[11px] text-blue-200 flex items-center justify-between">
                  <span>
                    {t.editor.breakpointNotice} <strong className="uppercase">{viewport}</strong>
                  </span>
                </div>
              )}

              {/* Element Identity & Text Content */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300">{t.editor.selectedLayer}</span>
                  <span className="font-mono text-[10px] text-blue-400 uppercase">
                    {selectedElement.type}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    {t.editor.layerName}
                  </label>
                  <input
                    type="text"
                    aria-label="Selected Layer Name"
                    value={selectedElement.name}
                    onChange={(e) =>
                      updateSelectedElement((el) => ({ ...el, name: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {selectedElement.type !== 'image' && selectedElement.type !== 'frame' && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      {t.editor.textContent}
                    </label>
                    <textarea
                      rows={2}
                      aria-label="Element Text Content"
                      value={selectedElement.metadata.content}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          metadata: { ...el.metadata, content: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>
                )}
              </div>

              {/* IMAGE SETTINGS & CROP SECTION (Dynamic for Image elements) */}
              {selectedElement.type === 'image' && (
                <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5" />
                      <span>{t.editor.imageSettings}</span>
                    </span>
                  </div>

                  {/* Quick Actions: Upload New File or Open Assets Library */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => replaceFileInputRef.current?.click()}
                      className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t.editor.uploadNewImage}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeftTab('assets')}
                      className="py-1.5 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{t.editor.replaceImage}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">
                      {t.editor.imageUrl}
                    </label>
                    <input
                      type="text"
                      aria-label="Image Source URL"
                      value={selectedElement.assets.src || ''}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          assets: { ...el.assets, src: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">
                      {t.editor.altText}
                    </label>
                    <input
                      type="text"
                      aria-label="Image Alt Text"
                      value={selectedElement.assets.alt || ''}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          assets: { ...el.assets, alt: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white text-[11px]"
                    />
                  </div>

                  {/* Fit / Fill & Aspect Ratio */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        {t.editor.fitMode}
                      </label>
                      <select
                        aria-label="Image Fit Mode"
                        value={selectedElement.assets.objectFit || 'cover'}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            assets: {
                              ...el.assets,
                              objectFit: e.target.value as 'cover' | 'contain' | 'fill',
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white text-[11px]"
                      >
                        <option value="cover">{t.editor.fitCover}</option>
                        <option value="contain">{t.editor.fitContain}</option>
                        <option value="fill">{t.editor.fitStretch}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">
                        {t.editor.aspectRatio}
                      </label>
                      <select
                        aria-label="Image Aspect Ratio"
                        value={selectedElement.assets.aspectRatio || 'auto'}
                        onChange={(e) => {
                          const ratio = e.target.value as 'auto' | '16:9' | '4:3' | '1:1';
                          updateSelectedElement((el) => {
                            let nextH = el.dimensions.height;
                            if (ratio === '16:9') nextH = Math.round((el.dimensions.width * 9) / 16);
                            if (ratio === '4:3') nextH = Math.round((el.dimensions.width * 3) / 4);
                            if (ratio === '1:1') nextH = el.dimensions.width;
                            return {
                              ...el,
                              dimensions: { ...el.dimensions, height: nextH },
                              assets: { ...el.assets, aspectRatio: ratio },
                            };
                          });
                        }}
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white text-[11px]"
                      >
                        <option value="auto">Auto</option>
                        <option value="16:9">16:9</option>
                        <option value="4:3">4:3</option>
                        <option value="1:1">1:1</option>
                      </select>
                    </div>
                  </div>

                  {/* Crop Zoom & Pan X/Y Controls */}
                  <div className="space-y-2 pt-1 tabular-nums">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>
                        {t.editor.cropZoom} (
                        {Math.round((selectedElement.assets.cropZoom || 1) * 100)}%)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement((el) => ({
                            ...el,
                            assets: { ...el.assets, cropZoom: 1, cropX: 50, cropY: 50 },
                          }))
                        }
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>{t.editor.resetCrop}</span>
                      </button>
                    </div>
                    <input
                      type="range"
                      aria-label="Image Crop Zoom"
                      min={1}
                      max={2.5}
                      step={0.05}
                      value={selectedElement.assets.cropZoom || 1}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          assets: { ...el.assets, cropZoom: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          {t.editor.cropOffsetX} ({selectedElement.assets.cropX ?? 50}%)
                        </label>
                        <input
                          type="range"
                          aria-label="Image Crop Offset X"
                          min={0}
                          max={100}
                          step={1}
                          value={selectedElement.assets.cropX ?? 50}
                          onChange={(e) =>
                            updateSelectedElement((el) => ({
                              ...el,
                              assets: { ...el.assets, cropX: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          {t.editor.cropOffsetY} ({selectedElement.assets.cropY ?? 50}%)
                        </label>
                        <input
                          type="range"
                          aria-label="Image Crop Offset Y"
                          min={0}
                          max={100}
                          step={1}
                          value={selectedElement.assets.cropY ?? 50}
                          onChange={(e) =>
                            updateSelectedElement((el) => ({
                              ...el,
                              assets: { ...el.assets, cropY: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="w-full py-1.5 px-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.editor.removeImageElement}</span>
                  </button>
                </div>
              )}

              {/* Position & Dimensions */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80 tabular-nums">
                <div className="font-semibold text-zinc-300">{t.editor.dimAndPos}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.widthPx}
                    </label>
                    <input
                      type="number"
                      aria-label="Element Width"
                      value={selectedElement.dimensions.width}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          dimensions: {
                            ...el.dimensions,
                            width: Math.max(20, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.heightPx}
                    </label>
                    <input
                      type="number"
                      aria-label="Element Height"
                      value={selectedElement.dimensions.height}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          dimensions: {
                            ...el.dimensions,
                            height: Math.max(20, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">{t.editor.xPos}</label>
                    <input
                      type="number"
                      aria-label="Element X Position"
                      value={selectedElement.position.x}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          position: { ...el.position, x: Number(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">{t.editor.yPos}</label>
                    <input
                      type="number"
                      aria-label="Element Y Position"
                      value={selectedElement.position.y}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          position: { ...el.position, y: Number(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Colors, Background & Opacity */}
              <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                <div className="font-semibold text-zinc-300">{t.editor.appearance}</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.background}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Background Color Picker"
                        value={
                          selectedElement.styles.background.startsWith('#')
                            ? selectedElement.styles.background.slice(0, 7)
                            : '#111827'
                        }
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: { ...el.styles, background: e.target.value },
                          }))
                        }
                        className="w-7 h-7 rounded bg-transparent border border-zinc-700 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        aria-label="Background Value"
                        value={selectedElement.styles.background}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: { ...el.styles, background: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#09090B] border border-zinc-800 rounded text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.textColor}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Text Color Picker"
                        value={
                          selectedElement.styles.color.startsWith('#')
                            ? selectedElement.styles.color.slice(0, 7)
                            : '#FFFFFF'
                        }
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: { ...el.styles, color: e.target.value },
                          }))
                        }
                        className="w-7 h-7 rounded bg-transparent border border-zinc-700 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        aria-label="Text Color Value"
                        value={selectedElement.styles.color}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: { ...el.styles, color: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1 bg-[#09090B] border border-zinc-800 rounded text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 tabular-nums">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.opacity} ({Math.round(selectedElement.styles.opacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      aria-label="Element Opacity"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={selectedElement.styles.opacity}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: { ...el.styles, opacity: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.shadow}
                    </label>
                    <select
                      aria-label="Element Shadow"
                      value={selectedElement.styles.shadow}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            shadow: e.target.value as DesignElement['styles']['shadow'],
                          },
                        }))
                      }
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white"
                    >
                      <option value="none">{t.editor.shadowNone}</option>
                      <option value="sm">{t.editor.shadowSm}</option>
                      <option value="md">{t.editor.shadowMd}</option>
                      <option value="lg">{t.editor.shadowLg}</option>
                      <option value="xl">{t.editor.shadowXl}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography (Shown for non-image layers) */}
              {selectedElement.type !== 'image' && (
                <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                  <div className="font-semibold text-zinc-300">{t.editor.typography}</div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.fontFamily}
                    </label>
                    <select
                      aria-label="Font Family"
                      value={selectedElement.typography.fontFamily}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          typography: { ...el.typography, fontFamily: e.target.value },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="DM Sans">DM Sans</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Oswald">Oswald</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 tabular-nums">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.fontSize}
                      </label>
                      <input
                        type="number"
                        aria-label="Font Size"
                        value={selectedElement.typography.fontSize}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            typography: {
                              ...el.typography,
                              fontSize: Math.max(10, Number(e.target.value) || 14),
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.fontWeight}
                      </label>
                      <select
                        aria-label="Font Weight"
                        value={selectedElement.typography.fontWeight}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            typography: {
                              ...el.typography,
                              fontWeight: e.target
                                .value as DesignElement['typography']['fontWeight'],
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                      >
                        <option value="400">400</option>
                        <option value="500">500</option>
                        <option value="600">600</option>
                        <option value="700">700</option>
                        <option value="800">800</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.textAlign}
                      </label>
                      <select
                        aria-label="Text Align"
                        value={selectedElement.typography.textAlign}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            typography: {
                              ...el.typography,
                              textAlign: e.target.value as 'left' | 'center' | 'right',
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white"
                      >
                        <option value="left">{t.editor.alignLeftOpt}</option>
                        <option value="center">{t.editor.alignCenterOpt}</option>
                        <option value="right">{t.editor.alignRightOpt}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 tabular-nums">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.lineHeight}
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        aria-label="Line Height"
                        value={selectedElement.typography.lineHeight}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            typography: {
                              ...el.typography,
                              lineHeight: Number(e.target.value) || 1.4,
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.letterSpacing}
                      </label>
                      <input
                        type="text"
                        aria-label="Letter Spacing"
                        value={selectedElement.typography.letterSpacing}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            typography: {
                              ...el.typography,
                              letterSpacing: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Layout: Display, Flexbox & Grid */}
              {selectedElement.type !== 'image' && selectedElement.type !== 'text' && (
                <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                  <div className="font-semibold text-zinc-300">{t.editor.layoutFlexGrid}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.displayMode}
                      </label>
                      <select
                        aria-label="Display Mode"
                        value={selectedElement.styles.display}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: {
                              ...el.styles,
                              display: e.target.value as 'block' | 'flex' | 'grid',
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white"
                      >
                        <option value="block">Block</option>
                        <option value="flex">Flexbox</option>
                        <option value="grid">CSS Grid</option>
                      </select>
                    </div>
                    {selectedElement.styles.display === 'grid' ? (
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          {t.editor.gridCols}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={6}
                          aria-label="Grid Columns"
                          value={selectedElement.styles.gridColumns || 3}
                          onChange={(e) =>
                            updateSelectedElement((el) => ({
                              ...el,
                              styles: {
                                ...el.styles,
                                gridColumns: Math.max(1, Math.min(6, Number(e.target.value) || 3)),
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1">
                          {t.editor.flexDirection}
                        </label>
                        <select
                          aria-label="Flex Direction"
                          value={selectedElement.styles.flexDirection}
                          onChange={(e) =>
                            updateSelectedElement((el) => ({
                              ...el,
                              styles: {
                                ...el.styles,
                                flexDirection: e.target.value as 'row' | 'column',
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white"
                        >
                          <option value="column">{t.editor.dirColumn}</option>
                          <option value="row">{t.editor.dirRow}</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.justify}
                      </label>
                      <select
                        aria-label="Justify Content"
                        value={selectedElement.styles.justifyContent}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: {
                              ...el.styles,
                              justifyContent: e.target
                                .value as DesignElement['styles']['justifyContent'],
                            },
                          }))
                        }
                        className="w-full px-1.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white text-[11px]"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Between</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.align}
                      </label>
                      <select
                        aria-label="Align Items"
                        value={selectedElement.styles.alignItems}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: {
                              ...el.styles,
                              alignItems: e.target.value as DesignElement['styles']['alignItems'],
                            },
                          }))
                        }
                        className="w-full px-1.5 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white text-[11px]"
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="stretch">Stretch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1">
                        {t.editor.gapPx}
                      </label>
                      <input
                        type="number"
                        aria-label="Flex Gap"
                        value={selectedElement.styles.gap}
                        onChange={(e) =>
                          updateSelectedElement((el) => ({
                            ...el,
                            styles: {
                              ...el.styles,
                              gap: Math.max(0, Number(e.target.value) || 0),
                            },
                          }))
                        }
                        className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Padding, Margin & Borders */}
              <div className="space-y-2.5 tabular-nums">
                <div className="font-semibold text-zinc-300">{t.editor.spacingAndBorder}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.paddingPx}
                    </label>
                    <input
                      type="number"
                      aria-label="Element Padding"
                      value={selectedElement.styles.paddingTop}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            paddingTop: val,
                            paddingRight: val,
                            paddingBottom: val,
                            paddingLeft: val,
                          },
                        }));
                      }}
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.marginPx}
                    </label>
                    <input
                      type="number"
                      aria-label="Element Margin"
                      value={selectedElement.styles.marginTop}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            marginTop: val,
                            marginRight: val,
                            marginBottom: val,
                            marginLeft: val,
                          },
                        }));
                      }}
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.borderWidth}
                    </label>
                    <input
                      type="number"
                      aria-label="Border Width"
                      value={selectedElement.styles.borderWidth}
                      onChange={(e) => {
                        const bw = Math.max(0, Number(e.target.value) || 0);
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            borderWidth: bw,
                            borderStyle: bw > 0 ? 'solid' : 'none',
                          },
                        }));
                      }}
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">
                      {t.editor.borderRadius}
                    </label>
                    <input
                      type="number"
                      aria-label="Border Radius"
                      value={selectedElement.styles.borderRadius}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            borderRadius: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">
                    {t.editor.borderColor}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      aria-label="Border Color Picker"
                      value={
                        selectedElement.styles.borderColor.startsWith('#')
                          ? selectedElement.styles.borderColor.slice(0, 7)
                          : '#27272A'
                      }
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: { ...el.styles, borderColor: e.target.value },
                        }))
                      }
                      className="w-7 h-7 rounded bg-transparent border border-zinc-700 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      aria-label="Border Color Value"
                      value={selectedElement.styles.borderColor}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: { ...el.styles, borderColor: e.target.value },
                        }))
                      }
                      className="w-full px-2 py-1 bg-[#09090B] border border-zinc-800 rounded text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* AI ASSISTANT TAB */
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs"
            >
              <div className="p-3 bg-[#14141D] border border-zinc-800 rounded-lg space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>{t.ai.title}</span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {deepseekConfigured ? t.ai.deepseekConnected : t.ai.localEngine}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {t.ai.targetLayer}{' '}
                  <strong className="text-zinc-200">{selectedElement.name}</strong> (
                  {selectedElement.type})
                </p>
              </div>

              {/* Pending Proposal Accept / Reject Card (including Image Replacement Selector) */}
              {pendingProposal && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/60 rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-blue-200">{t.ai.previewBanner}</div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {pendingProposal.summary}
                  </p>

                  {/* If AI command requested image replacement, show inline Asset / Upload / URL picker */}
                  {pendingProposal.requiresImageSelection && (
                    <div className="p-2.5 bg-[#09090B] border border-zinc-800 rounded-md space-y-2.5">
                      <p className="text-[10px] text-zinc-300 leading-snug">
                        {t.ai.imageReplacePromptNotice}
                      </p>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t.assets.uploadBtn}</span>
                      </button>

                      <div className="flex gap-1">
                        <input
                          type="url"
                          placeholder={t.assets.addUrlPlaceholder}
                          value={aiImageUrlInput}
                          onChange={(e) => setAiImageUrlInput(e.target.value)}
                          className="flex-1 px-2 py-1 text-[11px] bg-zinc-900 border border-zinc-700 rounded text-white"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const created = await createAssetFromUrl(aiImageUrlInput);
                            if (created) {
                              onAddAsset(created);
                              setPendingProposal({
                                ...pendingProposal,
                                after: {
                                  ...pendingProposal.after,
                                  type: 'image',
                                  assets: {
                                    ...pendingProposal.after.assets,
                                    src: created.src,
                                    alt: created.name,
                                    assetId: created.id,
                                  },
                                },
                              });
                              setAiImageUrlInput('');
                            }
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] rounded cursor-pointer"
                        >
                          {t.assets.addUrlBtn}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                        {assets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() =>
                              setPendingProposal({
                                ...pendingProposal,
                                after: {
                                  ...pendingProposal.after,
                                  type: 'image',
                                  assets: {
                                    ...pendingProposal.after.assets,
                                    src: asset.src,
                                    alt: asset.name,
                                    assetId: asset.id,
                                  },
                                },
                              })
                            }
                            className={`p-1 rounded border text-left cursor-pointer transition-colors ${
                              pendingProposal.after.assets.src === asset.src
                                ? 'border-blue-500 bg-blue-600/20'
                                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                            }`}
                          >
                            <img
                              src={asset.src}
                              alt={asset.name}
                              className="w-full h-12 object-cover rounded mb-1"
                            />
                            <div className="text-[10px] text-zinc-300 truncate">{asset.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptProposal}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs cursor-pointer"
                    >
                      {t.ai.accept}
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectProposal}
                      className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded text-xs cursor-pointer"
                    >
                      {t.ai.reject}
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Command Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunAIAssistant();
                }}
                className="space-y-2"
              >
                <label className="block text-[11px] font-semibold text-zinc-300">
                  {t.ai.instructionLabel} "{selectedElement.name}"
                </label>
                <textarea
                  rows={2}
                  aria-label="AI Assistant Prompt"
                  placeholder={t.ai.placeholder}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={isAiRunning}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiRunning ? t.ai.runningBtn : t.ai.applyBtn}</span>
                </button>
              </form>

              {/* Quick Command Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-400">
                  {t.ai.quickCommands}
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {t.ai.presets.map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => {
                        setAiPrompt(cmd);
                        handleRunAIAssistant(cmd);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded text-left text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{cmd}</span>
                      <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Change History */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-400">
                  {t.ai.historyTitle} ({(project.aiHistory || []).length})
                </div>
                {(project.aiHistory || []).length === 0 ? (
                  <p className="text-[11px] text-zinc-500">{t.ai.emptyHistory}</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(project.aiHistory || []).slice(0, 8).map((rec) => (
                      <div
                        key={rec.id}
                        className="p-2.5 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-300 truncate">
                            {rec.elementName}
                          </span>
                          <span
                            className={`font-mono px-1.5 py-0.5 rounded ${
                              rec.status === 'accepted'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {rec.status === 'accepted'
                              ? t.ai.statusAccepted
                              : t.ai.statusRejected}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">"{rec.prompt}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.aside>

        {/* ARTCRAFT-INSPIRED RIGHT VERTICAL TOOLBAR RAIL */}
        <motion.aside
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.36, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Studio Right Vertical Toolbar"
          className="w-12 bg-[#09090D] border-l border-zinc-800/90 flex flex-col items-center py-2.5 gap-1.5 shrink-0 z-30"
        >
          {/* Group 1: Pointer & Move */}
          <div className="flex flex-col items-center gap-1 w-full px-1.5">
            {(
              [
                {
                  id: 'select',
                  label: t.editor.toolSelect,
                  shortcut: 'V',
                  icon: MousePointer,
                  active: activeTool === 'select',
                  onClick: () => setActiveTool('select'),
                },
                {
                  id: 'move',
                  label: t.editor.toolMove,
                  shortcut: 'H',
                  icon: Hand,
                  active: activeTool === 'move',
                  onClick: () => setActiveTool('move'),
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={item.onClick}
                  className={`group relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    item.active
                      ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.28)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  {item.active && (
                    <motion.span
                      layoutId="studioRailActiveIndicator"
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r"
                    />
                  )}
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0 transition-all duration-150 absolute right-10 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#14141B] border border-zinc-700/80 text-[11px] font-medium text-zinc-100 whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
                    <span>{item.label}</span>
                    <kbd className="px-1 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-400 rounded">
                      {item.shortcut}
                    </kbd>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-6 h-px bg-zinc-800/90 my-0.5" />

          {/* Group 2: Canvas Primitives (Frame, Section, Text, Image, Shape) */}
          <div className="flex flex-col items-center gap-1 w-full px-1.5">
            {(
              [
                {
                  id: 'frame',
                  label: t.editor.toolFrame,
                  shortcut: 'F',
                  icon: Frame,
                  type: 'container' as ElementType,
                },
                {
                  id: 'section',
                  label: t.editor.toolSection,
                  shortcut: 'S',
                  icon: Layout,
                  type: 'section' as ElementType,
                },
                {
                  id: 'text',
                  label: t.editor.toolText,
                  shortcut: 'T',
                  icon: TypeIcon,
                  type: 'text' as ElementType,
                },
                {
                  id: 'image',
                  label: t.editor.toolImage,
                  shortcut: 'I',
                  icon: ImageIcon,
                  type: 'image' as ElementType,
                },
                {
                  id: 'shape',
                  label: t.editor.toolCard,
                  shortcut: 'R',
                  icon: Square,
                  type: 'rectangle' as ElementType,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isAct = activeTool === item.type;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={() => handleAddElement(item.type)}
                  className={`group relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    isAct
                      ? 'bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.28)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0 transition-all duration-150 absolute right-10 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#14141B] border border-zinc-700/80 text-[11px] font-medium text-zinc-100 whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
                    <span>{item.label}</span>
                    <kbd className="px-1 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-400 rounded">
                      {item.shortcut}
                    </kbd>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-6 h-px bg-zinc-800/90 my-0.5" />

          {/* Group 3: Studio Drawers (Components, Assets, Layers, AI Assistant) */}
          <div className="flex flex-col items-center gap-1 w-full px-1.5">
            {(
              [
                {
                  id: 'rail-components',
                  label: t.editor.railComponents,
                  shortcut: 'B',
                  icon: Box,
                  active: leftTab === 'components',
                  onClick: () => setLeftTab('components'),
                },
                {
                  id: 'rail-assets',
                  label: t.editor.railAssets,
                  shortcut: 'A',
                  icon: Upload,
                  active: leftTab === 'assets',
                  onClick: () => setLeftTab('assets'),
                },
                {
                  id: 'rail-layers',
                  label: t.editor.railLayers,
                  shortcut: 'L',
                  icon: Layers,
                  active: leftTab === 'layers',
                  onClick: () => setLeftTab('layers'),
                },
                {
                  id: 'rail-ai',
                  label: t.editor.railAi,
                  shortcut: 'AI',
                  icon: Sparkles,
                  active: rightTab === 'ai',
                  onClick: () => setRightTab(rightTab === 'ai' ? 'inspector' : 'ai'),
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={item.onClick}
                  className={`group relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    item.active
                      ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-[0_0_14px_rgba(59,130,246,0.22)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  {item.active && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                  <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0 transition-all duration-150 absolute right-10 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#14141B] border border-zinc-700/80 text-[11px] font-medium text-zinc-100 whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
                    <span>{item.label}</span>
                    <kbd className="px-1 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-400 rounded">
                      {item.shortcut}
                    </kbd>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col items-center gap-1 w-full px-1.5 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              aria-label={t.editor.railPreview}
              onClick={() => onOpenLivePreview(project)}
              className="group relative w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Eye className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0 transition-all duration-150 absolute right-10 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#14141B] border border-zinc-700/80 text-[11px] font-medium text-zinc-100 whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
                <span>{t.editor.railPreview}</span>
                <kbd className="px-1 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-400 rounded">
                  P
                </kbd>
              </span>
            </button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};
