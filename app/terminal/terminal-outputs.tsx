import Link from "next/link";
import { profile } from "../data/profile";
import { experiences, NAME_ART, projects, TELKOM_LOGO } from "./terminal-data";
import type { Project } from "./terminal-data";

export function Prompt() {
  return (
    <>
      <span className="text-term-red">{profile.user}</span>
      <span className="text-term-dim">@</span>
      <span className="text-term-bright">{profile.host}</span>
      <span className="text-term-dim">:~$</span>
    </>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const isExternalLink = href?.startsWith("http") ?? false;

  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-term-dim">{label}</dt>
      <dd className="min-w-0 text-term-ink">
        {href ? (
          <a
            href={href}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noreferrer" : undefined}
            className="text-term-brass underline decoration-term-brass/30 underline-offset-4 transition-colors hover:decoration-term-brass"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function FetchOutput() {
  return (
    <div className="my-3 flex flex-col gap-5 sm:flex-row sm:gap-8">
      <pre
        aria-hidden="true"
        className="select-none overflow-hidden text-[6px] leading-none text-term-brand/90 sm:text-[9px]"
      >
        {TELKOM_LOGO}
      </pre>

      <div className="min-w-0">
        <p>
          <span className="text-term-red">{profile.user}</span>
          <span className="text-term-dim">@</span>
          <span className="text-term-bright">{profile.host}</span>
        </p>
        <p className="text-term-line">-------------------</p>

        <dl className="mt-1 space-y-0.5 text-[12px] leading-6 sm:text-[13px]">
          <InfoRow label="University" value={profile.university} />
          <InfoRow label="Major" value={profile.major} />
          <InfoRow label="Graduation" value={profile.graduation} />
          <InfoRow label="GPA" value={profile.gpa} />
          <InfoRow label="Focus" value={profile.focus} />
          <InfoRow label="Stack" value={profile.stack} />
          <InfoRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
          <InfoRow label="WhatsApp" value={profile.phone} href={profile.whatsapp} />
          <InfoRow label="GitHub" value={profile.githubLabel} href={profile.github} />
        </dl>
      </div>
    </div>
  );
}

function ProjectLink({ project }: { project: Project }) {
  if (!project.href) {
    return <span className="text-term-dim">{project.linkLabel ?? "soon"}</span>;
  }

  const isExternalLink = project.href.startsWith("http");
  const linkClassName =
    "text-term-brass underline decoration-term-brass/30 underline-offset-4 transition-colors hover:decoration-term-brass";

  if (isExternalLink) {
    return (
      <a href={project.href} target="_blank" rel="noreferrer" className={linkClassName}>
        {project.linkLabel} ↗
      </a>
    );
  }

  return (
    <Link href={project.href} className={linkClassName}>
      {project.linkLabel} →
    </Link>
  );
}

export function ProjectsOutput() {
  return (
    <div className="my-2 space-y-2">
      {projects.map((project) => (
        <div
          key={project.name}
          className="grid gap-0.5 sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-4"
        >
          <span className="text-term-bright">{project.name}</span>
          <span className="text-term-dim">{project.description}</span>
          <ProjectLink project={project} />
        </div>
      ))}
    </div>
  );
}

export function ExperienceOutput() {
  return (
    <div className="my-3 space-y-8">
      {experiences.map((experience) => {
        const hasDetails = Boolean(experience.organization || experience.period);

        return (
          <div key={experience.title}>
            <p className="text-term-bright">{experience.title}</p>

            {hasDetails ? (
              <p className="text-term-dim">
                {[experience.organization, experience.period].filter(Boolean).join(" | ")}
              </p>
            ) : null}

            {experience.bullets ? (
              <ul className="mt-1 space-y-1 pl-3">
                {experience.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span aria-hidden="true" className="text-term-dim">
                      •
                    </span>
                    <span className="min-w-0 flex-1">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function NameArt() {
  return (
    <pre
      aria-label="M. AFANDI HARAHAP"
      className="my-2 select-none overflow-hidden font-mono text-[6px] leading-[1.15] text-term-brass sm:text-[10px]"
    >
      {NAME_ART}
    </pre>
  );
}

export function ContactOutput() {
  return (
    <dl className="my-2 space-y-0.5">
      <InfoRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
      <InfoRow label="WhatsApp" value={profile.phone} href={profile.whatsapp} />
      <InfoRow label="GitHub" value={profile.githubLabel} href={profile.github} />
    </dl>
  );
}
