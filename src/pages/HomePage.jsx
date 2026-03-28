import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { isRestaurantOpen } from '../lib/isOpen'

const fetchFeatured = () =>
  api.get('/api/menu').then(r => {
    const all = r.data
    const featured = all.filter(i => i.isAvailable && i.isFeatured)
    return featured.length > 0 ? featured.slice(0, 3) : all.filter(i => i.isAvailable).slice(0, 3)
  })


// Default featured items shown when API returns nothing yet
const DEFAULT_FEATURED = [
  {
    _id: 'd1', name: 'Prime Wagyu Beef', category: 'Signature Cuts',
    description: 'A5 Wagyu short rib marbled to perfection. Melt-in-your-mouth experience.',
    price: 42.00,
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
    isAvailable: true,
  },
  {
    _id: 'd2', name: 'Galbi (Short Rib)', category: 'Classics',
    description: 'Marinated bone-in short ribs in soy, pear and sesame. A KBBQ staple.',
    price: 28.00,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80',
    isAvailable: true,
  },
  {
    _id: 'd3', name: 'Samgyeopsal', category: 'Pork',
    description: 'Thick-cut pork belly crisped over live charcoal. Served with banchan.',
    price: 22.00,
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
    isAvailable: true,
  },
]

const HOURS = [
  { day: 'Monday – Thursday', time: '12:00 PM – 10:00 PM' },
  { day: 'Friday – Saturday', time: '12:00 PM – 12:00 AM' },
  { day: 'Sunday',            time: '12:00 PM – 9:00 PM'  },
]

const SOCIALS = [
  { name: 'Instagram', handle: '@kbbq.houston', href: 'https://instagram.com',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
  { name: 'TikTok', handle: '@kbbqhouston', href: 'https://tiktok.com',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.76a4.85 4.85 0 01-1.02-.07z"/></svg> },
  { name: 'Facebook', handle: 'KBBQ Houston', href: 'https://facebook.com',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
]

const PERKS = [
  { icon: '🔥', title: 'Live Charcoal Grills',
    desc: 'Every table has its own built-in charcoal grill for the authentic KBBQ experience.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
  { icon: '🥩', title: 'Premium Cuts Only',
    desc: 'We source A5 Wagyu, USDA Prime, and heritage-breed pork from trusted farms.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80' },
  { icon: '🍶', title: 'Unlimited Banchan',
    desc: 'Free-flowing sides — kimchi, japchae, pajeon and more, refilled as often as you like.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' },
  { icon: '🍺', title: 'Soju & Korean Beer',
    desc: 'Pair your meal with chilled soju cocktails or ice-cold hite beer.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80' },
]

function SectionLabel({ text }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-brand-accent text-lg">🔥</span>
      <p className="text-xs font-medium uppercase tracking-widest text-brand-accent">{text}</p>
    </div>
  )
}

export default function HomePage() {
  const { data: apiItems = [] } = useQuery({
    queryKey: ['featuredMenu'],
    queryFn: fetchFeatured,
    staleTime: 5 * 60_000,
  })

  const featured = apiItems.length > 0 ? apiItems : DEFAULT_FEATURED


  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://s3-media0.fl.yelpcdn.com/bphoto/94PL1mAz-6S9e3WIgINq9w/o.jpg"
            alt="Korean BBQ grill"
            className="w-full h-full object-cover"
          />
          {/* Heavy dark overlay so text pops */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/80 via-brand-bg/60 to-brand-bg" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Open badge */}
          {(() => {
            const open = isRestaurantOpen()
            return (
              <div className="flex flex-col items-center mb-10"
                  style={{ animation: 'swingSign 3s ease-in-out infinite', transformOrigin: 'top center' }}>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-700" />
                <div className="flex gap-10">
                  <div className="w-px h-8 bg-yellow-700 opacity-60" />
                  <div className="w-px h-8 bg-yellow-700 opacity-60" />
                </div>
                <div className={`relative px-7 py-3 border-2 rounded-sm
                                ${open ? 'border-green-500' : 'border-brand-accent'}`}>
                  <div className={`absolute inset-1 border rounded-sm opacity-40
                                  ${open ? 'border-green-500' : 'border-brand-accent'}`} />
                  
                  <p className={`text-2xl tracking-widest leading-none
                                ${open ? 'text-green-400' : 'text-brand-accent'}`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.15em' }}>
                    {open ? 'OPEN' : 'CLOSED'}
                  </p>
                </div>
              </div>
            )
          })()}

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-brand-primary leading-none mb-4">
            Grill. Sizzle.
            <span className="block text-brand-accent" style={{ animation: 'flicker 3s ease-in-out infinite' }}>
              Devour.
            </span>
          </h1>

          <p className="text-brand-muted text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Authentic Korean BBQ in the heart of Houston. Premium cuts,
            live charcoal grills, and an experience worth gathering for.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/menu"
              className="btn-primary px-8 py-3 text-base">
              View menu
            </Link>
            <Link to="/reservations"
              className="btn-outline px-8 py-3 text-base">
              Book a table
            </Link>
          </div>
        </div>

        {/* Scroll hint */}

      </section>
        {/* ── PERKS STRIP ──────────────────────────────────────────────────── */}
        <section className="border-y border-brand-border bg-brand-surface py-10">
          <div className="marquee-wrap">
            <div className="marquee-track">
              {/* First set */}
              <div className="flex">
                {PERKS.map(({ icon, title, desc, image }) => (
                    <div key={title} className="shrink-0 w-64 mx-5 rounded-2xl overflow-hidden border border-brand-border bg-brand-surface">
                      <div className="h-36 overflow-hidden">
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{icon}</span>
                          <p className="text-sm font-medium text-brand-primary">{title}</p>
                        </div>
                        <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Identical second set for seamless loop */}
              <div className="flex">
                {PERKS.map(({ icon, title, desc, image }) => (
                  <div key={title + '2'} className="shrink-0 w-64 mx-5 rounded-2xl overflow-hidden border border-brand-border bg-brand-surface">
                    <div className="h-36 overflow-hidden">
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{icon}</span>
                        <p className="text-sm font-medium text-brand-primary">{title}</p>
                      </div>
                      <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* ── FEATURED MENU ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <SectionLabel text="From the grill" />
        <h2 className="text-4xl text-brand-primary mb-10">Featured cuts</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((item, i) => (
            <Link key={item._id} to="/menu"
              className={`card-magnetic card-shimmer group relative rounded-2xl overflow-hidden
                          border border-brand-border
                          ${i === 0 ? 'md:col-span-2 h-80' : 'h-64'}`}
              onMouseMove={e => {
                const el = e.currentTarget
                const rect = el.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                el.style.transform = `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateZ(10px)`
                el.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(232,100,12,0.15)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
                e.currentTarget.style.boxShadow = ''
              }}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"/>
              ) : (
                <div className="absolute inset-0 bg-brand-elevated flex items-center justify-center">
                  <span className="text-7xl opacity-20">🥩</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-xs font-medium text-brand-accent uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className={`text-white font-display mt-1 ${i === 0 ? 'text-2xl' : 'text-lg'}`}>
                  {item.name}
                </h3>
                {i === 0 && (
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="font-mono text-brand-accent mt-2 font-medium">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/menu" className="btn-outline px-8">
            View full menu →
          </Link>
        </div>
      </section>

      {/* ── AMBIENT PHOTO STRIP ────────────────────────────────────────────
      <section className="max-w-6xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-3 gap-3 h-48 rounded-2xl overflow-hidden">
          <div className="rounded-xl overflow-hidden col-span-1">
            <img src="https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&q=80"
              alt="Grilling meat" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="rounded-xl overflow-hidden col-span-1">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80"
              alt="Banchan sides" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="rounded-xl overflow-hidden col-span-1">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
              alt="Restaurant atmosphere" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section> */}

     {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative bg-brand-bg overflow-hidden">

        {/* Ember particles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="ember-particle" style={{
              left: `${8 + i * 8}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }} />
          ))}
        </div>

        {/* Top decorative divider */}
        <div className="relative flex items-center gap-4 px-8 pt-16 pb-10 max-w-6xl mx-auto">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
          <span className="text-brand-accent/60 text-xs tracking-[0.4em] uppercase font-light">한국 바비큐</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
        </div>

        {/* Large display text */}
        <div className="px-8 max-w-6xl mx-auto mb-14 overflow-hidden">
          <h2 className="font-display text-[clamp(3rem,10vw,8rem)] leading-none text-brand-primary/10
                         select-none tracking-tight whitespace-nowrap">
            불고기 · BBQ · 갈비
          </h2>
        </div>

        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 pb-16">

          {/* Col 1 — Address + hours */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-accent mb-6">Find us</p>
            <p className="font-display text-2xl text-brand-primary mb-4">KBBQ Restaurant</p>
            <p className="text-brand-muted text-sm leading-relaxed mb-1">1234 Korean BBQ Blvd</p>
            <p className="text-brand-muted text-sm leading-relaxed mb-4">Houston, TX 77001</p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-brand-accent
                         border border-brand-accent/30 rounded-full px-4 py-1.5
                         hover:bg-brand-accent/10 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Get directions
            </a>
          </div>

          {/* Col 2 — Hours */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-accent mb-6">Hours</p>
            <div className="space-y-0">
              {HOURS.map(({ day, time }) => (
                <div key={day} className="flex justify-between py-3
                                          border-b border-brand-border/30 last:border-0">
                  <span className="text-sm text-brand-muted">{day}</span>
                  <span className="text-sm font-mono text-brand-primary/80">{time}</span>
                </div>
              ))}
            </div>
            <a href="tel:+17135550000"
              className="inline-flex items-center gap-2 mt-6 text-brand-muted
                         hover:text-brand-accent transition-colors text-sm font-mono">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              +1 (713) 555-0000
            </a>
          </div>

          {/* Col 3 — Socials + CTA */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-accent mb-6">Stay connected</p>
            <div className="flex gap-3 mb-8">
              {SOCIALS.map(({ name, href, icon }) => (
                <a key={name} href={href} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-brand-border/50
                             flex items-center justify-center text-brand-muted
                             hover:text-brand-accent hover:border-brand-accent/40
                             transition-all duration-200">
                  {icon}
                </a>
              ))}
            </div>

            <div className="relative">
              <div className="absolute -inset-px rounded-xl bg-gradient-to-br
                              from-brand-accent/30 via-transparent to-transparent" />
              <div className="relative rounded-xl border border-brand-border/50
                              bg-brand-surface/50 p-6">
                <p className="font-display text-xl text-brand-primary mb-1">Ready to dine?</p>
                <p className="text-brand-muted text-xs mb-4 leading-relaxed">
                  Reserve your table — it takes less than a minute.
                </p>
                <Link to="/reservations" className="btn-primary w-full text-center block text-sm">
                  Book a table
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative divider */}
        <div className="relative flex items-center gap-4 px-8 max-w-6xl mx-auto">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
          <span className="text-brand-muted/30 text-xs tracking-widest">✦</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto px-8 py-6 flex flex-col sm:flex-row
                        items-center justify-between gap-2">
          <p className="text-xs text-brand-muted/40 tracking-wider">
            © {new Date().getFullYear()} KBBQ Restaurant · Houston, TX
          </p>
          <p className="text-xs text-brand-muted/30 tracking-widest">맛있게 드세요</p>
        </div>
      </footer>

    </div>
  )
}
