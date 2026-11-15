import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Crop,
  Download,
  Eye,
  EyeOff,
  Frame,
  Hand,
  Image as ImageIcon,
  Layers,
  Lock,
  Menu,
  Monitor,
  MousePointer,
  Play,
  RotateCcw,
  Sliders,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
  Type as TypeIcon,
  Unlock,
  X,
} from 'lucide-react';
import { TemplateDefinition, ViewportMode } from '../types/design';
import { LanguageSwitcher, useI18n } from '../i18n/I18nContext';
import { HeroTechBackground } from './HeroTechBackground';
import { ScrollReveal } from './ScrollReveal';

interface LandingPageProps {
  templates: TemplateDefinition[];
  onStartBuilding: () => void;
  onOpenDashboard: () => void;
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate: (template: TemplateDefinition) => void;
}

interface TechLogoItem {
  id: string;
  name: string;
  group: 'builtWith' | 'poweredBy';
  svg: React.ReactNode;
}

const TECH_LOGOS: TechLogoItem[] = [
  {
    id: 'html5',
    name: 'HTML5',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
      </svg>
    ),
  },
  {
    id: 'css3',
    name: 'CSS3',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z" />
      </svg>
    ),
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
      </svg>
    ),
  },
  {
    id: 'react',
    name: 'React',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.75" aria-hidden="true">
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
      </svg>
    ),
  },
  {
    id: 'vite',
    name: 'Vite',
    group: 'builtWith',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 3L12 21L3 3L12 7L21 3Z" />
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma Canvas AST',
    group: 'poweredBy',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
        <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
        <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
        <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    group: 'poweredBy',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge',
    group: 'poweredBy',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0356-.0986-.019-.1553.0278-.084.1123-.1484.2036-.1562l8.7358-.1123c1.0352-.0489 2.1601-.8868 2.5537-1.9131l.499-1.3018c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4922-.3658-1.1187-.5625-1.794-.499-1.2026.1191-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6191.0635.9141C1.5684 13.2041 0 14.8057 0 16.7822c0 .1748.0142.3516.0352.5273.0141.084.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.1201-.457z" />
      </svg>
    ),
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    group: 'poweredBy',
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 2L14.8 8.5L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.5L12 2Z" />
      </svg>
    ),
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  templates,
  onStartBuilding,
  onOpenDashboard,
  onSelectTemplate,
  onPreviewTemplate,
}) => {
  const { lang, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const parallaxRafRef = useRef<number | null>(null);

  // =========================================================================
  // HERO PARALLAX MOUSE HANDLER (Compositor CSS Variables, Zero React Re-renders)
  // =========================================================================
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = heroSectionRef.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (parallaxRafRef.current) cancelAnimationFrame(parallaxRafRef.current);
    parallaxRafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--hero-px', `${(normX * 26).toFixed(1)}px`);
      el.style.setProperty('--hero-py', `${(normY * 22).toFixed(1)}px`);
    });
  };

  const handleHeroMouseLeave = () => {
    const el = heroSectionRef.current;
    if (!el) return;
    el.style.setProperty('--hero-px', '0px');
    el.style.setProperty('--hero-py', '0px');
  };

  // =========================================================================
  // HERO AUTONOMOUS + INTERACTIVE STUDIO SCENE STATE
  // =========================================================================
  const [heroAutoPlay, setHeroAutoPlay] = useState(true);
  const [heroStep, setHeroStep] = useState<number>(0); // 0: Drag, 1: Inspector, 2: Responsive, 3: Preview
  const [heroSelectedNode, setHeroSelectedNode] = useState<'headline' | 'media' | 'cta'>('headline');
  const [heroRightTool, setHeroRightTool] = useState<string>('select');
  const [heroViewport, setHeroViewport] = useState<ViewportMode>('desktop');
  const [heroShowPreview, setHeroShowPreview] = useState(false);

  // Live editable hero canvas values
  const [heroHeadlinePos, setHeroHeadlinePos] = useState({ x: 40, y: 44 });
  const [heroFontSize, setHeroFontSize] = useState(44);
  const [heroAccent, setHeroAccent] = useState('#3B82F6');
  const [heroRadius, setHeroRadius] = useState(14);
  const [heroShowSnapGuide, setHeroShowSnapGuide] = useState(false);

  useEffect(() => {
    if (!heroAutoPlay) return;
    const timer = setInterval(() => {
      setHeroStep((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setHeroShowPreview(false);
          setHeroViewport('desktop');
          setHeroSelectedNode('headline');
          setHeroRightTool('select');
          setHeroShowSnapGuide(true);
          setHeroHeadlinePos({ x: 56, y: 48 });
          setTimeout(() => setHeroShowSnapGuide(false), 1200);
        } else if (next === 1) {
          setHeroShowPreview(false);
          setHeroSelectedNode('headline');
          setHeroRightTool('text');
          setHeroFontSize(50);
          setHeroAccent('#60A5FA');
          setHeroRadius(18);
        } else if (next === 2) {
          setHeroShowPreview(false);
          setHeroViewport('tablet');
          setTimeout(() => {
            setHeroViewport((curr) => (curr === 'tablet' ? 'mobile' : curr));
          }, 1100);
        } else if (next === 3) {
          setHeroViewport('desktop');
          setHeroRightTool('preview');
          setHeroShowPreview(true);
          setHeroFontSize(44);
          setHeroHeadlinePos({ x: 40, y: 44 });
        }
        return next;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [heroAutoPlay]);

  const cursorTargets = [
    { x: '38%', y: '36%', label: t.hero.cursorDesigner },
    { x: '82%', y: '44%', label: t.hero.cursorDesigner },
    { x: '68%', y: '8%', label: t.hero.cursorDesigner },
    { x: '97%', y: '88%', label: t.hero.cursorAi },
  ];

  // =========================================================================
  // SECTION 01: 6-STEP EDITOR WALKTHROUGH STATE
  // =========================================================================
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [walkthroughAuto, setWalkthroughAuto] = useState(true);

  useEffect(() => {
    if (!walkthroughAuto) return;
    const interval = setInterval(() => {
      setWalkthroughStep((s) => (s + 1) % 6);
    }, 2800);
    return () => clearInterval(interval);
  }, [walkthroughAuto]);

  // =========================================================================
  // SECTION 02: AI PROMPT SYNTHESIS SCENARIO STATE
  // =========================================================================
  const targetAiPrompt: string = t.sections.s02DefaultPrompt;
  const [typedAiPrompt, setTypedAiPrompt] = useState<string>(targetAiPrompt);
  const [aiStage, setAiStage] = useState<number>(4);
  const [isAiAnimating, setIsAiAnimating] = useState(false);

  const runAiDemoSequence = () => {
    if (isAiAnimating) return;
    setIsAiAnimating(true);
    setTypedAiPrompt('');
    setAiStage(0);

    let charIdx = 0;
    const typeInterval = setInterval(() => {
      charIdx += 3;
      if (charIdx >= targetAiPrompt.length) {
        setTypedAiPrompt(targetAiPrompt);
        clearInterval(typeInterval);
        setAiStage(1);
        setTimeout(() => setAiStage(2), 550);
        setTimeout(() => setAiStage(3), 1100);
        setTimeout(() => {
          setAiStage(4);
          setIsAiAnimating(false);
        }, 1700);
      } else {
        setTypedAiPrompt(targetAiPrompt.slice(0, charIdx));
      }
    }, 28);
  };

  // =========================================================================
  // SECTION 03: CANVAS TO CODE NODE INSPECTOR STATE
  // =========================================================================
  const [activeCodeNode, setActiveCodeNode] = useState<'header' | 'hero' | 'grid'>('hero');
  const [activeCodeLang, setActiveCodeLang] = useState<'html' | 'css' | 'react'>('react');
  const [codeCopied, setCodeCopied] = useState(false);

  const codeSnippets: Record<
    'header' | 'hero' | 'grid',
    Record<'html' | 'css' | 'react', string>
  > = {
    header: {
      html: `<header class="sc-navbar" data-node="nav_01">
  <div class="sc-brand">ATELIER KRONOS</div>
  <nav class="sc-nav-links">
    <a href="#works">Monographs</a>
    <a href="#system">Design System</a>
    <button class="sc-cta-pill">Book Consultation</button>
  </nav>
</header>`,
      css: `.sc-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  background: rgba(9, 9, 11, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
}`,
      react: `export function StudioNavbar() {
  return (
    <header className="h-16 px-8 bg-[#09090B]/90 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
      <span className="font-display font-bold tracking-tight text-white">
        ATELIER KRONOS
      </span>
      <button className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-semibold">
        Book Consultation
      </button>
    </header>
  );
}`,
    },
    hero: {
      html: `<section class="sc-hero-frame" data-node="hero_02">
  <span class="sc-kicker">01 · ARCHITECTURAL DESIGN</span>
  <h1 class="sc-display-title">Your vision. Our canvas.</h1>
  <p class="sc-lead">Compiled directly from SITECRAFT spatial JSON.</p>
</section>`,
      css: `.sc-hero-frame {
  position: relative;
  padding: 64px 48px;
  border-radius: 18px;
  background: #0D0D12;
  border: 1px solid rgba(255, 255, 255, 0.09);
}
.sc-display-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 52px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #FAFAFA;
}`,
      react: `export function HeroSection() {
  return (
    <section className="p-12 rounded-[18px] bg-[#0D0D12] border border-white/10 space-y-4">
      <span className="font-mono text-[11px] uppercase tracking-widest text-blue-400">
        01 · ARCHITECTURAL DESIGN
      </span>
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-white">
        Your vision. Our canvas.
      </h1>
    </section>
  );
}`,
    },
    grid: {
      html: `<div class="sc-bento-grid" data-node="grid_03">
  <article class="sc-card">
    <img src="assets/template_creative_portfolio.jpg" alt="Monograph" />
    <h3>Spatial Computing Interface</h3>
  </article>
</div>`,
      css: `.sc-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
@media (max-width: 768px) {
  .sc-bento-grid {
    grid-template-columns: 1fr;
  }
}`,
      react: `export function WorksGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {items.map((item) => (
        <article key={item.id} className="p-4 rounded-xl bg-zinc-900/80 border border-white/10">
          <img src={item.src} alt={item.title} className="w-full h-44 object-cover rounded-lg" />
          <h3 className="mt-3 font-display font-bold text-white">{item.title}</h3>
        </article>
      ))}
    </div>
  );
}`,
    },
  };

  // =========================================================================
  // SECTION 04: EVERY DETAIL MATTERS (4 INTERACTIVE MICRO-LABS)
  // =========================================================================
  const [detailFontSize, setDetailFontSize] = useState(38);
  const [detailTracking, setDetailTracking] = useState(-0.03);
  const [detailCropZoom, setDetailCropZoom] = useState(1.15);
  const [detailRadius, setDetailRadius] = useState(14);
  const [detailLayers, setDetailLayers] = useState([
    { id: 'l1', name: 'Hero Typography', type: 'TEXT', locked: false, hidden: false },
    { id: 'l2', name: 'Glass Surface Card', type: 'FRAME', locked: true, hidden: false },
    { id: 'l3', name: 'Keynote Photograph', type: 'IMAGE', locked: false, hidden: false },
  ]);
  const [detailExportFormat, setDetailExportFormat] = useState<'zip' | 'react' | 'html'>('zip');

  // =========================================================================
  // SECTION 05: RESPONSIVE BY DEFAULT STATE
  // =========================================================================
  const [respMode, setRespMode] = useState<ViewportMode>('desktop');
  const [respAutoCycle, setRespAutoCycle] = useState(true);

  useEffect(() => {
    if (!respAutoCycle) return;
    const order: ViewportMode[] = ['desktop', 'tablet', 'mobile'];
    const timer = setInterval(() => {
      setRespMode((curr) => order[(order.indexOf(curr) + 1) % order.length]);
    }, 2600);
    return () => clearInterval(timer);
  }, [respAutoCycle]);

  // =========================================================================
  // SECTION 06: TEMPLATES FILTER STATE
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const categories = ['ALL', ...Array.from(new Set(templates.map((item) => item.category)))];
  const visibleTemplates =
    selectedCategory === 'ALL'
      ? templates
      : templates.filter((item) => item.category === selectedCategory);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#060608] text-[#F4F4F6] flex flex-col selection:bg-blue-500/30 overflow-x-hidden">
      {/* =====================================================================
          STICKY ARCHITECTURAL HEADER
      ===================================================================== */}
      <header className="sticky top-0 z-50 h-16 bg-[#060608]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-2 sm:gap-4">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight text-white font-display whitespace-nowrap shrink-0"
        >
          <span className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-mono text-xs font-black">
            S
          </span>
          <span>SITECRAFT</span>
        </a>

        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400"
        >
          <button
            type="button"
            onClick={() => scrollToSection('editor-showcase')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.nav.editor}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('ai-engine')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.nav.ai}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('code-compiler')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.nav.code}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('templates')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.nav.templates}
          </button>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.nav.dashboard}
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={onStartBuilding}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {t.nav.startCreating}
          </button>
          <button
            type="button"
            aria-label="Toggle Mobile Navigation"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B10] border-b border-zinc-800 px-6 py-4 space-y-2.5 z-40">
          <button
            type="button"
            onClick={() => scrollToSection('editor-showcase')}
            className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
          >
            01 · {t.nav.editor}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('ai-engine')}
            className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
          >
            02 · {t.nav.ai}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('code-compiler')}
            className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
          >
            03 · {t.nav.code}
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('templates')}
            className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
          >
            06 · {t.nav.templates}
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDashboard();
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-blue-400"
          >
            {t.nav.dashboard} →
          </button>
        </div>
      )}

      <main className="flex-1">
        {/* ===================================================================
            HERO SECTION: "Your vision. Our canvas." + ORBITAL/FLOATING LOGOS + LIVE STUDIO STAGE
        =================================================================== */}
        <section
          ref={heroSectionRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative pt-14 pb-18 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07] overflow-hidden"
        >
          {/* GetArtCraft-Inspired Animated Background with 14 Colored Tech Logos & Orbital Trajectories */}
          <HeroTechBackground />

          <div className="max-w-[1380px] mx-auto relative z-10">
            {/* Hero Editorial Header */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto text-center space-y-5 mb-12 lg:mb-14"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-blue-400">
                {t.hero.badge}
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] leading-[0.98] text-white">
                <span className="block">{t.hero.titleLine1}</span>
                <span className="block bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                  {t.hero.titleLine2}
                </span>
              </h1>

              {lang === 'ru' && (
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-400">
                  {t.hero.titleLocalizedSub}
                </p>
              )}

              <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  data-testid="hero-start-creating-btn"
                  onClick={onStartBuilding}
                  className="px-6 py-3.5 text-sm font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_12px_32px_rgba(255,255,255,0.14)] hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>{t.hero.startCreating}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('core-pillars')}
                  className="px-6 py-3.5 text-sm font-medium text-zinc-200 bg-[#111118]/90 hover:bg-zinc-800/90 border border-white/[0.12] hover:border-white/25 rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-md"
                >
                  {t.hero.explorePlatform}
                </button>
              </div>
            </motion.div>

            {/* LIVE INTERACTIVE & AUTONOMOUS STUDIO STAGE */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              onMouseDown={() => setHeroAutoPlay(false)}
              className="relative rounded-2xl bg-[#0B0B0F]/95 backdrop-blur-xl border border-white/[0.12] shadow-[0_32px_90px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              {/* Stage Top Chrome Bar */}
              <div className="h-11 px-4 bg-[#101016] border-b border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-200 font-semibold truncate">
                    SITECRAFT Studio — Kronos Spatial Architecture
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    ✓ {t.hero.savedStatus}
                  </span>
                </div>

                {/* Center: Live Breakpoint Switcher */}
                <div className="hidden sm:flex items-center gap-1 bg-[#08080C] p-1 rounded-lg border border-white/[0.07]">
                  {(
                    [
                      { id: 'desktop', label: 'Desktop 1200', icon: Monitor },
                      { id: 'tablet', label: 'Tablet 768', icon: Tablet },
                      { id: 'mobile', label: 'Mobile 390', icon: Smartphone },
                    ] as const
                  ).map((bp) => {
                    const Icon = bp.icon;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => {
                          setHeroAutoPlay(false);
                          setHeroViewport(bp.id);
                          setHeroShowPreview(false);
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                          heroViewport === bp.id
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden lg:inline">{bp.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right: Auto-Demo status & Open Studio */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHeroAutoPlay((a) => !a)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border cursor-pointer transition-colors ${
                      heroAutoPlay
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span className="hidden md:inline">
                      {heroAutoPlay ? t.hero.autoDemoActive : t.hero.interactiveMode}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onStartBuilding}
                    className="px-3 py-1 rounded bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    {t.nav.startCreating} →
                  </button>
                </div>
              </div>

              {/* 4-Column Studio Workspace: Left Layers | Center Canvas | Right Inspector | Right Vertical Toolbar Rail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px] relative">
                {/* LEFT PANEL: Layers & Structure */}
                <div className="hidden lg:flex lg:col-span-2 border-r border-white/[0.07] bg-[#0B0B10] p-3 flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-white/[0.06]">
                      <span>{t.editor.tabLayers}</span>
                      <span>DOM</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { id: 'headline', name: 'Hero Display H1', tag: 'TEXT' },
                        { id: 'media', name: 'Architecture Showcase', tag: 'IMAGE' },
                        { id: 'cta', name: 'Launch Action Pill', tag: 'BTN' },
                      ].map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => {
                            setHeroAutoPlay(false);
                            setHeroSelectedNode(node.id as 'headline' | 'media' | 'cta');
                            setHeroShowPreview(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                            heroSelectedNode === node.id
                              ? 'bg-white/[0.09] text-white border border-white/[0.15]'
                              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate font-medium">{node.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{node.tag}</span>
                        </button>
                      ))}
                    </div>

                    {/* Choreography Step Indicator */}
                    <div className="pt-4 border-t border-white/[0.06] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-zinc-500">
                        Studio Sequence
                      </div>
                      {[
                        t.hero.stepSelect,
                        t.hero.stepInspector,
                        t.hero.stepResponsive,
                        t.hero.stepCompiled,
                      ].map((label, idx) => (
                        <div
                          key={label}
                          onClick={() => {
                            setHeroAutoPlay(false);
                            setHeroStep(idx);
                            setHeroShowPreview(idx === 3);
                          }}
                          className={`px-2 py-1.5 rounded text-[11px] cursor-pointer transition-colors ${
                            heroStep === idx
                              ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onStartBuilding}
                    className="w-full py-2 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] rounded-lg text-[11px] font-medium text-zinc-200 transition-colors cursor-pointer truncate"
                  >
                    {t.nav.startCreating} →
                  </button>
                </div>

                {/* CENTER PANEL: Interactive Artboard Canvas */}
                <div
                  className="lg:col-span-7 bg-[#07070A] p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage:
                      'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {heroShowSnapGuide && (
                    <>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-pink-500/80 z-20 pointer-events-none" />
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-pink-500 text-white font-mono text-[10px] z-20">
                        Center Axis · 600px
                      </div>
                    </>
                  )}

                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    style={{
                      width:
                        heroViewport === 'desktop'
                          ? '100%'
                          : heroViewport === 'tablet'
                          ? '78%'
                          : '48%',
                    }}
                    className="bg-[#0D0D12] border border-white/[0.1] rounded-xl p-5 sm:p-6 shadow-2xl relative transition-colors"
                  >
                    {heroShowPreview ? (
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                          ✓ PRODUCTION PREVIEW · https://kronos.sitecraft.app
                        </span>
                        <button
                          type="button"
                          onClick={() => setHeroShowPreview(false)}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                        >
                          ← Canvas
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] text-[10px] font-mono text-zinc-500">
                        <span>ARTBOARD · {heroViewport.toUpperCase()}</span>
                        <span>
                          X:{heroHeadlinePos.x} Y:{heroHeadlinePos.y}
                        </span>
                      </div>
                    )}

                    <div
                      className={`grid gap-5 items-center ${
                        heroViewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-12'
                      }`}
                    >
                      <div
                        className={
                          heroViewport === 'mobile' ? 'col-span-1 space-y-4' : 'col-span-7 space-y-4'
                        }
                      >
                        <motion.div
                          animate={{
                            x: heroShowPreview ? 0 : (heroHeadlinePos.x - 40) * 0.35,
                            y: heroShowPreview ? 0 : (heroHeadlinePos.y - 44) * 0.35,
                          }}
                          onClick={() => {
                            setHeroAutoPlay(false);
                            setHeroSelectedNode('headline');
                          }}
                          className={`relative p-3.5 rounded-lg transition-all cursor-move ${
                            !heroShowPreview && heroSelectedNode === 'headline'
                              ? 'ring-2 ring-blue-500 bg-blue-500/[0.05]'
                              : 'hover:ring-1 hover:ring-white/20'
                          }`}
                        >
                          {!heroShowPreview && heroSelectedNode === 'headline' && (
                            <>
                              <div className="absolute -top-5 left-0 px-1.5 py-0.5 bg-blue-600 text-white font-mono text-[9px] rounded">
                                Hero Display H1 · {heroFontSize}px · ({heroHeadlinePos.x},{' '}
                                {heroHeadlinePos.y})
                              </div>
                              <span className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-600" />
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-600" />
                              <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-600" />
                              <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-600" />
                            </>
                          )}
                          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            ATELIER KRONOS · ZÜRICH
                          </div>
                          <div
                            style={{
                              fontSize: `${
                                heroViewport === 'mobile'
                                  ? Math.min(26, heroFontSize * 0.65)
                                  : Math.min(34, heroFontSize * 0.72)
                              }px`,
                              borderRadius: `${heroRadius}px`,
                            }}
                            className="font-display font-extrabold tracking-tight text-white leading-[1.08]"
                          >
                            Spatial Architecture & Autonomous Web Systems
                          </div>
                        </motion.div>

                        <p className="text-xs text-zinc-400 leading-relaxed px-1">
                          Precision-crafted digital flagship compiled directly from visual canvas primitives into clean semantic code.
                        </p>

                        <div className="px-1">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroAutoPlay(false);
                              setHeroSelectedNode('cta');
                            }}
                            style={{
                              backgroundColor: heroAccent,
                              borderRadius: `${heroRadius}px`,
                            }}
                            className={`px-4 py-2 text-xs font-semibold text-white transition-transform cursor-pointer ${
                              !heroShowPreview && heroSelectedNode === 'cta'
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0D0D12]'
                                : ''
                            }`}
                          >
                            Launch Production Site
                          </button>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setHeroAutoPlay(false);
                          setHeroSelectedNode('media');
                        }}
                        className={`${
                          heroViewport === 'mobile' ? 'col-span-1' : 'col-span-5'
                        } relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          !heroShowPreview && heroSelectedNode === 'media'
                            ? 'ring-2 ring-blue-500 border-blue-500'
                            : 'border-white/10 hover:border-white/25'
                        }`}
                      >
                        <img
                          src="/src/assets/images/template_modern_business_1794725846334.jpg"
                          alt="Studio Showcase"
                          referrerPolicy="no-referrer"
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-2.5 bg-[#111118] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>Cover · 16:9</span>
                          <span>1280×720</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT PANEL: Properties Inspector + ArtCraft Right Vertical Toolbar Rail */}
                <div className="lg:col-span-3 bg-[#0C0C12] border-t lg:border-t-0 lg:border-l border-white/[0.07] flex">
                  <div className="flex-1 p-3.5 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        {t.editor.tabProperties}
                      </span>
                      <span className="font-mono text-[10px] text-blue-400 uppercase">
                        {heroSelectedNode}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono tabular-nums">
                      <div className="p-2 rounded bg-[#08080C] border border-white/[0.06]">
                        <span className="block text-[9px] text-zinc-500">X POS</span>
                        <span className="text-xs text-white">{heroHeadlinePos.x}px</span>
                      </div>
                      <div className="p-2 rounded bg-[#08080C] border border-white/[0.06]">
                        <span className="block text-[9px] text-zinc-500">Y POS</span>
                        <span className="text-xs text-white">{heroHeadlinePos.y}px</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 tabular-nums">
                        <span>{t.editor.fontSize}</span>
                        <span className="font-mono text-white">{heroFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Hero Demo Font Size"
                        min={32}
                        max={58}
                        value={heroFontSize}
                        onChange={(e) => {
                          setHeroAutoPlay(false);
                          setHeroFontSize(Number(e.target.value));
                        }}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="text-[11px] text-zinc-400 mb-1.5">Accent Surface</div>
                      <div className="flex items-center gap-2">
                        {['#3B82F6', '#60A5FA', '#10B981', '#F59E0B', '#EC4899'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            aria-label={`Select demo color ${col}`}
                            onClick={() => {
                              setHeroAutoPlay(false);
                              setHeroAccent(col);
                            }}
                            style={{ backgroundColor: col }}
                            className={`w-6 h-6 rounded-md cursor-pointer transition-transform ${
                              heroAccent === col
                                ? 'ring-2 ring-white scale-110'
                                : 'opacity-75 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 tabular-nums">
                        <span>{t.editor.borderRadius}</span>
                        <span className="font-mono text-white">{heroRadius}px</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Hero Demo Corner Radius"
                        min={0}
                        max={28}
                        value={heroRadius}
                        onChange={(e) => {
                          setHeroAutoPlay(false);
                          setHeroRadius(Number(e.target.value));
                        }}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* ARTCRAFT-INSPIRED RIGHT VERTICAL TOOLBAR RAIL IN HERO STAGE */}
                  <div className="w-11 bg-[#08080C] border-l border-white/[0.07] py-2.5 flex flex-col items-center gap-1.5 shrink-0">
                    {[
                      { id: 'select', label: t.editor.toolSelect, icon: MousePointer },
                      { id: 'move', label: t.editor.toolMove, icon: Hand },
                      { id: 'frame', label: t.editor.toolFrame, icon: Frame },
                      { id: 'text', label: t.editor.toolText, icon: TypeIcon },
                      { id: 'image', label: t.editor.toolImage, icon: ImageIcon },
                      { id: 'shape', label: t.editor.toolCard, icon: Square },
                      { id: 'ai', label: t.editor.railAi, icon: Sparkles },
                      { id: 'preview', label: t.editor.railPreview, icon: Eye },
                    ].map((tool, index) => {
                      const Icon = tool.icon;
                      const isActive = heroRightTool === tool.id;
                      return (
                        <React.Fragment key={tool.id}>
                          {(index === 2 || index === 6) && (
                            <div className="w-5 h-px bg-white/[0.08] my-0.5" />
                          )}
                          <button
                            type="button"
                            aria-label={tool.label}
                            onClick={() => {
                              setHeroAutoPlay(false);
                              setHeroRightTool(tool.id);
                              if (tool.id === 'preview') {
                                setHeroShowPreview((p) => !p);
                              } else {
                                setHeroShowPreview(false);
                              }
                            }}
                            className={`group relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                              isActive
                                ? 'bg-white text-black shadow-sm scale-105'
                                : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                            <span className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 absolute right-9 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#16161F] border border-white/15 text-[10px] font-medium text-white whitespace-nowrap z-40 shadow-xl">
                              {tool.label}
                            </span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Autonomous Designer Cursor Overlay */}
                {heroAutoPlay && (
                  <motion.div
                    aria-hidden="true"
                    animate={{
                      left: cursorTargets[heroStep].x,
                      top: cursorTargets[heroStep].y,
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className="pointer-events-none hidden lg:flex items-center gap-1.5 absolute z-30"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] fill-blue-500 stroke-white"
                      strokeWidth="1.8"
                    >
                      <path d="M4 3l16 7.5-7.5 2L9 20 4 3z" />
                    </svg>
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[10px] font-semibold shadow-lg whitespace-nowrap">
                      {cursorTargets[heroStep].label}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================================================================
            ANIMATED INFINITE MONOCHROME LOGO WALL
        =================================================================== */}
        <section
          aria-label={t.logoWall.kicker}
          className="py-8 bg-[#050507] border-b border-white/[0.07] overflow-hidden"
        >
          <ScrollReveal className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-500">
            <span>{t.logoWall.kicker}</span>
            <span>{t.logoWall.pauseHint}</span>
          </ScrollReveal>

          <ScrollReveal delay={90} className="sc-edge-mask overflow-hidden">
            <div className="animate-sc-marquee flex items-center gap-4 py-1">
              {[...TECH_LOGOS, ...TECH_LOGOS].map((logo, idx) => (
                <div
                  key={`${logo.id}-${idx}`}
                  className="px-4 py-2.5 rounded-xl bg-[#0C0C10] border border-white/[0.06] hover:border-white/[0.18] text-zinc-400 hover:text-white transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3 shrink-0"
                >
                  <span className="text-zinc-300">{logo.svg}</span>
                  <span className="text-xs font-display font-semibold tracking-tight">
                    {logo.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    · {logo.group === 'builtWith' ? t.logoWall.builtWith : t.logoWall.poweredBy}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ===================================================================
            CORE PLATFORM PILLARS: THE 4 MAIN ARCHITECTURE CARDS (Staggered Scroll Reveal)
        =================================================================== */}
        <section
          id="core-pillars"
          className="relative py-20 lg:py-24 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07] overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 right-10 w-[440px] h-[280px] rounded-full bg-blue-600/[0.05] blur-[110px]"
          />

          <div className="max-w-[1380px] mx-auto space-y-12 relative z-10">
            <ScrollReveal className="max-w-3xl space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                {t.sections.coreCardsKicker}
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {t.sections.coreCardsTitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {t.sections.coreCardsSubtitle}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.sections.coreCards.map((card, idx) => (
                <ScrollReveal key={card.id} delay={idx * 115} className="h-full">
                  <article
                    onClick={onStartBuilding}
                    className="sc-premium-card h-full rounded-2xl bg-[#0B0B11] border border-white/[0.08] p-6 flex flex-col justify-between space-y-6 cursor-pointer overflow-hidden"
                  >
                    <div className="sc-card-glow" />
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                        <span className="text-blue-400 font-bold">{card.id}</span>
                        <span>{card.tag}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-white tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono relative z-10">
                      <span className="text-zinc-300">{card.metric}</span>
                      <span className="sc-card-detail text-blue-400 flex items-center gap-1">
                        <span>Studio</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 01 — DESIGN WITHOUT LIMITS (Interactive 6-Step Editor Showcase)
        =================================================================== */}
        <section
          id="editor-showcase"
          className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07] overflow-hidden"
        >
          <div className="max-w-[1380px] mx-auto space-y-12 relative z-10">
            <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                  {t.sections.s01Number}. STUDIO ARCHITECTURE
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {t.sections.s01Title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t.sections.s01Subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onStartBuilding}
                className="self-start lg:self-auto px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 shrink-0"
              >
                <span>{t.nav.startCreating}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </ScrollReveal>

            {/* 6-Step Interactive Walkthrough Selector + Live Studio Frame */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 flex flex-col justify-between gap-2.5">
                {t.sections.s01Steps.map((s, idx) => {
                  const isActive = walkthroughStep === idx;
                  return (
                    <ScrollReveal key={s.step} delay={idx * 75}>
                      <button
                        type="button"
                        onClick={() => {
                          setWalkthroughAuto(false);
                          setWalkthroughStep(idx);
                        }}
                        className={`sc-premium-card w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                          isActive
                            ? 'bg-[#12121A] border-white/25 shadow-lg'
                            : 'bg-[#0A0A0E] border-white/[0.06] hover:border-white/15'
                        }`}
                      >
                        <div className="sc-card-glow" />
                        <div className="flex items-center justify-between mb-1 relative z-10">
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              isActive ? 'text-blue-400' : 'text-zinc-500'
                            }`}
                          >
                            STEP {s.step}
                          </span>
                          <span className="sc-card-detail font-mono text-[10px] text-zinc-400">
                            {isActive ? 'ACTIVE' : 'SELECT →'}
                          </span>
                        </div>
                        <div className="text-xs font-bold font-display text-white mb-0.5 relative z-10">
                          {s.title}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug relative z-10">
                          {s.desc}
                        </p>
                      </button>
                    </ScrollReveal>
                  );
                })}
              </div>

              <ScrollReveal
                delay={160}
                className="lg:col-span-8 rounded-2xl bg-[#0B0B10] border border-white/[0.1] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="h-10 px-4 bg-[#111118] border-b border-white/[0.07] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>
                    STEP 0{walkthroughStep + 1} · {t.sections.s01Steps[walkthroughStep].title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWalkthroughAuto((a) => !a)}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {walkthroughAuto ? 'Auto-Stepping ●' : 'Manual Mode ○'}
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-[380px]">
                  <div className="sm:col-span-3 border-b sm:border-b-0 sm:border-r border-white/[0.06] p-3 bg-[#09090D] space-y-2">
                    <div className="text-[10px] font-mono uppercase text-zinc-500">Layers</div>
                    <div className="px-2 py-1.5 rounded bg-blue-600/20 border border-blue-500/40 text-[11px] text-blue-200 font-medium">
                      T · Hero Headline
                    </div>
                    <div className="px-2 py-1.5 rounded text-[11px] text-zinc-400">
                      F · Bento Feature Grid
                    </div>
                    <div className="px-2 py-1.5 rounded text-[11px] text-zinc-400">
                      I · Studio Showcase
                    </div>
                  </div>

                  <div
                    className="sm:col-span-5 p-5 bg-[#070709] flex flex-col justify-center relative"
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    {walkthroughStep === 4 && (
                      <div className="absolute inset-x-0 top-1/2 h-px bg-pink-500/70 pointer-events-none" />
                    )}
                    <motion.div
                      animate={{
                        scale: walkthroughStep >= 2 ? 1.04 : 1,
                        x: walkthroughStep >= 4 ? 10 : 0,
                        y: walkthroughStep >= 4 ? -6 : 0,
                      }}
                      className="p-4 rounded-xl bg-[#101018] border-2 border-blue-500 shadow-2xl space-y-2 relative"
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px]">
                        Hero Headline · {walkthroughStep >= 2 ? '54px' : '42px'}
                      </span>
                      <div
                        style={{
                          color: walkthroughStep >= 3 ? '#60A5FA' : '#FFFFFF',
                        }}
                        className="font-display text-xl sm:text-2xl font-extrabold tracking-tight transition-colors"
                      >
                        Precision Visual Engineering.
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {walkthroughStep === 5
                          ? '✓ Compiled & synchronized with DOM tree'
                          : 'Live interactive canvas node'}
                      </p>
                    </motion.div>
                  </div>

                  <div className="sm:col-span-4 bg-[#0C0C12] border-t sm:border-t-0 sm:border-l border-white/[0.06] flex">
                    <div className="flex-1 p-3 space-y-3 text-[11px]">
                      <div className="font-mono text-[10px] uppercase text-zinc-400">
                        Properties Inspector
                      </div>
                      <div
                        className={`p-2 rounded border transition-colors ${
                          walkthroughStep === 2
                            ? 'border-blue-500 bg-blue-950/30'
                            : 'border-white/[0.06] bg-[#08080C]'
                        }`}
                      >
                        <div className="text-[9px] text-zinc-500 font-mono">FONT SIZE</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {walkthroughStep >= 2 ? '54px' : '42px'}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded border transition-colors ${
                          walkthroughStep === 3
                            ? 'border-blue-500 bg-blue-950/30'
                            : 'border-white/[0.06] bg-[#08080C]'
                        }`}
                      >
                        <div className="text-[9px] text-zinc-500 font-mono">COLOR TOKEN</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: walkthroughStep >= 3 ? '#60A5FA' : '#FFFFFF',
                            }}
                          />
                          <span className="font-mono text-white">
                            {walkthroughStep >= 3 ? '#60A5FA' : '#FFFFFF'}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded border transition-colors ${
                          walkthroughStep === 4
                            ? 'border-pink-500 bg-pink-950/20'
                            : 'border-white/[0.06] bg-[#08080C]'
                        }`}
                      >
                        <div className="text-[9px] text-zinc-500 font-mono">POSITION</div>
                        <div className="font-mono text-white">
                          {walkthroughStep >= 4 ? 'X: 64px · Y: 48px' : 'X: 48px · Y: 60px'}
                        </div>
                      </div>
                    </div>

                    <div className="w-10 bg-[#08080C] border-l border-white/[0.06] py-2 flex flex-col items-center gap-1.5">
                      <span
                        className={`p-1.5 rounded ${
                          walkthroughStep <= 1 ? 'bg-white text-black' : 'text-zinc-500'
                        }`}
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                      </span>
                      <span
                        className={`p-1.5 rounded ${
                          walkthroughStep === 2 || walkthroughStep === 3
                            ? 'bg-white text-black'
                            : 'text-zinc-500'
                        }`}
                      >
                        <TypeIcon className="w-3.5 h-3.5" />
                      </span>
                      <span
                        className={`p-1.5 rounded ${
                          walkthroughStep === 4 ? 'bg-white text-black' : 'text-zinc-500'
                        }`}
                      >
                        <Hand className="w-3.5 h-3.5" />
                      </span>
                      <span
                        className={`p-1.5 rounded ${
                          walkthroughStep === 5 ? 'bg-blue-600 text-white' : 'text-zinc-500'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 02 — AI THAT UNDERSTANDS YOUR VISION
        =================================================================== */}
        <section
          id="ai-engine"
          className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-10 bg-[#08080C] border-b border-white/[0.07] overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-16 left-12 w-[480px] h-[300px] rounded-full bg-indigo-500/[0.05] blur-[120px]"
          />

          <div className="max-w-[1380px] mx-auto space-y-12 relative z-10">
            <ScrollReveal className="max-w-3xl space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                {t.sections.s02Number}. GENERATIVE SPATIAL ENGINE
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {t.sections.s02Title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {t.sections.s02Subtitle}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <ScrollReveal
                delay={80}
                className="lg:col-span-5 rounded-2xl bg-[#0D0D14] border border-white/[0.1] p-5 space-y-5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>SITECRAFT AI Prompt Stream</span>
                  </span>
                  <button
                    type="button"
                    onClick={runAiDemoSequence}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.sections.s02RunDemoBtn}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#07070A] border border-white/[0.08] font-mono text-xs text-zinc-100 min-h-[76px] flex items-center">
                  <span>
                    "{typedAiPrompt}"
                    {isAiAnimating && (
                      <span className="inline-block w-1.5 h-4 bg-blue-400 ml-1 animate-pulse" />
                    )}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 1, label: t.sections.s02Stage1 },
                    { id: 2, label: t.sections.s02Stage2 },
                    { id: 3, label: t.sections.s02Stage3 },
                    { id: 4, label: t.sections.s02Stage4 },
                  ].map((st) => {
                    const done = aiStage >= st.id;
                    return (
                      <div
                        key={st.id}
                        className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                          done
                            ? 'bg-white/[0.04] border-white/[0.12] text-zinc-200'
                            : 'bg-transparent border-white/[0.04] text-zinc-600'
                        }`}
                      >
                        <span>{st.label}</span>
                        <span className="font-mono text-[10px] text-emerald-400">
                          {done ? '✓ DONE' : '...'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-white/[0.06] pt-3">
                  {t.sections.s02DemoDisclaimer}
                </p>
              </ScrollReveal>

              <ScrollReveal
                delay={190}
                className="lg:col-span-7 rounded-2xl bg-[#0B0B10] border border-white/[0.1] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.07]">
                  <span className="font-mono text-[11px] text-zinc-400">
                    {aiStage < 4 ? t.sections.s02Generating : t.sections.s02Ready}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('creative-portfolio')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {t.templatesSection.customizeBtn} →
                  </button>
                </div>

                <motion.div
                  animate={{ opacity: aiStage >= 1 ? 1 : 0.25 }}
                  className="px-4 py-2.5 rounded-lg bg-[#12121A] border border-white/[0.07] flex items-center justify-between text-xs"
                >
                  <span className="font-display font-bold tracking-wider text-white">
                    NOIR ATELIER
                  </span>
                  <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                    <span>Works</span>
                    <span>Philosophy</span>
                    <span className="px-2.5 py-1 rounded bg-white text-black font-semibold">
                      Inquire
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ opacity: aiStage >= 2 ? 1 : 0.2 }}
                  className="p-5 rounded-xl bg-gradient-to-br from-[#12121A] to-[#09090D] border border-white/[0.08] space-y-2"
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    DIGITAL ARCHITECTURE & DIRECTION
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Sculpting Digital Brutalism & Silence.
                  </div>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Bespoke visual systems, interactive WebGL monographs, and spatial brand identities.
                  </p>
                </motion.div>

                <motion.div
                  animate={{ opacity: aiStage >= 4 ? 1 : 0.15 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {[
                    {
                      title: '01 · Monolith Audio',
                      img: '/src/assets/images/template_ecommerce_luxury_1794725850156.jpg',
                    },
                    {
                      title: '02 · Kronos Pavilion',
                      img: '/src/assets/images/template_creative_portfolio_1794725847084.jpg',
                    },
                    {
                      title: '03 · Apex Dynamics',
                      img: '/src/assets/images/template_auto_service_1794725849460.jpg',
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="sc-premium-card p-2.5 rounded-xl bg-[#111118] border border-white/[0.07] space-y-2 overflow-hidden group"
                    >
                      <div className="overflow-hidden rounded-lg">
                        <img
                          src={card.img}
                          alt={card.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-24 object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="text-[11px] font-display font-semibold text-zinc-200">
                        {card.title}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 03 — FROM CANVAS TO CODE
        =================================================================== */}
        <section
          id="code-compiler"
          className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07]"
        >
          <div className="max-w-[1380px] mx-auto space-y-12">
            <ScrollReveal className="max-w-3xl space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                {t.sections.s03Number}. DETERMINISTIC AST COMPILER
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {t.sections.s03Title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {t.sections.s03Subtitle}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 rounded-2xl bg-[#0B0B10] border border-white/[0.09] p-5 flex flex-col justify-between space-y-4">
                <div className="text-xs font-mono text-zinc-400">
                  {t.sections.s03ClickNodeHint}
                </div>

                <div className="space-y-3">
                  {(
                    [
                      {
                        id: 'header',
                        tag: '<header.sc-navbar>',
                        title: 'Navigation Bar Container',
                        meta: 'display: flex · justify: space-between · h: 64px',
                      },
                      {
                        id: 'hero',
                        tag: '<section.sc-hero-frame>',
                        title: 'Hero Display Frame',
                        meta: 'padding: 64px 48px · radius: 18px · Plus Jakarta Sans',
                      },
                      {
                        id: 'grid',
                        tag: '<div.sc-bento-grid>',
                        title: 'Responsive 3-Column Works Grid',
                        meta: 'display: grid · cols: 3 · gap: 20px · @media 768px',
                      },
                    ] as const
                  ).map((node, idx) => (
                    <ScrollReveal key={node.id} delay={idx * 95}>
                      <button
                        type="button"
                        onClick={() => setActiveCodeNode(node.id)}
                        className={`sc-premium-card w-full p-4 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                          activeCodeNode === node.id
                            ? 'bg-blue-600/15 border-blue-500/60 text-white shadow-lg'
                            : 'bg-[#101017] border-white/[0.06] text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="sc-card-glow" />
                        <div className="flex items-center justify-between font-mono text-[11px] text-blue-400 mb-1 relative z-10">
                          <span>{node.tag}</span>
                          <span>AST NODE</span>
                        </div>
                        <div className="font-display font-bold text-sm mb-1 relative z-10">
                          {node.title}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-400 relative z-10">
                          {node.meta}
                        </div>
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              <ScrollReveal
                delay={180}
                className="lg:col-span-7 rounded-2xl bg-[#0A0A0F] border border-white/[0.1] overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="h-11 px-4 bg-[#111118] border-b border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'react', label: 'React JSX' },
                        { id: 'html', label: 'HTML5' },
                        { id: 'css', label: 'CSS3' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCodeLang(tab.id)}
                        className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                          activeCodeLang === tab.id
                            ? 'bg-white text-black font-semibold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        codeSnippets[activeCodeNode][activeCodeLang]
                      );
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 1800);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{t.preview.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t.preview.copyCode}</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="flex-1 p-6 font-mono text-xs sm:text-[13px] leading-relaxed text-zinc-200 overflow-x-auto">
                  <code>{codeSnippets[activeCodeNode][activeCodeLang]}</code>
                </pre>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 04 — EVERY DETAIL MATTERS (4 Interactive Precision Cards)
        =================================================================== */}
        <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 bg-[#08080C] border-b border-white/[0.07]">
          <div className="max-w-[1380px] mx-auto space-y-12">
            <ScrollReveal className="max-w-3xl space-y-3">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                {t.sections.s04Number}. PRECISION MICRO-CONTROLS
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {t.sections.s04Title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                {t.sections.s04Subtitle}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Typography & Optical Rhythm */}
              <ScrollReveal delay={0} className="h-full">
                <div className="sc-premium-card h-full rounded-2xl bg-[#0D0D13] border border-white/[0.09] p-6 flex flex-col justify-between space-y-6 overflow-hidden">
                  <div className="sc-card-glow" />
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>01 · TYPOGRAPHY LAB</span>
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {t.sections.s04Card1Title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t.sections.s04Card1Desc}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#07070A] border border-white/[0.07] min-h-[116px] flex items-center justify-center overflow-hidden relative z-10">
                    <div
                      style={{
                        fontSize: `${detailFontSize}px`,
                        letterSpacing: `${detailTracking}em`,
                      }}
                      className="font-display font-extrabold text-white text-center leading-none transition-all"
                    >
                      Aa · Studio
                    </div>
                  </div>

                  <div className="space-y-3 text-xs tabular-nums relative z-10">
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>{t.editor.fontSize}</span>
                        <span className="font-mono text-white">{detailFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Detail Font Size"
                        min={24}
                        max={48}
                        value={detailFontSize}
                        onChange={(e) => setDetailFontSize(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>{t.editor.letterSpacing}</span>
                        <span className="font-mono text-white">{detailTracking}em</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Detail Letter Spacing"
                        min={-0.06}
                        max={0.04}
                        step={0.01}
                        value={detailTracking}
                        onChange={(e) => setDetailTracking(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2: Non-Destructive Image Crop & Surface */}
              <ScrollReveal delay={110} className="h-full">
                <div className="sc-premium-card h-full rounded-2xl bg-[#0D0D13] border border-white/[0.09] p-6 flex flex-col justify-between space-y-6 overflow-hidden">
                  <div className="sc-card-glow" />
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>02 · IMAGE CROP</span>
                      <Crop className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {t.sections.s04Card2Title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t.sections.s04Card2Desc}
                    </p>
                  </div>

                  <div
                    style={{ borderRadius: `${detailRadius}px` }}
                    className="h-32 w-full overflow-hidden border border-white/15 bg-black relative z-10"
                  >
                    <img
                      src="/src/assets/images/template_restaurant_dining_1794725848428.jpg"
                      alt="Crop Preview"
                      referrerPolicy="no-referrer"
                      style={{
                        transform: `scale(${detailCropZoom})`,
                      }}
                      className="w-full h-full object-cover transition-transform duration-150"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 font-mono text-[10px] text-white">
                      Zoom {Math.round(detailCropZoom * 100)}%
                    </span>
                  </div>

                  <div className="space-y-3 text-xs tabular-nums relative z-10">
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>{t.editor.cropZoom}</span>
                        <span className="font-mono text-white">
                          {Math.round(detailCropZoom * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label="Detail Crop Zoom"
                        min={1}
                        max={2.2}
                        step={0.05}
                        value={detailCropZoom}
                        onChange={(e) => setDetailCropZoom(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>{t.editor.borderRadius}</span>
                        <span className="font-mono text-white">{detailRadius}px</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Detail Border Radius"
                        min={0}
                        max={28}
                        value={detailRadius}
                        onChange={(e) => setDetailRadius(Number(e.target.value))}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 3: Layer Hierarchy, Locking & Visibility */}
              <ScrollReveal delay={220} className="h-full">
                <div className="sc-premium-card h-full rounded-2xl bg-[#0D0D13] border border-white/[0.09] p-6 flex flex-col justify-between space-y-6 overflow-hidden">
                  <div className="sc-card-glow" />
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>03 · DOM LAYERS</span>
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {t.sections.s04Card3Title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t.sections.s04Card3Desc}
                    </p>
                  </div>

                  <div className="space-y-2 relative z-10">
                    {detailLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          layer.hidden
                            ? 'bg-[#08080B] border-white/[0.04] text-zinc-600'
                            : 'bg-[#12121A] border-white/[0.09] text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-zinc-500">{layer.type}</span>
                          <span className="font-medium truncate">{layer.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Toggle lock on ${layer.name}`}
                            onClick={() =>
                              setDetailLayers((prev) =>
                                prev.map((l) =>
                                  l.id === layer.id ? { ...l, locked: !l.locked } : l
                                )
                              )
                            }
                            className={`p-1 rounded cursor-pointer ${
                              layer.locked
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                          >
                            {layer.locked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label={`Toggle visibility on ${layer.name}`}
                            onClick={() =>
                              setDetailLayers((prev) =>
                                prev.map((l) =>
                                  l.id === layer.id ? { ...l, hidden: !l.hidden } : l
                                )
                              )
                            }
                            className={`p-1 rounded cursor-pointer ${
                              layer.hidden
                                ? 'text-blue-400 bg-blue-500/10'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                          >
                            {layer.hidden ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-[#07070A] border border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400 relative z-10">
                    <span>
                      Active: {detailLayers.filter((l) => !l.hidden).length}/3
                    </span>
                    <span>
                      Locked: {detailLayers.filter((l) => l.locked).length}
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 4: 1-Click Production ZIP & Asset Bundler */}
              <ScrollReveal delay={330} className="h-full">
                <div className="sc-premium-card h-full rounded-2xl bg-[#0D0D13] border border-white/[0.09] p-6 flex flex-col justify-between space-y-6 overflow-hidden">
                  <div className="sc-card-glow" />
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                      <span>04 · CODE & ZIP BUNDLE</span>
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {t.sections.s04Card4Title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t.sections.s04Card4Desc}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#07070A] border border-white/[0.07] font-mono text-[11px] text-zinc-300 space-y-1.5 relative z-10">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>index.html + styles.css</span>
                      <span className="text-emerald-400">✓ Ready</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>App.tsx (React 19)</span>
                      <span className="text-emerald-400">✓ Ready</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>/assets/images/*</span>
                      <span className="text-blue-400">Bundled</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 relative z-10">
                    <div className="grid grid-cols-3 gap-1.5 bg-[#08080C] p-1 rounded-lg border border-white/[0.06] font-mono text-[10px]">
                      {(['zip', 'react', 'html'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setDetailExportFormat(fmt)}
                          className={`py-1 rounded uppercase cursor-pointer transition-colors ${
                            detailExportFormat === fmt
                              ? 'bg-white text-black font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onStartBuilding}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.editor.exportZipBtn}</span>
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 05 — RESPONSIVE BY DEFAULT
        =================================================================== */}
        <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07]">
          <div className="max-w-[1380px] mx-auto space-y-10">
            <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                  {t.sections.s05Number}. ADAPTIVE BREAKPOINT ENGINE
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {t.sections.s05Title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t.sections.s05Subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: 'desktop', label: 'Desktop · 1200px', icon: Monitor },
                    { id: 'tablet', label: 'Tablet · 768px', icon: Tablet },
                    { id: 'mobile', label: 'Mobile · 390px', icon: Smartphone },
                  ] as const
                ).map((bp) => {
                  const Icon = bp.icon;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => {
                        setRespAutoCycle(false);
                        setRespMode(bp.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border cursor-pointer transition-all ${
                        respMode === bp.id
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-[#0D0D13] text-zinc-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{bp.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal
              delay={120}
              className="rounded-2xl bg-[#09090E] border border-white/[0.08] p-6 sm:p-10 flex justify-center overflow-hidden"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                style={{
                  width:
                    respMode === 'desktop'
                      ? '100%'
                      : respMode === 'tablet'
                      ? '680px'
                      : '360px',
                }}
                className="max-w-full rounded-xl bg-[#0F0F17] border border-white/[0.12] p-5 sm:p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-3 border-b border-white/[0.07]">
                  <span>VIEWPORT · {respMode.toUpperCase()}</span>
                  <span>
                    {respMode === 'desktop'
                      ? '1200 × 780'
                      : respMode === 'tablet'
                      ? '768 × 1024'
                      : '390 × 844'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div
                    className={`font-display font-extrabold text-white tracking-tight ${
                      respMode === 'desktop'
                        ? 'text-3xl'
                        : respMode === 'tablet'
                        ? 'text-2xl'
                        : 'text-xl'
                    }`}
                  >
                    Adaptive Layout Reflow without Media Query Headaches
                  </div>
                  <p className="text-xs text-zinc-400">
                    Override coordinates, dimensions, and typography per breakpoint directly in the SITECRAFT Inspector.
                  </p>
                </div>

                <div
                  className={`grid gap-3 ${
                    respMode === 'desktop'
                      ? 'grid-cols-3'
                      : respMode === 'tablet'
                      ? 'grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {[
                    { kpi: '99.98%', label: 'Edge Uptime SLA' },
                    { kpi: '14 ms', label: 'Global PoP Latency' },
                    { kpi: '100 / 100', label: 'Core Web Vitals' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="sc-premium-card p-4 rounded-lg bg-[#09090D] border border-white/[0.07]"
                    >
                      <div className="font-mono text-xl font-bold text-white tabular-nums">
                        {item.kpi}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </section>

        {/* ===================================================================
            SECTION 06 — START WITH AN IDEA (Curated Templates Gallery)
        =================================================================== */}
        <section
          id="templates"
          className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 border-b border-white/[0.07]"
        >
          <div className="max-w-[1380px] mx-auto space-y-10">
            <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                  {t.sections.s06Number}. {t.templatesSection.kicker}
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {t.sections.s06Title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {t.sections.s06Subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto"
              >
                {t.templatesSection.openDashboard}
              </button>
            </ScrollReveal>

            <ScrollReveal delay={70} className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#0E0E14] text-zinc-400 border border-white/[0.07] hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? t.templatesSection.filterAll : cat}
                </button>
              ))}
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTemplates.map((tpl, idx) => (
                <ScrollReveal key={tpl.id} delay={idx * 95} className="h-full">
                  <article className="sc-premium-card h-full rounded-2xl bg-[#0C0C12] border border-white/[0.08] overflow-hidden flex flex-col justify-between group">
                    <div className="sc-card-glow" />
                    <div className="relative z-10">
                      <div className="relative h-52 overflow-hidden bg-zinc-950 border-b border-white/[0.06]">
                        <img
                          src={tpl.previewImage}
                          alt={tpl.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C12] via-transparent to-transparent opacity-85" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                          <span>{tpl.category}</span>
                          <span className="sc-card-detail text-[10px] text-blue-400">
                            {t.templatesSection.editableJson}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white font-display mb-1.5">
                          {tpl.name}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 flex items-center gap-2.5 relative z-10">
                      <button
                        type="button"
                        aria-label={`Customize ${tpl.name} in Editor`}
                        onClick={() => onSelectTemplate(tpl.id)}
                        className="flex-1 py-2.5 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap"
                      >
                        {t.templatesSection.customizeBtn}
                      </button>
                      <button
                        type="button"
                        aria-label={`Preview ${tpl.name}`}
                        onClick={() => onPreviewTemplate(tpl)}
                        className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.templatesSection.previewBtn}</span>
                      </button>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            DEDICATED CONVERSION CTA SECTION (Scroll Reveal)
        =================================================================== */}
        <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-10 bg-[#08080D] border-b border-white/[0.07] overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[680px] h-[300px] rounded-full bg-blue-600/[0.08] blur-[130px]" />
          </div>

          <ScrollReveal className="max-w-4xl mx-auto relative z-10 rounded-3xl bg-gradient-to-b from-[#111119] to-[#0A0A10] border border-white/[0.12] p-8 sm:p-14 text-center space-y-6 shadow-[0_28px_80px_rgba(0,0,0,0.85)]">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
              {t.sections.finalCtaKicker}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-[1.06]">
              {t.sections.finalCtaTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
              {t.sections.finalCtaSubtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onStartBuilding}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg"
              >
                <span>{t.sections.finalCtaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-200 text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5"
              >
                {t.sections.finalCtaSecondary}
              </button>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* =====================================================================
          MINIMAL ARCHITECTURAL FOOTER (Scroll Reveal)
      ===================================================================== */}
      <ScrollReveal
        as="footer"
        className="py-12 px-4 sm:px-6 lg:px-10 bg-[#050507] text-xs text-zinc-500"
      >
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="font-extrabold text-white tracking-tight font-display text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-white text-black flex items-center justify-center font-mono text-[10px] font-black">
                S
              </span>
              <span>SITECRAFT</span>
            </div>
            <p className="max-w-md text-zinc-400">{t.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-zinc-400">
            <button
              type="button"
              onClick={() => scrollToSection('editor-showcase')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.capabilities}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ai-engine')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.workflow}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('templates')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.templates}
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.footer.dashboard}
            </button>
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            © {new Date().getFullYear()} {t.footer.rights}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
