import type { ReactNode } from 'react';

import {
  resume,
  type Award,
  type Education,
  type Work,
} from '@/data/resume';
import headshot from '../../docs/resume/choiyoojin-profile-headshot.png';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (value: string | null): string => {
  if (value === null) return 'Present';
  const [year, month] = value.split('-');
  if (!month) return year;
  return `${MONTHS[Number(month) - 1]} ${year}`;
};

const dateRange = (start: string, end: string | null): string =>
  `${formatDate(start)} — ${formatDate(end)}`;

interface SectionProps {
  index: string;
  title: string;
  note?: string;
  children: ReactNode;
}

const Section = ({ index, title, note, children }: SectionProps) => (
  <section className="section">
    <div className="section__head">
      <div className="section__index">{index}</div>
      <h2 className="section__title">{title}</h2>
      {note ? <p className="section__note">{note}</p> : null}
    </div>
    <div className="section__body">{children}</div>
  </section>
);

const ExperienceItem = ({ job }: { job: Work }) => (
  <article className="xp__item">
    <div className="xp__top">
      <div>
        <span className="xp__role">{job.position}</span>
        <span className="xp__company">{job.company}</span>
      </div>
      <span className="xp__dates">{dateRange(job.startDate, job.endDate)}</span>
    </div>

    <div className="xp__context">
      {job.team ? <span>{job.team}</span> : null}
      {job.employmentType ? <span>{job.employmentType}</span> : null}
      {job.location ? <span>{job.location}</span> : null}
      {job.workMode ? <span>{job.workMode}</span> : null}
    </div>

    <p className="xp__summary">{job.summary}</p>

    {job.highlights ? (
      <ul className="xp__list">
        {job.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    ) : null}

    {job.subRoles?.map((sr) => (
      <div className="xp__subrole" key={sr.period}>
        <div className="xp__subrole-head">
          <span>{sr.period} · </span>
          {sr.title} — {sr.role}
        </div>
        <ul className="xp__list">
          {sr.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    ))}

    {job.recognition ? (
      <span className="xp__recognition">★ {job.recognition}</span>
    ) : null}

    {job.skills ? (
      <div className="chips xp__skills">
        {job.skills.map((s) => (
          <span className="chip" key={s}>
            {s}
          </span>
        ))}
      </div>
    ) : null}
  </article>
);

const EducationEntry = ({ edu }: { edu: Education }) => (
  <div>
    <div className="entry__title">{edu.institution}</div>
    <div className="entry__sub">
      {edu.degree}
      {edu.area ? ` — ${edu.area}` : ''}
    </div>
    <div className="entry__meta">
      {edu.startDate}–{edu.endDate}
      {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
    </div>
    {edu.coursework?.graduationWork ? (
      <p className="entry__detail">
        Graduation work: {edu.coursework.graduationWork}
      </p>
    ) : null}
    {edu.activities?.length ? (
      <p className="entry__detail">Activities: {edu.activities.join(', ')}</p>
    ) : null}
  </div>
);

const AwardEntry = ({ award }: { award: Award }) => (
  <div>
    <div className="award__result">{award.result}</div>
    <div className="entry__title">{award.title}</div>
    <div className="entry__meta">
      {formatDate(award.date)} · {award.category}
    </div>
  </div>
);

const downloadPdf = () => {
  const previousTitle = document.title;
  document.title = 'Yoojin Choi — Resume';
  const restore = () => {
    document.title = previousTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  window.print();
};

export const Resume = () => {
  const { basics } = resume;

  return (
    <div className="page">
      <main className="sheet" data-ripple-safe="primary">
        <div className="hero">
          <div className="hero__top">
            <span className="hero__eyebrow">{basics.title}</span>
            <button
              type="button"
              className="masthead__action no-print"
              onClick={downloadPdf}
            >
              Download PDF
            </button>
          </div>
          <h1 className="hero__tagline">{basics.tagline}</h1>
          <div className="hero__meta">
            <img
              className="hero__photo"
              src={headshot}
              alt={basics.name}
              width={72}
              height={72}
            />
            <div className="hero__ident">
              <span className="hero__name">{basics.name}</span>
              <span className="hero__role">
                {basics.specialties.join(' · ')}
              </span>
              <span className="hero__role hero__role--loc">
                {basics.location.current}
              </span>
            </div>
          </div>
          <p className="hero__summary">{basics.summary}</p>
        </div>

        <Section index="01" title="Approach">
          <div className="grid2">
            {resume.pillars.map((p) => (
              <div key={p.title}>
                <div className="entry__title">{p.title}</div>
                <p className="entry__detail">{p.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="02" title="Experience">
          <div className="xp">
            {resume.work.map((job) => (
              <ExperienceItem key={`${job.company}-${job.startDate}`} job={job} />
            ))}
          </div>
        </Section>

        <Section index="03" title="Skills">
          <div className="skills">
            {resume.skills.map((group) => (
              <div className="skills__group" key={group.category}>
                <div className="skills__cat">{group.category}</div>
                <div className="chips">
                  {group.keywords.map((k) => (
                    <span className="chip" key={k}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section index="04" title="Education">
          <div className="grid2">
            {resume.education.map((edu) => (
              <EducationEntry key={edu.institution} edu={edu} />
            ))}
          </div>
        </Section>

        <Section
          index="05"
          title="Awards"
          note="Application idea, design, and research competitions."
        >
          <div className="grid2">
            {resume.awards.map((a) => (
              <AwardEntry key={a.title} award={a} />
            ))}
          </div>
        </Section>

        <Section
          index="06"
          title="Certifications"
          note={resume.certificationsNote}
        >
          <div className="grid2">
            {resume.certifications.map((c) => (
              <div key={c.name}>
                <div className="entry__title">{c.name}</div>
                <div className="entry__sub">{c.issuer}</div>
                <div className="entry__meta">
                  Issued {formatDate(c.date)}
                  {c.credentialId ? ` · ID ${c.credentialId}` : ''}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section index="07" title="Languages">
          <div>
            {resume.languages.map((l) => (
              <div className="lang" key={l.language}>
                <span className="lang__name">{l.language}</span>
                <span className="lang__level">{l.fluency}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section index="08" title="Also">
          <div className="grid2">
            {resume.volunteerAndOther.map((o) => (
              <div key={o.role}>
                <div className="entry__title">{o.role}</div>
                <div className="entry__sub">{o.organization}</div>
                <div className="entry__meta">
                  {dateRange(o.startDate, o.endDate)}
                  {o.languages ? ` · ${o.languages.join(', ')}` : ''}
                </div>
                {o.summary ? <p className="entry__detail">{o.summary}</p> : null}
              </div>
            ))}
          </div>
        </Section>

        {resume.recommendations.length ? (
          <Section index="09" title="Recommendation">
            {resume.recommendations.map((r) => (
              <blockquote className="quote" key={r.name}>
                <p className="quote__text">“{r.text}”</p>
                <footer className="quote__by">
                  <strong>{r.name}</strong> — {r.title}
                  <br />
                  {r.relationship}
                </footer>
              </blockquote>
            ))}
          </Section>
        ) : null}
      </main>

      <footer className="colophon">
        <span>
          {basics.name} · {basics.location.current}
        </span>
        <span>
          {basics.email ? (
            <a href={`mailto:${basics.email}`}>{basics.email}</a>
          ) : null}
        </span>
      </footer>
    </div>
  );
};
