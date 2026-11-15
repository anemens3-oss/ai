import {
  AssetItem,
  DesignElement,
  DesignPage,
  DesignProject,
  TemplateDefinition,
} from '../types/design';
import { createDefaultElement, generateId } from '../utils/designEngine';

export const STUDIO_ASSETS: AssetItem[] = [
  {
    id: 'asset_business',
    name: 'Corporate Glass HQ',
    category: 'Architecture',
    src: '/src/assets/images/template_modern_business_1794725846334.jpg',
    mimeType: 'image/jpeg',
    format: 'JPG',
    sizeBytes: 342800,
    width: 1280,
    height: 720,
    createdAt: '2026-11-14T10:00:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'asset_portfolio',
    name: 'Sculptural Design Studio',
    category: 'Editorial',
    src: '/src/assets/images/template_creative_portfolio_1794725847084.jpg',
    mimeType: 'image/jpeg',
    format: 'JPG',
    sizeBytes: 318400,
    width: 1280,
    height: 720,
    createdAt: '2026-11-14T10:05:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'asset_restaurant',
    name: 'Artisanal Michelin Plating',
    category: 'Gastronomy',
    src: '/src/assets/images/template_restaurant_dining_1794725848428.jpg',
    mimeType: 'image/jpeg',
    format: 'JPG',
    sizeBytes: 294120,
    width: 1280,
    height: 720,
    createdAt: '2026-11-14T10:10:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'asset_auto',
    name: 'Performance Engineering Bay',
    category: 'Automotive',
    src: '/src/assets/images/template_auto_service_1794725849460.jpg',
    mimeType: 'image/jpeg',
    format: 'JPG',
    sizeBytes: 365900,
    width: 1280,
    height: 720,
    createdAt: '2026-11-14T10:15:00.000Z',
    isBuiltIn: true,
  },
  {
    id: 'asset_ecommerce',
    name: 'Titanium Chronograph & Audio',
    category: 'Luxury Retail',
    src: '/src/assets/images/template_ecommerce_luxury_1794725850156.jpg',
    mimeType: 'image/jpeg',
    format: 'JPG',
    sizeBytes: 312600,
    width: 1280,
    height: 720,
    createdAt: '2026-11-14T10:20:00.000Z',
    isBuiltIn: true,
  },
];

function buildPageFromElements(
  pageId: string,
  pageName: string,
  slug: string,
  rootBg: string,
  rootHeight: number,
  items: DesignElement[]
): DesignPage {
  const rootId = `${pageId}_root`;
  const root = createDefaultElement('frame', null, {
    id: rootId,
    name: `${pageName} Canvas`,
    dimensions: { width: 1200, height: rootHeight, widthMode: 'fixed', heightMode: 'fixed' },
    styles: {
      ...createDefaultElement('frame', null).styles,
      background: rootBg,
      color: '#F8FAFC',
    },
  });

  const elementsMap: Record<string, DesignElement> = {
    [rootId]: {
      ...root,
      children: items.filter((i) => i.parentId === rootId).map((i) => i.id),
    },
  };

  for (const item of items) {
    elementsMap[item.id] = item;
  }

  return {
    id: pageId,
    name: pageName,
    slug,
    rootId,
    elements: elementsMap,
  };
}

function makeModernBusinessPages(): DesignPage[] {
  const rootId = 'page_mb_home_root';
  const items: DesignElement[] = [
    createDefaultElement('section', rootId, {
      id: 'mb_nav',
      name: 'Top Navigation Bar',
      position: { x: 40, y: 24 },
      dimensions: { width: 1120, height: 64 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#111827',
        borderColor: '#1E293B',
        borderWidth: 1,
        borderRadius: 12,
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 24,
        paddingRight: 24,
      },
      metadata: {
        content: 'APEX GLOBAL ADVISORY   ·   Strategy   ·   M&A   ·   Capital Markets',
        semanticTag: 'header',
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 1.4,
        letterSpacing: '0em',
        textAlign: 'left',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'mb_hero_kicker',
      name: 'Hero Kicker',
      position: { x: 48, y: 128 },
      dimensions: { width: 520, height: 28 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#38BDF8' },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 1.4,
        letterSpacing: '0.06em',
        textAlign: 'left',
      },
      metadata: { content: '01. INSTITUTIONAL STRATEGY & ARCHITECTURE', semanticTag: 'p' },
    }),
    createDefaultElement('text', rootId, {
      id: 'mb_hero_title',
      name: 'Hero Headline',
      position: { x: 48, y: 164 },
      dimensions: { width: 540, height: 150 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#F8FAFC' },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 44,
        fontWeight: '800',
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        textAlign: 'left',
      },
      metadata: {
        content: 'Precision capital strategy for global enterprises.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'mb_hero_sub',
      name: 'Hero Subtitle',
      position: { x: 48, y: 326 },
      dimensions: { width: 510, height: 84 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#94A3B8' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 1.6,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'We partner with boardrooms across London, Zurich, and New York to structure cross-border acquisitions and digital infrastructure transitions.',
        semanticTag: 'p',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'mb_cta_primary',
      name: 'Primary CTA Button',
      position: { x: 48, y: 432 },
      dimensions: { width: 220, height: 52 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#0284C7',
        color: '#FFFFFF',
        borderRadius: 10,
      },
      metadata: { content: 'Schedule Executive Briefing', semanticTag: 'button' },
    }),
    createDefaultElement('image', rootId, {
      id: 'mb_hero_image',
      name: 'Headquarters Showcase Image',
      position: { x: 620, y: 120 },
      dimensions: { width: 540, height: 370 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
      },
      assets: {
        src: '/src/assets/images/template_modern_business_1794725846334.jpg',
        alt: 'Corporate glass headquarters boardroom at dusk',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'mb_card_1',
      name: 'Metric Card 01',
      position: { x: 40, y: 536 },
      dimensions: { width: 356, height: 196 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#0F172A',
        borderColor: '#1E293B',
        borderRadius: 14,
        paddingTop: 28,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '$14.8B Advisory Volume — 42 cross-border institutional restructurings completed since 2023.',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'mb_card_2',
      name: 'Metric Card 02',
      position: { x: 422, y: 536 },
      dimensions: { width: 356, height: 196 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#0F172A',
        borderColor: '#1E293B',
        borderRadius: 14,
        paddingTop: 28,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '98.4% Client Retention — Dedicated senior partner teams across 6 global financial hubs.',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'mb_card_3',
      name: 'Metric Card 03',
      position: { x: 804, y: 536 },
      dimensions: { width: 356, height: 196 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#0F172A',
        borderColor: '#1E293B',
        borderRadius: 14,
        paddingTop: 28,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'ISO 27001 Sovereign Data — End-to-end encrypted diligence rooms and regulatory compliance.',
      },
    }),
  ];

  return [buildPageFromElements('page_mb_home', 'Home', 'home', '#090D16', 780, items)];
}

function makeCreativePortfolioPages(): DesignPage[] {
  const rootId = 'page_cp_home_root';
  const items: DesignElement[] = [
    createDefaultElement('text', rootId, {
      id: 'cp_header',
      name: 'Studio Header',
      position: { x: 48, y: 32 },
      dimensions: { width: 1104, height: 40 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#E4E4E7' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 1.4,
        letterSpacing: '0.08em',
        textAlign: 'left',
      },
      metadata: {
        content: 'ATELIER KRONOS — INDUSTRIAL & ARCHITECTURAL MONOLITHS (ZURICH / MILAN)',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'cp_title',
      name: 'Editorial Display Title',
      position: { x: 48, y: 100 },
      dimensions: { width: 620, height: 156 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#FAFAF9' },
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 52,
        fontWeight: '600',
        lineHeight: 1.08,
        letterSpacing: '-0.02em',
        textAlign: 'left',
      },
      metadata: { content: 'Raw concrete, light & enduring spatial form.', semanticTag: 'h1' },
    }),
    createDefaultElement('text', rootId, {
      id: 'cp_manifesto',
      name: 'Curatorial Statement',
      position: { x: 48, y: 274 },
      dimensions: { width: 460, height: 110 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#A8A29E' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.65,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Selected architectural commissions, cast brutalist furniture editions, and museum acoustics engineered between 2019 and 2026.',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'cp_cta',
      name: 'Archive Dossier Button',
      position: { x: 48, y: 404 },
      dimensions: { width: 210, height: 48 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#D97706',
        color: '#FFFFFF',
        borderRadius: 4,
      },
      metadata: { content: 'Explore Works Archive' },
    }),
    createDefaultElement('image', rootId, {
      id: 'cp_hero_img',
      name: 'Atelier Monograph Photo',
      position: { x: 560, y: 96 },
      dimensions: { width: 592, height: 400 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 6,
        borderColor: '#292524',
      },
      assets: {
        src: '/src/assets/images/template_creative_portfolio_1794725847084.jpg',
        alt: 'Industrial sculptor working with concrete monoliths in sunlit atelier',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('section', rootId, {
      id: 'cp_exhibition_strip',
      name: 'Exhibition Index Strip',
      position: { x: 48, y: 536 },
      dimensions: { width: 1104, height: 180 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#1C1917',
        borderColor: '#292524',
        borderRadius: 8,
        paddingTop: 28,
        paddingLeft: 32,
      },
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 22,
        fontWeight: '500',
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '01. Kunsthalle Basel Pavilion (2026)   ·   02. Fondazione Prada Acoustic Hall (2025)   ·   03. Kyoto Cast Stone Residence (2024)',
      },
    }),
  ];

  return [
    buildPageFromElements('page_cp_home', 'Portfolio Index', 'home', '#0C0A09', 760, items),
  ];
}

function makeSaaSLandingPages(): DesignPage[] {
  const rootId = 'page_saas_home_root';
  const items: DesignElement[] = [
    createDefaultElement('section', rootId, {
      id: 'saas_header',
      name: 'Navigation Bar',
      position: { x: 40, y: 24 },
      dimensions: { width: 1120, height: 60 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#121218',
        borderColor: '#272732',
        borderRadius: 12,
        paddingTop: 16,
        paddingLeft: 24,
      },
      metadata: {
        content:
          'VECTRA CLOUD   ·   Edge Compute   ·   Zero-Trust Mesh   ·   Observability   ·   Pricing',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'saas_headline',
      name: 'Hero Display Headline',
      position: { x: 48, y: 116 },
      dimensions: { width: 540, height: 140 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#FFFFFF' },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 44,
        fontWeight: '800',
        lineHeight: 1.1,
        letterSpacing: '-0.03em',
        textAlign: 'left',
      },
      metadata: {
        content: 'Deploy distributed workloads in 40 milliseconds.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'saas_subheadline',
      name: 'Hero Subtitle',
      position: { x: 48, y: 268 },
      dimensions: { width: 510, height: 84 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#A1A1AA' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.55,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Deterministic Kubernetes orchestration, real-time eBPF packet telemetry, and instant global rollback without YAML complexity.',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'saas_cta_start',
      name: 'Start Free Cluster CTA',
      position: { x: 48, y: 374 },
      dimensions: { width: 230, height: 52 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#2563EB',
        color: '#FFFFFF',
        borderRadius: 10,
      },
      metadata: { content: 'Provision Free Cluster' },
    }),
    createDefaultElement('image', rootId, {
      id: 'saas_hero_image',
      name: 'Cloud Infrastructure Visual',
      position: { x: 616, y: 112 },
      dimensions: { width: 544, height: 356 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27273A',
      },
      assets: {
        src: '/src/assets/images/template_modern_business_1794725846334.jpg',
        alt: 'Enterprise Cloud Operations Center',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'saas_bento_1',
      name: 'Feature Card — Global Mesh',
      position: { x: 40, y: 500 },
      dimensions: { width: 544, height: 220 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#13131C',
        borderColor: '#27273A',
        borderRadius: 16,
        paddingTop: 28,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 19,
        fontWeight: '700',
        lineHeight: 1.4,
        letterSpacing: '-0.015em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '01. Sub-Millisecond Anycast Routing — Automatic failover across 310 edge PoPs with hardware-isolated microVMs and zero cold-start latency.',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'saas_bento_2',
      name: 'Feature Card — Live Telemetry',
      position: { x: 616, y: 500 },
      dimensions: { width: 544, height: 220 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#13131C',
        borderColor: '#27273A',
        borderRadius: 16,
        paddingTop: 28,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 19,
        fontWeight: '700',
        lineHeight: 1.4,
        letterSpacing: '-0.015em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '02. Unified OpenTelemetry Stream — Inspect SQL query bottlenecks, memory allocations, and distributed traces in a single zero-lag console.',
      },
    }),
  ];

  return [
    buildPageFromElements('page_saas_home', 'Product Landing', 'home', '#09090F', 760, items),
  ];
}

function makeRestaurantPages(): DesignPage[] {
  const rootId = 'page_rest_home_root';
  const items: DesignElement[] = [
    createDefaultElement('text', rootId, {
      id: 'rest_nav',
      name: 'Restaurant Header',
      position: { x: 48, y: 32 },
      dimensions: { width: 1104, height: 36 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#FDE68A' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 1.4,
        letterSpacing: '0.1em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'AURELIA GASTRONOMY   ·   AUTUMN TASTING MENU   ·   CELLAR   ·   PRIVATE DINING',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'rest_title',
      name: 'Culinary Headline',
      position: { x: 48, y: 116 },
      dimensions: { width: 520, height: 148 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#FFFBEB' },
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 48,
        fontWeight: '600',
        lineHeight: 1.12,
        letterSpacing: '-0.015em',
        textAlign: 'left',
      },
      metadata: {
        content: 'Wood-fired heritage cuisine & rare biodynamic vintages.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'rest_desc',
      name: 'Tasting Philosophy',
      position: { x: 48, y: 280 },
      dimensions: { width: 490, height: 88 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#D6D3D1' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.6,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Nine-course seasonal tasting menu forged over white oak embers. Sourced daily from regenerative coastal farms and alpine foragers.',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'rest_reserve_btn',
      name: 'Reserve Table Button',
      position: { x: 48, y: 396 },
      dimensions: { width: 210, height: 50 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#B45309',
        color: '#FFFBEB',
        borderRadius: 6,
      },
      metadata: { content: 'Reserve Tasting Table' },
    }),
    createDefaultElement('image', rootId, {
      id: 'rest_hero_photo',
      name: 'Signature Plating Photo',
      position: { x: 600, y: 100 },
      dimensions: { width: 552, height: 380 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 12,
        borderColor: '#44403C',
      },
      assets: {
        src: '/src/assets/images/template_restaurant_dining_1794725848428.jpg',
        alt: 'Michelin star charred heritage carrots and reduction on dark slate',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('section', rootId, {
      id: 'rest_menu_preview',
      name: 'Tasting Menu Highlights',
      position: { x: 48, y: 520 },
      dimensions: { width: 1104, height: 190 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#1C1917',
        borderColor: '#44403C',
        borderRadius: 12,
        paddingTop: 28,
        paddingLeft: 32,
      },
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 20,
        fontWeight: '500',
        lineHeight: 1.5,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Course I: Smoked Hokkaido Scallop & Black Garlic Dashi  ·  Course IV: Charred Heirloom Roots & Bone Marrow Glaze  ·  Tasting Menu $195 / Wine Pairing $115',
      },
    }),
  ];

  return [
    buildPageFromElements('page_rest_home', 'Dining & Menu', 'home', '#0F0D0C', 760, items),
  ];
}

function makeAutoServicePages(): DesignPage[] {
  const rootId = 'page_auto_home_root';
  const items: DesignElement[] = [
    createDefaultElement('section', rootId, {
      id: 'auto_header',
      name: 'Motorsport Workshop Bar',
      position: { x: 40, y: 24 },
      dimensions: { width: 1120, height: 58 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#141418',
        borderColor: '#27272A',
        borderRadius: 8,
        paddingTop: 16,
        paddingLeft: 24,
      },
      metadata: {
        content:
          'STUTTGART TECHNIK   ·   ECU CALIBRATION   ·   CARBON AERO   ·   TRACK PREP   ·   BOOK BAY',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'auto_title',
      name: 'Performance Headline',
      position: { x: 48, y: 116 },
      dimensions: { width: 520, height: 148 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#F4F4F5' },
      typography: {
        fontFamily: 'Oswald',
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content: 'PRECISION GERMAN MOTORSPORT ENGINEERING & DYNO TUNING.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'auto_sub',
      name: 'Engineering Subcopy',
      position: { x: 48, y: 280 },
      dimensions: { width: 490, height: 84 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#A1A1AA' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.6,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Factory-certified diagnostics, AWD Maha dyno telemetry, titanium exhaust fabrication, and dry-sump engine rebuilds for Porsche, Audi Sport, and AMG.',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'auto_cta',
      name: 'Book Performance Bay CTA',
      position: { x: 48, y: 392 },
      dimensions: { width: 224, height: 52 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#DC2626',
        color: '#FFFFFF',
        borderRadius: 6,
      },
      metadata: { content: 'Schedule Service Bay 04' },
    }),
    createDefaultElement('image', rootId, {
      id: 'auto_hero_img',
      name: 'Performance Bay 04 Photo',
      position: { x: 590, y: 104 },
      dimensions: { width: 570, height: 376 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 10,
        borderColor: '#27272A',
      },
      assets: {
        src: '/src/assets/images/template_auto_service_1794725849460.jpg',
        alt: 'Matte graphite sports coupe inside precision German engineering bay',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'auto_spec_1',
      name: 'Service Package 01',
      position: { x: 40, y: 520 },
      dimensions: { width: 544, height: 190 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#141418',
        borderColor: '#27272A',
        borderRadius: 10,
        paddingTop: 24,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '01. Stage 2 AWD Dyno Calibration ($1,450) — Custom ECU/TCU torque mapping with wideband lambda logging and thermal protection.',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'auto_spec_2',
      name: 'Service Package 02',
      position: { x: 616, y: 520 },
      dimensions: { width: 544, height: 190 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#141418',
        borderColor: '#27272A',
        borderRadius: 10,
        paddingTop: 24,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          '02. Track Corner-Balance & Coilover Setup ($680) — Laser 4-wheel kinematics, nitrogen damper charging, and carbon-ceramic brake service.',
      },
    }),
  ];

  return [
    buildPageFromElements('page_auto_home', 'Workshop & Booking', 'home', '#09090B', 760, items),
  ];
}

function makeEcommercePages(): DesignPage[] {
  const rootId = 'page_ec_home_root';
  const items: DesignElement[] = [
    createDefaultElement('section', rootId, {
      id: 'ec_header',
      name: 'Storefront Top Bar',
      position: { x: 40, y: 24 },
      dimensions: { width: 1120, height: 58 },
      styles: {
        ...createDefaultElement('section', rootId).styles,
        background: '#121214',
        borderColor: '#27272A',
        borderRadius: 10,
        paddingTop: 16,
        paddingLeft: 24,
      },
      metadata: {
        content: 'AURA OBJECTS   ·   CHRONOGRAPHS   ·   PLANAR AUDIO   ·   MATERIALS   ·   BAG (2)',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'ec_title',
      name: 'Flagship Collection Headline',
      position: { x: 48, y: 118 },
      dimensions: { width: 520, height: 136 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#FAFAFA' },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 44,
        fontWeight: '800',
        lineHeight: 1.12,
        letterSpacing: '-0.025em',
        textAlign: 'left',
      },
      metadata: {
        content: 'Grade-5 Titanium & Reference Planar Acoustics.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'ec_sub',
      name: 'Collection Description',
      position: { x: 48, y: 270 },
      dimensions: { width: 480, height: 84 },
      styles: { ...createDefaultElement('text', rootId).styles, color: '#A1A1AA' },
      typography: {
        fontFamily: 'DM Sans',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.6,
        letterSpacing: '0em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'Machined from solid billet titanium in Schaffhausen and paired with open-back beryllium acoustic drivers. Individually serialized.',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'ec_buy_btn',
      name: 'Acquire Edition CTA',
      position: { x: 48, y: 382 },
      dimensions: { width: 230, height: 52 },
      styles: {
        ...createDefaultElement('button', rootId).styles,
        background: '#F4F4F5',
        color: '#09090B',
        borderRadius: 8,
      },
      metadata: { content: 'Acquire Edition — $2,850' },
    }),
    createDefaultElement('image', rootId, {
      id: 'ec_hero_img',
      name: 'Product Plinth Showcase',
      position: { x: 588, y: 104 },
      dimensions: { width: 572, height: 376 },
      styles: {
        ...createDefaultElement('image', rootId).styles,
        borderRadius: 14,
        borderColor: '#27272A',
      },
      assets: {
        src: '/src/assets/images/template_ecommerce_luxury_1794725850156.jpg',
        alt: 'Titanium chronograph watch and open-back headphones on dark travertine stone',
        objectFit: 'cover',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'ec_prod_1',
      name: 'Product Card — Chronograph 01',
      position: { x: 40, y: 516 },
      dimensions: { width: 544, height: 194 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#141417',
        borderColor: '#27272A',
        borderRadius: 12,
        paddingTop: 26,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'CHRONOGRAPH REF. 01-TI ($1,950) — bead-blasted Grade 5 titanium case, sapphire exhibition caseback, 72-hour automatic reserve.',
      },
    }),
    createDefaultElement('container', rootId, {
      id: 'ec_prod_2',
      name: 'Product Card — Reference Headphones',
      position: { x: 616, y: 516 },
      dimensions: { width: 544, height: 194 },
      styles: {
        ...createDefaultElement('container', rootId).styles,
        background: '#141417',
        borderColor: '#27272A',
        borderRadius: 12,
        paddingTop: 26,
        paddingLeft: 28,
      },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        textAlign: 'left',
      },
      metadata: {
        content:
          'AURA PLANAR REFERENCE ($980) — CNC anodized aluminum earcups, 100mm ultra-thin planar magnetic transducers, lambskin pads.',
      },
    }),
  ];

  return [
    buildPageFromElements('page_ec_home', 'Collection Storefront', 'home', '#09090B', 760, items),
  ];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    category: 'Corporate & Advisory',
    tagline: 'Institutional clarity & executive presence',
    description:
      'Designed for consulting firms, financial advisory practices, and enterprise B2B headquarters with structured KPI proof cards.',
    previewImage: '/src/assets/images/template_modern_business_1794725846334.jpg',
    accentColor: '#0284C7',
    pages: makeModernBusinessPages(),
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    category: 'Architecture & Design Studio',
    tagline: 'Monolithic editorial typography & gallery rhythm',
    description:
      'High-contrast editorial showcase for industrial designers, architects, and visual directors featuring Playfair Display headings.',
    previewImage: '/src/assets/images/template_creative_portfolio_1794725847084.jpg',
    accentColor: '#D97706',
    pages: makeCreativePortfolioPages(),
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    category: 'Cloud & Developer Platform',
    tagline: 'High-conversion technical product launch',
    description:
      'Obsidian developer platform template with hero proposition, cloud showcase image, Bento capability blocks, and instant CTA.',
    previewImage: '/src/assets/images/template_modern_business_1794725846334.jpg',
    accentColor: '#2563EB',
    pages: makeSaaSLandingPages(),
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'Fine Dining & Gastronomy',
    tagline: 'Atmospheric culinary storytelling & reservations',
    description:
      'Crafted for Michelin-caliber restaurants, tasting lounges, and sommeliers with course highlights and table reservation flow.',
    previewImage: '/src/assets/images/template_restaurant_dining_1794725848428.jpg',
    accentColor: '#B45309',
    pages: makeRestaurantPages(),
  },
  {
    id: 'auto-service',
    name: 'Auto Service',
    category: 'Performance Engineering & Tuning',
    tagline: 'Technical motorsport precision & bay booking',
    description:
      'Built for specialist European automotive workshops, dyno tuning centers, and motorsport preparation facilities.',
    previewImage: '/src/assets/images/template_auto_service_1794725849460.jpg',
    accentColor: '#DC2626',
    pages: makeAutoServicePages(),
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    category: 'Luxury Hardware & Horology',
    tagline: 'Tactile product presentation & direct acquisition',
    description:
      'Minimalist flagship storefront for industrial hardware, watches, and bespoke consumer objects with clear pricing cards.',
    previewImage: '/src/assets/images/template_ecommerce_luxury_1794725850156.jpg',
    accentColor: '#F4F4F5',
    pages: makeEcommercePages(),
  },
];

export const COMPONENT_PRESETS = [
  {
    id: 'comp_navbar',
    name: 'Navbar (Шапка навигации)',
    category: 'Navigation',
    description: 'Sticky top navigation bar with brand title and menu links',
    create: (parentId: string) =>
      createDefaultElement('section', parentId, {
        name: 'Navbar Header',
        position: { x: 40, y: 24 },
        dimensions: { width: 1120, height: 64 },
        styles: {
          ...createDefaultElement('section', parentId).styles,
          background: '#121218',
          borderColor: '#272732',
          borderRadius: 12,
        },
        metadata: {
          content: 'SITECRAFT STUDIO   ·   Возможности   ·   Проекты   ·   Тарифы   ·   Контакты',
          semanticTag: 'header',
        },
      }),
  },
  {
    id: 'comp_hero_banner',
    name: 'Hero Section (Главный экран)',
    category: 'Hero',
    description: 'High-impact headline banner with call-to-action proposition',
    create: (parentId: string) =>
      createDefaultElement('section', parentId, {
        name: 'Hero Section',
        position: { x: 40, y: 110 },
        dimensions: { width: 1120, height: 280 },
        styles: {
          ...createDefaultElement('section', parentId).styles,
          background: '#14141D',
          borderColor: '#2E2E42',
          borderRadius: 16,
          paddingTop: 36,
          paddingLeft: 36,
        },
        typography: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 34,
          fontWeight: '800',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          textAlign: 'left',
        },
        metadata: {
          content: 'Design once. Build instantly — Визуальная разработка нового поколения.',
          semanticTag: 'section',
        },
      }),
  },
  {
    id: 'comp_features',
    name: 'Features (Блок преимуществ)',
    category: 'Features',
    description: 'Structured feature showcase section with architectural grid',
    create: (parentId: string) =>
      createDefaultElement('section', parentId, {
        name: 'Features Grid Block',
        position: { x: 40, y: 410 },
        dimensions: { width: 1120, height: 220 },
        styles: {
          ...createDefaultElement('section', parentId).styles,
          background: '#111116',
          borderColor: '#27272A',
          borderRadius: 14,
          paddingTop: 28,
          paddingLeft: 32,
        },
        typography: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 1.45,
          letterSpacing: '-0.01em',
          textAlign: 'left',
        },
        metadata: {
          content:
            '01. Интерактивный холст Figma-уровня   ·   02. ИИ-компиляция в HTML/CSS/React   ·   03. Мгновенный экспорт в ZIP',
          semanticTag: 'section',
        },
      }),
  },
  {
    id: 'comp_gallery',
    name: 'Image Gallery (Галерея фото)',
    category: 'Media',
    description: 'Visual photography showcase frame with rounded border',
    create: (parentId: string) =>
      createDefaultElement('image', parentId, {
        name: 'Gallery Showcase Image',
        position: { x: 80, y: 180 },
        dimensions: { width: 540, height: 340 },
        styles: {
          ...createDefaultElement('image', parentId).styles,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#27272A',
        },
        assets: {
          src: '/src/assets/images/template_creative_portfolio_1794725847084.jpg',
          alt: 'Gallery Visual Showcase',
          objectFit: 'cover',
        },
      }),
  },
  {
    id: 'comp_testimonials',
    name: 'Testimonials (Отзывы клиентов)',
    category: 'Social Proof',
    description: 'Verified customer quote & executive attribution block',
    create: (parentId: string) =>
      createDefaultElement('container', parentId, {
        name: 'Testimonials Block',
        position: { x: 60, y: 260 },
        dimensions: { width: 540, height: 190 },
        styles: {
          ...createDefaultElement('container', parentId).styles,
          background: '#14141B',
          borderColor: '#272736',
          borderRadius: 14,
          paddingTop: 24,
          paddingLeft: 28,
        },
        typography: {
          fontFamily: 'DM Sans',
          fontSize: 16,
          fontWeight: '500',
          lineHeight: 1.55,
          letterSpacing: '0em',
          textAlign: 'left',
        },
        metadata: {
          content:
            '«SITECRAFT сократил цикл запуска наших клиентских лендингов с двух недель до 25 минут» — Алексей Воронцов, CTO NordTech',
        },
      }),
  },
  {
    id: 'comp_pricing_card',
    name: 'Pricing (Тарифный план)',
    category: 'Commerce',
    description: 'Structured pricing & specification card with accent border',
    create: (parentId: string) =>
      createDefaultElement('container', parentId, {
        name: 'Pricing Tier Card',
        position: { x: 80, y: 220 },
        dimensions: { width: 360, height: 240 },
        styles: {
          ...createDefaultElement('container', parentId).styles,
          background: '#111827',
          borderColor: '#2563EB',
          borderWidth: 1,
          borderRadius: 14,
          paddingTop: 28,
          paddingLeft: 28,
        },
        typography: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: '700',
          lineHeight: 1.45,
          letterSpacing: '-0.01em',
          textAlign: 'left',
        },
        metadata: {
          content:
            'PRO STUDIO — $49/мес · Безлимитные проекты, загрузка собственных фото, DeepSeek AI и полный экспорт в ZIP.',
        },
      }),
  },
  {
    id: 'comp_contact_form',
    name: 'Contact Form (Форма обратной связи)',
    category: 'Forms',
    description: 'Lead capture & consultation request block',
    create: (parentId: string) =>
      createDefaultElement('section', parentId, {
        name: 'Contact Form Section',
        position: { x: 60, y: 300 },
        dimensions: { width: 640, height: 220 },
        styles: {
          ...createDefaultElement('section', parentId).styles,
          background: '#12121A',
          borderColor: '#2E2E3E',
          borderRadius: 16,
          paddingTop: 28,
          paddingLeft: 32,
        },
        typography: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          fontWeight: '600',
          lineHeight: 1.45,
          letterSpacing: '0em',
          textAlign: 'left',
        },
        metadata: {
          content:
            'Связаться с нами — Оставьте ваш Email и описание задачи. Ответим в течение 15 минут: [ name@company.com ] [ Отправить заявку ]',
          semanticTag: 'section',
        },
      }),
  },
  {
    id: 'comp_card',
    name: 'Card (Карточка контента)',
    category: 'Containers',
    description: 'Universal surface card for services, products, or metrics',
    create: (parentId: string) =>
      createDefaultElement('container', parentId, {
        name: 'Content Card',
        position: { x: 100, y: 240 },
        dimensions: { width: 340, height: 190 },
        styles: {
          ...createDefaultElement('container', parentId).styles,
          background: '#16161F',
          borderColor: '#272732',
          borderRadius: 12,
          paddingTop: 24,
          paddingLeft: 24,
        },
        metadata: {
          content: 'Карточка услуги — Отредактируйте заголовок, описание и параметры отображения.',
        },
      }),
  },
  {
    id: 'comp_footer',
    name: 'Footer (Подвал сайта)',
    category: 'Navigation',
    description: 'Bottom copyright, links, and contact information bar',
    create: (parentId: string) =>
      createDefaultElement('section', parentId, {
        name: 'Footer Block',
        position: { x: 40, y: 660 },
        dimensions: { width: 1120, height: 84 },
        styles: {
          ...createDefaultElement('section', parentId).styles,
          background: '#0B0B0F',
          borderColor: '#1F1F28',
          borderRadius: 10,
          paddingTop: 24,
          paddingLeft: 28,
        },
        typography: {
          fontFamily: 'DM Sans',
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 1.4,
          letterSpacing: '0em',
          textAlign: 'left',
        },
        metadata: {
          content:
            '© 2026 SITECRAFT Studio · Все права защищены · Политика конфиденциальности · studio@sitecraft.dev',
          semanticTag: 'footer',
        },
      }),
  },
  {
    id: 'comp_cta_button',
    name: 'Button (Акцентная кнопка)',
    category: 'Actions',
    description: 'High-contrast interactive action button with hover elevation',
    create: (parentId: string) =>
      createDefaultElement('button', parentId, {
        name: 'Conversion CTA',
        position: { x: 120, y: 320 },
        dimensions: { width: 210, height: 50 },
        styles: {
          ...createDefaultElement('button', parentId).styles,
          background: '#2563EB',
          color: '#FFFFFF',
          borderRadius: 10,
        },
        metadata: {
          content: 'Запустить проект',
          semanticTag: 'button',
        },
      }),
  },
];

export function createProjectFromTemplate(
  templateId: string,
  customName?: string,
  allTemplates: TemplateDefinition[] = TEMPLATES
): DesignProject {
  const tpl = allTemplates.find((t) => t.id === templateId) || TEMPLATES[0];
  const clonedPages: DesignPage[] = structuredClone(tpl.pages);

  return {
    id: generateId('proj'),
    name: customName || `${tpl.name} Site`,
    description: tpl.description,
    templateId: tpl.id,
    category: tpl.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: clonedPages,
    activePageId: clonedPages[0].id,
    aiHistory: [],
  };
}

export function createBlankProject(name = 'Новый визуальный проект'): DesignProject {
  const rootId = 'page_blank_root';
  const items: DesignElement[] = [
    createDefaultElement('section', rootId, {
      id: 'blank_header',
      name: 'Header Container',
      position: { x: 40, y: 24 },
      dimensions: { width: 1120, height: 64 },
      metadata: {
        content: `${name.toUpperCase()}   ·   О проекте   ·   Возможности   ·   Контакты`,
        semanticTag: 'header',
      },
    }),
    createDefaultElement('text', rootId, {
      id: 'blank_title',
      name: 'Hero Headline',
      position: { x: 48, y: 140 },
      dimensions: { width: 680, height: 110 },
      typography: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 42,
        fontWeight: '800',
        lineHeight: 1.15,
        letterSpacing: '-0.025em',
        textAlign: 'left',
      },
      metadata: {
        content: 'Начните визуальную разработку на холсте.',
        semanticTag: 'h1',
      },
    }),
    createDefaultElement('button', rootId, {
      id: 'blank_cta',
      name: 'Primary Button',
      position: { x: 48, y: 276 },
      dimensions: { width: 210, height: 48 },
      metadata: {
        content: 'Запустить сайт',
        semanticTag: 'button',
      },
    }),
  ];

  const page = buildPageFromElements('page_blank_home', 'Главная', 'home', '#09090B', 760, items);

  return {
    id: generateId('proj'),
    name,
    description: 'Пользовательский проект, созданный с чистого листа в SITECRAFT Studio.',
    templateId: 'blank',
    category: 'Custom Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: [page],
    activePageId: page.id,
    aiHistory: [],
  };
}
