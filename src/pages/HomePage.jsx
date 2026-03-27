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
  { icon: '🔥', title: 'Live Charcoal Grills', desc: 'Every table has its own built-in charcoal grill for the authentic KBBQ experience.' },
  { icon: '🥩', title: 'Premium Cuts Only', desc: 'We source A5 Wagyu, USDA Prime, and heritage-breed pork from trusted farms.' },
  { icon: '🍶', title: 'Unlimited Banchan', desc: 'Free-flowing sides — kimchi, japchae, pajeon and more, refilled as often as you like.' },
  { icon: '🍺', title: 'Soju & Korean Beer', desc: 'Pair your meal with chilled soju cocktails or ice-cold hite beer.' },
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
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80"
            alt="Korean BBQ grill"
            className="w-full h-full object-cover"
          />
          {/* Heavy dark overlay so text pops */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/80 via-brand-bg/60 to-brand-bg" />
          {/* Warm ember glow at bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-48
                          bg-brand-ember/20 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Open badge */}
          {(() => {
            const open = isRestaurantOpen()
            return (
              <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-8
                              ${open ? 'bg-brand-accent/15 border-brand-accent/30' : 'bg-red-900/20 border-red-700/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-brand-accent animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-xs font-medium uppercase tracking-widest ${open ? 'text-brand-accent' : 'text-red-400'}`}>
                  {open ? 'Now open' : 'Closed'} · Houston, TX
                </span>
              </div>
            )
          })()}

          <h1 className="text-5xl md:text-7xl lg:text-8xl text-brand-primary leading-none mb-4">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center
                        gap-1 text-brand-muted animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── PERKS STRIP ──────────────────────────────────────────────────── */}
      <section className="border-y border-brand-border bg-brand-surface">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PERKS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-medium text-brand-primary">{title}</p>
                <p className="text-xs text-brand-muted leading-relaxed">{desc}</p>
              </div>
            ))}
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
              className={`group relative rounded-2xl overflow-hidden border border-brand-border
                          hover:border-brand-accent/50 transition-all duration-300
                          hover:shadow-xl hover:shadow-brand-accent/10
                          ${i === 0 ? 'md:col-span-2 h-80' : 'h-64'}`}>

              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover
                             transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-brand-elevated flex items-center justify-center">
                  <span className="text-7xl opacity-20">🥩</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Hover glow */}
              <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/5
                              transition-colors duration-300" />

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

      {/* ── AMBIENT PHOTO STRIP ──────────────────────────────────────────── */}
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
      </section>

      {/* ── HOURS + SOCIALS ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-brand-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Hours & location */}
          <div>
            <SectionLabel text="Find us" />
            <h2 className="text-3xl text-brand-primary mb-8">Hours & location</h2>

            <div className="flex items-start gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-brand-accent/15 border border-brand-accent/30
                              flex items-center justify-center text-brand-accent shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-brand-primary font-medium">KBBQ Restaurant</p>
                <p className="text-brand-muted text-sm mt-0.5">1234 Korean BBQ Blvd</p>
                <p className="text-brand-muted text-sm">Houston, TX 77001</p>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                  className="text-xs text-brand-accent hover:underline mt-2 inline-block">
                  Get directions →
                </a>
              </div>
            </div>

            <div className="space-y-0">
              {HOURS.map(({ day, time }) => (
                <div key={day} className="flex justify-between py-3 border-b border-brand-border/50 last:border-0">
                  <span className="text-sm text-brand-muted">{day}</span>
                  <span className="text-sm font-mono text-brand-primary">{time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <div className="w-9 h-9 rounded-lg bg-brand-accent/15 border border-brand-accent/30
                              flex items-center justify-center text-brand-accent shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wider">Reservations</p>
                <a href="tel:+17135550000"
                  className="text-brand-primary font-mono hover:text-brand-accent transition-colors">
                  +1 (713) 555-0000
                </a>
              </div>
            </div>
          </div>

          {/* Socials + CTA */}
          <div>
            <SectionLabel text="Stay connected" />
            <h2 className="text-3xl text-brand-primary mb-8">Follow us</h2>

            <div className="space-y-3 mb-8">
              {SOCIALS.map(({ name, handle, href, icon }) => (
                <a key={name} href={href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-brand-border
                             bg-brand-surface hover:border-brand-accent/40 hover:bg-brand-elevated
                             transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-lg bg-brand-elevated border border-brand-border
                                  flex items-center justify-center text-brand-muted
                                  group-hover:text-brand-accent group-hover:border-brand-accent/30
                                  transition-colors shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-primary">{name}</p>
                    <p className="text-xs text-brand-muted">{handle}</p>
                  </div>
                  <svg className="w-4 h-4 text-brand-muted group-hover:text-brand-accent transition-colors shrink-0"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-brand-accent/10 border border-brand-accent/25">
              <h3 className="text-lg text-brand-primary mb-1">Ready to dine? 🔥</h3>
              <p className="text-brand-muted text-sm mb-4">
                Reserve your table online — it takes less than a minute.
              </p>
              <Link to="/reservations" className="btn-primary w-full text-center block">
                Book a table
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
