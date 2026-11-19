import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { resume } from '@/data/resume';
import { Resume } from '@/resume/Resume';
import { Opening } from '@/experience/Opening';
import { Intro, IntroBand } from '@/experience/Intro';
import { ChatWidget } from '@/experience/ChatWidget';
import { Playground } from '@/experience/Playground';
import { SurfaceCanvas } from '@/experience/SurfaceCanvas';
import type { SurfaceController } from '@/experience/types';
import { useMotionPreference } from '@/experience/useMotionPreference';
import { createGridSurface } from '@/grid';

type PortfolioTab = 'intro' | 'resume';

const tabFromHash = (): PortfolioTab =>
  typeof window !== 'undefined' && window.location.hash === '#resume' ? 'resume' : 'intro';

function PortfolioTabs() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>(tabFromHash);
  const [scrolled, setScrolled] = useState(false);
  const [sideSheetOpen, setSideSheetOpen] = useState(false);
  const reducedMotion = useMotionPreference();
  const introTabRef = useRef<HTMLButtonElement>(null);
  const resumeTabRef = useRef<HTMLButtonElement>(null);
  const resumeSurfaceRef = useRef<SurfaceController | null>(null);
  const heroChatAnchorRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionsRef = useRef<Record<PortfolioTab, number>>({ intro: 0, resume: 0 });

  const selectTab = useCallback(
    (next: PortfolioTab, { scrollTop = false } = {}) => {
      if (next !== activeTab) {
        scrollPositionsRef.current[activeTab] = window.scrollY;
      }
      setActiveTab(next);
      const nextHash = `#${next}`;
      if (window.location.hash !== nextHash) {
        window.history.pushState(null, '', nextHash);
      }
      const targetY = scrollTop ? 0 : scrollPositionsRef.current[next];
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      });
    },
    [activeTab],
  );

  useEffect(() => {
    const syncFromLocation = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    let next: PortfolioTab;
    if (event.key === 'Home') {
      next = 'intro';
    } else if (event.key === 'End') {
      next = 'resume';
    } else {
      next = activeTab === 'intro' ? 'resume' : 'intro';
    }
    selectTab(next);
    (next === 'intro' ? introTabRef : resumeTabRef).current?.focus();
  };

  const handleResumePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !window.innerWidth || !window.innerHeight) return;
    const nx = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
    const ny = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
    resumeSurfaceRef.current?.hover?.(nx, ny);
  };

  const handleResumePointerLeave = () => {
    resumeSurfaceRef.current?.leave?.();
  };

  const { basics } = resume;
  const linkedinUrl = basics.profiles.find((p) => p.network.toLowerCase() === 'linkedin')?.url;

  return (
    <div className={`portfolio-shell${sideSheetOpen ? ' portfolio-shell--pushed' : ''}`}>
      <nav
        className={`portfolio-tabs no-print${scrolled ? ' portfolio-tabs--scrolled' : ''}`}
        aria-label="Portfolio sections"
      >
        <p className="portfolio-tabs__name">{basics.name}</p>
        <div className="portfolio-tabs__right">
          <div className="portfolio-tabs__icons" aria-label="Contact links">
            {basics.email ? (
              <a
                href={`mailto:${basics.email}`}
                className="portfolio-tabs__icon"
                aria-label={`Email ${basics.email}`}
                title={basics.email}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            ) : null}
            {basics.phone ? (
              <a
                href={`tel:${basics.phone.replace(/[^+\d]/g, '')}`}
                className="portfolio-tabs__icon"
                aria-label={`Call ${basics.phone}`}
                title={basics.phone}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            ) : null}
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="portfolio-tabs__icon"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            ) : null}
          </div>
          <div
            className="portfolio-tabs__list"
            role="tablist"
            aria-label="Portfolio view"
            onKeyDown={handleTabKeyDown}
          >
          <button
            ref={introTabRef}
            type="button"
            role="tab"
            id="tab-intro"
            className="portfolio-tabs__tab"
            aria-selected={activeTab === 'intro'}
            aria-controls="panel-intro"
            tabIndex={activeTab === 'intro' ? 0 : -1}
            onClick={() => selectTab('intro')}
          >
            Intro
          </button>
          <button
            ref={resumeTabRef}
            type="button"
            role="tab"
            id="tab-resume"
            className="portfolio-tabs__tab"
            aria-selected={activeTab === 'resume'}
            aria-controls="panel-resume"
            tabIndex={activeTab === 'resume' ? 0 : -1}
            onClick={() => selectTab('resume')}
          >
            Resume
          </button>
          </div>
        </div>
      </nav>

      {activeTab === 'intro' ? (
        <div role="tabpanel" id="panel-intro" aria-labelledby="tab-intro">
          <Opening
            createSurface={createGridSurface}
            playgroundHref="./water/"
            onReadResume={() => selectTab('resume', { scrollTop: true })}
            heroChatAnchorRef={heroChatAnchorRef}
          >
            <IntroBand />
          </Opening>
          <Intro
            playgroundHref="./water/"
            onReadResume={() => selectTab('resume', { scrollTop: true })}
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="panel-resume"
          aria-labelledby="tab-resume"
          onPointerMove={handleResumePointerMove}
          onPointerLeave={handleResumePointerLeave}
        >
          <div className="ripple-host no-print" aria-hidden="true">
            <SurfaceCanvas
              createSurface={createGridSurface}
              paused={reducedMotion}
              strength={0.65}
              ambient={true}
              allowPageScroll
              onController={(next) => {
                resumeSurfaceRef.current = next;
              }}
            />
          </div>
          <section id="resume" aria-label="Resume">
            <Resume />
          </section>
        </div>
      )}
      <ChatWidget
        heroAnchorRef={heroChatAnchorRef}
        dockedOnly={activeTab !== 'intro'}
        onSideSheetChange={setSideSheetOpen}
      />
    </div>
  );
}

export const App = ({ page = 'portfolio' }: { page?: 'portfolio' | 'water' }) =>
  page === 'water' ? (
    <Playground createSurface={createGridSurface} portfolioHref="../" />
  ) : (
    <PortfolioTabs />
  );
