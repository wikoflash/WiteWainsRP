import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-border py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.30_0.038_55_/_0.3)_0%,_transparent_70%)] pointer-events-none" />
        <p className="text-primary/70 text-xs tracking-[0.4em] uppercase mb-4">Est. — Red Dead Redemption 2 RP</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">
          White Wains
        </h1>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-primary/40" />
          <span className="text-primary text-sm tracking-[0.25em] uppercase">Family · Loyalty · Code</span>
          <div className="h-px w-16 bg-primary/40" />
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
          We are the White Wains — a family bound by code, loyal to our own, and ruthless to those who cross us.
          Every member earns their place. Every rule exists for a reason.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/laws" className="bg-primary text-primary-foreground px-6 py-2.5 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors">
            Our Code
          </Link>
          <Link href="/members" className="border border-border text-foreground px-6 py-2.5 uppercase tracking-widest text-sm hover:border-primary/60 transition-colors">
            The Family
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-border text-center">
          {[
            { label: 'Laws', value: '10+' },
            { label: 'Members', value: 'Growing' },
            { label: 'Territory', value: 'West Elizabeth' },
          ].map(({ label, value }) => (
            <div key={label} className="px-4">
              <div className="text-2xl font-bold text-primary tracking-wide">{value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          {
            href: '/laws',
            title: 'Code of Laws',
            desc: 'Every family member must know and honour the laws that bind us. No exceptions, no excuses.',
          },
          {
            href: '/gallery',
            title: 'Gallery',
            desc: 'Moments captured from our operations, celebrations, and family gatherings across the frontier.',
          },
          {
            href: '/calculator',
            title: 'Crafting',
            desc: 'Calculate exactly what resources you need to craft weapons, ammo, and throwables for the family.',
          },
        ].map(({ href, title, desc }) => (
          <Link key={href} href={href} className="group block border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <h2 className="text-foreground font-semibold tracking-wider uppercase text-sm mb-3 group-hover:text-primary transition-colors">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
