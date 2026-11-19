import { useEffect, useRef, useState } from 'react';
import { resume } from '@/data/resume';
import { ApproachLatticeStage } from './ApproachLatticeStage';

export interface IntroProps {
  onReadResume: () => void;
  playgroundHref?: string;
}

const IN_PRACTICE: readonly string[] = [
  'Structured a GenAI-powered construction dashboard and used DVF trade-offs to make decisions faster at BCG.',
  'Lead a cross-functional squad at BCG Design Studios and provided UX consultancy across teams at Google (via Vaco).',
  'Designed a construction MVP and starter design system, turning concepts into functional AI prototypes in hours.',
];

export function IntroBand() {
  const { basics, work, awards, languages } = resume;
  const currentTeam = work[0]?.team ?? work[0]?.company ?? 'BCG Design Studios';
  const previousCompany =
    work[1]?.company === 'Vaco (onsite Google)' ? 'Google (via Vaco)' : work[1]?.company;
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

  return (
    <div className="intro__band" aria-label="Overview and track record">
      <header className="intro__hero">
        <h2 className="intro__headline">{basics.oneLiner}</h2>
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
    </div>
  );
}

export function Intro({ onReadResume, playgroundHref = './water/' }: IntroProps) {
  const { pillars } = resume;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealedChapters, setRevealedChapters] = useState<boolean[]>(() =>
    pillars.map(() => false),
  );
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const els = chapterRefs.current;
      const c0 = els[0] ? els[0].getBoundingClientRect().top + els[0].getBoundingClientRect().height * 0.5 : null;
      const c1 = els[1] ? els[1].getBoundingClientRect().top + els[1].getBoundingClientRect().height * 0.5 : null;
      const c2 = els[2] ? els[2].getBoundingClientRect().top + els[2].getBoundingClientRect().height * 0.5 : null;

      if (c0 === null || c1 === null || c2 === null) return;

      const anchorY = window.innerHeight * 0.46;
      let next = 0;
      if (anchorY <= c0) {
        next = 0;
      } else if (anchorY <= c1) {
        next = c1 > c0 ? (anchorY - c0) / (c1 - c0) : 0;
      } else if (anchorY <= c2) {
        next = c2 > c1 ? 1 + (anchorY - c1) / (c2 - c1) : 1;
      } else {
        next = 2;
      }

      const clamped = Math.max(0, Math.min(2, next));
      setScrollProgress((prev) => (Math.abs(prev - clamped) > 0.002 ? clamped : prev));
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    if (motionQuery?.matches || typeof IntersectionObserver === 'undefined') {
      setRevealedChapters(pillars.map(() => true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idxAttr = entry.target.getAttribute('data-chapter');
          const idx = idxAttr !== null ? Number(idxAttr) : -1;
          if (idx >= 0) {
            setRevealedChapters((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22 },
    );

    chapterRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pillars.length]);

  const activeChapter = Math.max(0, Math.min(pillars.length - 1, Math.round(scrollProgress)));
  const totalChapters = String(pillars.length).padStart(2, '0');

  return (
    <section className="intro" aria-label="Self introduction">
      <div className="intro__sheet">
        <section className="intro__approach" aria-labelledby="intro-approach-heading">
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
                    className={`intro__chapter${revealedChapters[index] ? ' is-revealed' : ''}`}
                  >
                    <span className="intro__chapter-index">
                      {index === 0 ? (
                        <span id="intro-approach-heading">Approach · </span>
                      ) : null}
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
                    {index === pillars.length - 1 ? (
                      <div className="intro__chapter-cta">
                        <button type="button" className="intro__cta" onClick={onReadResume}>
                          Read full resume
                        </button>
                      </div>
                    ) : null}
                    <div className="intro__chapter-visual-mobile">
                      <ApproachLatticeStage
                        progress={index}
                        staticProgress={index}
                        variant="inline"
                        ariaLabel={`${pillar.title} dot-lattice diagram`}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="intro__stage" aria-label="Approach visual stage">
              <ApproachLatticeStage progress={scrollProgress} variant="stage" />
            </aside>
          </div>
        </section>

        <footer className="intro__actions">
          <a href={playgroundHref} className="intro__explore">
            Explore the water
          </a>
        </footer>
      </div>
    </section>
  );
}
