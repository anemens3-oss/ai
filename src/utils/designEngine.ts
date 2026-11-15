import {
  DesignElement,
  DesignPage,
  DesignProject,
  ElementType,
  GeneratedWebsiteBundle,
  Language,
  ViewportMode,
} from '../types/design';

export function generateId(prefix = 'el'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`;
}

export function createDefaultElement(
  type: ElementType,
  parentId: string | null,
  overrides: Partial<DesignElement> = {}
): DesignElement {
  const id = overrides.id || generateId(type);

  const defaultsByType: Record<
    ElementType,
    {
      name: string;
      width: number;
      height: number;
      bg: string;
      color: string;
      content: string;
      fontSize: number;
      fontWeight: '400' | '500' | '600' | '700' | '800';
      radius: number;
      display: 'block' | 'flex' | 'grid';
      borderWidth: number;
      borderColor: string;
    }
  > = {
    frame: {
      name: 'Page Frame',
      width: 1200,
      height: 820,
      bg: '#0D0D11',
      color: '#F4F4F6',
      content: '',
      fontSize: 16,
      fontWeight: '400',
      radius: 0,
      display: 'block',
      borderWidth: 0,
      borderColor: '#27272A',
    },
    section: {
      name: 'Section Block',
      width: 1120,
      height: 360,
      bg: '#13131A',
      color: '#F4F4F6',
      content: '',
      fontSize: 16,
      fontWeight: '400',
      radius: 16,
      display: 'flex',
      borderWidth: 1,
      borderColor: '#262630',
    },
    container: {
      name: 'Flex Container',
      width: 520,
      height: 240,
      bg: '#181822',
      color: '#F4F4F6',
      content: '',
      fontSize: 15,
      fontWeight: '400',
      radius: 12,
      display: 'flex',
      borderWidth: 1,
      borderColor: '#2E2E3A',
    },
    rectangle: {
      name: 'Surface Card',
      width: 320,
      height: 180,
      bg: '#1E1E2A',
      color: '#E4E4E7',
      content: '',
      fontSize: 14,
      fontWeight: '500',
      radius: 12,
      display: 'block',
      borderWidth: 1,
      borderColor: '#323242',
    },
    text: {
      name: 'Text Heading',
      width: 460,
      height: 64,
      bg: 'transparent',
      color: '#F8FAFC',
      content: 'Design with clarity. Ship with confidence.',
      fontSize: 28,
      fontWeight: '700',
      radius: 0,
      display: 'block',
      borderWidth: 0,
      borderColor: 'transparent',
    },
    button: {
      name: 'Action Button',
      width: 188,
      height: 48,
      bg: '#2563EB',
      color: '#FFFFFF',
      content: 'Get Started Now',
      fontSize: 14,
      fontWeight: '600',
      radius: 10,
      display: 'flex',
      borderWidth: 0,
      borderColor: '#3B82F6',
    },
    image: {
      name: 'Media Image',
      width: 480,
      height: 290,
      bg: '#18181B',
      color: '#A1A1AA',
      content: 'Studio Visual Asset',
      fontSize: 13,
      fontWeight: '500',
      radius: 12,
      display: 'block',
      borderWidth: 1,
      borderColor: '#27272A',
    },
  };

  const preset = defaultsByType[type];

  const base: DesignElement = {
    id,
    type,
    name: preset.name,
    parentId,
    children: [],
    position: { x: 40, y: 40 },
    dimensions: {
      width: preset.width,
      height: preset.height,
      widthMode: 'fixed',
      heightMode: 'fixed',
    },
    styles: {
      background: preset.bg,
      color: preset.color,
      paddingTop: type === 'button' ? 12 : type === 'section' || type === 'container' ? 24 : 8,
      paddingRight: type === 'button' ? 24 : type === 'section' || type === 'container' ? 24 : 8,
      paddingBottom: type === 'button' ? 12 : type === 'section' || type === 'container' ? 24 : 8,
      paddingLeft: type === 'button' ? 24 : type === 'section' || type === 'container' ? 24 : 8,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
      borderStyle: preset.borderWidth > 0 ? 'solid' : 'none',
      borderRadius: preset.radius,
      shadow: type === 'button' ? 'md' : 'none',
      opacity: 1,
      display: preset.display,
      flexDirection: 'column',
      justifyContent: type === 'button' ? 'center' : 'flex-start',
      alignItems: type === 'button' ? 'center' : 'flex-start',
      gap: 16,
      gridColumns: 3,
    },
    typography: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
      textAlign: type === 'button' ? 'center' : 'left',
    },
    assets: {
      src:
        type === 'image'
          ? '/src/assets/images/template_modern_business_1794725846334.jpg'
          : undefined,
      alt: type === 'image' ? 'Visual showcase' : undefined,
      objectFit: 'cover',
      aspectRatio: 'auto',
      cropZoom: 1,
      cropX: 50,
      cropY: 50,
    },
    responsive: {},
    metadata: {
      content: preset.content,
      locked: false,
      hidden: false,
      semanticTag:
        type === 'section'
          ? 'section'
          : type === 'button'
          ? 'button'
          : type === 'text'
          ? 'h2'
          : 'div',
      animation: 'none',
    },
  };

  return {
    ...base,
    ...overrides,
    position: { ...base.position, ...(overrides.position || {}) },
    dimensions: { ...base.dimensions, ...(overrides.dimensions || {}) },
    styles: { ...base.styles, ...(overrides.styles || {}) },
    typography: { ...base.typography, ...(overrides.typography || {}) },
    assets: { ...base.assets, ...(overrides.assets || {}) },
    responsive: { ...base.responsive, ...(overrides.responsive || {}) },
    metadata: { ...base.metadata, ...(overrides.metadata || {}) },
  };
}

export function resolveElementForViewport(
  element: DesignElement,
  viewport: ViewportMode
): DesignElement {
  if (viewport === 'desktop') return element;
  const override = element.responsive[viewport];
  const isRoot = element.parentId === null;

  if (isRoot) {
    return {
      ...element,
      dimensions: {
        ...element.dimensions,
        width: viewport === 'tablet' ? 768 : 390,
        ...(override?.dimensions || {}),
      },
    };
  }

  if (!override) {
    const scale = viewport === 'tablet' ? 0.64 : 0.32;
    const maxW = viewport === 'tablet' ? 700 : 342;
    return {
      ...element,
      position: {
        x: Math.min(Math.round(element.position.x * scale), viewport === 'tablet' ? 48 : 24),
        y: element.position.y,
      },
      dimensions: {
        ...element.dimensions,
        width: Math.min(element.dimensions.width, maxW),
      },
      typography: {
        ...element.typography,
        fontSize:
          element.typography.fontSize > 26
            ? Math.round(element.typography.fontSize * (viewport === 'tablet' ? 0.82 : 0.68))
            : element.typography.fontSize,
      },
    };
  }

  return {
    ...element,
    position: { ...element.position, ...(override.position || {}) },
    dimensions: { ...element.dimensions, ...(override.dimensions || {}) },
    styles: { ...element.styles, ...(override.styles || {}) },
    typography: { ...element.typography, ...(override.typography || {}) },
  };
}

export function addElementToPage(
  page: DesignPage,
  newElement: DesignElement,
  targetParentId?: string
): DesignPage {
  const parentId = targetParentId || newElement.parentId || page.rootId;
  const parent = page.elements[parentId];
  if (!parent) return page;

  const elementWithParent: DesignElement = {
    ...newElement,
    parentId,
  };

  return {
    ...page,
    elements: {
      ...page.elements,
      [parentId]: {
        ...parent,
        children: [...parent.children, elementWithParent.id],
      },
      [elementWithParent.id]: elementWithParent,
    },
  };
}

export function updateElementInPage(
  page: DesignPage,
  elementId: string,
  updater: (el: DesignElement) => DesignElement
): DesignPage {
  const existing = page.elements[elementId];
  if (!existing) return page;
  const updated = updater(existing);
  return {
    ...page,
    elements: {
      ...page.elements,
      [elementId]: updated,
    },
  };
}

export function deleteElementFromPage(page: DesignPage, elementId: string): DesignPage {
  if (elementId === page.rootId) return page;
  const target = page.elements[elementId];
  if (!target) return page;

  const toRemove = new Set<string>();
  const collectDescendants = (id: string) => {
    toRemove.add(id);
    const el = page.elements[id];
    if (el) {
      el.children.forEach(collectDescendants);
    }
  };
  collectDescendants(elementId);

  const nextElements: Record<string, DesignElement> = {};
  for (const [key, val] of Object.entries(page.elements)) {
    if (toRemove.has(key)) continue;
    if (val.id === target.parentId) {
      nextElements[key] = {
        ...val,
        children: val.children.filter((cid) => cid !== elementId),
      };
    } else {
      nextElements[key] = val;
    }
  }

  return {
    ...page,
    elements: nextElements,
  };
}

export function duplicateElementInPage(
  page: DesignPage,
  elementId: string
): { page: DesignPage; newId: string | null } {
  if (elementId === page.rootId) return { page, newId: null };
  const source = page.elements[elementId];
  if (!source || !source.parentId) return { page, newId: null };

  const nextElements = { ...page.elements };

  const cloneRecursive = (id: string, newParentId: string, isRootClone: boolean): string => {
    const orig = page.elements[id];
    const clonedId = generateId(orig.type);
    const childCloneIds = orig.children.map((cid) => cloneRecursive(cid, clonedId, false));

    nextElements[clonedId] = {
      ...structuredClone(orig),
      id: clonedId,
      name: isRootClone ? `${orig.name} Copy` : orig.name,
      parentId: newParentId,
      children: childCloneIds,
      position: isRootClone
        ? { x: orig.position.x + 24, y: orig.position.y + 24 }
        : { ...orig.position },
    };
    return clonedId;
  };

  const newRootCloneId = cloneRecursive(elementId, source.parentId, true);
  const parent = nextElements[source.parentId];
  const idx = parent.children.indexOf(elementId);
  const nextChildren = [...parent.children];
  nextChildren.splice(idx + 1, 0, newRootCloneId);

  nextElements[source.parentId] = {
    ...parent,
    children: nextChildren,
  };

  return {
    page: {
      ...page,
      elements: nextElements,
    },
    newId: newRootCloneId,
  };
}

export function reorderElementInParent(
  page: DesignPage,
  elementId: string,
  direction: 'up' | 'down'
): DesignPage {
  const el = page.elements[elementId];
  if (!el || !el.parentId) return page;
  const parent = page.elements[el.parentId];
  if (!parent) return page;

  const idx = parent.children.indexOf(elementId);
  if (idx === -1) return page;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= parent.children.length) return page;

  const nextChildren = [...parent.children];
  const [moved] = nextChildren.splice(idx, 1);
  nextChildren.splice(targetIdx, 0, moved);

  return {
    ...page,
    elements: {
      ...page.elements,
      [parent.id]: {
        ...parent,
        children: nextChildren,
      },
    },
  };
}

export function groupElementsInPage(
  page: DesignPage,
  elementIds: string[]
): { page: DesignPage; groupId: string | null } {
  const validIds = elementIds.filter((id) => id !== page.rootId && page.elements[id]);
  if (validIds.length < 1) return { page, groupId: null };

  const first = page.elements[validIds[0]];
  const parentId = first.parentId || page.rootId;
  const parent = page.elements[parentId];
  if (!parent) return { page, groupId: null };

  const minX = Math.min(...validIds.map((id) => page.elements[id].position.x));
  const minY = Math.min(...validIds.map((id) => page.elements[id].position.y));
  const maxX = Math.max(
    ...validIds.map((id) => page.elements[id].position.x + page.elements[id].dimensions.width)
  );
  const maxY = Math.max(
    ...validIds.map((id) => page.elements[id].position.y + page.elements[id].dimensions.height)
  );

  const groupEl = createDefaultElement('container', parentId, {
    name: `Group (${validIds.length})`,
    position: { x: minX, y: minY },
    dimensions: {
      width: Math.max(120, maxX - minX + 16),
      height: Math.max(80, maxY - minY + 16),
      widthMode: 'fixed',
      heightMode: 'fixed',
    },
    styles: {
      ...first.styles,
      background: 'rgba(255,255,255,0.02)',
      borderWidth: 1,
      borderColor: '#3F3F46',
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    },
    children: validIds,
  });

  const nextElements: Record<string, DesignElement> = {
    ...page.elements,
    [groupEl.id]: groupEl,
    [parentId]: {
      ...parent,
      children: [...parent.children.filter((cid) => !validIds.includes(cid)), groupEl.id],
    },
  };

  for (const id of validIds) {
    const child = nextElements[id];
    nextElements[id] = {
      ...child,
      parentId: groupEl.id,
      position: {
        x: Math.max(0, child.position.x - minX),
        y: Math.max(0, child.position.y - minY),
      },
    };
  }

  return {
    page: {
      ...page,
      elements: nextElements,
    },
    groupId: groupEl.id,
  };
}

export function isImageReplaceCommand(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return (
    lower.includes('replace this image') ||
    lower.includes('change image') ||
    lower.includes('replace image') ||
    lower.includes('swap image') ||
    lower.includes('заменить это изображение') ||
    lower.includes('замени изображение') ||
    lower.includes('заменить изображение') ||
    lower.includes('поменять картинку') ||
    lower.includes('сменить фото')
  );
}

/**
 * Deterministic Local AI Assistant Element Transformer (Supports both Russian and English instructions)
 */
export function applyLocalAIAssistantCommand(
  element: DesignElement,
  prompt: string,
  lang: Language = 'en'
): { updated: DesignElement; summary: string; requiresImageSelection?: boolean } {
  const lower = prompt.toLowerCase();
  const next = structuredClone(element);
  const changes: string[] = [];

  if (isImageReplaceCommand(lower)) {
    // Do not invent a fake local file! Prompt user to select from Assets Library, upload, or paste URL.
    return {
      updated: next,
      summary:
        lang === 'ru'
          ? 'Готово к замене изображения с сохранением всех настроек и размеров элемента. Выберите файл из библиотеки, загрузите с устройства или вставьте URL.'
          : 'Ready to replace image while preserving all layout & style properties. Choose an image from your Assets Library, upload a file, or enter a URL.',
      requiresImageSelection: true,
    };
  }

  if (
    lower.includes('modern') ||
    lower.includes('redesign') ||
    lower.includes('upgrade') ||
    lower.includes('современ') ||
    lower.includes('обнови') ||
    lower.includes('редизайн')
  ) {
    next.styles.borderRadius = Math.max(16, next.styles.borderRadius);
    next.styles.borderWidth = 1;
    next.styles.borderColor = '#38BDF8';
    next.styles.borderStyle = 'solid';
    next.styles.shadow = 'xl';
    if (next.type !== 'text') {
      next.styles.background =
        next.type === 'button'
          ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
          : '#111827';
    }
    next.typography.letterSpacing = '-0.02em';
    changes.push(
      'applied modern architectural surface radius (16px), subtle sky-blue hairline border, and elevated shadow depth'
    );
  }

  if (
    lower.includes('dark') ||
    lower.includes('obsidian') ||
    lower.includes('graphite') ||
    lower.includes('тёмн') ||
    lower.includes('темн')
  ) {
    next.styles.background = '#09090B';
    next.styles.color = '#F8FAFC';
    next.styles.borderWidth = 1;
    next.styles.borderColor = '#27272A';
    next.styles.borderStyle = 'solid';
    changes.push(
      'switched surface palette to deep obsidian (#09090B) with high-contrast #F8FAFC typography'
    );
  }

  if (
    lower.includes('light') ||
    lower.includes('bright') ||
    lower.includes('white') ||
    lower.includes('светл') ||
    lower.includes('бел')
  ) {
    next.styles.background = '#F8FAFC';
    next.styles.color = '#0F172A';
    next.styles.borderColor = '#E2E8F0';
    changes.push('converted surface to crisp light theme (#F8FAFC) with dark slate text (#0F172A)');
  }

  if (
    lower.includes('animation') ||
    lower.includes('smooth') ||
    lower.includes('motion') ||
    lower.includes('анимац') ||
    lower.includes('плавн')
  ) {
    next.metadata.animation = 'fade-up';
    next.styles.shadow = 'lg';
    changes.push('enabled smooth cubic-bezier entrance & hover elevation transition');
  }

  if (
    lower.includes('spacing') ||
    lower.includes('padding') ||
    lower.includes('breathing') ||
    lower.includes('отступ') ||
    lower.includes('воздух')
  ) {
    next.styles.paddingTop = Math.max(32, next.styles.paddingTop + 16);
    next.styles.paddingBottom = Math.max(32, next.styles.paddingBottom + 16);
    next.styles.paddingLeft = Math.max(32, next.styles.paddingLeft + 16);
    next.styles.paddingRight = Math.max(32, next.styles.paddingRight + 16);
    next.styles.gap = Math.max(24, next.styles.gap + 8);
    changes.push(
      `expanded internal padding to ${next.styles.paddingTop}px and layout gap to ${next.styles.gap}px`
    );
  }

  if (
    lower.includes('responsive') ||
    lower.includes('mobile') ||
    lower.includes('tablet') ||
    lower.includes('адаптив') ||
    lower.includes('мобил')
  ) {
    next.responsive = {
      tablet: {
        dimensions: {
          width: Math.min(680, next.dimensions.width),
          height: next.dimensions.height,
        },
        position: {
          x: Math.min(32, next.position.x),
          y: next.position.y,
        },
      },
      mobile: {
        dimensions: {
          width: Math.min(342, next.dimensions.width),
          height: next.dimensions.height,
        },
        position: {
          x: 24,
          y: next.position.y,
        },
        typography: {
          fontSize: Math.max(14, Math.round(next.typography.fontSize * 0.78)),
        },
      },
    };
    changes.push(
      'generated explicit Tablet (768px) and Mobile (390px) responsive breakpoint overrides'
    );
  }

  if (
    lower.includes('typography') ||
    lower.includes('font') ||
    lower.includes('headline') ||
    lower.includes('типограф') ||
    lower.includes('шрифт')
  ) {
    next.typography.fontFamily = 'Plus Jakarta Sans';
    next.typography.fontWeight = '700';
    next.typography.lineHeight = 1.2;
    next.typography.letterSpacing = '-0.025em';
    if (next.type === 'text') {
      next.typography.fontSize = Math.min(64, Math.round(next.typography.fontSize * 1.15));
    }
    changes.push(
      `refined typography to Plus Jakarta Sans Bold (${next.typography.fontSize}px, tight tracking)`
    );
  }

  if (changes.length === 0) {
    next.styles.borderRadius = Math.max(12, next.styles.borderRadius + 4);
    next.styles.shadow = 'lg';
    next.styles.borderWidth = 1;
    next.styles.borderColor = '#3B82F6';
    next.styles.borderStyle = 'solid';
    changes.push(
      `refined "${element.name}" with accent border highlight, 12px+ corner radius, and balanced elevation`
    );
  }

  return {
    updated: next,
    summary: `Updated ${element.name}: ${changes.join('; ')}.`,
  };
}

/**
 * Deterministic Design-to-Code Compiler
 */
export function compileProjectToCode(
  project: DesignProject,
  provider: 'deepseek' | 'gemini' | 'local-compiler' = 'local-compiler',
  providerMessage = 'Compiled via SITECRAFT Deterministic AST Compiler (No external DeepSeek API key configured)',
  deepseekConfigured = false
): GeneratedWebsiteBundle {
  const activePage =
    project.pages.find((p) => p.id === project.activePageId) || project.pages[0];
  const root = activePage.elements[activePage.rootId];

  const cssRules: string[] = [];
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 2px 6px rgba(0,0,0,0.22)',
    md: '0 8px 20px rgba(0,0,0,0.32)',
    lg: '0 16px 36px rgba(0,0,0,0.45)',
    xl: '0 24px 48px rgba(0,0,0,0.6)',
  };

  cssRules.push(`/* SITECRAFT Generated Stylesheet — Project: ${project.name} */
:root {
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: ${root?.styles.background || '#09090B'};
  color: ${root?.styles.color || '#F4F4F6'};
  font-family: var(--font-sans);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.sc-page-wrapper {
  position: relative;
  width: 100%;
  max-width: ${root?.dimensions.width || 1200}px;
  min-height: ${root?.dimensions.height || 900}px;
  margin: 0 auto;
  background: ${root?.styles.background || '#09090B'};
  overflow: hidden;
}

.sc-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  background: rgba(9, 9, 11, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.sc-nav-links {
  display: flex;
  gap: 20px;
}

.sc-nav-link {
  color: #A1A1AA;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  transition: color 0.15s ease;
}

.sc-nav-link:hover, .sc-nav-link.active {
  color: #FFFFFF;
}

.sc-anim-fade-up {
  animation: scFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes scFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
`);

  const buildElementHTML = (page: DesignPage, elId: string, indent = 4): string => {
    const el = page.elements[elId];
    if (!el || el.metadata.hidden) return '';

    const pad = ' '.repeat(indent);
    const className = `sc-el-${el.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const animClass = el.metadata.animation === 'fade-up' ? ' sc-anim-fade-up' : '';
    const isRoot = el.id === page.rootId;

    if (!isRoot) {
      cssRules.push(`.${className} {
  position: absolute;
  left: ${el.position.x}px;
  top: ${el.position.y}px;
  width: ${el.dimensions.width}px;
  ${el.type === 'image' ? `height: ${el.dimensions.height}px;` : `min-height: ${el.dimensions.height}px;`}
  background: ${el.styles.background};
  color: ${el.styles.color};
  padding: ${el.styles.paddingTop}px ${el.styles.paddingRight}px ${el.styles.paddingBottom}px ${el.styles.paddingLeft}px;
  margin: ${el.styles.marginTop}px ${el.styles.marginRight}px ${el.styles.marginBottom}px ${el.styles.marginLeft}px;
  border: ${el.styles.borderWidth}px ${el.styles.borderStyle} ${el.styles.borderColor};
  border-radius: ${el.styles.borderRadius}px;
  box-shadow: ${shadowMap[el.styles.shadow] || 'none'};
  opacity: ${el.styles.opacity};
  display: ${el.styles.display};
  flex-direction: ${el.styles.flexDirection};
  justify-content: ${el.styles.justifyContent};
  align-items: ${el.styles.alignItems};
  gap: ${el.styles.gap}px;
  font-family: '${el.typography.fontFamily}', sans-serif;
  font-size: ${el.typography.fontSize}px;
  font-weight: ${el.typography.fontWeight};
  line-height: ${el.typography.lineHeight};
  letter-spacing: ${el.typography.letterSpacing};
  text-align: ${el.typography.textAlign};
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  overflow: ${el.type === 'image' ? 'hidden' : 'visible'};
}`);

      if (el.responsive.tablet) {
        const t = el.responsive.tablet;
        tabletRules.push(`  .${className} {
    ${t.dimensions?.width ? `width: ${t.dimensions.width}px !important;` : ''}
    ${t.dimensions?.height ? `height: ${t.dimensions.height}px !important;` : ''}
    ${t.typography?.fontSize ? `font-size: ${t.typography.fontSize}px !important;` : ''}
    ${t.styles?.background ? `background: ${t.styles.background} !important;` : ''}
  }`);
      }

      if (el.responsive.mobile) {
        const m = el.responsive.mobile;
        mobileRules.push(`  .${className} {
    ${m.dimensions?.width ? `width: ${m.dimensions.width}px !important;` : ''}
    ${m.dimensions?.height ? `height: ${m.dimensions.height}px !important;` : ''}
    ${m.typography?.fontSize ? `font-size: ${m.typography.fontSize}px !important;` : ''}
    ${m.styles?.background ? `background: ${m.styles.background} !important;` : ''}
  }`);
      }

      if (el.type === 'button') {
        cssRules.push(`.${className}:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  cursor: pointer;
}`);
      }
    }

    if (el.type === 'image') {
      const imgSrc =
        el.assets.src || '/src/assets/images/template_modern_business_1794725846334.jpg';
      const zoom = el.assets.cropZoom || 1;
      const cx = el.assets.cropX ?? 50;
      const cy = el.assets.cropY ?? 50;
      const objFit = el.assets.objectFit || 'cover';

      return `${pad}<div class="${className}${animClass}" data-element-id="${el.id}">
${pad}  <img src="${imgSrc}" alt="${(el.assets.alt || el.name).replace(/"/g, '&quot;')}" style="width:100%;height:100%;object-fit:${objFit};object-position:${cx}% ${cy}%;transform:scale(${zoom});display:block;" referrerpolicy="no-referrer" />
${pad}</div>`;
    }

    const tag =
      el.type === 'button'
        ? 'button'
        : el.metadata.semanticTag || (el.type === 'section' ? 'section' : 'div');

    const childrenMarkup = el.children
      .map((cid) => buildElementHTML(page, cid, indent + 2))
      .filter(Boolean)
      .join('\n');

    const textContent = el.metadata.content
      ? `${pad}  <span>${el.metadata.content}</span>`
      : '';

    const inner = [textContent, childrenMarkup].filter(Boolean).join('\n');

    if (isRoot) {
      return `${pad}<div class="sc-page-wrapper" id="page-${page.slug}" data-page-id="${page.id}" style="min-height:${el.dimensions.height}px;background:${el.styles.background};">
${childrenMarkup}
${pad}</div>`;
    }

    return `${pad}<${tag} class="${className}${animClass}" data-element-id="${el.id}">
${inner}
${pad}</${tag}>`;
  };

  const pagesHTML = project.pages
    .map((p, idx) => {
      const markup = buildElementHTML(p, p.rootId, 2);
      if (idx === 0) return markup;
      return markup.replace(
        'class="sc-page-wrapper"',
        'class="sc-page-wrapper" style="display:none;"'
      );
    })
    .join('\n\n');

  cssRules.push(`
@media (max-width: 1024px) {
  .sc-page-wrapper {
    max-width: 100%;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: auto !important;
  }
  .sc-page-wrapper > [data-element-id] {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 60px;
  }
${tabletRules.join('\n')}
}

@media (max-width: 640px) {
  .sc-page-wrapper {
    padding: 16px 12px;
    gap: 16px;
  }
  .sc-nav-bar {
    padding: 12px 16px;
    flex-direction: column;
    gap: 8px;
  }
${mobileRules.join('\n')}
}
`);

  const multiPageNav =
    project.pages.length > 1
      ? `  <nav class="sc-nav-bar" aria-label="Site Pages">
    <strong style="font-family:var(--font-display);font-size:15px;letter-spacing:-0.02em;">${project.name}</strong>
    <div class="sc-nav-links">
${project.pages
  .map(
    (p, idx) =>
      `      <button class="sc-nav-link${idx === 0 ? ' active' : ''}" data-target-page="page-${p.slug}">${p.name}</button>`
  )
  .join('\n')}
    </div>
  </nav>\n`
      : '';

  const cssContent = cssRules.join('\n\n');

  const jsContent = `// SITECRAFT Generated Interactive Runtime — ${project.name}
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('[data-target-page]');
  const pages = document.querySelectorAll('.sc-page-wrapper');

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target-page');
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      pages.forEach((page) => {
        if (page.id === targetId) {
          page.style.display = 'block';
        } else {
          page.style.display = 'none';
        }
      });
    });
  });

  document.querySelectorAll('button[data-element-id]').forEach((button) => {
    button.addEventListener('click', () => {
      button.style.transform = 'scale(0.97)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    });
  });
});
`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Oswald:wght@500;700&family=Playfair+Display:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
${cssContent}
  </style>
</head>
<body>
${multiPageNav}${pagesHTML}
  <script>
${jsContent}
  </script>
</body>
</html>`;

  const reactContent = `import React, { useState } from 'react';
import './styles.css';

export default function GeneratedSite() {
  const [activePage, setActivePage] = useState('${activePage.slug}');

  return (
    <div className="sitecraft-generated-app">
      {/* Generated by SITECRAFT Visual Compiler for project "${project.name}" */}
      <main dangerouslySetInnerHTML={{ __html: ${JSON.stringify(pagesHTML)} }} />
    </div>
  );
}
`;

  return {
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    react: reactContent,
    generatedAt: new Date().toISOString(),
    provider,
    providerMessage,
    deepseekConfigured,
  };
}
