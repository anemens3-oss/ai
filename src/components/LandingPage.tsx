import React, { useState } from 'react';
import {
  ArrowRight,
  Code2,
  Download,
  Eye,
  Layers,
  Layout,
  Monitor,
  Smartphone,
  Sparkles,
  Tablet,
} from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { TemplateDefinition } from '../types/design';

interface LandingPageProps {
  onStartBuilding: () => void;
  onOpenDashboard: () => void;
  onSelectTemplate: (templateId: string) => void;
  onPreviewTemplate: (template: TemplateDefinition) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartBuilding,
  onOpenDashboard,
  onSelectTemplate,
  onPreviewTemplate,
}) => {
  // Interactive mini-editor state in the Hero section
  const [heroSelectedLayer, setHeroSelectedLayer] = useState<'headline' | 'cta' | 'card'>('headline');
  const [heroAccent, setHeroAccent] = useState<'#2563EB' | '#0284C7' | '#D97706' | '#DC2626'>('#2563EB');
  const [heroRadius, setHeroRadius] = useState<number>(12);
  const [heroViewMode, setHeroViewMode] = useState<'canvas' | 'code'>('canvas');
  const [heroHeadlineText, setHeroHeadlineText] = useState('Autonomous Cloud Infrastructure');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F6] flex flex-col selection:bg-blue-600/30">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-800/80">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          SITECRAFT
        </a>

        {/* Zone 2: 4–5 clean single-line navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('templates')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Templates
          </button>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign In
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartBuilding}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Creating
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="top" className="relative pt-14 pb-20 lg:pt-20 lg:pb-28 px-6 lg:px-12 max-w-[1380px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <p className="text-xs font-semibold tracking-wider text-blue-400 mb-4">
                DESIGN ONCE. BUILD INSTANTLY.
              </p>
              <h1
                className="font-display font-extrabold text-white tracking-tight leading-[1.08] mb-6"
                style={{ fontSize: 'clamp(2.35rem, 4vw, 3.65rem)', textWrap: 'balance' }}
              >
                Design your website. Let AI build it.
              </h1>
              <p className="text-base lg:text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl">
                Create visually. Generate instantly. Turn your ideas into real websites with the power of AI. Craft layouts on a Figma-grade canvas and compile structured JSON directly into responsive HTML, CSS, JS, and React.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onStartBuilding}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('templates')}
                  className="px-6 py-3.5 text-sm font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Templates
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-6 w-full tabular-nums">
                <div>
                  <div className="text-xl font-bold text-white font-display">6</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Production Templates</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-display">3 Breakpoints</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Desktop · Tablet · Mobile</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-display">ZIP Export</div>
                  <div className="text-xs text-zinc-400 mt-0.5">HTML5 · CSS3 · React</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Mini Visual Studio Preview */}
            <div className="lg:col-span-7">
              <div className="bg-[#0E0E12] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Studio Window Top Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#141419] border-b border-zinc-800 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-zinc-200">SITECRAFT Studio — Interactive Demo</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400 font-mono tabular-nums">1200 × 760 px</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#09090B] p-1 rounded-md border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setHeroViewMode('canvas')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        heroViewMode === 'canvas'
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Visual Canvas
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroViewMode('code')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        heroViewMode === 'code'
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Compiled Code
                    </button>
                  </div>
                </div>

                {/* 3-Pane Interactive Workspace */}
                <div className="grid grid-cols-12 min-h-[380px]">
                  {/* Left Mini Layers */}
                  <div className="col-span-3 border-r border-zinc-800/80 p-3 bg-[#0B0B0F] flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-zinc-400 mb-2.5">Layers</div>
                      <div className="space-y-1">
                        {[
                          { id: 'headline', label: 'Hero Headline', type: 'Text' },
                          { id: 'cta', label: 'Primary Action', type: 'Button' },
                          { id: 'card', label: 'Feature Container', type: 'Frame' },
                        ].map((layer) => (
                          <button
                            key={layer.id}
                            type="button"
                            onClick={() => setHeroSelectedLayer(layer.id as 'headline' | 'cta' | 'card')}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              heroSelectedLayer === layer.id
                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                            }`}
                          >
                            <span className="truncate">{layer.label}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{layer.type}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={onStartBuilding}
                        className="w-full py-2 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded text-xs font-medium text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Open Full Editor →
                      </button>
                    </div>
                  </div>

                  {/* Center Interactive Stage */}
                  <div className="col-span-6 p-5 bg-[#09090B] flex flex-col justify-center relative">
                    {heroViewMode === 'canvas' ? (
                      <div className="border border-zinc-800/90 rounded-lg p-5 bg-[#111116] space-y-4">
                        {/* Simulated Editable Headline */}
                        <div
                          onClick={() => setHeroSelectedLayer('headline')}
                          className={`p-3 rounded transition-all cursor-pointer ${
                            heroSelectedLayer === 'headline'
                              ? 'ring-2 ring-blue-500 bg-blue-950/10'
                              : 'hover:ring-1 hover:ring-zinc-700'
                          }`}
                        >
                          <div className="text-[10px] font-mono text-blue-400 mb-1">
                            h1 · Plus Jakarta Sans · 700
                          </div>
                          <div className="text-lg font-bold text-white leading-snug">
                            {heroHeadlineText}
                          </div>
                        </div>

                        {/* Simulated Editable Card */}
                        <div
                          onClick={() => setHeroSelectedLayer('card')}
                          style={{ borderRadius: `${heroRadius}px` }}
                          className={`p-3.5 bg-[#181822] border border-zinc-800 transition-all cursor-pointer ${
                            heroSelectedLayer === 'card'
                              ? 'ring-2 ring-blue-500'
                              : 'hover:ring-1 hover:ring-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-semibold text-zinc-200 mb-1">
                            01. Real-Time AST Code Generation
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Every drag, resize, and flexbox change updates the underlying JSON schema and compiles to clean semantic code.
                          </p>
                        </div>

                        {/* Simulated Editable Button */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setHeroSelectedLayer('cta')}
                            style={{
                              backgroundColor: heroAccent,
                              borderRadius: `${heroRadius}px`,
                            }}
                            className={`px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer ${
                              heroSelectedLayer === 'cta'
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111116]'
                                : ''
                            }`}
                          >
                            Launch Production Site
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-[11px] font-mono text-zinc-300 bg-[#0B0B0E] p-4 rounded-lg border border-zinc-800 overflow-x-auto leading-relaxed">
{`<section class="sc-hero-container">
  <h1 class="sc-heading">
    ${heroHeadlineText}
  </h1>
  <div class="sc-card" style="border-radius: ${heroRadius}px">
    01. Real-Time AST Code Generation
  </div>
  <button
    class="sc-btn-primary"
    style="background: ${heroAccent}; border-radius: ${heroRadius}px"
  >
    Launch Production Site
  </button>
</section>`}
                      </pre>
                    )}
                  </div>

                  {/* Right Mini Inspector */}
                  <div className="col-span-3 border-l border-zinc-800/80 p-3 bg-[#0B0B0F] space-y-4">
                    <div className="text-[11px] font-semibold text-zinc-400">
                      Inspector · {heroSelectedLayer.toUpperCase()}
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Headline Text</label>
                      <input
                        type="text"
                        aria-label="Demo Headline Text"
                        value={heroHeadlineText}
                        onChange={(e) => setHeroHeadlineText(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#14141A] border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5">Accent Color</label>
                      <div className="flex items-center gap-2">
                        {(['#2563EB', '#0284C7', '#D97706', '#DC2626'] as const).map((color) => (
                          <button
                            key={color}
                            type="button"
                            aria-label={`Select accent color ${color}`}
                            onClick={() => setHeroAccent(color)}
                            style={{ backgroundColor: color }}
                            className={`w-6 h-6 rounded-md cursor-pointer transition-transform ${
                              heroAccent === color ? 'scale-110 ring-2 ring-white' : 'opacity-75 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mb-1 tabular-nums">
                        <span>Border Radius</span>
                        <span className="font-mono">{heroRadius}px</span>
                      </div>
                      <input
                        type="range"
                        aria-label="Demo Border Radius"
                        min={0}
                        max={24}
                        value={heroRadius}
                        onChange={(e) => setHeroRadius(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 px-6 lg:px-12 border-t border-zinc-900 bg-[#0B0B0E]">
          <div className="max-w-[1280px] mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-semibold tracking-wider text-blue-400 mb-2">
                CORE CAPABILITIES
              </p>
              <h2 className="text-2xl lg:text-4xl font-bold text-white font-display tracking-tight">
                Engineered for visual precision and real code output.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1 (Span 7) */}
              <div className="md:col-span-7 p-8 bg-[#111116] border border-zinc-800/90 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                    <span className="font-mono text-blue-400">01. Visual Design Editor</span>
                    <span>Layers · Snap Guides · Multi-Select</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">
                    Figma-grade interactive canvas with direct DOM manipulation
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Drag, resize, group, and nest frames, sections, containers, typography, buttons, and media assets. Inspect and edit width, height, flexbox, grid, spacing, borders, and shadows in real time.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-400">
                  <Layout className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Full Undo/Redo history · Copy/Paste · Keyboard shortcuts</span>
                </div>
              </div>

              {/* Feature 2 (Span 5) */}
              <div className="md:col-span-5 p-8 bg-[#111116] border border-zinc-800/90 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                    <span className="font-mono text-blue-400">02. AI Website Generation</span>
                    <span>DeepSeek API + Local AST</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">
                    Compile design models into clean HTML, CSS, JS, and React
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Translates your structured JSON document hierarchy into semantic markup and responsive stylesheets while preserving every coordinate, color, and asset.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-400">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Contextual AI Assistant with Before/After diff preview</span>
                </div>
              </div>

              {/* Feature 3 (Span 4) */}
              <div className="md:col-span-4 p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-xs font-mono text-blue-400 mb-3">03. Ready-made Templates</div>
                <h3 className="text-lg font-bold text-white font-display mb-2">
                  6 distinct industry systems
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Launch immediately with Modern Business, Creative Portfolio, SaaS Landing, Restaurant, Auto Service, or E-commerce layouts.
                </p>
              </div>

              {/* Feature 4 (Span 4) */}
              <div className="md:col-span-4 p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-xs font-mono text-blue-400 mb-3">04. Responsive Design</div>
                <h3 className="text-lg font-bold text-white font-display mb-2">
                  Desktop, Tablet, and Mobile
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Switch viewports directly inside the studio canvas (1440px, 768px, 390px) and verify responsive reflow before exporting.
                </p>
              </div>

              {/* Feature 5 & 6 combined row (Span 4) */}
              <div className="md:col-span-4 p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-xs font-mono text-blue-400 mb-3">05 & 06. Live Preview & ZIP Export</div>
                <h3 className="text-lg font-bold text-white font-display mb-2">
                  Sandboxed runtime & full archive
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Test generated sites in an isolated iframe and download a complete ZIP with HTML, CSS, JS, React components, and README.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 px-6 lg:px-12 border-t border-zinc-900">
          <div className="max-w-[1280px] mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-semibold tracking-wider text-blue-400 mb-2">
                WORKFLOW PIPELINE
              </p>
              <h2 className="text-2xl lg:text-4xl font-bold text-white font-display tracking-tight">
                From blank canvas to downloadable codebase in three steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-sm font-mono font-semibold text-blue-400 mb-3">
                  01. Design
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2.5">
                  Create your layout visually
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Start from one of 6 curated templates or a clean frame. Arrange sections, customize typography, fine-tune flexbox spacing, or ask the AI Assistant to restyle selected layers.
                </p>
              </div>

              <div className="p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-sm font-mono font-semibold text-blue-400 mb-3">
                  02. Generate
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2.5">
                  AI compiles your design into code
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Click Generate Website to send the structured JSON schema to our compilation engine (DeepSeek API when configured, or our deterministic local AST compiler).
                </p>
              </div>

              <div className="p-7 bg-[#111116] border border-zinc-800/90 rounded-xl">
                <div className="text-sm font-mono font-semibold text-blue-400 mb-3">
                  03. Launch
                </div>
                <h3 className="text-xl font-bold text-white font-display mb-2.5">
                  Preview live & export ZIP
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Inspect the rendered site across Desktop, Tablet, and Mobile viewports in Live Preview, review the generated source files, and download your standalone ZIP package.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES PREVIEW SECTION */}
        <section id="templates" className="py-20 px-6 lg:px-12 border-t border-zinc-900 bg-[#0B0B0E]">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-blue-400 mb-2">
                  PRODUCTION TEMPLATES
                </p>
                <h2 className="text-2xl lg:text-4xl font-bold text-white font-display tracking-tight">
                  Start with an architectural foundation.
                </h2>
              </div>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto"
              >
                Open Project Dashboard →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {TEMPLATES.map((tpl) => (
                <article
                  key={tpl.id}
                  className="bg-[#111116] border border-zinc-800/90 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="relative h-48 bg-zinc-900 overflow-hidden border-b border-zinc-800/80">
                      <img
                        src={tpl.previewImage}
                        alt={tpl.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                        <div className="text-xs text-zinc-300 font-medium">
                          <span>{tpl.category}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>Editable JSON Layout</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white font-display mb-1.5">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label={`Customize ${tpl.name} in Editor`}
                      onClick={() => onSelectTemplate(tpl.id)}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Customize in Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreviewTemplate(tpl)}
                      aria-label={`Preview ${tpl.name}`}
                      className="py-2.5 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-zinc-900 bg-[#09090B] py-12 px-6 lg:px-12 text-xs text-zinc-500">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="text-base font-extrabold text-white font-display tracking-tight mb-1">
              SITECRAFT
            </div>
            <p className="text-zinc-400">
              Design once. Build instantly. Visual web development & AI compilation platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-zinc-400">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Workflow
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('templates')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span>studio@sitecraft.dev</span>
          </div>

          <div className="text-zinc-500 tabular-nums">
            © {new Date().getFullYear()} SITECRAFT Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
