import React, { useEffect, useRef, useState } from 'react';
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
  Box,
  Check,
  Clipboard,
  Copy,
  Download,
  Eye,
  FileText,
  FolderPlus,
  Frame,
  Grid,
  Image as ImageIcon,
  Layers,
  Layout,
  Maximize2,
  Monitor,
  MousePointer,
  Plus,
  Redo2,
  Ruler,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  Trash2,
  Type as TypeIcon,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  AIChangeRecord,
  DesignElement,
  DesignPage,
  DesignProject,
  ElementType,
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
  reorderElementInParent,
  resolveElementForViewport,
  updateElementInPage,
} from '../utils/designEngine';
import {
  COMPONENT_PRESETS,
  STUDIO_ASSETS,
  TEMPLATES,
} from '../data/templates';

interface VisualEditorProps {
  project: DesignProject;
  activeEngineLabel: string;
  deepseekConfigured: boolean;
  onUpdateProject: (updated: DesignProject) => void;
  onBackToDashboard: () => void;
  onGenerateWebsite: (project: DesignProject) => void;
  onOpenLivePreview: (project: DesignProject) => void;
  onExportZip: (project: DesignProject) => void;
  onSwitchTemplate: (templateId: string) => void;
}

type LeftTab = 'layers' | 'pages' | 'assets' | 'components' | 'templates';
type RightTab = 'inspector' | 'ai';

const AI_PRESET_COMMANDS = [
  'Make this section more modern',
  'Change the background to dark',
  'Add smooth animations',
  'Improve spacing',
  'Make this block responsive',
  'Redesign this card',
  'Improve typography',
];

export const VisualEditor: React.FC<VisualEditorProps> = ({
  project,
  activeEngineLabel,
  deepseekConfigured,
  onUpdateProject,
  onBackToDashboard,
  onGenerateWebsite,
  onOpenLivePreview,
  onExportZip,
  onSwitchTemplate,
}) => {
  const [leftTab, setLeftTab] = useState<LeftTab>('layers');
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [activeTool, setActiveTool] = useState<'select' | ElementType>('select');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [zoom, setZoom] = useState<number>(0.64);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);

  const activePage: DesignPage =
    project.pages.find((p) => p.id === project.activePageId) || project.pages[0];

  const [selectedIds, setSelectedIds] = useState<string[]>([
    activePage.elements[activePage.rootId]?.children[0] || activePage.rootId,
  ]);
  const primarySelectedId = selectedIds[0] || activePage.rootId;
  const selectedElement: DesignElement =
    activePage.elements[primarySelectedId] || activePage.elements[activePage.rootId];

  // Undo / Redo stacks of pages state
  const [undoStack, setUndoStack] = useState<DesignPage[][]>([]);
  const [redoStack, setRedoStack] = useState<DesignPage[][]>([]);
  const [clipboardElement, setClipboardElement] = useState<DesignElement | null>(null);

  // Inline layer rename state
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
  const [renamingLayerValue, setRenamingLayerValue] = useState<string>('');

  // New page name input
  const [newPageName, setNewPageName] = useState('');
  const [customAssetUrl, setCustomAssetUrl] = useState('');

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [pendingProposal, setPendingProposal] = useState<AIChangeRecord | null>(null);

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
      (selectedElement &&
      (selectedElement.type === 'frame' ||
        selectedElement.type === 'section' ||
        selectedElement.type === 'container')
        ? selectedElement.id
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
    if (selectedElement && selectedElement.id !== activePage.rootId) {
      setClipboardElement(structuredClone(selectedElement));
    }
  };

  const handlePasteClipboard = () => {
    if (!clipboardElement) return;
    const pasted = createDefaultElement(clipboardElement.type, activePage.rootId, {
      ...structuredClone(clipboardElement),
      id: generateId(clipboardElement.type),
      name: `${clipboardElement.name} Pasted`,
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

  // Keyboard shortcuts
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
        e.preventDefault();
        handlePasteClipboard();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

        const nextPage = updateElementInPage(activePage, state.elementId, (el) => ({
          ...el,
          position: { x: nextX, y: nextY },
        }));
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

        const nextPage = updateElementInPage(activePage, state.elementId, (el) => ({
          ...el,
          position: { x: nextX, y: nextY },
          dimensions: { ...el.dimensions, width: nextW, height: nextH },
        }));
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
  }, [activePage, project, zoom, showGrid, showGuides]);

  const updateSelectedElement = (updater: (el: DesignElement) => DesignElement) => {
    if (!selectedElement) return;
    const nextPage = updateElementInPage(activePage, selectedElement.id, updater);
    commitPageChange(nextPage, true);
  };

  // Run AI Assistant transformation
  const handleRunAIAssistant = async (commandToRun?: string) => {
    const finalPrompt = (commandToRun || aiPrompt).trim();
    if (!finalPrompt || !selectedElement) return;

    setIsAiRunning(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element: selectedElement,
          prompt: finalPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const proposal: AIChangeRecord = {
          id: generateId('ai_diff'),
          timestamp: new Date().toISOString(),
          elementId: selectedElement.id,
          elementName: selectedElement.name,
          prompt: finalPrompt,
          summary: data.summary,
          provider: data.provider || 'local-engine',
          status: 'pending',
          before: structuredClone(selectedElement),
          after: data.updated,
        };
        setPendingProposal(proposal);
      } else {
        const local = applyLocalAIAssistantCommand(selectedElement, finalPrompt);
        setPendingProposal({
          id: generateId('ai_diff'),
          timestamp: new Date().toISOString(),
          elementId: selectedElement.id,
          elementName: selectedElement.name,
          prompt: finalPrompt,
          summary: local.summary,
          provider: 'local-engine',
          status: 'pending',
          before: structuredClone(selectedElement),
          after: local.updated,
        });
      }
    } catch {
      const local = applyLocalAIAssistantCommand(selectedElement, finalPrompt);
      setPendingProposal({
        id: generateId('ai_diff'),
        timestamp: new Date().toISOString(),
        elementId: selectedElement.id,
        elementName: selectedElement.name,
        prompt: finalPrompt,
        summary: local.summary,
        provider: 'local-engine',
        status: 'pending',
        before: structuredClone(selectedElement),
        after: local.updated,
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
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

  // Render recursive layer tree in Left Panel
  const renderLayerNode = (elId: string, depth = 0): React.ReactNode => {
    const el = activePage.elements[elId];
    if (!el) return null;
    const isSelected = selectedIds.includes(el.id);
    const isRoot = el.id === activePage.rootId;

    return (
      <div key={el.id} className="select-none">
        <div
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
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
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-600/25 text-blue-200 border border-blue-500/40'
              : 'text-zinc-300 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0 w-9">
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
            <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
              <button
                type="button"
                aria-label={`Move ${el.name} Up`}
                onClick={(e) => {
                  e.stopPropagation();
                  commitPageChange(reorderElementInParent(activePage, el.id, 'up'), true);
                }}
                className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                title="Move Up"
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
                title="Move Down"
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
                title="Delete Layer"
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
          fontFamily: `'${el.typography.fontFamily}', sans-serif`,
          fontSize: `${el.typography.fontSize}px`,
          fontWeight: el.typography.fontWeight,
          lineHeight: el.typography.lineHeight,
          letterSpacing: el.typography.letterSpacing,
          textAlign: el.typography.textAlign,
          userSelect: 'none',
          cursor: activeTool === 'select' ? 'move' : 'crosshair',
          overflow: 'visible',
        };

    return (
      <div
        key={el.id}
        data-testid={`canvas-el-${el.id}`}
        style={styleObj}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (activeTool !== 'select') {
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

          if (!isRoot && !el.metadata.locked) {
            dragStateRef.current = {
              mode: 'move',
              elementId: el.id,
              startX: e.clientX,
              startY: e.clientY,
              origX: rawEl.position.x,
              origY: rawEl.position.y,
              origW: rawEl.dimensions.width,
              origH: rawEl.dimensions.height,
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
            <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-mono rounded whitespace-nowrap pointer-events-none shadow tabular-nums">
              {el.name} · {el.dimensions.width} × {el.dimensions.height} ({el.position.x}, {el.position.y})
            </div>

            {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => {
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
                      origX: rawEl.position.x,
                      origY: rawEl.position.y,
                      origW: rawEl.dimensions.width,
                      origH: rawEl.dimensions.height,
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
    <div className="h-screen w-screen overflow-hidden bg-[#09090B] text-[#F4F4F6] flex flex-col select-none">
      {/* TOP STUDIO TOOLBAR */}
      <header className="h-13 px-3 bg-[#101015] border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Back to Dashboard + Project Name + Page Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
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
            className="px-2 py-1 text-xs font-bold text-white bg-transparent hover:bg-zinc-900 focus:bg-zinc-900 border border-transparent focus:border-zinc-700 rounded focus:outline-none w-40 truncate font-display"
          />

          {/* Undo / Redo / Copy / Duplicate / Delete */}
          <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-zinc-800">
            <button
              type="button"
              aria-label="Undo"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Redo"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Duplicate Selected Element"
              onClick={handleDuplicateSelected}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900 cursor-pointer"
              title="Duplicate Element (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Paste Element"
              onClick={handlePasteClipboard}
              disabled={!clipboardElement}
              className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-900 cursor-pointer"
              title="Paste Element (Ctrl+V)"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Delete Selected Element"
              onClick={handleDeleteSelected}
              className="p-1.5 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-900 cursor-pointer"
              title="Delete Selected (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Element Creation Toolbelt */}
        <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
          {(
            [
              { id: 'select', label: 'Select', icon: MousePointer },
              { id: 'section', label: 'Section', icon: Layout },
              { id: 'container', label: 'Container', icon: Box },
              { id: 'text', label: 'Text', icon: TypeIcon },
              { id: 'button', label: 'Button', icon: Square },
              { id: 'image', label: 'Image', icon: ImageIcon },
              { id: 'rectangle', label: 'Card', icon: Frame },
            ] as const
          ).map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  if (tool.id === 'select') {
                    setActiveTool('select');
                  } else {
                    handleAddElement(tool.id);
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTool === tool.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Viewport Breakpoints + Zoom + Preview + Generate Website + Export ZIP */}
        <div className="flex items-center gap-2 shrink-0">
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
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateWebsite(project)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-blue-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Website</span>
          </button>

          <button
            type="button"
            onClick={() => onExportZip(project)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Layers, Pages, Assets, Components, Templates */}
        <aside className="w-72 bg-[#0E0E13] border-r border-zinc-800 flex flex-col shrink-0">
          {/* Left Panel Tabs */}
          <div className="grid grid-cols-5 border-b border-zinc-800 bg-[#0A0A0E] p-1 gap-0.5 text-[11px] font-medium">
            {(
              [
                { id: 'layers', label: 'Layers' },
                { id: 'pages', label: 'Pages' },
                { id: 'assets', label: 'Assets' },
                { id: 'components', label: 'Blocks' },
                { id: 'templates', label: 'Themes' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeftTab(tab.id)}
                className={`py-1.5 rounded text-center transition-colors cursor-pointer truncate ${
                  leftTab === tab.id
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {leftTab === 'layers' && (
              <>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-zinc-800/80">
                  <span>Document Hierarchy</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGroupSelected}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 cursor-pointer"
                      title="Group Selected Layers"
                    >
                      Group
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
                    Project Pages ({project.pages.length})
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
                      <span className="text-[10px] font-mono text-zinc-500">/{p.slug}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddPage} className="pt-3 border-t border-zinc-800 space-y-2">
                  <label className="block text-[11px] font-medium text-zinc-400">
                    Add New Page
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Pricing, About"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-[#09090B] border border-zinc-800 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}

            {leftTab === 'assets' && (
              <div className="space-y-4">
                <div className="text-[11px] text-zinc-400">
                  Click any studio asset to insert it or apply it to the selected Image layer.
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {STUDIO_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        if (selectedElement && selectedElement.type === 'image') {
                          updateSelectedElement((el) => ({
                            ...el,
                            assets: { ...el.assets, src: asset.src, alt: asset.name },
                          }));
                        } else {
                          const imgEl = createDefaultElement('image', activePage.rootId, {
                            name: asset.name,
                            assets: { src: asset.src, alt: asset.name, objectFit: 'cover' },
                          });
                          const nextPage = addElementToPage(activePage, imgEl, activePage.rootId);
                          commitPageChange(nextPage, true);
                          setSelectedIds([imgEl.id]);
                        }
                      }}
                      className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left transition-colors cursor-pointer group"
                    >
                      <img
                        src={asset.src}
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <div className="text-xs font-semibold text-zinc-200 truncate">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-zinc-500">{asset.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'components' && (
              <div className="space-y-2.5">
                <div className="text-[11px] text-zinc-400 mb-2">
                  Reusable architectural blocks — click to insert onto the active page.
                </div>
                {COMPONENT_PRESETS.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
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
                <div className="text-[11px] text-zinc-400 mb-2">
                  Switch or load any of the 6 industry templates into the editor:
                </div>
                {TEMPLATES.map((tpl) => (
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
                    <div className="text-xs font-bold font-display">{tpl.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{tpl.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER INTERACTIVE CANVAS */}
        <main className="flex-1 bg-[#070709] relative overflow-auto flex flex-col">
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
                  onClick={() => setZoom(0.85)}
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
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuides((g) => !g)}
                className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer ${
                  showGuides ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Ruler className="w-3 h-3" />
                <span>Guides</span>
              </button>
            </div>

            {/* Alignment Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Align Left"
                onClick={() => handleAlignSelected('left')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Left"
              >
                <AlignStartVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Center Horizontally"
                onClick={() => handleAlignSelected('center-x')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Center Horizontally"
              >
                <AlignCenterVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Right"
                onClick={() => handleAlignSelected('right')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Right"
              >
                <AlignEndVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Top"
                onClick={() => handleAlignSelected('top')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Top"
              >
                <AlignStartHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Center Vertically"
                onClick={() => handleAlignSelected('center-y')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Center Vertically"
              >
                <AlignCenterHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Align Bottom"
                onClick={() => handleAlignSelected('bottom')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
                title="Align Bottom"
              >
                <AlignEndHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pending AI Proposal Banner on Canvas */}
          {pendingProposal && (
            <div className="mx-6 mt-3 p-3 bg-blue-950/80 border border-blue-500/60 rounded-lg flex items-center justify-between gap-4 z-30">
              <div className="text-xs">
                <span className="font-semibold text-blue-200">AI Assistant Preview: </span>
                <span className="text-zinc-200">{pendingProposal.summary}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAcceptProposal}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectProposal}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Artboard Stage */}
          <div
            className="flex-1 overflow-auto p-6 flex justify-center items-start"
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
                  className="relative shrink-0"
                >
                  <div
                    style={{
                      width: `${artW}px`,
                      minHeight: `${artH}px`,
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                    }}
                    className="relative shadow-2xl border border-zinc-800 rounded-sm transition-transform duration-75"
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
        </main>

        {/* RIGHT PANEL: Properties Inspector & AI Assistant */}
        <aside className="w-80 bg-[#0E0E13] border-l border-zinc-800 flex flex-col shrink-0">
          {/* Right Panel Mode Switcher */}
          <div className="grid grid-cols-2 border-b border-zinc-800 bg-[#0A0A0E] p-1 gap-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={`py-1.5 rounded text-center transition-colors cursor-pointer ${
                rightTab === 'inspector'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Properties
            </button>
            <button
              type="button"
              onClick={() => setRightTab('ai')}
              className={`py-1.5 rounded text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                rightTab === 'ai'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          </div>

          {/* RIGHT PANEL BODY */}
          {rightTab === 'inspector' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Element Identity & Text Content */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-300">Selected Layer</span>
                  <span className="font-mono text-[10px] text-blue-400 uppercase">
                    {selectedElement.type}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Layer Name</label>
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
                    <label className="block text-[11px] text-zinc-400 mb-1">Text Content</label>
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

                {selectedElement.type === 'image' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] text-zinc-400">Image Source URL</label>
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
                )}
              </div>

              {/* Position & Dimensions */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80 tabular-nums">
                <div className="font-semibold text-zinc-300">Dimensions & Position</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Width (px)</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Height (px)</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">X Position</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Y Position</label>
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
                <div className="font-semibold text-zinc-300">Appearance & Surface</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Background</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Background Color Picker"
                        value={
                          selectedElement.styles.background.startsWith('#')
                            ? selectedElement.styles.background
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        aria-label="Text Color Picker"
                        value={
                          selectedElement.styles.color.startsWith('#')
                            ? selectedElement.styles.color
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
                      Opacity ({Math.round(selectedElement.styles.opacity * 100)}%)
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Shadow</label>
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
                      <option value="none">None</option>
                      <option value="sm">Subtle (sm)</option>
                      <option value="md">Medium (md)</option>
                      <option value="lg">Elevated (lg)</option>
                      <option value="xl">Deep Studio (xl)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                <div className="font-semibold text-zinc-300">Typography</div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">Font Family</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Size (px)</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Weight</label>
                    <select
                      aria-label="Font Weight"
                      value={selectedElement.typography.fontWeight}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          typography: {
                            ...el.typography,
                            fontWeight: e.target.value as DesignElement['typography']['fontWeight'],
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Align</label>
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
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layout: Display, Flexbox & Grid */}
              <div className="space-y-2.5 pb-4 border-b border-zinc-800/80">
                <div className="font-semibold text-zinc-300">Layout (Flexbox & Grid)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Display Mode</label>
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
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Flex Direction</label>
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
                      <option value="column">Column</option>
                      <option value="row">Row</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Justify</label>
                    <select
                      aria-label="Justify Content"
                      value={selectedElement.styles.justifyContent}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: {
                            ...el.styles,
                            justifyContent: e.target.value as DesignElement['styles']['justifyContent'],
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Align</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Gap (px)</label>
                    <input
                      type="number"
                      aria-label="Flex Gap"
                      value={selectedElement.styles.gap}
                      onChange={(e) =>
                        updateSelectedElement((el) => ({
                          ...el,
                          styles: { ...el.styles, gap: Math.max(0, Number(e.target.value) || 0) },
                        }))
                      }
                      className="w-full px-2 py-1.5 bg-[#09090B] border border-zinc-800 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Padding, Margin & Borders */}
              <div className="space-y-2.5 tabular-nums">
                <div className="font-semibold text-zinc-300">Spacing & Border</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Padding (px)</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Margin (px)</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Border Width</label>
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
                    <label className="block text-[10px] text-zinc-500 mb-1">Corner Radius</label>
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
              </div>
            </div>
          ) : (
            /* AI ASSISTANT TAB */
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              <div className="p-3 bg-[#14141D] border border-zinc-800 rounded-lg space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Contextual AI Assistant</span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {deepseekConfigured ? 'DeepSeek API' : 'Local Engine'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Target layer: <strong className="text-zinc-200">{selectedElement.name}</strong> ({selectedElement.type}). Select a quick transformation or enter a custom instruction.
                </p>
              </div>

              {/* Pending Proposal Accept / Reject Card */}
              {pendingProposal && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/60 rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-blue-200">
                    Previewing Proposed Change
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {pendingProposal.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptProposal}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs cursor-pointer"
                    >
                      Accept Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectProposal}
                      className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded text-xs cursor-pointer"
                    >
                      Reject
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
                  Instruction for "{selectedElement.name}"
                </label>
                <textarea
                  rows={2}
                  aria-label="AI Assistant Prompt"
                  placeholder="e.g., Make this section more modern and responsive..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#09090B] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isAiRunning || !aiPrompt.trim()}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {isAiRunning ? 'Analyzing & Transforming...' : 'Apply AI Transformation'}
                </button>
              </form>

              {/* Preset Commands */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400">Quick Commands</div>
                <div className="space-y-1.5">
                  {AI_PRESET_COMMANDS.map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => {
                        setAiPrompt(cmd);
                        handleRunAIAssistant(cmd);
                      }}
                      className="w-full text-left px-3 py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-200 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{cmd}</span>
                      <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Change History */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400">
                  Change History ({project.aiHistory?.length || 0})
                </div>
                {(!project.aiHistory || project.aiHistory.length === 0) ? (
                  <div className="text-[11px] text-zinc-500">
                    No AI modifications applied yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.aiHistory.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-zinc-300 truncate">
                            {item.elementName}
                          </span>
                          <span
                            className={
                              item.status === 'accepted' ? 'text-emerald-400' : 'text-zinc-500'
                            }
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">"{item.prompt}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
