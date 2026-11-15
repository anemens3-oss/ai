export type ElementType =
  | 'frame'
  | 'section'
  | 'container'
  | 'text'
  | 'button'
  | 'image'
  | 'rectangle';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type Language = 'ru' | 'en';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
  widthMode?: 'fixed' | 'fill' | 'auto';
  heightMode?: 'fixed' | 'auto';
}

export interface ElementStyles {
  background: string;
  color: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'none';
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity: number;
  display: 'block' | 'flex' | 'grid';
  flexDirection: 'row' | 'column';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap: number;
  gridColumns: number;
}

export interface ElementTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ElementAssets {
  src?: string;
  alt?: string;
  href?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
  cropZoom?: number;
  cropX?: number;
  cropY?: number;
  assetId?: string;
}

export interface ResponsiveOverride {
  position?: Partial<ElementPosition>;
  dimensions?: Partial<ElementDimensions>;
  styles?: Partial<ElementStyles>;
  typography?: Partial<ElementTypography>;
}

export interface ElementResponsive {
  tablet?: ResponsiveOverride;
  mobile?: ResponsiveOverride;
}

export interface ElementMetadata {
  content: string;
  locked?: boolean;
  hidden?: boolean;
  semanticTag?:
    | 'header'
    | 'section'
    | 'div'
    | 'nav'
    | 'footer'
    | 'article'
    | 'main'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'p'
    | 'button';
  animation?: 'none' | 'fade-up' | 'scale-in' | 'glow-hover';
  componentSourceId?: string;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  name: string;
  parentId: string | null;
  children: string[];
  position: ElementPosition;
  dimensions: ElementDimensions;
  styles: ElementStyles;
  typography: ElementTypography;
  assets: ElementAssets;
  responsive: ElementResponsive;
  metadata: ElementMetadata;
}

export interface DesignPage {
  id: string;
  name: string;
  slug: string;
  rootId: string;
  elements: Record<string, DesignElement>;
}

export interface AIChangeRecord {
  id: string;
  timestamp: string;
  elementId: string;
  elementName: string;
  prompt: string;
  summary: string;
  provider: 'deepseek' | 'gemini' | 'local-engine';
  status: 'pending' | 'accepted' | 'rejected';
  before: DesignElement;
  after: DesignElement;
  requiresImageSelection?: boolean;
}

export interface GeneratedWebsiteBundle {
  html: string;
  css: string;
  js: string;
  react: string;
  generatedAt: string;
  provider: 'deepseek' | 'gemini' | 'local-compiler';
  providerMessage: string;
  deepseekConfigured: boolean;
}

export interface DesignProject {
  id: string;
  name: string;
  description: string;
  templateId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  pages: DesignPage[];
  activePageId: string;
  aiHistory: AIChangeRecord[];
  lastGeneratedBundle?: GeneratedWebsiteBundle;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  previewImage: string;
  accentColor: string;
  pages: DesignPage[];
  isCustom?: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  src: string;
  mimeType: string;
  format: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  category: string;
  createdAt: string;
  isBuiltIn?: boolean;
}
