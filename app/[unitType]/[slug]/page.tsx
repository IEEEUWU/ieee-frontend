import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { societies, type SocietyId } from "@/lib/units";
import { SiteHeader } from "@/components/navigation/site-header";
import { Footer } from "@/components/sections/footer";
import { ArrowLeft, Check, Clock, Globe, ArrowSquareOut } from "@phosphor-icons/react/ssr";

interface PageProps {
  params: Promise<{
    unitType: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [
    { unitType: "chapters", slug: "ias" },
    { unitType: "chapters", slug: "cs" },
    { unitType: "chapters", slug: "ras" },
    { unitType: "affinity", slug: "wie" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const unit = societies.find((s) => s.id === (slug as SocietyId));
  if (!unit) return { title: "Unit Not Found" };

  return {
    title: `${unit.name} (${unit.abbreviation}) · IEEE UWU Student Branch`,
    description: unit.scope,
  };
}

export default async function UnitPortalPage({ params }: PageProps) {
  const { unitType, slug } = await params;
  const unit = societies.find((s) => s.id === (slug as SocietyId));

  if (!unit) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="page-stack min-h-[70vh] bg-background pt-24 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Return Navigation */}
          <div className="border-b border-border pb-6">
            <Link
              href="/#societies"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-subtle transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Back to IEEE Student Branch</span>
            </Link>
          </div>

          {/* Unit Hero Header */}
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              {unit.logo ? (
                <Image
                  src={unit.logo.src}
                  alt=""
                  width={unit.logo.width}
                  height={unit.logo.height}
                  sizes="224px"
                  className="mb-6 h-14 w-56 object-contain object-left"
                />
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: unit.colour.brand }}
                  aria-hidden="true"
                />
                <span
                  className="label-mono font-bold"
                  style={{ color: unit.colour.ink }}
                >
                  {unit.abbreviation}
                </span>
                <span className="text-subtle">&middot;</span>
                <span className="label-mono text-subtle">{unit.unitTypeLabel}</span>
                <span className="text-subtle">&middot;</span>
                <span className="label-mono text-subtle">
                  Chartered under IEEE Student Branch
                </span>
              </div>

              <h1 className="mt-4 text-[clamp(2rem,3.5vw,3rem)] font-bold leading-tight tracking-[-0.035em]">
                {unit.name}
              </h1>

              <p className="mt-6 max-w-[62ch] text-[clamp(1.05rem,1.3vw,1.2rem)] leading-relaxed text-muted">
                {unit.scope}
              </p>

              {/* Portal Deployment Notice */}
              <div className="mt-8 border border-border bg-surface-tone p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Globe size={20} weight="bold" className="mt-0.5 shrink-0 text-primary" />
                  <div className="space-y-1.5">
                    <h2 className="text-[14px] font-bold text-text">
                      Subgroup Portal Deployment Status
                    </h2>
                    <p className="text-[13px] leading-relaxed text-muted">
                      This route serves as the frontend designated landing point for{" "}
                      <strong className="text-text">{unit.name}</strong>. The branch executive
                      committee is currently confirming whether this unit will run on this subpage route (
                      <code className="text-text font-semibold">{`/${unitType}/${slug}`}</code>) or
                      transition to a dedicated subdomain (e.g.{" "}
                      <code className="text-text font-semibold">{`https://${slug}.ieee-uwu.org`}</code>).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Areas & Information */}
            <div className="space-y-8 lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
              <div>
                <h3 className="label-mono text-subtle">Chartered Focus Areas</h3>
                <ul className="mt-4 space-y-3">
                  {unit.areas.map((area) => (
                    <li
                      key={area}
                      className="flex items-baseline gap-3 text-[14px] text-text"
                    >
                      <Check
                        size={14}
                        weight="bold"
                        aria-hidden="true"
                        className="shrink-0 translate-y-0.5 text-primary"
                      />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {unit.pending.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="label-mono text-subtle">Awaiting Official Publication</h3>
                  <ul className="mt-4 space-y-2.5">
                    {unit.pending.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-3 text-[13px] text-subtle"
                      >
                        <Clock
                          size={13}
                          weight="regular"
                          aria-hidden="true"
                          className="shrink-0 translate-y-0.5"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <Link
                  href="/#join"
                  className="inline-flex w-full items-center justify-center gap-2 border border-primary bg-primary px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  <span>Join this Chapter</span>
                  <ArrowSquareOut size={15} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
