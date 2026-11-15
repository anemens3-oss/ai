import React from 'react';
import { motion } from 'motion/react';

export interface ColoredTechNode {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  size: 'sm' | 'md' | 'lg';
  depth: 'fore' | 'mid' | 'deep';
  top: string;
  left: string;
  floatVariant: 'a' | 'b' | 'c';
  duration: string;
  delay: number;
  mobileVisible?: boolean;
  svg: React.ReactNode;
}

export const HERO_COLORED_LOGOS: ColoredTechNode[] = [
  {
    id: 'react',
    name: 'React',
    color: '#61DAFB',
    glowColor: 'rgba(97, 218, 251, 0.35)',
    size: 'lg',
    depth: 'fore',
    top: '6%',
    left: '6%',
    floatVariant: 'a',
    duration: '19s',
    delay: 0.05,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2.3" fill="#61DAFB" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.6" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.2"
          stroke="#61DAFB"
          strokeWidth="1.6"
          transform="rotate(60 12 12)"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4.2"
          stroke="#61DAFB"
          strokeWidth="1.6"
          transform="rotate(120 12 12)"
        />
      </svg>
    ),
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    color: '#3178C6',
    glowColor: 'rgba(49, 120, 198, 0.38)',
    size: 'lg',
    depth: 'fore',
    top: '7%',
    left: '85%',
    floatVariant: 'b',
    duration: '21s',
    delay: 0.12,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path
          fill="#FFFFFF"
          d="M13.6 12.1h-2.9v8.1H8.4v-8.1H5.5v-2h8.1v2zm1.6 6.2c.6.4 1.5.7 2.4.7.9 0 1.5-.3 1.5-.9 0-.6-.5-.9-1.7-1.3-1.6-.6-2.5-1.3-2.5-2.7 0-1.5 1.3-2.6 3.3-2.6 1 0 1.9.2 2.5.6l-.5 1.8c-.5-.3-1.2-.5-1.9-.5-.9 0-1.3.3-1.3.8 0 .5.5.8 1.8 1.3 1.7.6 2.5 1.4 2.5 2.8 0 1.6-1.3 2.8-3.6 2.8-1.1 0-2.2-.3-2.8-.7l.3-2.1z"
        />
      </svg>
    ),
  },
  {
    id: 'html5',
    name: 'HTML5',
    color: '#E34F26',
    glowColor: 'rgba(227, 79, 38, 0.34)',
    size: 'md',
    depth: 'mid',
    top: '20%',
    left: '3%',
    floatVariant: 'c',
    duration: '23s',
    delay: 0.18,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path fill="#E34F26" d="M2 1h20l-1.8 19.8L12 23l-8.2-2.2L2 1z" />
        <path fill="#EF652A" d="M12 2.7v18.5l6.6-1.8L20.1 2.7H12z" />
        <path
          fill="#FFFFFF"
          d="M6.2 6.5h11.6l-.2 2.3H8.7l.2 2.4h8.5l-.6 6.7L12 19.3l-4.8-1.4-.3-3.6h2.3l.2 1.8 2.6.7 2.6-.7.3-2.9H6.7l-.5-6.7z"
        />
      </svg>
    ),
  },
  {
    id: 'css3',
    name: 'CSS3',
    color: '#1572B6',
    glowColor: 'rgba(21, 114, 182, 0.34)',
    size: 'md',
    depth: 'mid',
    top: '21%',
    left: '88%',
    floatVariant: 'a',
    duration: '25s',
    delay: 0.24,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path fill="#1572B6" d="M2 1h20l-1.8 19.8L12 23l-8.2-2.2L2 1z" />
        <path fill="#33A9DC" d="M12 2.7v18.5l6.6-1.8L20.1 2.7H12z" />
        <path
          fill="#FFFFFF"
          d="M17.8 5.2H6.2l.2 2.3h9l-.2 2.4H9.3l.2 2.3h5.4l-.3 3.1-2.6.7-2.6-.7-.2-1.9H6.9l.3 3.4L12 18.2l4.8-1.4L17.8 5.2z"
        />
      </svg>
    ),
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    color: '#F7DF1E',
    glowColor: 'rgba(247, 223, 30, 0.32)',
    size: 'md',
    depth: 'fore',
    top: '35%',
    left: '14%',
    floatVariant: 'b',
    duration: '20s',
    delay: 0.3,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path
          fill="#000000"
          d="M10.8 17.4c0 1.9-1.1 2.8-2.8 2.8-1.5 0-2.4-.8-2.8-1.7l1.6-1c.3.5.6.9 1.2.9.6 0 1-.2 1-1.2v-6.4h1.8v6.6zm4.7 2.8c-1.8 0-3-.9-3.5-2l1.6-.9c.4.7 1 1.2 2 1.2.8 0 1.4-.4 1.4-1 0-.7-.5-1-1.5-1.4l-.5-.2c-1.5-.6-2.5-1.4-2.5-3 0-1.5 1.1-2.6 2.9-2.6 1.3 0 2.2.4 2.8 1.6l-1.5 1c-.3-.6-.7-.9-1.3-.9-.6 0-1 .4-1 .9 0 .6.4.9 1.3 1.3l.5.2c1.8.8 2.8 1.6 2.8 3.2 0 1.8-1.4 2.6-3.5 2.6z"
        />
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    color: '#A259FF',
    glowColor: 'rgba(162, 89, 255, 0.36)',
    size: 'lg',
    depth: 'fore',
    top: '34%',
    left: '82%',
    floatVariant: 'c',
    duration: '18s',
    delay: 0.35,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
        <path d="M8.5 2h3.5v7H8.5a3.5 3.5 0 1 1 0-7z" fill="#F24E1E" />
        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" fill="#FF7262" />
        <circle cx="15.5" cy="12.5" r="3.5" fill="#1ABCFE" />
        <path d="M8.5 9H12v7H8.5a3.5 3.5 0 1 1 0-7z" fill="#A259FF" />
        <path d="M8.5 16H12v3.5a3.5 3.5 0 1 1-3.5-3.5z" fill="#0ACF83" />
      </svg>
    ),
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.34)',
    size: 'md',
    depth: 'mid',
    top: '4%',
    left: '26%',
    floatVariant: 'a',
    duration: '24s',
    delay: 0.4,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#38BDF8" aria-hidden="true">
        <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.47 6 12 6zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C8.39 16.85 9.53 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.47 12 7 12z" />
      </svg>
    ),
  },
  {
    id: 'vite',
    name: 'Vite',
    color: '#646CFF',
    glowColor: 'rgba(100, 108, 255, 0.36)',
    size: 'md',
    depth: 'mid',
    top: '5%',
    left: '71%',
    floatVariant: 'b',
    duration: '22s',
    delay: 0.45,
    mobileVisible: true,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path d="M21 3.5L12 21.5 3 3.5l9 3.6 9-3.6z" fill="#646CFF" />
        <path d="M14.5 2.5L9.8 11.5h3.5l-1.5 6.8 5.4-9.2h-3.4l.7-6.6z" fill="#FFEA83" />
      </svg>
    ),
  },
  {
    id: 'vue',
    name: 'Vue',
    color: '#4FC08D',
    glowColor: 'rgba(79, 192, 141, 0.32)',
    size: 'sm',
    depth: 'deep',
    top: '15%',
    left: '21%',
    floatVariant: 'c',
    duration: '27s',
    delay: 0.5,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path d="M2 3h4l6 10.4L18 3h4L12 20.5 2 3z" fill="#4FC08D" />
        <path d="M6.2 3h3.6L12 6.9 14.2 3h3.6L12 13.2 6.2 3z" fill="#35495E" />
      </svg>
    ),
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    color: '#5FA04E',
    glowColor: 'rgba(95, 160, 78, 0.32)',
    size: 'md',
    depth: 'mid',
    top: '34%',
    left: '2%',
    floatVariant: 'a',
    duration: '26s',
    delay: 0.55,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path
          d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"
          fill="#5FA04E"
          fillOpacity="0.22"
          stroke="#5FA04E"
          strokeWidth="1.7"
        />
        <path
          d="M9.5 9.5v5l2.5 1.5 2.5-1.5v-3L12 10l-2.5 1.5"
          stroke="#83CD29"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'python',
    name: 'Python',
    color: '#3776AB',
    glowColor: 'rgba(55, 118, 171, 0.32)',
    size: 'md',
    depth: 'deep',
    top: '35%',
    left: '92%',
    floatVariant: 'b',
    duration: '29s',
    delay: 0.6,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path
          fill="#3776AB"
          d="M11.9 2C7.8 2 8.1 3.8 8.1 3.8v2h3.9v.7H6.5S4 6.2 4 10.2s2.2 3.8 2.2 3.8h1.3v-1.9s-.1-2.2 2.2-2.2h3.8s2.1 0 2.1-2V4.2S16.1 2 11.9 2zm-2 1.3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"
        />
        <path
          fill="#FFD43B"
          d="M12.1 22c4.1 0 3.8-1.8 3.8-1.8v-2H12v-.7h5.5S20 17.8 20 13.8s-2.2-3.8-2.2-3.8h-1.3v1.9s.1 2.2-2.2 2.2h-3.8s-2.1 0-2.1 2v3.7S7.9 22 12.1 22zm2-1.3a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"
        />
      </svg>
    ),
  },
  {
    id: 'php',
    name: 'PHP',
    color: '#777BB4',
    glowColor: 'rgba(119, 123, 180, 0.3)',
    size: 'sm',
    depth: 'deep',
    top: '27%',
    left: '10%',
    floatVariant: 'c',
    duration: '31s',
    delay: 0.65,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="10" ry="5.8" fill="#777BB4" />
        <text
          x="12"
          y="14"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          PHP
        </text>
      </svg>
    ),
  },
  {
    id: 'git',
    name: 'Git',
    color: '#F05032',
    glowColor: 'rgba(240, 80, 50, 0.32)',
    size: 'sm',
    depth: 'mid',
    top: '15%',
    left: '77%',
    floatVariant: 'a',
    duration: '24s',
    delay: 0.7,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
        <path
          fill="#F05032"
          d="M21.6 11.1L12.9 2.4a1.3 1.3 0 0 0-1.8 0L9.3 4.2l2.3 2.3a1.5 1.5 0 0 1 1.9 1.9l2.2 2.2a1.5 1.5 0 1 1-.9.9L12.7 9.4v5.5a1.5 1.5 0 1 1-1.2-.1V9.2a1.5 1.5 0 0 1-.8-2L8.4 4.9 2.4 11a1.3 1.3 0 0 0 0 1.8l8.7 8.7a1.3 1.3 0 0 0 1.8 0l8.7-8.6a1.3 1.3 0 0 0 0-1.8z"
        />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#F0F6FC',
    glowColor: 'rgba(240, 246, 252, 0.25)',
    size: 'md',
    depth: 'deep',
    top: '27%',
    left: '74%',
    floatVariant: 'b',
    duration: '28s',
    delay: 0.75,
    mobileVisible: false,
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#F0F6FC" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    ),
  },
];

// Orbital ring items that continuously revolve on circular/elliptical tracks
const ORBIT_INNER_NODES = [
  { id: 'orb-react', angle: 28, color: '#61DAFB', label: 'React 19' },
  { id: 'orb-ts', angle: 148, color: '#3178C6', label: 'TypeScript' },
  { id: 'orb-vite', angle: 268, color: '#FFEA83', label: 'Vite' },
];

const ORBIT_OUTER_NODES = [
  { id: 'orb-html', angle: 12, color: '#E34F26', label: 'HTML5' },
  { id: 'orb-css', angle: 102, color: '#1572B6', label: 'CSS3' },
  { id: 'orb-tailwind', angle: 192, color: '#38BDF8', label: 'Tailwind' },
  { id: 'orb-figma', angle: 282, color: '#A259FF', label: 'Figma AST' },
];

export const HeroTechBackground: React.FC = () => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const depthClasses: Record<'fore' | 'mid' | 'deep', string> = {
    fore: 'sc-parallax-fore opacity-40 md:opacity-95 z-10',
    mid: 'sc-parallax-mid opacity-35 md:opacity-85 blur-[0.4px] z-0',
    deep: 'sc-parallax-deep opacity-30 md:opacity-65 blur-[1.4px] hover:blur-none hover:opacity-100 z-0',
  };

  const floatClassMap: Record<'a' | 'b' | 'c', string> = {
    a: 'animate-sc-float-a',
    b: 'animate-sc-float-b',
    c: 'animate-sc-float-c',
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* 1. Ambient Volumetric Gradient Blobs */}
      <div className="animate-sc-ambient absolute -top-24 left-1/4 w-[540px] h-[360px] rounded-full bg-blue-600/[0.08] blur-[110px]" />
      <div
        style={{ animationDelay: '-6s' }}
        className="animate-sc-ambient absolute top-28 right-1/5 w-[480px] h-[340px] rounded-full bg-indigo-500/[0.07] blur-[120px]"
      />
      <div
        style={{ animationDelay: '-3s' }}
        className="animate-sc-ambient absolute top-64 left-1/2 -translate-x-1/2 w-[780px] h-[300px] rounded-full bg-sky-500/[0.05] blur-[130px]"
      />

      {/* 2. Continuous Orbital Constellation Rings around the Hero Center */}
      <div className="hidden md:flex items-center justify-center absolute top-[230px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        {/* Inner Clockwise Orbit Ring */}
        <div
          style={{ '--orbit-duration': '54s' } as React.CSSProperties}
          className="animate-sc-orbit-cw absolute w-[680px] h-[680px] rounded-full border border-white/[0.045]"
        >
          {ORBIT_INNER_NODES.map((item) => (
            <div
              key={item.id}
              style={{
                transform: `rotate(${item.angle}deg) translateY(-340px) rotate(-${item.angle}deg)`,
              }}
              className="absolute top-1/2 left-1/2 -ml-3 -mt-3"
            >
              <div
                style={{ '--orbit-duration': '54s' } as React.CSSProperties}
                className="animate-sc-orbit-ccw px-2 py-0.5 rounded-full bg-[#0D0D14]/90 border border-white/[0.1] shadow-lg flex items-center gap-1.5"
              >
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                <span className="font-mono text-[9px] text-zinc-300 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Outer Counter-Clockwise Orbit Ring */}
        <div
          style={{ '--orbit-duration': '76s' } as React.CSSProperties}
          className="animate-sc-orbit-ccw absolute w-[1040px] h-[1040px] rounded-full border border-dashed border-white/[0.04]"
        >
          {ORBIT_OUTER_NODES.map((item) => (
            <div
              key={item.id}
              style={{
                transform: `rotate(${item.angle}deg) translateY(-520px) rotate(-${item.angle}deg)`,
              }}
              className="absolute top-1/2 left-1/2 -ml-3 -mt-3"
            >
              <div
                style={{ '--orbit-duration': '76s' } as React.CSSProperties}
                className="animate-sc-orbit-cw px-2 py-0.5 rounded-full bg-[#0B0B12]/80 border border-white/[0.08] flex items-center gap-1.5"
              >
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                <span className="font-mono text-[9px] text-zinc-400 whitespace-nowrap">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. All 14 Colored SVG Technology Badges Floating in Multi-Depth Space */}
      {HERO_COLORED_LOGOS.map((logo) => (
        <div
          key={logo.id}
          style={{
            top: logo.top,
            left: logo.left,
          }}
          className={`absolute ${
            logo.mobileVisible ? 'flex' : 'hidden md:flex'
          } ${depthClasses[logo.depth]}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.72, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.85,
              delay: logo.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              style={
                {
                  '--float-duration': logo.duration,
                  boxShadow: `0 12px 32px -6px rgba(0,0,0,0.75), 0 0 24px -4px ${logo.glowColor}`,
                } as React.CSSProperties
              }
              className={`${floatClassMap[logo.floatVariant]} ${
                sizeClasses[logo.size]
              } pointer-events-auto group relative bg-[#0D0D15]/90 backdrop-blur-md border border-white/[0.12] hover:border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-115 cursor-default`}
            >
              {/* Subtle inner brand radial tint */}
              <div
                style={{
                  background: `radial-gradient(circle at center, ${logo.glowColor}, transparent 72%)`,
                }}
                className="absolute inset-0 rounded-inherit opacity-45 group-hover:opacity-90 transition-opacity"
              />
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                {logo.svg}
              </div>
              {/* Floating label tooltip on hover */}
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#14141D] border border-white/15 font-mono text-[10px] text-white whitespace-nowrap shadow-xl z-30">
                {logo.name}
              </span>
            </div>
          </motion.div>
        </div>
      ))}

      {/* 4. Central Editorial Legibility Shield so Headline & CTAs are 100% crisp */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[430px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6,6,8,0.86) 0%, rgba(6,6,8,0.52) 52%, transparent 80%)',
        }}
      />
    </div>
  );
};
