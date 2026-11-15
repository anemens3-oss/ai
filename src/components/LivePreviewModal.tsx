import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from 'lucide-react';
import {
  DesignProject,
  GeneratedWebsiteBundle,
  ViewportMode,
} from '../types/design';
import { useI18n, LanguageSwitcher } from '../i18n/I18nContext';

interface LivePreviewModalProps {
  project: DesignProject;
  bundle: GeneratedWebsiteBundle;
  isGenerating?: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onExportZip: () => void;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  project,
  bundle,
  isGenerating = false,
  onClose,
  onExportZip,
}) => {
  const { t } = useI18n();

  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js' | 'react'>('preview');
  const [iframeKey, setIframeKey] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const viewportWidthMap: Record<ViewportMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  };

  const getCodeForTab = (): string => {
    if (activeTab === 'html') return bundle.html;
    if (activeTab === 'css') return bundle.css;
    if (activeTab === 'js') return bundle.js;
    if (activeTab === 'react') return bundle.react;
    return bundle.html;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeForTab());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#09090B] flex flex-col ${
        isFullscreen ? 'p-0' : ''
      }`}
      role="dialog"
      aria-label="Live Website Preview and Code Inspector"
    >
      {/* Top Preview Controls Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-[#111116] border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.preview.backToEditor}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-bold text-white font-display">{project.name}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400">{bundle.providerMessage}</span>
          </div>
        </div>

        {/* Center Viewport & Code Mode Switcher */}
        <div className="flex items-center gap-3">
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewport === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>{t.preview.desktop}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewport === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>{t.preview.tablet}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  viewport === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.preview.mobile}</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
            {(
              [
                { id: 'preview', label: t.preview.livePreviewTab },
                { id: 'html', label: 'HTML5' },
                { id: 'css', label: 'CSS3' },
                { id: 'js', label: 'JS' },
                { id: 'react', label: 'React JSX' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions: Language, Reload, Fullscreen, Export ZIP */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={t.preview.reload}
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title={t.preview.reload}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            aria-label={t.preview.fullscreen}
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title={t.preview.fullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onExportZip}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.preview.downloadZip}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#09090B] overflow-hidden flex flex-col items-center justify-center p-4">
        {activeTab === 'preview' ? (
          <div
            style={{ width: viewportWidthMap[viewport] }}
            className="h-full bg-[#0D0D12] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-200 flex flex-col"
          >
            <div className="px-4 py-2 bg-[#14141A] border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>
                https://{project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.sitecraft.app
              </span>
              <span className="tabular-nums">
                {viewport === 'desktop'
                  ? '1440px'
                  : viewport === 'tablet'
                  ? '768px'
                  : '390px'}
              </span>
            </div>

            <iframe
              key={iframeKey}
              title={`Live Preview — ${project.name}`}
              srcDoc={bundle.html}
              sandbox="allow-scripts"
              className="w-full flex-1 bg-[#09090B]"
            />
          </div>
        ) : (
          <div className="w-full max-w-[1280px] h-full bg-[#0E0E14] border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[#14141C] border-b border-zinc-800 flex items-center justify-between">
              <div className="text-xs font-mono text-zinc-300">
                {activeTab === 'html' && 'index.html'}
                {activeTab === 'css' && 'styles.css'}
                {activeTab === 'js' && 'script.js'}
                {activeTab === 'react' && 'src/App.tsx'}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? t.preview.copied : t.preview.copyCode}</span>
              </button>
            </div>
            <pre className="flex-1 p-5 text-xs font-mono text-zinc-200 overflow-auto leading-relaxed">
              {getCodeForTab()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
