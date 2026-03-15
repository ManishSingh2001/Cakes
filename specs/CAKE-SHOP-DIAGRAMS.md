# Cake Shop — Detailed Diagrams

---

## 1. System Architecture Diagram (High-Level)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              INTERNET / BROWSER                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║    ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐     ║
║    │ VISITOR (Public)   │  │ USER (Registered)  │  │ ADMIN (Protected)  │     ║
║    │                    │  │                    │  │                    │     ║
║    │ • Browse cakes     │  │ • All visitor      │  │ • Login with       │     ║
║    │ • Read blog        │  │   features +       │  │   email/pw         │     ║
║    │ • View shop info   │  │ • Login/Register   │  │ • Manage all       │     ║
║    │ • Read pages       │  │ • Leave reviews    │  │   sections         │     ║
║    │ • Contact          │  │ • Wishlist cakes   │  │ • Upload media     │     ║
║    │                    │  │ • Manage profile   │  │ • Manage users     │     ║
║    └─────────┬──────────┘  └─────────┬──────────┘  └─────────┬──────────┘     ║
║                 │                    │                    │                     ║
║                 │              HTTPS Requests              │                     ║
║                 └──────────────┬────┴────────────────┬─────┘                     ║
║                                │                                              ║
╚════════════════════════════════╪══════════════════════════════════════════════╝
                                 │
                                 ▼
╔════════════════════════════════════════════════════════════════════════════════╗
║                         VERCEL EDGE NETWORK                                   ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                        MIDDLEWARE LAYER                                  │   ║
║  │                                                                         │   ║
║  │   Every request passes through here first                               │   ║
║  │                                                                         │   ║
║  │   ┌─────────────┐    ┌──────────────────┐    ┌───────────────────┐      │   ║
║  │   │ Is /admin/* │───▶│ Has valid JWT?   │───▶│ Role == admin    │      │   ║
║  │   │ or          │ NO │                  │ NO │ or superadmin?   │      │   ║
║  │   │ /api/admin? │──┐ │ Redirect to     │──┐ │ Redirect to /   │      │   ║
║  │   └─────────────┘  │ │ /admin/login    │  │ └───────┬─────────┘      │   ║
║  │                     │ └──────────────────┘  │         │ YES            │   ║
║  │   ┌──────────────┐  │                       │         ▼                │   ║
║  │   │ Is /profile/* │  │                       │   ┌────────────┐        │   ║
║  │   │ or /api/user? │  │                       │   │ Allow      │        │   ║
║  │   └──────┬───────┘  │                       │   │ Admin      │        │   ║
║  │     YES  │  NO      │                       │   │ Access     │        │   ║
║  │          ▼          │                       │   └────────────┘        │   ║
║  │   ┌──────────────┐  │                       │                         │   ║
║  │   │ Has JWT?     │  │                       │                         │   ║
║  │   │ YES: Allow   │  │                       │                         │   ║
║  │   │ NO: → /login │  │                       │                         │   ║
║  │   └──────────────┘  │                       │                         │   ║
║  │        Pass through │                       │                         │   ║
║  │             ▼       │                       │                         │   ║
║  │      Public routes  │                       │                         │   ║
║  │      served         │                       │                         │   ║
║  └─────────────────────┴───────────────────────┴─────────────────────────┘   ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                      NEXT.JS 15 APP ROUTER                              │   ║
║  │                                                                         │   ║
║  │   ┌─────────────────────┐       ┌─────────────────────────┐             │   ║
║  │   │  SERVER COMPONENTS  │       │  CLIENT COMPONENTS      │             │   ║
║  │   │                     │       │                         │             │   ║
║  │   │  • Page rendering   │       │  • Hero carousel        │             │   ║
║  │   │  • Data fetching    │       │  • Admin forms          │             │   ║
║  │   │  • Metadata         │       │  • Media uploader       │             │   ║
║  │   │  • Layout           │       │  • Rich text editor     │             │   ║
║  │   │  • SEO              │       │  • Animations           │             │   ║
║  │   └──────────┬──────────┘       │  • Toasts / Modals      │             │   ║
║  │              │                  └─────────────────────────┘             │   ║
║  │              │                                                          │   ║
║  │   ┌──────────▼──────────────────────────────────────────────────────┐   │   ║
║  │   │  SERVER ACTIONS + API ROUTE HANDLERS                            │   │   ║
║  │   │                                                                 │   │   ║
║  │   │  Server Actions (preferred for forms):                          │   │   ║
║  │   │    updateHero(), updateAbout(), createFavorite(), etc.           │   │   ║
║  │   │                                                                 │   │   ║
║  │   │  Route Handlers (for REST API / media):                         │   │   ║
║  │   │    /api/admin/*    — CRUD endpoints (auth required)             │   │   ║
║  │   │    /api/public/*   — Read-only public endpoints                 │   │   ║
║  │   └──────────┬──────────────────────────────────────────────────────┘   │   ║
║  │              │                                                          │   ║
║  │   ┌──────────▼──────────────────────────────────────────────────────┐   │   ║
║  │   │  DATA ACCESS LAYER                                              │   │   ║
║  │   │                                                                 │   │   ║
║  │   │  Mongoose ODM  ←→  Zod Validation  ←→  Business Logic           │   │   ║
║  │   └──────────┬──────────────────────────────────────────────────────┘   │   ║
║  └──────────────┼──────────────────────────────────────────────────────────┘   ║
╚═════════════════╪═════════════════════════════════════════════════════════════╝
                  │
       ┌──────────┴──────────────────────────────────┐
       │                                              │
       ▼                                              ▼
╔══════════════════════════╗         ╔══════════════════════════╗
║     MONGODB ATLAS        ║         ║     CLOUDINARY CDN       ║
║                          ║         ║                          ║
║  ┌────────────────────┐  ║         ║  ┌────────────────────┐  ║
║  │  Collections:      │  ║         ║  │  Folders:          │  ║
║  │                    │  ║         ║  │                    │  ║
║  │  users             │  ║         ║  │  /cakeshop/hero    │  ║
║  │  headers           │  ║         ║  │  /cakeshop/cakes   │  ║
║  │  footers           │  ║         ║  │  /cakeshop/about   │  ║
║  │  heroes            │  ║         ║  │  /cakeshop/updates │  ║
║  │  abouts            │  ║         ║  │  /cakeshop/pages   │  ║
║  │  cakes             │  ║         ║  │  /cakeshop/gallery │  ║
║  │  addons            │  ║         ║  │                    │  ║
║  │  carts             │  ║         ║  │                    │  ║
║  │  orders            │  ║         ║  │                    │  ║
║  │  updates           │  ║         ║  │                    │  ║
║  │  visits            │  ║         ║  │  Auto-generates:   │  ║
║  │  custompages       │  ║         ║  │  • WebP/AVIF       │  ║
║  │  media             │  ║         ║  │  • Thumbnails      │  ║
║  │  sitesettings      │  ║         ║  │  • Responsive      │  ║
║  └────────────────────┘  ║         ║  └────────────────────┘  ║
║                          ║         ║                          ║
╚══════════════════════════╝         ╚══════════════════════════╝
```

---

## 2. Authentication & Authorization Flow

```
                           ┌─────────────────────────────┐
                           │     Admin visits /admin      │
                           └──────────────┬──────────────┘
                                          │
                                          ▼
                           ┌─────────────────────────────┐
                           │   Middleware intercepts      │
                           │   the request                │
                           └──────────────┬──────────────┘
                                          │
                                ┌─────────┴─────────┐
                                │  Has JWT cookie?   │
                                └─────────┬─────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                          YES ▼                   NO  ▼
                    ┌─────────────┐          ┌─────────────────┐
                    │ Decode JWT  │          │ Redirect to     │
                    │ & verify    │          │ /admin/login    │
                    └──────┬──────┘          └────────┬────────┘
                           │                          │
                    ┌──────┴──────┐                   ▼
                    │ role ==     │          ┌─────────────────┐
                    │ "admin" or  │          │  LOGIN PAGE     │
                    │ "superadmin"│          │                 │
                    └──────┬──────┘          │  ┌───────────┐  │
                           │                 │  │ Email     │  │
                  ┌────────┴────────┐        │  │ Password  │  │
                  │                 │        │  │ [Login]   │  │
              YES ▼             NO ▼        │  └─────┬─────┘  │
        ┌────────────┐    ┌──────────┐      └────────┼────────┘
        │ ACCESS     │    │ Redirect │               │
        │ GRANTED    │    │ to /     │               ▼
        │            │    │ (home)   │      ┌─────────────────┐
        │ Show admin │    └──────────┘      │ NextAuth        │
        │ dashboard  │                      │ Credentials     │
        └────────────┘                      │ Provider        │
                                            └────────┬────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │ Find user in    │
                                            │ MongoDB by      │
                                            │ email           │
                                            └────────┬────────┘
                                                     │
                                            ┌────────┴────────┐
                                            │  User found?    │
                                            └────────┬────────┘
                                                     │
                                          ┌──────────┴──────────┐
                                          │                     │
                                      YES ▼                 NO  ▼
                                ┌──────────────┐      ┌──────────────┐
                                │ bcrypt.compare│      │ Show error   │
                                │ password     │      │ "Invalid     │
                                └──────┬───────┘      │  credentials"│
                                       │              └──────────────┘
                              ┌────────┴────────┐
                              │  Match?         │
                              └────────┬────────┘
                                       │
                            ┌──────────┴──────────┐
                            │                     │
                        YES ▼                 NO  ▼
                  ┌──────────────┐       ┌──────────────┐
                  │ Create JWT   │       │ Show error   │
                  │ with:        │       │ "Invalid     │
                  │ • user id    │       │  credentials"│
                  │ • email      │       └──────────────┘
                  │ • role       │
                  │              │
                  │ Set HTTP-only│
                  │ cookie       │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Redirect to  │
                  │ /admin       │
                  │ (dashboard)  │
                  └──────────────┘
```

---

## 3. Request Lifecycle — Public Page

```
Customer visits "/"
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                             │
│                                                               │
│   1. app/(public)/layout.tsx   (Server Component)            │
│      │                                                        │
│      ├── Fetch Header data from MongoDB ──────────────────┐   │
│      ├── Fetch Footer data from MongoDB ──────────────┐   │   │
│      │                                                │   │   │
│      │   Cache Strategy:                              │   │   │
│      │   fetch() with { next: { tags: ["header"] } }  │   │   │
│      │   Revalidated when admin updates header        │   │   │
│      │                                                │   │   │
│   2. app/(public)/page.tsx   (Server Component)       │   │   │
│      │                                                │   │   │
│      ├── Fetch Hero slides ───────────────────────┐   │   │   │
│      ├── Fetch Cakes (isFeatured: true) ──┐   │   │   │   │
│      ├── Fetch Latest Updates (limit: 4) ──┐  │   │   │   │   │
│      ├── Fetch Visit section data ──────┐  │  │   │   │   │   │
│      │                                  │  │  │   │   │   │   │
│      │   ┌──────────────────────────────┴──┴──┴───┴───┴───┘   │
│      │   │                                                     │
│      │   │         MongoDB (parallel queries)                  │
│      │   │                                                     │
│      │   │  db.heroes.findOne()                                │
│      │   │  db.cakes.find({isFeatured:true}).sort({order}) │
│      │   │  db.updates.find({isPublished:true}).limit(4)       │
│      │   │  db.visits.findOne()                                │
│      │   │  db.headers.findOne()                               │
│      │   │  db.footers.findOne()                               │
│      │   │                                                     │
│      │   └─────────────────────────────────────────────────────│
│      │                                                         │
│   3. RENDER (Server-side HTML)                                │
│      │                                                         │
│      ├── <Header />           ← Server Component              │
│      ├── <HeroSection />      ← Client Component (carousel)   │
│      ├── <FavoritesSection /> ← Server + Client (animations)  │
│      ├── <LatestUpdates />    ← Server Component              │
│      ├── <VisitSection />     ← Server + Client (map)         │
│      └── <Footer />           ← Server Component              │
│                                                               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  HTML + JS sent │
                   │  to browser     │
                   │                 │
                   │  • Full HTML    │
                   │    (SEO ready)  │
                   │  • Minimal JS   │
                   │    (hydration   │
                   │     for client  │
                   │     components) │
                   └─────────────────┘
```

---

## 4. Admin Content Update Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

Admin clicks "Hero" in sidebar
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  app/(admin)/admin/hero/page.tsx                                        │
│                                                                         │
│  SERVER: Fetch current hero data from MongoDB                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  const heroData = await Hero.findOne({});                    │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                         │
│  Pass data to CLIENT component:                                         │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  <HeroEditor initialData={heroData} />                       │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLIENT: HeroEditor Component                                           │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │  FORM (React Hook Form + Zod)                                  │     │
│  │                                                                │     │
│  │  Slide 1:                                                      │     │
│  │  ┌─────────────────┐  Title:    [Handcrafted with Love    ]   │     │
│  │  │                 │  Subtitle: [Premium cakes for every..]   │     │
│  │  │  [Upload Image] │  CTA Text: [Explore Our Cakes       ]   │     │
│  │  │                 │  CTA Link: [/menu                    ]   │     │
│  │  │  current.jpg    │  Overlay:  [===●=====] 0.4               │     │
│  │  └─────────────────┘  Active:   [✓]                           │     │
│  │                                                                │     │
│  │  [+ Add Slide]                                                 │     │
│  │                                                                │     │
│  │  Autoplay Speed: [5000] ms                                     │     │
│  │                                                                │     │
│  │  ┌──────────────┐  ┌──────────────┐                           │     │
│  │  │   Preview    │  │  Save Changes│                           │     │
│  │  └──────────────┘  └──────┬───────┘                           │     │
│  └───────────────────────────┼────────────────────────────────────┘     │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                    Admin clicks "Save Changes"
                               │
                               ▼
                  ┌────────────────────────┐
                  │  CLIENT-SIDE           │
                  │  Zod Validation        │
                  │                        │
                  │  heroSchema.parse(data)│
                  └────────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                VALID ▼              INVALID ▼
          ┌──────────────┐       ┌─────────────────┐
          │ Call Server  │       │ Show inline      │
          │ Action       │       │ error messages   │
          └──────┬───────┘       │ under fields     │
                 │               └─────────────────┘
                 ▼
          ┌──────────────────────────────────────────┐
          │  SERVER ACTION: updateHero()              │
          │                                          │
          │  1. Verify auth session                  │
          │     const session = await auth();        │
          │     if (!session) throw Unauthorized;    │
          │                                          │
          │  2. Server-side Zod validation           │
          │     heroSchema.parse(data);              │
          │                                          │
          │  3. Update MongoDB                       │
          │     await Hero.findOneAndUpdate(          │
          │       {}, data, { upsert: true }         │
          │     );                                   │
          │                                          │
          │  4. Revalidate cache                     │
          │     revalidateTag("hero");               │
          │                                          │
          │  5. Return { success: true }             │
          └──────────────┬───────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  CLIENT receives response    │
          │                              │
          │  ┌────────────────────────┐  │
          │  │  ✓ Hero section        │  │
          │  │    updated             │  │
          │  │    successfully!       │  │
          │  │         (toast)        │  │
          │  └────────────────────────┘  │
          │                              │
          │  Public site now shows       │
          │  updated hero immediately    │
          │  (cache was revalidated)     │
          └──────────────────────────────┘
```

---

## 5. Database Relationship Diagram (ERD)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        MongoDB Collections (ERD)                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

 ┌──────────────────────────┐
 │          USERS           │
 ├──────────────────────────┤
 │ _id: ObjectId  [PK]      │
 │ name: String             │
 │ email: String [UQ]       │──────────────────────────────────────┐
 │ password: String         │                                      │
 │ role: "user"|"admin"|    │                                      │
 │       "superadmin"       │                                      │
 │ avatar: String           │                                      │
 │ phone: String            │                                      │
 │ address: {street, city,  │                                      │
 │   state, zip, country}   │                                      │
 │ wishlist: [ObjectId] ────┼──── ref: Cakes                       │
 │ isActive: Boolean        │                                      │
 │ lastLogin: Date          │                                      │
 │ createdAt: Date          │                                      │
 │ updatedAt: Date          │                                      │
 └──────────────────────────┘                                      │
                                                                   │
  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ SINGLETON COLLECTIONS ─ ─ ─ ─│─ ─ ─ ─ ─ ┐
  │                                   (one document each)          │           │
  │                                                                │
  │  ┌─────────────────────┐   ┌─────────────────────┐            │           │
  │  │      HEADERS         │   │       HEROES         │            │
  │  ├─────────────────────┤   ├─────────────────────┤            │           │
     │ _id: ObjectId  [PK] │   │ _id: ObjectId  [PK] │            │
  │  │ logo: {             │   │ slides: [{          │            │           │
  │  │   imageUrl, altText,│   │   title, subtitle,  │            │
  │  │   linkTo            │   │   backgroundImage,  │            │           │
  │  │ }                   │   │   ctaText, ctaLink, │
  │  │ navigation: [{      │   │   overlayOpacity,   │            │           │
  │  │   label, href,      │   │   order, isActive   │
  │  │   order, isVisible  │   │ }]                  │            │           │
  │  │ }]                  │   │ autoplaySpeed: Num  │
  │  │ ctaButton: {        │   │ updatedAt: Date     │            │           │
  │  │   text, href,       │   └─────────────────────┘
  │  │   isVisible         │                                      │           │
  │  │ }                   │   ┌─────────────────────┐
  │  │ isSticky: Boolean   │   │       ABOUTS         │            │           │
  │  │ updatedAt: Date     │   ├─────────────────────┤
  │  └─────────────────────┘   │ _id: ObjectId  [PK] │            │           │
  │                             │ sectionTitle: Str   │
  │                             │ heading: String     │            │           │
  │  ┌─────────────────────┐   │ description: String │
  │  │       VISITS         │   │ images: [{url,alt}] │            │           │
  │  ├─────────────────────┤   │ stats: [{label,     │
  │  │ _id: ObjectId  [PK] │   │   value, icon}]     │            │           │
  │  │ sectionTitle: Str   │   │ teamMembers: [{     │
  │  │ heading: String     │   │   name, role,       │            │           │
  │  │ description: String │   │   image, bio}]      │
  │  │ address: {          │   │ isVisible: Boolean  │            │           │
  │  │   street, city,     │   │ updatedAt: Date     │
  │  │   state, zip,       │   └─────────────────────┘            │           │
  │  │   country           │
  │  │ }                   │   ┌─────────────────────┐            │           │
  │  │ phone: String       │   │      FOOTERS         │
  │  │ email: String       │   ├─────────────────────┤            │           │
  │  │ businessHours: [{   │   │ _id: ObjectId  [PK] │
  │  │   day, openTime,    │   │ logo: {imageUrl,    │            │           │
  │  │   closeTime,        │   │   altText}          │
  │  │   isClosed          │   │ description: String │            │           │
  │  │ }]                  │   │ sections: [{        │
  │  │ mapEmbedUrl: String │   │   title, links:[{   │            │           │
  │  │ images: [{url,alt}] │   │     label, href,    │
  │  │ isVisible: Boolean  │   │     isExternal}],   │            │           │
  │  │ updatedAt: Date     │   │   order             │
  │  └─────────────────────┘   │ }]                  │            │           │
  │                             │ socialLinks: [{     │
  │  ┌─────────────────────┐   │   platform, url,    │            │           │
  │  │    SITESETTINGS      │   │   icon}]            │
  │  ├─────────────────────┤   │ copyrightText: Str  │            │           │
  │  │ _id: ObjectId  [PK] │   │ newsletterEnabled   │
  │  │ siteName: String    │   │ updatedAt: Date     │            │           │
  │  │ tagline: String     │   └─────────────────────┘
  │  │ favicon: String     │                                      │           │
  │  │ seo: {defaultTitle, │
  │  │   defaultDesc,      │                                      │           │
  │  │   ogImage}          │
  │  │ theme: {primary,    │                                      │           │
  │  │   secondary, accent,│
  │  │   fontHeading,      │                                      │           │
  │  │   fontBody}         │
  │  │ maintenance: {      │                                      │           │
  │  │   isEnabled, msg}   │
  │  │ updatedAt: Date     │                                      │           │
  │  └─────────────────────┘
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ MULTI-DOC COLLECTIONS ─ ─ ─ ─ ─ ─ ─ ─ ┐
  │                                   (many documents)                         │
  │                                                                            │
  │  ┌──────────────────────────┐   ┌─────────────────────┐                   │
  │  │        CAKES              │   │      UPDATES         │                   │
  │  ├──────────────────────────┤   ├─────────────────────┤                   │
     │ _id: ObjectId  [PK]      │   │ _id: ObjectId  [PK] │
  │  │ name: String             │   │ title: String       │                   │
  │  │ description: String      │   │ slug: String   [UQ] │
  │  │ caketype: "cake"|        │   │ excerpt: String     │                   │
  │  │           "pastries"     │   │ content: String     │
  │  │ type: "eggless"|"egg"    │   │ coverImage: String  │                   │
  │  │ category: String         │   │ author: ObjectId ───┼───── ref: Users
  │  │ slug: String   [UQ]      │   │ category: String    │                   │
  │  │ images: [{url,alt}]      │   │ tags: [String]      │
  │  │ prices: [{weight,        │   │ isPublished: Boolean│                   │
  │  │   costPrice, sellPrice}] │   │ publishedAt: Date   │
  │  │ tags: [String]           │   │ createdAt: Date     │                   │
  │  │ isFeatured: Boolean      │   │ updatedAt: Date     │
  │  │ isAvailable: Boolean     │   └─────────────────────┘                   │
  │  │ reviews: [{userId,       │
  │  │   username, rating,      │                                              │
  │  │   comment, timestamps}]  │
  │  │ averageRating: Number    │                                              │
  │  │ totalReviews: Number     │
  │  │ order: Number            │                                              │
  │  │ createdAt: Date          │
  │  │ updatedAt: Date          │                                              │
  │  └──────────────────────────┘
  │                             ┌─────────────────────┐                        │
  │  ┌─────────────────────┐   │       MEDIA          │
  │  │    CUSTOMPAGES       │   ├─────────────────────┤                        │
  │  ├─────────────────────┤   │ _id: ObjectId  [PK] │
  │  │ _id: ObjectId  [PK] │   │ filename: String    │                        │
  │  │ title: String       │   │ url: String         │
  │  │ slug: String   [UQ] │   │ thumbnailUrl: String│                        │
  │  │ content: String     │   │ mimeType: String    │
  │  │ metaTitle: String   │   │ size: Number        │                        │
  │  │ metaDescription: Str│   │ width: Number       │
  │  │ coverImage: String  │   │ height: Number      │                        │
  │  │ isPublished: Boolean│   │ alt: String         │
  │  │ publishedAt: Date   │   │ folder: String      │                        │
  │  │ author: ObjectId ───┼── │ uploadedBy: ObjId ──┼───── ref: Users
  │  │ createdAt: Date     │   │ createdAt: Date     │                        │
  │  │ updatedAt: Date     │   └─────────────────────┘
  │  └─────────────────────┘                                                   │
  │                                                                            │
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ E-COMMERCE COLLECTIONS ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  │                               (orders, cart, addons)                       │

  │  ┌──────────────────────────┐                                              │
  │  │        ADDONS             │
  │  ├──────────────────────────┤                                              │
     │ _id: ObjectId  [PK]      │
  │  │ name: String             │                                              │
  │  │ slug: String   [UQ]      │
  │  │ description: String      │                                              │
  │  │ category: "candles"|     │
  │  │   "toppers"|"decorations"│                                              │
  │  │   |"packaging"|"extras"  │
  │  │ image: String            │                                              │
  │  │ price: Number            │
  │  │ stock: Number            │                                              │
  │  │ isAvailable: Boolean     │
  │  │ order: Number            │                                              │
  │  │ createdAt: Date          │
  │  │ updatedAt: Date          │                                              │
  │  └──────────────────────────┘

  │  ┌──────────────────────────┐                                              │
  │  │         CARTS             │
  │  ├──────────────────────────┤                                              │
     │ _id: ObjectId  [PK]      │
  │  │ userId: ObjectId ────────┼───── ref: Users                              │
  │  │ items: [{                │
  │  │   cakeId: ObjectId ──────┼───── ref: Cakes                              │
  │  │   name, image, quantity  │
  │  │   priceOption: {weight,  │                                              │
  │  │     sellPrice}           │
  │  │   cakeMessage: String    │                                              │
  │  │   addons: [{             │
  │  │     addonId: ObjectId ───┼───── ref: Addons                             │
  │  │     name, price, qty     │
  │  │   }]                     │                                              │
  │  │ }]                       │
  │  │ totalAmount: Number      │                                              │
  │  │ updatedAt: Date          │
  │  └──────────────────────────┘                                              │

  │  ┌───────────────────────────────────────────────────────────────────┐     │
  │  │                          ORDERS                                    │
  │  ├───────────────────────────────────────────────────────────────────┤     │
     │ _id: ObjectId  [PK]                                                │
  │  │ orderId: String [UQ]      (e.g., "ORD-20260314-A7B2")             │     │
  │  │ userId: ObjectId ────────── ref: Users                             │
  │  │ items: [{                                                          │     │
  │  │   cakeId: ObjectId ──────── ref: Cakes                             │
  │  │   name, image, caketype, type                                      │     │
  │  │   priceOption: {weight, sellPrice}                                 │
  │  │   quantity, cakeMessage                                            │     │
  │  │   addons: [{addonId, name, price, qty}]                            │
  │  │   itemTotal: Number                                                │     │
  │  │ }]                                                                 │
  │  │ deliveryAddress: {fullName, phone, street, city, state, zip, lm}   │     │
  │  │ deliveryDate: Date          deliverySlot: String                   │
  │  │ subtotal, deliveryCharge, discount, totalAmount: Number            │     │
  │  │ payment: {                                                         │
  │  │   method: "razorpay"|"cod"                                         │     │
  │  │   status: "pending"|"paid"|"failed"|"refunded"                     │
  │  │   razorpayOrderId, razorpayPaymentId, razorpaySignature            │     │
  │  │   paidAt: Date                                                     │
  │  │ }                                                                  │     │
  │  │ orderStatus: "placed"|"confirmed"|"preparing"|                     │
  │  │              "out_for_delivery"|"delivered"|"cancelled"             │     │
  │  │ statusHistory: [{status, changedAt, changedBy, note}]              │
  │  │ specialInstructions: String                                        │     │
  │  │ cancelReason: String                                               │
  │  │ createdAt, updatedAt: Date                                         │     │
  │  └───────────────────────────────────────────────────────────────────┘

  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

---

## 6. Component Architecture Diagram

```
                            app/layout.tsx (Root)
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
        app/(public)/layout.tsx          app/(admin)/layout.tsx
        ┌───────────────────┐            ┌───────────────────┐
        │ <Header />  [SC]  │            │ <Sidebar />  [CC] │
        │ {children}        │            │ <Topbar />   [CC] │
        │ <Footer />  [SC]  │            │ {children}        │
        └───────┬───────────┘            └───────┬───────────┘
                │                                │
     ┌──────────┴──────────┐          ┌──────────┴──────────────────┐
     │                     │          │          │          │        │
  page.tsx            [slug]/      /admin     /admin/     /admin/    /admin/   /admin/
  (Home)              page.tsx   page.tsx   hero/       cakes/     addons/   orders/
     │                             │       page.tsx    page.tsx   page.tsx  page.tsx
     │                             │          │           │          │         │
     ├── <HeroSection />  [CC]     │   <HeroEditor/> <CakeTable/> <Addon   <Orders
     │    └── <Carousel />         │     [CC]          [CC]       Manager>  Table>
     │                             │      │             │          [CC]     [CC]
     ├── <CakesSection/>    [SC]  │   ┌──┴──┐       ┌──┴──┐       │        │
     │    └── <CakeCard /> [SC]    │   │Form │       │CRUD │    ┌──┴──┐  ┌──┴──┐
     │        └── hover anim [CC]  │   │Image│       │Table│    │CRUD │  │View │
     │                             │   │RTE  │       │Modal│    │Price│  │Status│
     ├── <LatestUpdates /> [SC]    │   └─────┘       └─────┘    │Stock│  │Update│
     │    └── <UpdateCard /> [SC]  │                             └─────┘  └─────┘
     │                             │
     ├── <VisitSection />  [SC]    │
     │    └── <Map />  [CC]        │
     │                             │
     └── <AnimatedSection /> [CC]  │
          (wraps each section)     │

  app/(user)/ routes:
     │
     ├── /cart → <CartPage />  [CC]
     │    ├── <CartItem />  [CC]
     │    └── <AddonPicker />  [CC]
     │
     ├── /checkout → <CheckoutForm />  [CC]
     │    ├── <OrderSummary />  [CC]
     │    └── <RazorpayButton />  [CC]
     │
     ├── /orders → <OrderCard />  [SC]
     │    └── /orders/[id] → <OrderTracking />  [CC]
     │
     └── /cake/[slug] → <CakeDetail />  [SC+CC]
          ├── <AddToCartButton />  [CC]
          ├── <AddonPicker />  [CC]
          └── <ReviewSection />  [CC]

[SC] = Server Component (default)
[CC] = Client Component ("use client")
```

---

## 7. Caching & Revalidation Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CACHING ARCHITECTURE                               │
└──────────────────────────────────────────────────────────────────────┘

  ADMIN ACTION                    CACHE LAYER                PUBLIC VIEW
  ─────────────                   ───────────                ───────────

  Admin updates     ──▶   revalidateTag("hero")    ──▶   Homepage re-renders
  Hero section             Cache invalidated              with new hero data
                           │
                           ▼
                    ┌──────────────────────┐
                    │  Next.js Data Cache   │
                    │                      │
                    │  Tags:               │
                    │  ┌────────────────┐  │
                    │  │ "header"       │──┼──▶  Header component
                    │  │ "footer"       │──┼──▶  Footer component
                    │  │ "hero"         │──┼──▶  Hero section
                    │  │ "about"        │──┼──▶  About section/page
                    │  │ "cakes"        │──┼──▶  Cakes / Favorites section
                    │  │ "addons"       │──┼──▶  Addon items for cart
                    │  │ "orders"       │──┼──▶  Order data
                    │  │ "updates"      │──┼──▶  Latest Updates
                    │  │ "visit"        │──┼──▶  Visit section
                    │  │ "pages"        │──┼──▶  Custom pages
                    │  │ "settings"     │──┼──▶  Metadata, theme
                    │  └────────────────┘  │
                    │                      │
                    │  When tag is          │
                    │  revalidated:         │
                    │  • Cached data purged │
                    │  • Next request       │
                    │    fetches fresh data │
                    │  • New response       │
                    │    cached with tag    │
                    └──────────────────────┘


  FLOW EXAMPLE:

  1. First visit to "/"
     │
     ├── Cache MISS → fetch Hero from MongoDB → cache with tag "hero"
     ├── Cache MISS → fetch Favorites from MongoDB → cache with tag "favorites"
     └── ... (all sections cached)

  2. Second visit to "/"
     │
     ├── Cache HIT → serve Hero from cache (fast!)
     ├── Cache HIT → serve Cakes from cache
     └── ... (all served from cache, no DB queries)

  3. Admin updates Hero
     │
     ├── Server Action: updateHero()
     ├── MongoDB updated
     ├── revalidateTag("hero")  ←── Only hero cache purged
     └── Other caches untouched (cakes, footer, etc.)

  4. Next visit to "/"
     │
     ├── Cache MISS → fetch Hero from MongoDB (fresh data!) → re-cache
     ├── Cache HIT → Cakes still cached
     └── ... (only hero was re-fetched)
```

---

## 8. Media Upload Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MEDIA UPLOAD PIPELINE                          │
└─────────────────────────────────────────────────────────────────────┘

  ADMIN BROWSER                     SERVER                    CLOUD
  ─────────────                     ──────                    ─────

  ┌───────────────┐
  │ 1. Select     │
  │    File       │
  │ ┌───────────┐ │
  │ │ cake.jpg  │ │
  │ │ 4.2 MB    │ │
  │ │ 3000x2000 │ │
  │ └───────────┘ │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐
  │ 2. Client     │
  │    Validation  │
  │               │
  │ ✓ Type: jpg   │
  │ ✓ Size: <10MB │
  │ ✓ Preview OK  │
  └───────┬───────┘
          │
          ▼
  ┌───────────────┐        ┌───────────────────┐
  │ 3. Upload     │───────▶│ 4. API Route      │
  │    Progress   │        │    /api/admin/media│
  │               │        │                   │
  │ [████████░░]  │        │ • Verify auth     │
  │    80%        │        │ • Validate file   │
  └───────────────┘        │ • Generate name   │
                           └─────────┬─────────┘
                                     │
                                     ▼
                           ┌───────────────────┐      ┌──────────────────┐
                           │ 5. Upload to      │─────▶│ 6. CLOUDINARY    │
                           │    Cloudinary      │      │                  │
                           │                   │      │ Auto-generates:  │
                           │ cloudinary.       │      │                  │
                           │  uploader.upload( │      │ • Original       │
                           │    file,          │      │   /cakeshop/     │
                           │    {folder:       │      │   cake_abc123    │
                           │     "cakeshop/    │      │                  │
                           │      cakes"}      │      │ • WebP version   │
                           │  )               │      │   (auto-format)  │
                           └───────────────────┘      │                  │
                                                      │ • Thumbnail      │
                                                      │   (c_thumb,      │
                                                      │    w_300,h_300)  │
                                                      │                  │
                                                      │ Returns:         │
                                                      │ • secure_url     │
                                                      │ • width, height  │
                                                      │ • format, bytes  │
                                                      └────────┬─────────┘
                                                               │
                                     ┌─────────────────────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │ 7. Save metadata  │
                           │    to MongoDB     │
                           │                   │
                           │ Media.create({    │
                           │   filename,       │
                           │   url,            │
                           │   thumbnailUrl,   │
                           │   mimeType,       │
                           │   size,           │
                           │   width, height,  │
                           │   folder,         │
                           │   uploadedBy      │
                           │ })                │
                           └─────────┬─────────┘
                                     │
                                     ▼
  ┌───────────────┐        ┌───────────────────┐
  │ 8. Show       │◀───────│ Return URL +      │
  │    success    │        │ metadata to       │
  │               │        │ client            │
  │ ┌───────────┐ │        └───────────────────┘
  │ │ cake.jpg  │ │
  │ │ ✓ Uploaded│ │
  │ └───────────┘ │
  └───────────────┘
```

---

## 9. Public Website Page Flow (User Journey)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY MAP                              │
└──────────────────────────────────────────────────────────────────────────┘


    ┌─────────┐
    │ Customer│
    │ arrives │
    └────┬────┘
         │
         ▼
    ┌─────────────────────────────────────────────┐
    │              HOME PAGE  "/"                  │
    │                                              │
    │  ┌────────────────────────────────────────┐  │
    │  │           HERO CAROUSEL                │  │
    │  │    "Handcrafted with Love"             │  │
    │  │    [Explore Our Cakes] ────────────────┼──┼──── → /menu
    │  └────────────────────────────────────────┘  │
    │              ↓ scroll                        │
    │  ┌────────────────────────────────────────┐  │
    │  │         OUR FAVORITES                  │  │
    │  │    [Cake] [Cake] [Cake] [Cake]         │  │
    │  │     Click any cake ────────────────────┼──┼──── → /menu#cake-slug
    │  │    [View All] ────────────────────────┼──┼──── → /menu
    │  └────────────────────────────────────────┘  │
    │              ↓ scroll                        │
    │  ┌────────────────────────────────────────┐  │
    │  │        LATEST UPDATES                  │  │
    │  │    [Blog Post]  [Blog Post]            │  │
    │  │     Click post ───────────────────────┼──┼──── → /updates/slug
    │  └────────────────────────────────────────┘  │
    │              ↓ scroll                        │
    │  ┌────────────────────────────────────────┐  │
    │  │       VISIT THE CAKE SHOP              │  │
    │  │    [Map]  Address  Hours               │  │
    │  │    [Get Directions] ──────────────────┼──┼──── → Google Maps
    │  └────────────────────────────────────────┘  │
    │                                              │
    └──────────────────────────────────────────────┘

    Navigation (available on every page):

    ┌──────┐  ┌───────┐  ┌──────┐  ┌─────────┐  ┌─────────┐  ┌──────┐  ┌────────┐
    │ Home │  │ About │  │ Menu │  │ Gallery │  │ Contact │  │ Cart │  │ [slug] │
    │  /   │  │/about │  │/menu │  │/gallery │  │/contact │  │/cart │  │/[slug] │
    └──┬───┘  └───┬───┘  └──┬───┘  └────┬────┘  └────┬────┘  └──┬───┘  └───┬────┘
       │          │         │           │             │           │          │
       ▼          ▼         ▼           ▼             ▼           ▼          ▼
    Home       Our Story  Full Cake   Photo       Contact     Shopping   Dynamic
    (all       + Team     Catalog     Gallery     Form +      Cart →    Custom
    sections)  + Stats    + Filter    + Lightbox  Map +       Checkout   Pages
                          + Search    + Reviews   Hours       → Pay     (CMS)
                          + Add to                → Order
                            Cart                    Track

    Shopping Flow:
    ┌──────────┐    ┌────────────┐    ┌───────────┐    ┌───────────┐    ┌────────────┐
    │ /menu or │───▶│ /cake/slug │───▶│ /cart      │───▶│ /checkout │───▶│ Razorpay   │
    │ browse   │    │ Select wt  │    │ Review     │    │ Address   │    │ Payment    │
    │ cakes    │    │ + addons   │    │ items +    │    │ Date/Slot │    │ Modal      │
    │          │    │ + message  │    │ quantities │    │ Summary   │    │            │
    └──────────┘    │ Add to Cart│    └───────────┘    └───────────┘    └──────┬─────┘
                    └────────────┘                                             │
                                                                              ▼
                                                                    ┌────────────────┐
                                                                    │ /order-success │
                                                                    │ → /orders/[id] │
                                                                    │ (tracking)     │
                                                                    └────────────────┘
```

---

## 10. Order & Checkout Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       ORDER & CHECKOUT FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────┘

    Customer browses /menu
            │
            ▼
    ┌─────────────────────────────────┐
    │  CAKE DETAIL PAGE               │
    │  /cake/[slug]                   │
    │                                 │
    │  ┌────────────────────────────┐ │
    │  │ Red Velvet Cake            │ │
    │  │ ★★★★☆ (4.2) 128 reviews   │ │
    │  │                            │ │
    │  │ Select Weight:             │ │
    │  │ [500g ₹399] [1kg ₹599]    │ │
    │  │ [2kg ₹999]                 │ │
    │  │                            │ │
    │  │ Type: ○ Egg  ● Eggless    │ │
    │  │                            │ │
    │  │ Cake Message:              │ │
    │  │ [Happy Birthday Rahul!  ]  │ │
    │  │                            │ │
    │  │ Add-ons:                   │ │
    │  │ ☑ Birthday Candles    ₹49  │ │
    │  │ ☑ Gold Topper         ₹99  │ │
    │  │ ☐ Gift Box            ₹149 │ │
    │  │ ☐ Knife & Server      ₹79  │ │
    │  │                            │ │
    │  │ [Add to Cart ₹747]         │ │
    │  └────────────────────────────┘ │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │  CART PAGE  /cart                │
    │                                 │
    │  ┌────────────────────────────┐ │
    │  │ 1. Red Velvet 1kg    ₹599 │ │
    │  │    + Candles           ₹49 │ │
    │  │    + Topper            ₹99 │ │
    │  │    Msg: "Happy Bday!"     │ │
    │  │    Qty: [- 1 +]    [🗑️]   │ │
    │  ├────────────────────────────┤ │
    │  │ 2. Choco Pastry x2   ₹398 │ │
    │  │    Qty: [- 2 +]    [🗑️]   │ │
    │  ├────────────────────────────┤ │
    │  │ Subtotal:          ₹1,146 │ │
    │  │ Delivery:              ₹0 │ │
    │  │ ─────────────────────────  │ │
    │  │ Total:             ₹1,146 │ │
    │  │                            │ │
    │  │ [Proceed to Checkout →]    │ │
    │  └────────────────────────────┘ │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │  CHECKOUT PAGE  /checkout       │
    │                                 │
    │  Delivery Address:              │
    │  ┌────────────────────────────┐ │
    │  │ Full Name: [Rahul Sharma] │ │
    │  │ Phone:     [9876543210  ] │ │
    │  │ Address:   [42 Baker St ] │ │
    │  │ City:      [Mumbai      ] │ │
    │  │ State:     [Maharashtra ] │ │
    │  │ Pincode:   [400001      ] │ │
    │  │ Landmark:  [Near Park   ] │ │
    │  └────────────────────────────┘ │
    │                                 │
    │  Delivery Date: [Mar 16, 2026]  │
    │  Delivery Slot: [10AM-12PM ▼]   │
    │                                 │
    │  Special Notes:                 │
    │  [No nuts - severe allergy    ] │
    │                                 │
    │  ┌────────────────────────────┐ │
    │  │ ORDER SUMMARY              │ │
    │  │ 2 items              ₹1146 │ │
    │  │ Delivery                ₹0 │ │
    │  │ Total              ₹1,146 │ │
    │  └────────────────────────────┘ │
    │                                 │
    │  [Pay ₹1,146 with Razorpay]     │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │  RAZORPAY PAYMENT MODAL         │
    │                                 │
    │  ┌────────────────────────────┐ │
    │  │ Sweet Delights Bakery     │ │
    │  │ Order #ORD-20260314-A7B2  │ │
    │  │                            │ │
    │  │ ₹1,146.00                  │ │
    │  │                            │ │
    │  │ ┌──────────────────────┐   │ │
    │  │ │ ○ UPI (GPay/PhonePe)│   │ │
    │  │ │ ○ Credit/Debit Card │   │ │
    │  │ │ ○ Net Banking       │   │ │
    │  │ │ ○ Wallets           │   │ │
    │  │ └──────────────────────┘   │ │
    │  │                            │ │
    │  │ [Pay ₹1,146]              │ │
    │  └────────────────────────────┘ │
    └─────────────┬───────────────────┘
                  │
           ┌──────┴──────┐
           │             │
       SUCCESS        FAILURE
           │             │
           ▼             ▼
    ┌──────────────┐  ┌──────────────┐
    │ Verify       │  │ Show error   │
    │ signature    │  │ Retry option │
    │ on server    │  └──────────────┘
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────────────────┐
    │  ORDER SUCCESS  /order-success  │
    │                                 │
    │  ✅ Order Placed Successfully!   │
    │                                 │
    │  Order #ORD-20260314-A7B2       │
    │  Amount: ₹1,146                 │
    │  Delivery: Mar 16, 10AM-12PM    │
    │                                 │
    │  [Track Order]  [Continue Shop]  │
    └─────────────────────────────────┘
```

---

## 11. Admin Order Management Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN ORDER MANAGEMENT                                     │
└──────────────────────────────────────────────────────────────────────────────┘

  Admin navigates to /admin/orders
          │
          ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  ORDERS DASHBOARD                                                 │
  │                                                                   │
  │  Filter: [All ▼] [Today ▼] [Search order ID...]                  │
  │                                                                   │
  │  ┌─────────┬───────────────┬──────────┬──────────┬────────────┐  │
  │  │ Order # │ Customer      │ Total    │ Status   │ Actions    │  │
  │  ├─────────┼───────────────┼──────────┼──────────┼────────────┤  │
  │  │ A7B2    │ Rahul Sharma  │ ₹1,146  │ 🟡 Placed│ [View]     │  │
  │  │ B3C9    │ Priya Patel   │ ₹599    │ 🟢 Prep  │ [View]     │  │
  │  │ D1E4    │ Amit Kumar    │ ₹2,340  │ 🔵 Out   │ [View]     │  │
  │  │ F5G7    │ Sneha Reddy   │ ₹899    │ ✅ Done  │ [View]     │  │
  │  └─────────┴───────────────┴──────────┴──────────┴────────────┘  │
  │                                                                   │
  │  Stats:  🟡 12 Placed  🟢 8 Preparing  🔵 5 Out  ✅ 47 Done     │
  └────────────────────────────┬──────────────────────────────────────┘
                               │
                        Admin clicks [View]
                               │
                               ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │  ORDER DETAIL  /admin/orders/[id]                                 │
  │                                                                   │
  │  Order #ORD-20260314-A7B2                   Payment: ✅ Paid     │
  │                                                                   │
  │  Customer: Rahul Sharma                                           │
  │  Phone: 9876543210                                                │
  │  Email: rahul@example.com                                         │
  │                                                                   │
  │  Delivery Address:                                                │
  │  42 Baker Street, Near Park, Mumbai, MH 400001                    │
  │                                                                   │
  │  Delivery: Mar 16, 2026 | Slot: 10AM-12PM                        │
  │  Special Notes: "No nuts - severe allergy"                        │
  │                                                                   │
  │  Items:                                                           │
  │  ┌────────────────────────────────────────────────────────────┐   │
  │  │ 1. Red Velvet Cake (Eggless) 1kg              ₹599       │   │
  │  │    + Birthday Candles                           ₹49       │   │
  │  │    + Gold Topper                                ₹99       │   │
  │  │    Message: "Happy Birthday Rahul!"                        │   │
  │  │ 2. Choco Pastry x2                              ₹398       │   │
  │  ├────────────────────────────────────────────────────────────┤   │
  │  │ Subtotal: ₹1,146  |  Delivery: ₹0  |  Total: ₹1,146     │   │
  │  └────────────────────────────────────────────────────────────┘   │
  │                                                                   │
  │  Update Status:                                                   │
  │  ┌──────────────────────────────────────────────────┐             │
  │  │ ● Placed → ○ Confirmed → ○ Preparing →          │             │
  │  │   ○ Out for Delivery → ○ Delivered               │             │
  │  │                                                  │             │
  │  │ Note: [Cake is ready, assigning delivery boy ]   │             │
  │  │                                                  │             │
  │  │ [Update Status]              [Cancel Order]      │             │
  │  └──────────────────────────────────────────────────┘             │
  │                                                                   │
  │  Status History:                                                  │
  │  • Placed — Mar 14, 2:30 PM                                      │
  │  • Confirmed — Mar 14, 2:45 PM (Admin: Super Admin)               │
  │  • Preparing — Mar 15, 9:00 AM (Admin: Super Admin)               │
  └───────────────────────────────────────────────────────────────────┘
```

---

## 12. Addon Management (Admin)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    ADMIN ADDON MANAGEMENT  /admin/addons                      │
└──────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────┐
  │  ADDON ITEMS                                        [+ Add Addon]    │
  │                                                                       │
  │  Filter: [All Categories ▼]                                           │
  │                                                                       │
  │  ┌──────┬────────────────────────┬──────────┬───────┬───────┬──────┐ │
  │  │ IMG  │ Name                   │ Category │ Price │ Stock │ Acts │ │
  │  ├──────┼────────────────────────┼──────────┼───────┼───────┼──────┤ │
  │  │ 🕯️   │ Birthday Candles (10)  │ candles  │ ₹49   │ 150   │ ✏️🗑️ │ │
  │  │ 🔢   │ Number Candle (0-9)    │ candles  │ ₹79   │ 200   │ ✏️🗑️ │ │
  │  │ ⭐   │ Gold "Happy Bday"      │ toppers  │ ₹99   │ 80    │ ✏️🗑️ │ │
  │  │ 🌺   │ Edible Flowers Set     │ decor    │ ₹149  │ 45    │ ✏️🗑️ │ │
  │  │ 🎁   │ Premium Gift Box       │ packaging│ ₹199  │ 60    │ ✏️🗑️ │ │
  │  │ 🍴   │ Knife & Server Set     │ extras   │ ₹79   │ 100   │ ✏️🗑️ │ │
  │  └──────┴────────────────────────┴──────────┴───────┴───────┴──────┘ │
  │                                                                       │
  │  Categories: candles | toppers | decorations | packaging | extras      │
  └───────────────────────────────────────────────────────────────────────┘
```

---

## 13. Razorpay Payment Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       RAZORPAY PAYMENT FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────┘

  CLIENT (Browser)              SERVER (Next.js)              RAZORPAY
  ─────────────────             ────────────────              ────────

  User clicks
  "Pay with Razorpay"
        │
        │  POST /api/user/payment/create
        │  { deliveryAddress, deliveryDate, ... }
        │──────────────────────────▶│
        │                          │
        │                          │  1. Validate cart
        │                          │  2. Calculate totals
        │                          │
        │                          │  razorpay.orders.create({
        │                          │    amount: 114600, // paise
        │                          │    currency: "INR"
        │                          │  })
        │                          │──────────────────────▶│
        │                          │                       │
        │                          │◀──────────────────────│
        │                          │  { id: "order_XXXXX" }
        │                          │
        │                          │  3. Save Order to MongoDB
        │                          │     (status: "pending")
        │                          │
        │◀─────────────────────────│
        │  { razorpayOrderId,
        │    amount, orderId }
        │
        │  Open Razorpay modal
        │  new Razorpay(options)
        │  rzp.open()
        │─────────────────────────────────────────────────▶│
        │                                                  │
        │           User completes payment                 │
        │           (UPI / Card / NetBanking)              │
        │                                                  │
        │◀─────────────────────────────────────────────────│
        │  { razorpay_order_id,
        │    razorpay_payment_id,
        │    razorpay_signature }
        │
        │  POST /api/user/payment/verify
        │  { orderId, razorpay_order_id,
        │    razorpay_payment_id,
        │    razorpay_signature }
        │──────────────────────────▶│
        │                          │
        │                          │  4. Verify signature:
        │                          │
        │                          │  expected = HMAC_SHA256(
        │                          │    key_secret,
        │                          │    order_id + "|" + payment_id
        │                          │  )
        │                          │
        │                          │  if (expected === signature)
        │                          │    ✅ Payment verified!
        │                          │    • Update order: "paid"
        │                          │    • Status: "confirmed"
        │                          │    • Clear user cart
        │                          │  else
        │                          │    ❌ Mark as "failed"
        │                          │
        │◀─────────────────────────│
        │  { success: true }
        │
        │  Redirect to
        │  /order-success?id=XXX
        ▼
```

---

## 10. Deployment Pipeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT PIPELINE                                │
└──────────────────────────────────────────────────────────────────────────┘


  DEVELOPMENT                    STAGING                     PRODUCTION
  ───────────                    ───────                     ──────────

  ┌─────────────┐
  │ Developer   │
  │ pushes to   │
  │ feature     │
  │ branch      │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐    ┌─────────────┐
  │ GitHub      │───▶│ Vercel      │
  │ Repository  │    │ Preview     │
  │             │    │ Deployment  │
  │ PR created  │    │             │
  └──────┬──────┘    │ https://    │
         │           │ pr-123.     │
         │           │ vercel.app  │
         │           └──────┬──────┘
         │                  │
         │           ┌──────▼──────┐
         │           │ Preview     │
         │           │ Environment │
         │           │             │
         │           │ MongoDB:    │
         │           │ dev-cluster │
         │           │             │
         │           │ Cloudinary: │
         │           │ dev-folder  │
         │           └─────────────┘
         │
         ▼
  ┌─────────────┐
  │ Merge to    │
  │ main branch │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐
  │ GitHub      │───▶│ Vercel      │───▶│ PRODUCTION          │
  │ main branch │    │ Production  │    │                     │
  │             │    │ Build       │    │ https://             │
  │             │    │             │    │ sweetdelights.com    │
  │             │    │ • Build     │    │                     │
  │             │    │ • Optimize  │    │ MongoDB:             │
  │             │    │ • Deploy    │    │ production-cluster   │
  │             │    │             │    │                     │
  │             │    │ ~60 seconds │    │ Cloudinary:          │
  │             │    │             │    │ production-folder    │
  │             │    └─────────────┘    │                     │
  │             │                       │ Vercel Edge Network  │
  │             │                       │ (Global CDN)         │
  │             │                       └─────────────────────┘
  └─────────────┘


  ENVIRONMENT VARIABLES (per environment):

  ┌────────────────────────────────────────────────────────────────┐
  │  Development (.env.local)                                      │
  │  MONGODB_URI = mongodb://localhost:27017/cakeshop-dev          │
  │  NEXTAUTH_URL = http://localhost:3000                          │
  ├────────────────────────────────────────────────────────────────┤
  │  Preview (Vercel env vars)                                     │
  │  MONGODB_URI = mongodb+srv://...cakeshop-staging              │
  │  NEXTAUTH_URL = https://pr-xxx.vercel.app                     │
  ├────────────────────────────────────────────────────────────────┤
  │  Production (Vercel env vars)                                  │
  │  MONGODB_URI = mongodb+srv://...cakeshop-prod                 │
  │  NEXTAUTH_URL = https://sweetdelights.com                     │
  └────────────────────────────────────────────────────────────────┘
```

---

*These diagrams provide a complete visual reference for the Cake Shop architecture. Use them alongside the main architecture document (`CAKE-SHOP-ARCHITECTURE.md`) for implementation guidance.*
