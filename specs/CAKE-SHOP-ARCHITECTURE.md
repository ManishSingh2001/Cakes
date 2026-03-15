# Cake Shop Website — Full Architecture Document

> **Tech Stack:** Next.js 15 (App Router) | MongoDB (Mongoose) | NextAuth.js
> **Goal:** A premium, creative cake shop website with a fully manageable admin panel

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Technology Stack & Libraries](#3-technology-stack--libraries)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Routing Strategy](#5-routing-strategy)
6. [Data Models (MongoDB / Mongoose)](#6-data-models-mongodb--mongoose)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Admin Panel — Content Management](#8-admin-panel--content-management)
9. [Public Website — Pages & Sections](#9-public-website--pages--sections)
10. [API Design (Route Handlers)](#10-api-design-route-handlers)
11. [Image & Media Management](#11-image--media-management)
12. [UI/UX Design Guidelines](#12-uiux-design-guidelines)
13. [Performance & SEO Strategy](#13-performance--seo-strategy)
14. [Deployment Strategy](#14-deployment-strategy)
15. [Future Feature Suggestions](#15-future-feature-suggestions)

---

## 1. Project Overview

A **premium cake shop website** that serves three audiences:

| Audience | Experience |
|----------|-----------|
| **Visitors (Guest)** | Browse cakes, view about/story, see latest updates, explore favorites, find shop location, read custom pages |
| **Users (Registered)** | All visitor features + login/register, leave reviews & ratings, manage profile, wishlist cakes |
| **Admins** | Full CMS to manage every section — hero, about, favorites, updates, header, footer, custom pages, manage users |

### Core Principles

- **Content-first:** Every visible section is admin-manageable — zero hardcoded content
- **Performance:** Server Components by default, Client Components only where interactivity is needed
- **Security:** Admin routes fully protected, role-based access
- **Premium Feel:** Smooth animations, elegant typography, rich imagery

---

## 2. Folder Structure

```
cake-shop/
├── app/
│   ├── (public)/                    # Public route group
│   │   ├── layout.tsx               # Public layout (header + footer from DB)
│   │   ├── page.tsx                 # Home page (Hero, Favorites, Updates, Visit)
│   │   ├── about/
│   │   │   └── page.tsx             # About / Our Story page
│   │   │   ├── menu/
│   │   │   └── page.tsx             # Full cake menu / catalog (filter by caketype, type, category)
│   │   ├── gallery/
│   │   │   └── page.tsx             # Cake gallery
│   │   ├── contact/
│   │   │   └── page.tsx             # Contact & location
│   │   ├── cake/
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Single cake detail page (reviews, add to cart)
│   │   └── [slug]/
│   │       └── page.tsx             # Dynamic custom pages
│   │
│   ├── (admin)/                     # Admin route group
│   │   ├── layout.tsx               # Admin layout (sidebar + topbar)
│   │   ├── admin/
│   │   │   ├── page.tsx             # Admin dashboard
│   │   │   ├── header/
│   │   │   │   └── page.tsx         # Manage header (logo, nav links)
│   │   │   ├── footer/
│   │   │   │   └── page.tsx         # Manage footer (links, social, text)
│   │   │   ├── hero/
│   │   │   │   └── page.tsx         # Manage hero section
│   │   │   ├── about/
│   │   │   │   └── page.tsx         # Manage about section
│   │   │   ├── cakes/
│   │   │   │   └── page.tsx         # Manage cakes / products
│   │   │   ├── addons/
│   │   │   │   └── page.tsx         # Manage addon items (candles, toppers, etc.)
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx         # View/manage all orders
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Single order detail (update status)
│   │   │   ├── users/
│   │   │   │   ├── page.tsx         # Manage all users
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # View/edit single user
│   │   │   ├── updates/
│   │   │   │   └── page.tsx         # Manage latest updates / blog
│   │   │   ├── visit/
│   │   │   │   └── page.tsx         # Manage "Visit the Cake Shop" section
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx         # List all custom pages
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx     # Create new custom page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Edit custom page
│   │   │   ├── media/
│   │   │   │   └── page.tsx         # Media library
│   │   │   └── settings/
│   │   │       └── page.tsx         # Site-wide settings (SEO, colors)
│   │   └── middleware.ts            # (handled at root level)
│   │
│   ├── (auth)/                      # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx             # User login page
│   │   └── register/
│   │       └── page.tsx             # User registration page
│   │
│   ├── (user)/                      # User route group (auth required)
│   │   ├── cart/
│   │   │   └── page.tsx             # Shopping cart page
│   │   ├── checkout/
│   │   │   └── page.tsx             # Checkout page (address, payment)
│   │   ├── orders/
│   │   │   ├── page.tsx             # User's order history
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Single order detail + tracking
│   │   ├── order-success/
│   │   │   └── page.tsx             # Order confirmation page
│   │   ├── profile/
│   │   │   ├── page.tsx             # User profile page
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx         # User's wishlisted cakes
│   │   │   └── reviews/
│   │   │       └── page.tsx         # User's submitted reviews
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts         # NextAuth API route
│   │   ├── admin/
│   │   │   ├── header/
│   │   │   │   └── route.ts         # CRUD for header
│   │   │   ├── footer/
│   │   │   │   └── route.ts         # CRUD for footer
│   │   │   ├── hero/
│   │   │   │   └── route.ts         # CRUD for hero
│   │   │   ├── about/
│   │   │   │   └── route.ts         # CRUD for about
│   │   │   ├── cakes/
│   │   │   │   └── route.ts         # CRUD for cakes
│   │   │   ├── addons/
│   │   │   │   └── route.ts         # CRUD for addon items
│   │   │   ├── orders/
│   │   │   │   └── route.ts         # View/update orders
│   │   │   ├── users/
│   │   │   │   └── route.ts         # Manage users
│   │   │   ├── updates/
│   │   │   │   └── route.ts         # CRUD for updates
│   │   │   ├── visit/
│   │   │   │   └── route.ts         # CRUD for visit section
│   │   │   ├── pages/
│   │   │   │   └── route.ts         # CRUD for custom pages
│   │   │   ├── media/
│   │   │   │   └── route.ts         # Upload / delete media
│   │   │   └── settings/
│   │   │       └── route.ts         # Site settings
│   │   ├── user/
│   │   │   ├── register/
│   │   │   │   └── route.ts         # User registration
│   │   │   ├── profile/
│   │   │   │   └── route.ts         # Get/update user profile
│   │   │   ├── wishlist/
│   │   │   │   └── route.ts         # Add/remove wishlist items
│   │   │   ├── reviews/
│   │   │   │   └── route.ts         # Submit/edit/delete reviews
│   │   │   ├── cart/
│   │   │   │   └── route.ts         # Get/update cart
│   │   │   ├── checkout/
│   │   │   │   └── route.ts         # Create order + Razorpay order
│   │   │   ├── orders/
│   │   │   │   └── route.ts         # Get user's orders
│   │   │   └── payment/
│   │   │       ├── create/
│   │   │       │   └── route.ts     # Create Razorpay order
│   │   │       └── verify/
│   │   │           └── route.ts     # Verify Razorpay payment signature
│   │   └── public/
│   │       ├── content/
│   │       │   └── route.ts         # Fetch all public content
│   │       ├── cakes/
│   │       │   └── route.ts         # Fetch cakes (public, with filters)
│   │       └── pages/
│   │           └── [slug]/
│   │               └── route.ts     # Fetch single custom page
│   │
│   ├── layout.tsx                   # Root layout
│   ├── loading.tsx                  # Global loading UI
│   ├── not-found.tsx                # 404 page
│   └── error.tsx                    # Error boundary
│
├── components/
│   ├── public/                      # Public-facing components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── CakesSection.tsx
│   │   ├── LatestUpdates.tsx
│   │   ├── VisitSection.tsx
│   │   ├── CakeCard.tsx
│   │   ├── CakeDetail.tsx           # Single cake page with reviews
│   │   ├── AddToCartButton.tsx      # Add cake + addons to cart
│   │   ├── CartDrawer.tsx           # Slide-out cart preview
│   │   ├── CartItem.tsx             # Single cart item row
│   │   ├── CheckoutForm.tsx         # Address + delivery details form
│   │   ├── OrderSummary.tsx         # Order summary with totals
│   │   ├── RazorpayButton.tsx       # Razorpay payment button
│   │   ├── AddonPicker.tsx          # Select addons (candles, toppers)
│   │   ├── OrderCard.tsx            # Order history card
│   │   ├── OrderTracking.tsx        # Order status timeline
│   │   └── AnimatedSection.tsx      # Scroll-triggered animations
│   │
│   ├── admin/                       # Admin panel components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── RichTextEditor.tsx       # WYSIWYG editor
│   │   ├── ImageUploader.tsx
│   │   ├── MediaPicker.tsx
│   │   ├── ContentForm.tsx          # Reusable form component
│   │   ├── DataTable.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── OrdersTable.tsx          # Admin orders list with filters
│   │   ├── OrderDetail.tsx          # Admin order detail + status update
│   │   ├── AddonManager.tsx         # Admin addon CRUD
│   │   └── UsersTable.tsx           # Admin user management
│   │
│   └── ui/                          # Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Skeleton.tsx
│       └── Badge.tsx
│
├── lib/
│   ├── db.ts                        # MongoDB connection (singleton)
│   ├── auth.ts                      # NextAuth configuration
│   ├── models/                      # Mongoose models
│   │   ├── User.ts
│   │   ├── Header.ts
│   │   ├── Footer.ts
│   │   ├── Hero.ts
│   │   ├── About.ts
│   │   ├── Cake.ts
│   │   ├── Addon.ts
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   ├── Update.ts
│   │   ├── Visit.ts
│   │   ├── CustomPage.ts
│   │   ├── Media.ts
│   │   └── SiteSettings.ts
│   ├── actions/                     # Server Actions
│   │   ├── header.actions.ts
│   │   ├── footer.actions.ts
│   │   ├── hero.actions.ts
│   │   ├── about.actions.ts
│   │   ├── cakes.actions.ts
│   │   ├── addons.actions.ts
│   │   ├── cart.actions.ts
│   │   ├── checkout.actions.ts
│   │   ├── orders.actions.ts
│   │   ├── updates.actions.ts
│   │   ├── visit.actions.ts
│   │   ├── pages.actions.ts
│   │   └── media.actions.ts
│   ├── validations/                 # Zod schemas
│   │   ├── header.schema.ts
│   │   ├── hero.schema.ts
│   │   └── ...
│   ├── razorpay.ts                  # Razorpay SDK instance
│   └── utils.ts                     # Helper functions
│
├── hooks/                           # Custom React hooks
│   ├── useToast.ts
│   ├── useMediaUpload.ts
│   └── useDebounce.ts
│
├── styles/
│   └── globals.css                  # Tailwind + custom CSS variables
│
├── public/
│   ├── fonts/                       # Premium custom fonts
│   └── images/                      # Static fallback images
│
├── middleware.ts                     # Root middleware (auth guard)
├── next.config.ts
├── tailwind.config.ts
├── .env.local
├── .env.example
└── package.json
```

---

## 3. Technology Stack & Libraries

### Core

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 15** (App Router) | SSR, SSG, API routes, Server Components |
| Database | **MongoDB Atlas** | Document-based storage for CMS content |
| ODM | **Mongoose 8** | Schema validation, queries, middleware |
| Auth | **NextAuth.js v5** (Auth.js) | Authentication with credentials/OAuth |
| Payments | **Razorpay** | Payment gateway for orders & checkout |
| Styling | **Tailwind CSS 4** | Utility-first styling |
| Animations | **Framer Motion** | Scroll animations, page transitions |

### Admin Panel

| Library | Purpose |
|---------|---------|
| **Tiptap** or **React Quill** | Rich text editor for content |
| **React Hook Form** | Performant form handling |
| **Zod** | Schema validation (shared client/server) |
| **Uploadthing** or **Cloudinary** | Image/media uploads |
| **Sonner** | Toast notifications |
| **Lucide React** | Icon library |
| **razorpay** | Server-side Razorpay SDK for order/payment creation |

### UI Enhancement

| Library | Purpose |
|---------|---------|
| **Shadcn/ui** | Pre-built accessible components |
| **Embla Carousel** | Smooth carousels for cakes/gallery |
| **next/image** | Optimized image loading |
| **next-themes** | Light/dark mode support |

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
├────────────────────────────┬────────────────────────────────────┤
│     Public Website         │         Admin Panel                │
│  (Server Components +      │   (Client Components +            │
│   Client interactivity)    │    Server Actions)                 │
└────────────┬───────────────┴──────────────┬─────────────────────┘
             │                              │
             │         Next.js 15           │
             │        App Router            │
             │                              │
┌────────────▼──────────────────────────────▼─────────────────────┐
│                                                                  │
│                     MIDDLEWARE LAYER                              │
│           (Authentication + Route Protection)                    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    SERVER LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐      │
│  │ Server       │  │ Route        │  │ Server            │      │
│  │ Components   │  │ Handlers     │  │ Actions           │      │
│  │ (Data fetch) │  │ (REST API)   │  │ (Form mutations)  │      │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘      │
│         │                 │                    │                  │
│         └─────────────────┼────────────────────┘                 │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐    │
│  │              DATA ACCESS LAYER                            │    │
│  │  Mongoose Models + Validation (Zod) + Business Logic      │    │
│  └────────────────────────┬─────────────────────────────────┘    │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │     MongoDB Atlas       │
               │  ┌────────────────────┐ │
               │  │  Collections:      │ │
               │  │  - users           │ │
               │  │  - headers         │ │
               │  │  - footers         │ │
               │  │  - heroes          │ │
               │  │  - abouts          │ │
               │  │  - cakes            │ │
               │  │  - addons          │ │
               │  │  - carts           │ │
               │  │  - orders          │ │
               │  │  - updates         │ │
               │  │  - visits          │ │
               │  │  - custompages     │ │
               │  │  - media           │ │
               │  │  - sitesettings    │ │
               │  └────────────────────┘ │
               └─────────────────────────┘

               ┌─────────────────────────┐
               │   Cloudinary / S3       │
               │   (Image Storage)       │
               └─────────────────────────┘
```

---

## 5. Routing Strategy

### Public Routes (No Auth Required)

| Route | Page | Data Source |
|-------|------|------------|
| `/` | Home | Hero, Featured Cakes, Updates, Visit |
| `/about` | About / Our Story | About collection |
| `/menu` | Cake Menu / Catalog | Cakes collection (filter by caketype, type, category) |
| `/gallery` | Photo Gallery | Media collection |
| `/contact` | Contact & Location | Visit collection |
| `/cake/[slug]` | Cake Detail | Single cake with reviews, add to cart |
| `/[slug]` | Custom Pages | CustomPages collection |

### Admin Routes (Auth Required — Admin Role Only)

| Route | Page | Manages |
|-------|------|---------|
| `/admin` | Dashboard | Overview stats |
| `/admin/header` | Header Manager | Logo, navigation links |
| `/admin/footer` | Footer Manager | Footer links, social, copyright |
| `/admin/hero` | Hero Manager | Hero images, text, CTA |
| `/admin/about` | About Manager | Story, team, images |
| `/admin/cakes` | Cakes Manager | Cakes / products CRUD |
| `/admin/addons` | Addons Manager | Addon items CRUD (candles, toppers, etc.) |
| `/admin/orders` | Orders Manager | View all orders, update status, filter |
| `/admin/orders/[id]` | Order Detail | View order detail, update status |
| `/admin/users` | Users Manager | View/manage all registered users |
| `/admin/users/[id]` | User Detail | View/edit user, toggle active |
| `/admin/updates` | Updates Manager | Blog / news CRUD |
| `/admin/visit` | Visit Manager | Address, hours, map embed |
| `/admin/pages` | Custom Pages | Create/edit/delete pages |
| `/admin/pages/new` | New Custom Page | Rich text page builder |
| `/admin/pages/[id]` | Edit Custom Page | Edit existing page |
| `/admin/media` | Media Library | Upload, browse, delete images |
| `/admin/settings` | Site Settings | SEO defaults, theme colors |

### User Routes (Auth Required — Any Authenticated User)

| Route | Page | Purpose |
|-------|------|---------|
| `/cart` | Shopping Cart | View cart, update quantities, remove items |
| `/checkout` | Checkout | Enter delivery address, select slot, pay |
| `/orders` | My Orders | Order history with status |
| `/orders/[id]` | Order Detail | Single order with tracking timeline |
| `/order-success` | Order Confirmation | Success page after payment |
| `/profile` | User Profile | View/edit profile, change password |
| `/profile/wishlist` | Wishlist | Saved/wishlisted cakes |
| `/profile/reviews` | My Reviews | Reviews left by the user |

### Auth Routes

| Route | Page |
|-------|------|
| `/login` | User & Admin login page |
| `/register` | User registration page |
| `/admin/login` | Admin login page |

---

## 6. Data Models (MongoDB / Mongoose)

### User

```typescript
// lib/models/User.ts
{
  name:          String,          // "John Doe"
  email:         String (unique), // "john@example.com"
  password:      String,          // bcrypt hashed
  role:          String,          // "user" | "admin" | "superadmin"
  avatar:        String,          // URL
  phone:         String,          // Optional phone number
  address: {
    street:      String,
    city:        String,
    state:       String,
    zipCode:     String,
    country:     String
  },
  wishlist:      [ObjectId],      // ref: Cake — list of wishlisted cake IDs
  isActive:      Boolean,         // default: true
  lastLogin:     Date,
  createdAt:     Date,
  updatedAt:     Date
}
```

> **Roles:**
> - `user` — Default role for registered customers. Can browse, leave reviews, manage wishlist & profile.
> - `admin` — Can access the admin panel and manage all CMS content.
> - `superadmin` — Full access including user management and site settings.

### Header

```typescript
// lib/models/Header.ts
{
  logo: {
    imageUrl:    String,          // Logo image URL
    altText:     String,          // "Sweet Delights Bakery"
    linkTo:      String           // "/" (home)
  },
  navigation: [{
    label:       String,          // "Menu"
    href:        String,          // "/menu"
    order:       Number,          // Sort order
    isVisible:   Boolean          // Toggle visibility
  }],
  ctaButton: {
    text:        String,          // "Order Now"
    href:        String,          // "/contact"
    isVisible:   Boolean
  },
  isSticky:      Boolean,         // Sticky header toggle
  updatedAt:     Date
}
```

### Hero

```typescript
// lib/models/Hero.ts
{
  slides: [{
    title:       String,          // "Handcrafted with Love"
    subtitle:    String,          // "Premium cakes for every occasion"
    backgroundImage: String,      // URL
    ctaText:     String,          // "Explore Our Cakes"
    ctaLink:     String,          // "/menu"
    overlayOpacity: Number,       // 0.0 - 1.0
    order:       Number,
    isActive:    Boolean
  }],
  autoplaySpeed: Number,          // milliseconds (default: 5000)
  updatedAt:     Date
}
```

### About

```typescript
// lib/models/About.ts
{
  sectionTitle:  String,          // "Our Story"
  heading:       String,          // "Baking Happiness Since 2010"
  description:   String,          // Rich text / HTML
  images: [{
    url:         String,
    alt:         String,
    order:       Number
  }],
  stats: [{                       // e.g., "500+ Cakes Sold"
    label:       String,
    value:       String,
    icon:        String
  }],
  teamMembers: [{
    name:        String,
    role:        String,
    image:       String,
    bio:         String
  }],
  isVisible:     Boolean,
  updatedAt:     Date
}
```

### Cake (Product)

```typescript
// lib/models/Cake.ts

const priceSchema = {
  weight:        Number,          // Weight in grams or kilograms
  costPrice:     Number,          // Cost price for the specified weight
  sellPrice:     Number,          // Selling price for the specified weight
};

const reviewSchema = {
  userId:        ObjectId (ref: User),  // Reviewer's user ID
  username:      String,          // Reviewer's display name
  rating:        Number,          // 1 to 5
  comment:       String,          // Review text
  createdAt:     Date,
  updatedAt:     Date
};

{
  name:          String,          // "Red Velvet Dream"
  description:   String,          // Detailed description
  caketype:      String,          // "cake" | "pastries" (enum)
  type:          String,          // "eggless" | "egg" (enum)
  category:      String,          // "Wedding" | "Birthday" | "Custom" | "Anniversary"
  slug:          String (unique), // "red-velvet-dream"
  images: [{
    url:         String,
    alt:         String
  }],
  prices:        [priceSchema],   // Array of weight-based pricing options
  tags:          [String],        // ["chocolate", "premium", "bestseller"]
  isFeatured:    Boolean,         // Show on homepage "Our Favorites"
  isAvailable:   Boolean,         // Currently available for order
  reviews:       [reviewSchema],  // Embedded user reviews
  averageRating: Number,          // Computed average of all review ratings
  totalReviews:  Number,          // Count of reviews
  order:         Number,          // Display order for featured section
  createdAt:     Date,
  updatedAt:     Date
}
```

### Update (Latest Updates / Blog)

```typescript
// lib/models/Update.ts
{
  title:         String,          // "New Summer Collection!"
  slug:          String (unique),
  excerpt:       String,          // Short preview text
  content:       String,          // Rich text / HTML
  coverImage:    String,          // URL
  author:        ObjectId (ref: User),
  category:      String,          // "News" | "Recipe" | "Event"
  tags:          [String],
  isPublished:   Boolean,
  publishedAt:   Date,
  createdAt:     Date,
  updatedAt:     Date
}
```

### Visit (Visit the Cake Shop)

```typescript
// lib/models/Visit.ts
{
  sectionTitle:  String,          // "Visit Us"
  heading:       String,          // "Come Experience the Magic"
  description:   String,
  address: {
    street:      String,
    city:        String,
    state:       String,
    zipCode:     String,
    country:     String
  },
  phone:         String,
  email:         String,
  businessHours: [{
    day:         String,          // "Monday"
    openTime:    String,          // "09:00"
    closeTime:   String,          // "18:00"
    isClosed:    Boolean
  }],
  mapEmbedUrl:   String,          // Google Maps embed URL
  images: [{
    url:         String,
    alt:         String
  }],
  isVisible:     Boolean,
  updatedAt:     Date
}
```

### Footer

```typescript
// lib/models/Footer.ts
{
  logo: {
    imageUrl:    String,
    altText:     String
  },
  description:   String,          // Short brand description
  sections: [{
    title:       String,          // "Quick Links"
    links: [{
      label:     String,
      href:      String,
      isExternal: Boolean
    }],
    order:       Number
  }],
  socialLinks: [{
    platform:    String,          // "instagram" | "facebook" | "twitter"
    url:         String,
    icon:        String
  }],
  copyrightText: String,          // "© 2026 Sweet Delights"
  newsletterEnabled: Boolean,
  updatedAt:     Date
}
```

### CustomPage

```typescript
// lib/models/CustomPage.ts
{
  title:         String,          // "Catering Services"
  slug:          String (unique), // "catering-services"
  content:       String,          // Rich text / HTML
  metaTitle:     String,          // SEO title
  metaDescription: String,        // SEO description
  coverImage:    String,
  isPublished:   Boolean,
  publishedAt:   Date,
  author:        ObjectId (ref: User),
  createdAt:     Date,
  updatedAt:     Date
}
```

### Media

```typescript
// lib/models/Media.ts
{
  filename:      String,          // "red-velvet-cake.jpg"
  url:           String,          // Cloudinary / S3 URL
  thumbnailUrl:  String,          // Thumbnail version
  mimeType:      String,          // "image/jpeg"
  size:          Number,          // bytes
  width:         Number,
  height:        Number,
  alt:           String,          // Alt text
  folder:        String,          // "cakes" | "hero" | "about"
  uploadedBy:    ObjectId (ref: User),
  createdAt:     Date
}
```

### SiteSettings

```typescript
// lib/models/SiteSettings.ts
{
  siteName:      String,          // "Sweet Delights Bakery"
  tagline:       String,          // "Handcrafted Cakes & Pastries"
  favicon:       String,          // URL
  seo: {
    defaultTitle:       String,
    defaultDescription: String,
    ogImage:            String
  },
  theme: {
    primaryColor:    String,      // "#D4A574" (warm gold)
    secondaryColor:  String,      // "#8B4513" (chocolate brown)
    accentColor:     String,      // "#F5E6D3" (cream)
    fontHeading:     String,      // "Playfair Display"
    fontBody:        String       // "Lato"
  },
  maintenance: {
    isEnabled:   Boolean,
    message:     String
  },
  updatedAt:     Date
}
```

### Addon (Admin-Managed Add-on Items)

```typescript
// lib/models/Addon.ts
{
  name:          String,          // "Birthday Candles (Pack of 10)"
  slug:          String (unique), // "birthday-candles-10"
  description:   String,          // "Colorful birthday candles"
  category:      String,          // "candles" | "toppers" | "decorations" | "packaging" | "extras"
  image:         String,          // Cloudinary URL
  price:         Number,          // 49 (INR)
  stock:         Number,          // Available quantity
  isAvailable:   Boolean,         // default: true
  order:         Number,          // Display order
  createdAt:     Date,
  updatedAt:     Date
}
```

> **Addon Categories:**
> - `candles` — Birthday candles, number candles, sparkler candles
> - `toppers` — Cake toppers, figurines, message plaques
> - `decorations` — Sprinkles, edible flowers, fondant shapes
> - `packaging` — Gift boxes, ribbons, carry bags
> - `extras` — Knife & server set, plates, napkins

### Cart

```typescript
// lib/models/Cart.ts
{
  userId:        ObjectId (ref: User),   // Cart owner
  items: [{
    cakeId:      ObjectId (ref: Cake),   // The cake product
    name:        String,                  // Snapshot of cake name
    image:       String,                  // Snapshot of cake image
    priceOption: {
      weight:    Number,                  // Selected weight (e.g., 500g, 1kg)
      sellPrice: Number                   // Price at time of adding
    },
    quantity:    Number,                  // default: 1
    cakeMessage: String,                  // "Happy Birthday Rahul!" (optional)
    addons: [{
      addonId:   ObjectId (ref: Addon),
      name:      String,                  // Snapshot of addon name
      price:     Number,                  // Price at time of adding
      quantity:  Number
    }]
  }],
  totalAmount:   Number,                  // Computed total (all items + addons)
  updatedAt:     Date
}
```

### Order

```typescript
// lib/models/Order.ts
{
  orderId:       String (unique),  // "ORD-20260314-XXXX" (auto-generated)
  userId:        ObjectId (ref: User),
  items: [{
    cakeId:      ObjectId (ref: Cake),
    name:        String,           // Snapshot at time of order
    image:       String,
    caketype:    String,           // "cake" | "pastries"
    type:        String,           // "eggless" | "egg"
    priceOption: {
      weight:    Number,           // e.g., 1000 (grams)
      sellPrice: Number            // e.g., 599
    },
    quantity:    Number,
    cakeMessage: String,           // Custom message on cake
    addons: [{
      addonId:   ObjectId (ref: Addon),
      name:      String,
      price:     Number,
      quantity:  Number
    }],
    itemTotal:   Number            // (sellPrice * qty) + addons total
  }],
  deliveryAddress: {
    fullName:    String,
    phone:       String,
    street:      String,
    city:        String,
    state:       String,
    zipCode:     String,
    landmark:    String             // Optional
  },
  deliveryDate:  Date,              // Requested delivery date
  deliverySlot:  String,            // "10AM-12PM" | "12PM-3PM" | "3PM-6PM" | "6PM-9PM"
  subtotal:      Number,            // Sum of all item totals
  deliveryCharge: Number,           // Delivery fee
  discount:      Number,            // Coupon / promo discount (default: 0)
  totalAmount:   Number,            // subtotal + deliveryCharge - discount
  payment: {
    method:      String,            // "razorpay" | "cod" (cash on delivery)
    status:      String,            // "pending" | "paid" | "failed" | "refunded"
    razorpayOrderId:   String,      // Razorpay order ID (order_XXXXX)
    razorpayPaymentId: String,      // Razorpay payment ID (pay_XXXXX)
    razorpaySignature: String,      // Razorpay signature for verification
    paidAt:      Date
  },
  orderStatus:   String,            // "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  statusHistory: [{
    status:      String,
    changedAt:   Date,
    changedBy:   ObjectId (ref: User),  // Admin who changed status
    note:        String                  // Optional note ("Cake is ready for pickup")
  }],
  specialInstructions: String,      // "No nuts please, allergy"
  cancelReason:  String,            // If cancelled
  createdAt:     Date,
  updatedAt:     Date
}
```

> **Order Status Flow:**
> ```
> placed → confirmed → preparing → out_for_delivery → delivered
>                                                   ↘ cancelled (at any stage before delivered)
> ```

---

## 6b. Razorpay Integration

### Razorpay SDK Setup

```typescript
// lib/razorpay.ts
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### Payment Flow

```
User clicks "Pay Now"
        │
        ▼
┌──────────────────────┐
│ 1. Create Order      │
│    POST /api/user/    │
│    payment/create     │
│                      │
│    • Validate cart   │
│    • Calculate total │
│    • Create Razorpay │
│      order (server)  │
│    • Save Order to   │
│      MongoDB with    │
│      status: pending │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. Razorpay Checkout │
│    (Client-Side)     │
│                      │
│    Opens Razorpay    │
│    payment modal:    │
│    • UPI             │
│    • Cards           │
│    • Net Banking     │
│    • Wallets         │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
SUCCESS ▼      FAIL ▼
┌────────────┐  ┌──────────┐
│ 3. Verify  │  │ Show     │
│ Signature  │  │ error    │
│            │  │ message  │
│ POST /api/ │  └──────────┘
│ user/      │
│ payment/   │
│ verify     │
└─────┬──────┘
      │
      ▼
┌──────────────────────┐
│ 4. Server verifies   │
│    Razorpay signature│
│                      │
│    crypto.createHmac │
│    ('sha256', secret)│
│    .update(          │
│      orderId + "|" + │
│      paymentId       │
│    )                 │
│    .digest('hex')    │
│    === signature     │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
  VALID ▼    INVALID ▼
┌────────────┐  ┌──────────────┐
│ 5. Update  │  │ Mark payment │
│ Order:     │  │ as "failed"  │
│ payment:   │  │ Show error   │
│  "paid"    │  └──────────────┘
│ status:    │
│ "placed"   │
│            │
│ Clear cart │
│ Send email │
└─────┬──────┘
      │
      ▼
┌──────────────┐
│ 6. Redirect  │
│ to /order-   │
│ success      │
│              │
│ Show order   │
│ confirmation │
│ + order ID   │
└──────────────┘
```

### Razorpay Client Component

```typescript
// components/public/RazorpayButton.tsx
"use client";

import Script from "next/script";

interface RazorpayButtonProps {
  orderId: string;          // MongoDB order ID
  razorpayOrderId: string;  // Razorpay order_XXXXX
  amount: number;           // In paise (e.g., 59900 for ₹599)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function RazorpayButton({ orderId, razorpayOrderId, amount, ... }: RazorpayButtonProps) {
  const handlePayment = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "Sweet Delights Bakery",
      description: `Order #${orderId}`,
      order_id: razorpayOrderId,
      handler: async (response) => {
        // Verify payment on server
        await fetch("/api/user/payment/verify", {
          method: "POST",
          body: JSON.stringify({
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        window.location.href = `/order-success?id=${orderId}`;
      },
      prefill: { name: customerName, email: customerEmail, contact: customerPhone },
      theme: { color: "#D4A574" },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={handlePayment}>Pay ₹{(amount / 100).toFixed(2)}</button>
    </>
  );
}
```

### Payment Creation (Server)

```typescript
// api/user/payment/create/route.ts
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { Order } from "@/lib/models/Order";
import { Cart } from "@/lib/models/Cart";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { deliveryAddress, deliveryDate, deliverySlot, specialInstructions } = await req.json();

  // Get user's cart & calculate total
  const cart = await Cart.findOne({ userId: session.user.id }).populate("items.cakeId items.addons.addonId");
  if (!cart || cart.items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  const subtotal = cart.totalAmount;
  const deliveryCharge = subtotal >= 500 ? 0 : 50; // Free delivery above ₹500
  const totalAmount = subtotal + deliveryCharge;

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount * 100, // Convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  // Create order in DB
  const order = await Order.create({
    orderId: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,
    userId: session.user.id,
    items: cart.items,
    deliveryAddress,
    deliveryDate,
    deliverySlot,
    subtotal,
    deliveryCharge,
    totalAmount,
    payment: {
      method: "razorpay",
      status: "pending",
      razorpayOrderId: razorpayOrder.id,
    },
    orderStatus: "placed",
    statusHistory: [{ status: "placed", changedAt: new Date() }],
    specialInstructions,
  });

  return Response.json({
    orderId: order.orderId,
    razorpayOrderId: razorpayOrder.id,
    amount: totalAmount * 100,
  });
}
```

### Payment Verification (Server)

```typescript
// api/user/payment/verify/route.ts
import crypto from "crypto";
import { Order } from "@/lib/models/Order";
import { Cart } from "@/lib/models/Cart";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await Order.findOneAndUpdate({ orderId }, { "payment.status": "failed" });
    return Response.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Update order payment status
  await Order.findOneAndUpdate(
    { orderId },
    {
      "payment.status": "paid",
      "payment.razorpayPaymentId": razorpay_payment_id,
      "payment.razorpaySignature": razorpay_signature,
      "payment.paidAt": new Date(),
      orderStatus: "confirmed",
      $push: { statusHistory: { status: "confirmed", changedAt: new Date() } },
    }
  );

  // Clear user's cart
  await Cart.findOneAndUpdate({ userId: session.user.id }, { items: [], totalAmount: 0 });

  return Response.json({ success: true, message: "Payment verified" });
}
```

---

## 6c. Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CHECKOUT FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

 STEP 1: CART                STEP 2: CHECKOUT           STEP 3: PAYMENT
 (/cart)                     (/checkout)                (Razorpay Modal)
 ─────────                   ───────────                ────────────────

 ┌────────────────────┐      ┌────────────────────┐     ┌──────────────────┐
 │ CART PAGE          │      │ CHECKOUT PAGE       │     │ RAZORPAY MODAL   │
 │                    │      │                    │     │                  │
 │ ┌────────────────┐ │      │ Delivery Address:  │     │  ┌────────────┐  │
 │ │ Red Velvet 1kg │ │      │ ┌────────────────┐ │     │  │  UPI       │  │
 │ │ ₹599    Qty: 1 │ │      │ │ Full Name      │ │     │  │  Cards     │  │
 │ │ Msg: "Happy    │ │      │ │ Phone          │ │     │  │  NetBank   │  │
 │ │  Birthday!"    │ │      │ │ Street Address │ │     │  │  Wallets   │  │
 │ │                │ │      │ │ City, State    │ │     │  └────────────┘  │
 │ │ Addons:        │ │      │ │ Pincode        │ │     │                  │
 │ │ + Candles  ₹49 │ │      │ │ Landmark       │ │     │  Amount: ₹648   │
 │ │ + Topper  ₹99  │ │      │ └────────────────┘ │     │                  │
 │ └────────────────┘ │      │                    │     │  [Pay Now]       │
 │                    │      │ Delivery Date:     │     └──────────────────┘
 │ ┌────────────────┐ │      │ [📅 Mar 16, 2026]  │
 │ │ Pastry Box x2  │ │      │                    │          │
 │ │ ₹199    Qty: 2 │ │      │ Delivery Slot:     │          │ SUCCESS
 │ └────────────────┘ │      │ [10AM-12PM ▼]      │          │
 │                    │      │                    │          ▼
 │ ─────────────────  │      │ Special Notes:     │     ┌──────────────────┐
 │ Subtotal:   ₹1146 │      │ [No nuts - allergy]│     │ ORDER SUCCESS    │
 │ Delivery:     ₹0  │      │                    │     │ (/order-success) │
 │ ─────────────────  │      │ ┌──────────────┐   │     │                  │
 │ Total:     ₹1146  │      │ │ ORDER SUMMARY│   │     │ ✓ Order Placed!  │
 │                    │      │ │              │   │     │                  │
 │ [Checkout →]       │──────│ │ Items:  ₹1146│   │     │ Order #ORD-2026  │
 └────────────────────┘      │ │ Delivery: ₹0│   │     │   0314-A7B2      │
                             │ │ Total: ₹1146│   │     │                  │
                             │ └──────────────┘   │     │ Track your order │
                             │                    │     │ at /orders/[id]  │
                             │ [Pay with Razorpay]│     │                  │
                             └────────────────────┘     │ [View Order]     │
                                                        └──────────────────┘


 STEP 4: ORDER TRACKING
 (/orders/[id])
 ──────────────────────

 ┌─────────────────────────────────────────────────────┐
 │ ORDER #ORD-20260314-A7B2                            │
 │                                                      │
 │ Status Timeline:                                     │
 │                                                      │
 │  ●──────●──────●──────○──────○                       │
 │  Placed  Confirmed Preparing  Out for   Delivered    │
 │  ✓       ✓         ✓ (now)   Delivery              │
 │                                                      │
 │ Items:                                               │
 │ • Red Velvet Cake 1kg      ₹599                     │
 │   + Birthday Candles        ₹49                     │
 │   + Gold Topper             ₹99                     │
 │   Message: "Happy Birthday!"                        │
 │ • Pastry Box x2             ₹398                    │
 │                                                      │
 │ Delivery: Mar 16, 2026 (10AM-12PM)                  │
 │ Address: 42 Baker Street, Mumbai 400001              │
 │                                                      │
 │ Payment: Razorpay (Paid ✓)                          │
 │ Total: ₹1146                                        │
 └─────────────────────────────────────────────────────┘
```

### Strategy: NextAuth.js v5 + Middleware

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login      │────▶│  NextAuth    │────▶│  MongoDB     │
│   Page       │     │  Credentials │     │  User Check  │
└──────────────┘     │  Provider    │     └──────┬───────┘
                     └──────────────┘            │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  JWT Token   │◀────│  Password    │
                     │  (role incl.)│     │  Verify      │
                     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Middleware   │
                     │  Check Role  │
                     └──────────────┘
```

### Middleware (root `middleware.ts`)

```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isUserRoute = pathname.startsWith("/profile") || pathname.startsWith("/cart") || pathname.startsWith("/checkout") || pathname.startsWith("/orders") || pathname.startsWith("/order-success");
  const isApiUserRoute = pathname.startsWith("/api/user");
  const isLoginPage = pathname === "/admin/login" || pathname === "/login";
  const isRegisterPage = pathname === "/register";

  // Allow login & register pages
  if (isLoginPage || isRegisterPage) return NextResponse.next();

  // Protect admin routes — admin or superadmin only
  if (isAdminRoute || isApiAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (req.auth.user.role !== "admin" && req.auth.user.role !== "superadmin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect user routes — any authenticated user
  if (isUserRoute || isApiUserRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/profile/:path*", "/cart/:path*", "/checkout/:path*", "/orders/:path*", "/order-success/:path*", "/api/user/:path*"],
};
```

### Auth Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { connectDB } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user._id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
```

### Security Layers

| Layer | Protection |
|-------|-----------|
| **Middleware** | Redirects unauthenticated users away from `/admin/*` and `/profile/*` |
| **API Route Handlers** | Verify session + role before any mutation |
| **Server Actions** | Verify session inside each action |
| **UI** | Conditionally render admin/user UI (defense in depth) |
| **Role Check** | `user` can only access own profile/reviews/wishlist; `admin`/`superadmin` can access CMS |

---

## 8. Admin Panel — Content Management

### Admin Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Topbar  [Sweet Delights Admin]        [Admin ▼] [🔔]  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  Sidebar   │            Main Content Area               │
│            │                                            │
│  Dashboard │   ┌──────────────────────────────────┐     │
│  ─────────  │   │  Dashboard Stats                 │     │
│  Header    │   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │     │
│  Hero      │   │  │Pages│ │Media│ │Posts│ │Visits│  │     │
│  About     │   │  │ 12  │ │ 48  │ │ 23 │ │1.2K │  │     │
│  Cakes     │   │  └────┘ └────┘ └────┘ └────┘    │     │
│  Updates   │   └──────────────────────────────────┘     │
│  Visit     │                                            │
│  ─────────  │   ┌──────────────────────────────────┐     │
│  Pages     │   │  Recent Activity                  │     │
│  Media     │   │  • Hero updated — 2 hours ago     │     │
│  ─────────  │   │  • New cake added — 5 hours ago   │     │
│  Footer    │   │  • Page published — 1 day ago     │     │
│  Settings  │   └──────────────────────────────────┘     │
│            │                                            │
└────────────┴────────────────────────────────────────────┘
```

### Content Management Flow

```
Admin opens section
        │
        ▼
┌─────────────────┐     ┌──────────────────┐
│  Fetch current  │────▶│  Pre-fill form   │
│  data (Server)  │     │  with data       │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Admin edits     │
                        │  content         │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Client-side     │
                        │  Zod validation  │
                        └────────┬─────────┘
                                 │
                          ┌──────┴──────┐
                          ▼             ▼
                     ┌────────┐   ┌──────────┐
                     │ Valid  │   │ Invalid  │
                     └───┬────┘   │ Show     │
                         │        │ errors   │
                         ▼        └──────────┘
                  ┌──────────────┐
                  │ Server Action│
                  │ / API call   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Server-side  │
                  │ Zod + Auth   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ MongoDB      │
                  │ Update       │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Revalidate   │
                  │ Cache +      │
                  │ Toast        │
                  └──────────────┘
```

### Admin Features Per Section

| Section | Admin Capabilities |
|---------|-------------------|
| **Header** | Upload logo, add/reorder/hide nav links, toggle sticky, edit CTA button |
| **Hero** | Add/edit/remove slides, upload backgrounds, set overlay, autoplay speed |
| **About** | Edit story text (rich editor), manage team members, update stats |
| **Cakes** | CRUD cakes/pastries, set weight-based pricing, manage categories, set featured, drag-to-reorder, view reviews |
| **Addons** | CRUD addon items (candles, toppers, decorations, packaging, extras), set price, stock, availability |
| **Orders** | View all orders, filter by status/date, update order status (confirm, preparing, out for delivery, delivered), cancel + refund |
| **Users** | View all registered users, toggle active/inactive, view order history per user |
| **Updates** | CRUD blog posts, rich text editor, schedule publishing |
| **Visit** | Edit address, business hours, phone, email, map embed |
| **Footer** | Edit sections/links, social links, copyright text, newsletter toggle |
| **Pages** | Create/edit/delete custom pages with slug, rich text, SEO fields |
| **Media** | Upload images, browse library, delete, set alt text, organize by folder |
| **Settings** | Site name, SEO defaults, theme colors, maintenance mode |

---

## 9. Public Website — Pages & Sections

### Home Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER                                │
│  [Logo]    Home  About  Menu  Gallery  Contact  [Order] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                  HERO SECTION                            │
│           ┌──────────────────────────┐                   │
│           │                          │                   │
│           │   "Handcrafted with      │                   │
│           │        Love"             │                   │
│           │                          │                   │
│           │   Premium cakes for      │                   │
│           │   every occasion         │                   │
│           │                          │                   │
│           │   [ Explore Our Cakes ]  │                   │
│           │                          │                   │
│           │     ● ○ ○  (slides)      │                   │
│           └──────────────────────────┘                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              ✦ OUR FAVORITES ✦                           │
│                                                          │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│    │  Cake   │  │  Cake   │  │  Cake   │               │
│    │  Image  │  │  Image  │  │  Image  │               │
│    │         │  │         │  │         │               │
│    │ Red     │  │ Choco   │  │ Vanilla │               │
│    │ Velvet  │  │ Truffle │  │ Dream   │               │
│    │ $45.99  │  │ $38.99  │  │ $42.99  │               │
│    └─────────┘  └─────────┘  └─────────┘               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              LATEST UPDATES                              │
│                                                          │
│    ┌──────────────────┐  ┌──────────────────┐           │
│    │  Cover Image     │  │  Cover Image     │           │
│    │                  │  │                  │           │
│    │  New Summer      │  │  Wedding Cake    │           │
│    │  Collection!     │  │  Trends 2026     │           │
│    │  Mar 10, 2026    │  │  Mar 5, 2026     │           │
│    └──────────────────┘  └──────────────────┘           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│            VISIT THE CAKE SHOP                           │
│                                                          │
│    ┌────────────────┐    Address: 123 Baker St           │
│    │                │    Phone: (555) 123-4567           │
│    │   Google Map   │    Hours: Mon-Sat 9AM-6PM         │
│    │   Embed        │                                    │
│    │                │    [ Get Directions ]              │
│    └────────────────┘                                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    FOOTER                                │
│  [Logo]  Quick Links  |  Social  |  Newsletter          │
│          About           Instagram   [Email      ]      │
│          Menu            Facebook    [Subscribe  ]      │
│          Contact         Twitter                        │
│                                                          │
│         © 2026 Sweet Delights Bakery                    │
└─────────────────────────────────────────────────────────┘
```

### Data Fetching Strategy

| Section | Rendering | Revalidation |
|---------|-----------|-------------|
| Header | Server Component | `revalidateTag("header")` |
| Hero | Server Component + Client carousel | `revalidateTag("hero")` |
| About | Server Component | `revalidateTag("about")` |
| Favorites (Cakes) | Server Component | `revalidateTag("cakes")` |
| Updates | Server Component | `revalidateTag("updates")` |
| Visit | Server Component | `revalidateTag("visit")` |
| Footer | Server Component | `revalidateTag("footer")` |
| Custom Pages | Dynamic SSR | `revalidateTag("pages")` |

All public pages use **Server Components** for initial data fetch. Interactive elements (carousel, animations, forms) are wrapped in small Client Components.

---

## 10. API Design (Route Handlers)

### Admin API Endpoints

All admin endpoints require authentication and admin role.

```
# Header
GET    /api/admin/header          → Fetch header config
PUT    /api/admin/header          → Update header config

# Hero
GET    /api/admin/hero            → Fetch hero config
PUT    /api/admin/hero            → Update hero config

# About
GET    /api/admin/about           → Fetch about content
PUT    /api/admin/about           → Update about content

# Cakes / Products (CRUD)
GET    /api/admin/cakes           → List all cakes
POST   /api/admin/cakes           → Create new cake
PUT    /api/admin/cakes/[id]      → Update cake
DELETE /api/admin/cakes/[id]      → Delete cake
PATCH  /api/admin/cakes/reorder   → Reorder featured cakes

# Updates (CRUD)
GET    /api/admin/updates         → List all updates
POST   /api/admin/updates         → Create new update
PUT    /api/admin/updates/[id]    → Update post
DELETE /api/admin/updates/[id]    → Delete post

# Visit
GET    /api/admin/visit           → Fetch visit config
PUT    /api/admin/visit           → Update visit config

# Footer
GET    /api/admin/footer          → Fetch footer config
PUT    /api/admin/footer          → Update footer config

# Custom Pages (CRUD)
GET    /api/admin/pages           → List all custom pages
POST   /api/admin/pages           → Create new page
PUT    /api/admin/pages/[id]      → Update page
DELETE /api/admin/pages/[id]      → Delete page

# Media
GET    /api/admin/media           → List media (paginated)
POST   /api/admin/media           → Upload media
DELETE /api/admin/media/[id]      → Delete media

# Addons (CRUD) — Admin managed
GET    /api/admin/addons           → List all addons
POST   /api/admin/addons           → Create new addon
PUT    /api/admin/addons/[id]      → Update addon
DELETE /api/admin/addons/[id]      → Delete addon

# Orders — Admin managed
GET    /api/admin/orders           → List all orders (paginated, filterable)
GET    /api/admin/orders/[id]      → Get single order detail
PUT    /api/admin/orders/[id]      → Update order status
PATCH  /api/admin/orders/[id]/cancel → Cancel order + initiate refund

# Users — Admin managed
GET    /api/admin/users            → List all users (paginated)
GET    /api/admin/users/[id]       → Get single user detail
PUT    /api/admin/users/[id]       → Update user (toggle active, change role)

# Settings
GET    /api/admin/settings        → Fetch site settings
PUT    /api/admin/settings        → Update site settings
```

### Public API Endpoints

```
GET    /api/public/content        → Fetch all homepage content (batched)
GET    /api/public/cakes          → Fetch cakes (with filters: caketype, type, category)
GET    /api/public/cakes/[slug]   → Fetch single cake with reviews
GET    /api/public/pages/[slug]   → Fetch single custom page
```

### User API Endpoints (Auth Required — Any Authenticated User)

```
# Auth
POST   /api/user/register         → Register new user (role: "user")

# Profile
GET    /api/user/profile           → Get own profile
PUT    /api/user/profile           → Update own profile

# Wishlist
GET    /api/user/wishlist          → Get user's wishlisted cakes
POST   /api/user/wishlist          → Add cake to wishlist
DELETE /api/user/wishlist/[cakeId] → Remove cake from wishlist

# Reviews
GET    /api/user/reviews           → Get user's own reviews
POST   /api/user/reviews           → Submit a review on a cake
PUT    /api/user/reviews/[id]      → Edit own review
DELETE /api/user/reviews/[id]      → Delete own review

# Cart
GET    /api/user/cart              → Get user's cart
POST   /api/user/cart              → Add item to cart (cake + weight + addons + message)
PUT    /api/user/cart/[itemIndex]  → Update cart item (quantity, addons)
DELETE /api/user/cart/[itemIndex]  → Remove item from cart
DELETE /api/user/cart              → Clear entire cart

# Checkout & Orders
POST   /api/user/checkout          → Create order from cart + Razorpay order
GET    /api/user/orders            → Get user's order history
GET    /api/user/orders/[id]       → Get single order detail

# Payment (Razorpay)
POST   /api/user/payment/create    → Create Razorpay order (returns razorpay_order_id)
POST   /api/user/payment/verify    → Verify Razorpay payment signature
```

### Preferred Approach: Server Actions

For the admin panel, **Server Actions** are preferred over Route Handlers for form submissions:

```typescript
// lib/actions/hero.actions.ts (Admin-only action)
"use server";

import { auth } from "@/lib/auth";
import { Hero } from "@/lib/models/Hero";
import { heroSchema } from "@/lib/validations/hero.schema";
import { revalidateTag } from "next/cache";

export async function updateHero(formData: FormData) {
  const session = await auth();
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const data = heroSchema.parse(Object.fromEntries(formData));
  await Hero.findOneAndUpdate({}, data, { upsert: true });

  revalidateTag("hero");
  return { success: true };
}
```

```typescript
// lib/actions/reviews.actions.ts (User action)
"use server";

import { auth } from "@/lib/auth";
import { Cake } from "@/lib/models/Cake";
import { revalidateTag } from "next/cache";

export async function submitReview(cakeId: string, data: { rating: number; comment: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const cake = await Cake.findById(cakeId);
  if (!cake) throw new Error("Cake not found");

  cake.reviews.push({
    userId: session.user.id,
    username: session.user.name,
    rating: data.rating,
    comment: data.comment,
  });

  // Recalculate average rating
  const totalRatings = cake.reviews.reduce((sum, r) => sum + r.rating, 0);
  cake.averageRating = totalRatings / cake.reviews.length;
  cake.totalReviews = cake.reviews.length;

  await cake.save();
  revalidateTag("cakes");
  return { success: true };
}
```

---

## 11. Image & Media Management

### Upload Flow

```
Admin selects image
        │
        ▼
┌──────────────────┐
│ Client-side      │
│ • Preview        │
│ • Validate type  │
│ • Validate size  │
│ • Compress       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Upload to        │
│ Cloudinary / S3  │
│ via API route    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Save metadata    │
│ to MongoDB       │
│ (Media model)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Return URL +     │
│ thumbnail URL    │
└──────────────────┘
```

### Recommended: Cloudinary Integration

| Feature | Benefit |
|---------|---------|
| Auto-optimization | WebP/AVIF conversion, responsive sizes |
| Transformations | Crop, resize, blur on-the-fly via URL params |
| CDN delivery | Global edge caching |
| Free tier | 25GB storage, 25GB bandwidth/month |

### Media Picker Component

When editing any section, admins can either:
1. **Upload new** — opens file picker, uploads to cloud, saves to Media
2. **Choose existing** — opens Media Library modal with search/filter

---

## 12. UI/UX Design Guidelines

### Color Palette (Premium Bakery)

```css
:root {
  --color-primary:    #D4A574;   /* Warm Gold — main brand color */
  --color-secondary:  #8B4513;   /* Chocolate Brown — headings, accents */
  --color-accent:     #F5E6D3;   /* Cream — backgrounds, cards */
  --color-dark:       #2C1810;   /* Dark Espresso — text */
  --color-light:      #FFF8F0;   /* Off-White — page background */
  --color-rose:       #E8B4B8;   /* Soft Rose — highlights */
}
```

### Typography

| Use | Font | Style |
|-----|------|-------|
| Headings | **Playfair Display** | Serif, elegant, premium feel |
| Body | **Lato** or **Inter** | Clean sans-serif, readable |
| Accent | **Great Vibes** | Script font for decorative text |

### Animation Strategy (Framer Motion)

```typescript
// components/public/AnimatedSection.tsx
"use client";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function AnimatedSection({ children }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
}
```

### Key UX Patterns

| Pattern | Implementation |
|---------|---------------|
| **Smooth scrolling** | CSS `scroll-behavior: smooth` + section anchors |
| **Parallax hero** | Subtle background parallax on hero images |
| **Hover effects** | Cake cards lift + shadow on hover |
| **Loading states** | Skeleton placeholders matching content layout |
| **Page transitions** | Fade transitions between routes |
| **Image reveal** | Images fade in as they enter viewport |
| **Sticky header** | Header becomes compact + adds backdrop blur on scroll |

---

## 13. Performance & SEO Strategy

### Performance

| Technique | Implementation |
|-----------|---------------|
| **Server Components** | Default for all data-fetching pages |
| **Image optimization** | `next/image` with Cloudinary loader |
| **Font optimization** | `next/font` for Google Fonts (zero layout shift) |
| **Code splitting** | Dynamic imports for heavy components (editor, maps) |
| **ISR** | Tag-based revalidation for content updates |
| **Bundle analysis** | `@next/bundle-analyzer` in dev |

### SEO

```typescript
// app/(public)/layout.tsx
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings(); // cached

  return {
    title: {
      default: settings.seo.defaultTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.seo.defaultDescription,
    openGraph: {
      images: [settings.seo.ogImage],
      siteName: settings.siteName,
    },
  };
}
```

| SEO Feature | Implementation |
|-------------|---------------|
| **Dynamic metadata** | Per-page title, description, OG image |
| **Sitemap** | `app/sitemap.ts` auto-generates from pages + custom pages |
| **Robots** | `app/robots.ts` with admin routes disallowed |
| **Structured data** | JSON-LD for LocalBusiness, BreadcrumbList |
| **Canonical URLs** | Auto-set via metadata API |

---

## 14. Deployment Strategy

### Recommended: Vercel

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────▶│   Vercel     │────▶│  Production  │
│   Push       │     │   Build      │     │  Deploy      │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                    ┌──────────────┐             │
                    │  MongoDB     │◀────────────┘
                    │  Atlas       │
                    └──────────────┘
                    ┌──────────────┐
                    │  Cloudinary  │◀──── (image CDN)
                    └──────────────┘
```

### Environment Variables

```env
# .env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Initial Admin Seeding

```typescript
// scripts/seed-admin.ts
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../lib/models/User";

async function seedAdmin() {
  await connectDB();
  const exists = await User.findOne({ role: "superadmin" });
  if (exists) return console.log("Admin already exists");

  await User.create({
    name: "Super Admin",
    email: "admin@cakeshop.com",
    password: await bcrypt.hash("ChangeMe123!", 12),
    role: "superadmin",
    isActive: true,
  });
  console.log("Admin user created!");
}

seedAdmin();
```

### User Registration Flow

New users register via `/register` with role `"user"` by default:

```typescript
// api/user/register/route.ts
import bcrypt from "bcryptjs";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) return Response.json({ error: "Email already in use" }, { status: 400 });

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: "user",
    isActive: true,
  });

  return Response.json({ success: true, message: "Registration successful" });
}
```

---

## 15. Future Feature Suggestions

### Phase 2 — E-Commerce & Orders

| Feature | Description |
|---------|-------------|
| **Online Ordering** | ~~Cart + checkout + Razorpay~~ ✅ Implemented — full cart, checkout, Razorpay payment flow |
| **Addon Items** | ~~Add-on items~~ ✅ Implemented — candles, toppers, decorations, packaging, extras (admin-managed) |
| **Order Management** | ~~Admin order management~~ ✅ Implemented — view/update status, cancel + refund |
| **Order Tracking** | ~~Status tracking~~ ✅ Implemented — status timeline (placed → confirmed → preparing → out for delivery → delivered) |
| **Pricing Tiers** | ~~Size-based pricing~~ ✅ Implemented via weight-based `prices` array in Cake model |
| **Custom Cake Builder** | Interactive cake customizer (layers, flavors, toppings, message) |
| **Coupon System** | Discount codes, seasonal promotions, first-order discounts |

### Phase 3 — Customer Engagement

| Feature | Description |
|---------|-------------|
| **Customer Reviews** | ~~Star ratings + reviews~~ ✅ Implemented via embedded `reviews` in Cake model |
| **Wishlist / Favorites** | ~~Customers can save cakes~~ ✅ Implemented via `wishlist` array in User model |
| **Newsletter** | Email subscription with Mailchimp/Resend integration |
| **Live Chat** | Tawk.to or custom chat widget for cake inquiries |
| **Social Media Feed** | Instagram feed embed showing latest cake photos |
| **Loyalty Program** | Points system — earn on orders, redeem for discounts |

### Phase 4 — Advanced CMS

| Feature | Description |
|---------|-------------|
| **Multi-language Support** | i18n for header, content, and pages |
| **Drag-and-Drop Page Builder** | Visual page builder for custom pages |
| **Content Versioning** | History/undo for all content changes |
| **Scheduled Publishing** | Set publish/unpublish dates for updates and pages |
| **Role-Based Access** | Editor, Manager, Super Admin with granular permissions |
| **Activity Log** | Track all admin actions (who changed what, when) |

### Phase 5 — Analytics & Growth

| Feature | Description |
|---------|-------------|
| **Analytics Dashboard** | Page views, popular cakes, conversion tracking |
| **A/B Testing** | Test hero variants, CTA text, layouts |
| **SEO Analyzer** | Built-in SEO score for each page |
| **PWA Support** | Installable app with offline browsing |
| **Push Notifications** | Notify customers about new cakes, offers |
| **AI Recommendations** | "You might also like" based on browsing history |

### Phase 6 — Operations

| Feature | Description |
|---------|-------------|
| **Inventory Management** | Track ingredients, availability, stock levels |
| **Delivery Zones** | Define delivery areas with radius-based pricing |
| **Calendar Integration** | Manage bookings, delivery slots, event orders |
| **Multi-Branch Support** | Manage multiple shop locations from one admin |
| **Automated Backups** | Scheduled MongoDB backups with one-click restore |

---

## Quick Start Checklist

```
[ ] Initialize Next.js 15 project with TypeScript
[ ] Set up Tailwind CSS 4 + custom theme
[ ] Configure MongoDB connection (lib/db.ts)
[ ] Define all Mongoose models (User, Cake, Addon, Cart, Order, + CMS models)
[ ] Set up NextAuth.js v5 with credentials provider
[ ] Create middleware for admin + user route protection
[ ] Seed initial admin user
[ ] Build user registration + login flow
[ ] Build admin layout (sidebar + topbar)
[ ] Build admin CRUD pages for each section
[ ] Build admin addon management (CRUD candles, toppers, etc.)
[ ] Build admin order management (view, status updates, cancel/refund)
[ ] Build admin user management (view, toggle active, roles)
[ ] Build public layout (header + footer from DB)
[ ] Build homepage sections (Hero, Featured Cakes, Updates, Visit)
[ ] Build cake detail page with reviews + add to cart
[ ] Build cart page (add/remove items, addons, cake message)
[ ] Build checkout page (address, delivery date/slot, order summary)
[ ] Set up Razorpay integration (payment create + verify)
[ ] Build order confirmation + tracking pages
[ ] Set up Cloudinary for media uploads
[ ] Add Framer Motion animations
[ ] Configure SEO metadata
[ ] Deploy to Vercel + connect MongoDB Atlas
[ ] Configure Razorpay production keys
[ ] Test full ordering flow end-to-end
[ ] Test admin flow end-to-end
[ ] Test public site performance (Lighthouse)
```

---

*Architecture designed for **Sweet Delights Cake Shop** — a premium, admin-manageable cake shop website built with Next.js 15 and MongoDB.*
