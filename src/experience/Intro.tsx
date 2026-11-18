import { resume } from '@/data/resume';

export interface IntroProps {
  onReadResume: () => void;
  playgroundHref?: string;
}

export function Intro({ onReadResume, playgroundHref = './water/' }: IntroProps) {
  const { basics, pillars } = resume;

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

        <section className="intro__approach" aria-labelledby="intro-approach-heading">
          <div className="intro__section-head">
            <span className="section__index">01</span>
            <h3 id="intro-approach-heading" className="section__title">
              Approach
            </h3>
          </div>
          <div className="intro__pillars">
            {pillars.map((pillar) => (
              <article className="intro__pillar" key={pillar.title}>
                <h4 className="entry__title">{pillar.title}</h4>
                <p className="entry__detail">{pillar.description}</p>
              </article>
            ))}
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
