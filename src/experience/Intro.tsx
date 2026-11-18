import { useEffect, useRef, useState } from 'react';
import { resume } from '@/data/resume';

export interface IntroProps {
  onReadResume: () => void;
  playgroundHref?: string;
}

const IN_PRACTICE: readonly string[] = [
  'Structured a GenAI-powered construction dashboard and used DVF trade-offs to make decisions faster at BCG.',
  'Lead a cross-functional squad at BCG Design Studios and provided UX consultancy across teams at Google (via Vaco).',
  'Designed a construction MVP and starter design system, turning concepts into functional AI prototypes in hours.',
];

function PillarCreative({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg
        className="intro__svg intro__svg--ux"
        viewBox="0 0 420 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Topographic path-mapping and node-validation network from Problem to Map to Validate"
      >
        {/* Topographic contour rings */}
        <g className="ux-contours">
          <ellipse cx="210" cy="170" rx="172" ry="128" className="svg-contour svg-contour--1" />
          <ellipse cx="210" cy="170" rx="136" ry="98" className="svg-contour svg-contour--2" />
          <ellipse cx="210" cy="170" rx="96" ry="68" className="svg-contour svg-contour--3" />
          <ellipse cx="210" cy="170" rx="54" ry="38" className="svg-contour svg-contour--4" />
        </g>

        {/* Subtle coordinate crosshairs */}
        <line x1="34" y1="170" x2="386" y2="170" className="svg-axis" />
        <line x1="210" y1="28" x2="210" y2="312" className="svg-axis" />

        {/* Bezier path: Problem -> Map -> Validate */}
        <path
          d="M 76 232 C 122 232, 146 118, 210 132 C 266 144, 286 96, 344 108"
          className="ux-path-base"
        />
        <path
          d="M 76 232 C 122 232, 146 118, 210 132 C 266 144, 286 96, 344 108"
          className="ux-path-flow"
        />

        {/* Node 1: Problem */}
        <g transform="translate(76, 232)">
          <circle r="18" className="ux-node-pulse ux-node-pulse--1" />
          <circle r="7" className="ux-node-core" />
          <text x="0" y="34" textAnchor="middle" className="svg-label">
            Problem
          </text>
        </g>

        {/* Node 2: Map */}
        <g transform="translate(210, 132)">
          <circle r="20" className="ux-node-pulse ux-node-pulse--2" />
          <circle r="8" className="ux-node-core" />
          <text x="0" y="-26" textAnchor="middle" className="svg-label">
            Map
          </text>
        </g>

        {/* Node 3: Validate */}
        <g transform="translate(344, 108)">
          <circle r="18" className="ux-node-pulse ux-node-pulse--3" />
          <circle r="7" className="ux-node-core ux-node-core--accent" />
          <text x="0" y="34" textAnchor="middle" className="svg-label">
            Validate
          </text>
        </g>
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg
        className="intro__svg intro__svg--dvf"
        viewBox="0 0 420 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Desirability, Viability, and Feasibility alignment rings converging at the center"
      >
        {/* Outer orbital guide */}
        <circle cx="210" cy="170" r="134" className="svg-axis-circle" />

        {/* DVF Venn / Orbital Rings */}
        <g className="dvf-ring dvf-ring--d">
          <circle cx="210" cy="126" r="76" className="dvf-circle" />
          <text x="210" y="76" textAnchor="middle" className="svg-label">
            Desirability
          </text>
        </g>

        <g className="dvf-ring dvf-ring--v">
          <circle cx="168" cy="198" r="76" className="dvf-circle" />
          <text x="122" y="246" textAnchor="middle" className="svg-label">
            Viability
          </text>
        </g>

        <g className="dvf-ring dvf-ring--f">
          <circle cx="252" cy="198" r="76" className="dvf-circle" />
          <text x="298" y="246" textAnchor="middle" className="svg-label">
            Feasibility
          </text>
        </g>

        {/* Rotating satellite dots */}
        <g className="dvf-orbit">
          <circle cx="210" cy="36" r="4" className="dvf-satellite" />
          <circle cx="326" cy="237" r="4" className="dvf-satellite" />
          <circle cx="94" cy="237" r="4" className="dvf-satellite" />
        </g>

        {/* Shared convergence core */}
        <g transform="translate(210, 174)">
          <circle r="22" className="dvf-core-pulse" />
          <circle r="7" className="ux-node-core ux-node-core--accent" />
          <text x="0" y="34" textAnchor="middle" className="svg-label svg-label--strong">
            Aligned
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg
      className="intro__svg intro__svg--make"
      viewBox="0 0 420 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Wireframe to shipped UI kinetic grid with live waveform pulse"
    >
      {/* Background architectural grid */}
      <g className="make-grid">
        <rect x="46" y="42" width="328" height="240" rx="14" className="make-frame" />
        <line x1="46" y1="84" x2="374" y2="84" className="make-divider" />
        <line x1="154" y1="84" x2="154" y2="282" className="make-divider" />
      </g>

      {/* Window chrome dots */}
      <circle cx="68" cy="63" r="4" className="make-dot" />
      <circle cx="84" cy="63" r="4" className="make-dot" />
      <circle cx="100" cy="63" r="4" className="make-dot" />
      <rect x="276" y="55" width="78" height="16" rx="8" className="make-pill make-pill--pulse" />

      {/* Sidebar wireframe blocks */}
      <rect x="64" y="106" width="72" height="12" rx="4" className="make-block make-block--1" />
      <rect x="64" y="130" width="56" height="10" rx="4" className="make-block make-block--2" />
      <rect x="64" y="152" width="64" height="10" rx="4" className="make-block make-block--3" />
      <rect x="64" y="232" width="72" height="28" rx="8" className="make-block-outline" />

      {/* Main UI canvas + live waveform */}
      <rect x="174" y="104" width="180" height="96" rx="10" className="make-canvas" />
      <path
        d="M 186 156 Q 208 120, 232 152 T 278 148 T 324 134 L 342 146"
        className="make-wave-base"
      />
      <path
        d="M 186 156 Q 208 120, 232 152 T 278 148 T 324 134 L 342 146"
        className="make-wave-flow"
      />

      {/* Bottom metric cards */}
      <rect x="174" y="216" width="84" height="46" rx="8" className="make-card" />
      <rect x="270" y="216" width="84" height="46" rx="8" className="make-card" />
      <rect x="186" y="230" width="38" height="8" rx="4" className="make-block make-block--1" />
      <rect x="282" y="230" width="48" height="8" rx="4" className="make-block make-block--2" />

      {/* Stage caption */}
      <text x="210" y="314" textAnchor="middle" className="svg-label">
        Sketch → Prototype → MVP
      </text>
    </svg>
  );
}

export function Intro({ onReadResume, playgroundHref = './water/' }: IntroProps) {
  const { basics, pillars, work, awards, languages } = resume;
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.chapter);
          if (!Number.isNaN(idx)) {
            ratios.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
        }
        let bestIdx = -1;
        let bestRatio = 0;
        for (const [idx, ratio] of ratios.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        }
        if (bestIdx !== -1) {
          setActiveChapter(bestIdx);
        }
      },
      {
        rootMargin: '-32% 0px -32% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    for (const el of chapterRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const currentTeam = work[0]?.team ?? work[0]?.company ?? 'BCG Design Studios';
  const previousCompany = work[1]?.company === 'Vaco (onsite Google)' ? 'Google (via Vaco)' : work[1]?.company;
  const recognitionLabel = `${work[0]?.recognition ? 'BCG Star Awards · ' : ''}${awards.length}× Design & UX Awards`;
  const languageSummary = languages
    .slice(0, 3)
    .map((item) => item.language)
    .join(' / ');

  const trackRecord = [
    { label: 'Current', value: currentTeam },
    { label: 'Previously', value: previousCompany },
    { label: 'Recognition', value: recognitionLabel },
    { label: 'Languages', value: languageSummary },
  ];

  const totalChapters = String(pillars.length).padStart(2, '0');

  return (
    <section className="intro" aria-label="Self introduction">
      <div className="intro__sheet">
        <header className="intro__hero">
          <span className="intro__eyebrow">{basics.title}</span>
          <h2 className="intro__headline">{basics.oneLiner}</h2>
          <p className="intro__tagline">{basics.tagline}</p>

          <div className="intro__meta">
            <span className="intro__name">{basics.name}</span>
            <span className="intro__location">{basics.location.current}</span>
            {basics.location.openToWork?.length ? (
              <span className="intro__location">
                Open to {basics.location.openToWork.join(', ')}
              </span>
            ) : null}
          </div>

          <div className="chips" aria-label="Specialties">
            {basics.specialties.map((specialty) => (
              <span className="chip" key={specialty}>
                {specialty}
              </span>
            ))}
          </div>

          <p className="intro__summary">{basics.summary}</p>
        </header>

        <dl className="intro__track-record" aria-label="Track record at a glance">
          {trackRecord.map((item) => (
            <div className="intro__stat" key={item.label}>
              <dt className="intro__stat-label">{item.label}</dt>
              <dd className="intro__stat-value">{item.value}</dd>
            </div>
          ))}
        </dl>

        <section className="intro__approach" aria-labelledby="intro-approach-heading">
          <div className="intro__section-head">
            <span className="section__index">01</span>
            <h3 id="intro-approach-heading" className="section__title">
              Approach
            </h3>
          </div>

          <div className="intro__scrolly">
            <div className="intro__chapters">
              {pillars.map((pillar, index) => {
                const chapterNumber = String(index + 1).padStart(2, '0');
                const isActive = activeChapter === index;
                return (
                  <article
                    key={pillar.title}
                    ref={(el) => {
                      chapterRefs.current[index] = el;
                    }}
                    data-chapter={index}
                    data-active={isActive ? 'true' : 'false'}
                    className="intro__chapter"
                  >
                    <span className="intro__chapter-index">
                      {chapterNumber} / {totalChapters}
                    </span>
                    <h4 className="intro__chapter-title">{pillar.title}</h4>
                    <p className="intro__chapter-desc">{pillar.description}</p>
                    {IN_PRACTICE[index] ? (
                      <div className="intro__practice">
                        <span className="intro__practice-label">In practice</span>
                        <p className="intro__practice-text">{IN_PRACTICE[index]}</p>
                      </div>
                    ) : null}
                    <div className="intro__chapter-visual-mobile">
                      <PillarCreative index={index} />
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="intro__stage" aria-label="Approach visual stage">
              <div className="intro__stage-frame">
                <div className="intro__stage-header">
                  <span className="intro__stage-counter">
                    {String(activeChapter + 1).padStart(2, '0')} / {totalChapters}
                  </span>
                  <span className="intro__stage-title">{pillars[activeChapter]?.title}</span>
                </div>

                <div className="intro__stage-canvas">
                  {pillars.map((pillar, index) => (
                    <div
                      key={pillar.title}
                      className="intro__scene"
                      data-active={activeChapter === index ? 'true' : 'false'}
                      aria-hidden={activeChapter !== index}
                    >
                      <PillarCreative index={index} />
                    </div>
                  ))}
                </div>

                <div className="intro__stage-dots" aria-hidden="true">
                  {pillars.map((pillar, index) => (
                    <span
                      key={pillar.title}
                      className="intro__stage-dot"
                      data-active={activeChapter === index ? 'true' : 'false'}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <footer className="intro__actions">
          <button type="button" className="intro__cta" onClick={onReadResume}>
            Read full resume
          </button>
          <a href={playgroundHref} className="water-link">
            Explore the water
          </a>
        </footer>
      </div>
    </section>
  );
}
