import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Resume } from '@/resume/Resume';
import { Opening } from '@/experience/Opening';
import { Intro } from '@/experience/Intro';
import { Playground } from '@/experience/Playground';
import { createGridSurface } from '@/grid';

type PortfolioTab = 'intro' | 'resume';

const tabFromHash = (): PortfolioTab =>
  typeof window !== 'undefined' && window.location.hash === '#resume' ? 'resume' : 'intro';

function PortfolioTabs() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>(tabFromHash);
  const introTabRef = useRef<HTMLButtonElement>(null);
  const resumeTabRef = useRef<HTMLButtonElement>(null);

  const selectTab = useCallback((next: PortfolioTab, { scrollTop = false } = {}) => {
    setActiveTab(next);
    const nextHash = `#${next}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const syncFromLocation = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
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

  return (
    <>
      <nav className="portfolio-tabs no-print" aria-label="Portfolio sections">
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
      </nav>

      {activeTab === 'intro' ? (
        <div role="tabpanel" id="panel-intro" aria-labelledby="tab-intro">
          <Opening
            createSurface={createGridSurface}
            playgroundHref="./water/"
            onReadResume={() => selectTab('resume', { scrollTop: true })}
          />
          <Intro
            playgroundHref="./water/"
            onReadResume={() => selectTab('resume', { scrollTop: true })}
          />
        </div>
      ) : (
        <div role="tabpanel" id="panel-resume" aria-labelledby="tab-resume">
          <Resume />
        </div>
      )}
    </>
  );
}

export const App = ({ page = 'portfolio' }: { page?: 'portfolio' | 'water' }) =>
  page === 'water' ? (
    <Playground createSurface={createGridSurface} portfolioHref="../" />
  ) : (
    <PortfolioTabs />
  );
