import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-border py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.30_0.038_55_/_0.3)_0%,_transparent_70%)] pointer-events-none" />
        <p className="text-primary/70 text-xs tracking-[0.4em] uppercase mb-4">Red Dead Redemption</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.12em] uppercase text-foreground mb-4">
          White Wains
        </h1>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-primary/40" />
          <span className="text-primary text-sm tracking-[0.25em] uppercase">ოჯახი · ლოიალობა · კოდი</span>
          <div className="h-px w-16 bg-primary/40" />
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
          ჩვენ ვართ White Wains — ოჯახი, რომელსაც აერთიანებს საერთო კოდექსი, ერთმანეთისადმი ერთგულება და მტკიცე პოზიცია ყველას მიმართ, ვინც ჩვენს წინააღმდეგ დგება.
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
          ჩვენთან თითოეულ წევრს თავისი ადგილი დამსახურებით უკავია. თითოეულ წესს აქვს მიზეზი, ხოლო თითოეულ ქმედებას — შედეგი. ამ პრინციპებით ვცხოვრობთ როგორც ოჯახის შიგნით, ისე მის ფარგლებს გარეთ.
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
          ჩვენ ვაფასებთ ერთგულებას, პატიოსნებას, სიმამაცეს და იმ ადამიანებს, ვინც სიტყვას საქმედ აქცევს.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/laws" className="bg-primary text-primary-foreground px-6 py-2.5 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors">
            ჩვენი წესდება
          </Link>
          <Link href="/members" className="border border-border text-foreground px-6 py-2.5 uppercase tracking-widest text-sm hover:border-primary/60 transition-colors">
            ოჯახი
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-border text-center">
          {[
            { label: 'ოჯახის სტატუსი', value: 'აქტიური' },
            { label: 'ოჯახი', value: 'მზარდი' },
            { label: 'ტერიტორია', value: 'დასავლეთი ელიზაბეთი' },
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
            title: 'ჩვენი წესდება',
            desc: 'ყველა ოჯახის წევრმა უნდა იცოდეს და პატივი სცეს წესებს, რომლებიც გვაერთიანებს. გამონაკლისები არ არსებობს, არც გამართლებები.',
          },
          {
            href: '/gallery',
            title: 'გალერეა',
            desc: 'მოგონებები ჩვენი ოპერაციებიდან, ზეიმებიდან და ოჯახის შეკრებებიდან მთელ საზღვარზე.',
          },
          {
            href: '/calculator',
            title: 'Crafting',
            desc: 'გაანგარიშეთ ზუსტად რა რესურსებია საჭირო იარაღების, საბრძოლო მასალისა და ოჯახისათვის საჭირო ნივთების დასამზადებლად.',
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
