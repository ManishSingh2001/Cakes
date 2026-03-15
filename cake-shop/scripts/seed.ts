import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cake-shop";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  const db = mongoose.connection.db!;

  // 1. Seed Super Admin
  console.log("Seeding admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await db.collection("users").updateOne(
    { email: "admin@cakeshop.com" },
    {
      $set: {
        name: "Super Admin",
        email: "admin@cakeshop.com",
        password: hashedPassword,
        role: "superadmin",
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  // 2. Seed Header
  console.log("Seeding header...");
  await db.collection("headers").updateOne(
    {},
    {
      $set: {
        logo: { imageUrl: "", altText: "Sweet Delights Bakery", linkTo: "/" },
        navigation: [
          { label: "Home", href: "/", order: 0, isVisible: true },
          { label: "About", href: "/about", order: 1, isVisible: true },
          { label: "Menu", href: "/menu", order: 2, isVisible: true },
          { label: "Gallery", href: "/gallery", order: 3, isVisible: true },
          { label: "Contact", href: "/contact", order: 4, isVisible: true },
        ],
        ctaButton: { text: "Order Now", href: "/menu", isVisible: true },
        isSticky: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 3. Seed Hero
  console.log("Seeding hero...");
  await db.collection("heroes").updateOne(
    {},
    {
      $set: {
        slides: [
          {
            title: "Handcrafted with Love",
            subtitle: "Premium cakes for every occasion",
            backgroundImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80",
            ctaText: "Explore Our Cakes",
            ctaLink: "/menu",
            overlayOpacity: 0.4,
            order: 0,
            isActive: true,
          },
          {
            title: "Celebrate Every Moment",
            subtitle: "Custom cakes made just for you",
            backgroundImage: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1920&q=80",
            ctaText: "Order Now",
            ctaLink: "/menu",
            overlayOpacity: 0.45,
            order: 1,
            isActive: true,
          },
        ],
        autoplaySpeed: 5000,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 4. Seed About
  console.log("Seeding about...");
  await db.collection("abouts").updateOne(
    {},
    {
      $set: {
        sectionTitle: "Our Story",
        heading: "Baking Happiness Since 2010",
        description: "<p>At Sweet Delights, we believe every cake tells a story. Founded with a passion for baking and a love for creating memorable moments, we've been crafting premium cakes and pastries for over a decade.</p><p>Our team of talented bakers uses only the finest ingredients to create cakes that not only look stunning but taste absolutely divine.</p>",
        images: [
          { url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80", alt: "Our Bakery", order: 0 },
        ],
        stats: [
          { label: "Cakes Delivered", value: "5000+", icon: "cake" },
          { label: "Happy Customers", value: "3000+", icon: "heart" },
          { label: "Years of Experience", value: "14+", icon: "clock" },
          { label: "Cake Varieties", value: "100+", icon: "star" },
        ],
        teamMembers: [
          { name: "Priya Sharma", role: "Head Baker", image: "", bio: "With 15 years of experience, Priya leads our baking team with creativity and precision." },
          { name: "Rahul Patel", role: "Pastry Chef", image: "", bio: "Rahul specializes in French pastries and creates our signature desserts." },
        ],
        isVisible: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 5. Seed Sample Cakes
  console.log("Seeding cakes...");
  const cakes = [
    {
      name: "Red Velvet Dream",
      description: "A classic red velvet cake with cream cheese frosting, layered with love and topped with red velvet crumbs.",
      caketype: "cake",
      type: "egg",
      category: "Birthday",
      slug: "red-velvet-dream",
      images: [{ url: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&q=80", alt: "Red Velvet Cake" }],
      prices: [
        { weight: 500, costPrice: 350, sellPrice: 499 },
        { weight: 1000, costPrice: 650, sellPrice: 899 },
        { weight: 1500, costPrice: 900, sellPrice: 1299 },
      ],
      tags: ["red velvet", "premium", "bestseller"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 4.5,
      totalReviews: 0,
      order: 0,
    },
    {
      name: "Chocolate Truffle",
      description: "Rich dark chocolate cake with layers of chocolate ganache and truffle filling.",
      caketype: "cake",
      type: "eggless",
      category: "Birthday",
      slug: "chocolate-truffle",
      images: [{ url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", alt: "Chocolate Truffle Cake" }],
      prices: [
        { weight: 500, costPrice: 300, sellPrice: 449 },
        { weight: 1000, costPrice: 550, sellPrice: 799 },
      ],
      tags: ["chocolate", "truffle", "eggless"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      order: 1,
    },
    {
      name: "Vanilla Butterscotch",
      description: "Light vanilla sponge cake with crunchy butterscotch praline and cream frosting.",
      caketype: "cake",
      type: "eggless",
      category: "Anniversary",
      slug: "vanilla-butterscotch",
      images: [{ url: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80", alt: "Vanilla Butterscotch Cake" }],
      prices: [
        { weight: 500, costPrice: 280, sellPrice: 399 },
        { weight: 1000, costPrice: 500, sellPrice: 699 },
      ],
      tags: ["vanilla", "butterscotch", "eggless"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      order: 2,
    },
    {
      name: "Strawberry Cheesecake",
      description: "Creamy New York style cheesecake topped with fresh strawberry compote.",
      caketype: "cake",
      type: "egg",
      category: "Custom",
      slug: "strawberry-cheesecake",
      images: [{ url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80", alt: "Strawberry Cheesecake" }],
      prices: [
        { weight: 500, costPrice: 400, sellPrice: 599 },
        { weight: 1000, costPrice: 750, sellPrice: 1099 },
      ],
      tags: ["cheesecake", "strawberry", "premium"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      order: 3,
    },
    {
      name: "Croissant Box",
      description: "Fresh baked butter croissants, flaky and golden. Box of 4.",
      caketype: "pastries",
      type: "egg",
      category: "Custom",
      slug: "croissant-box",
      images: [{ url: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800&q=80", alt: "Croissants" }],
      prices: [{ weight: 200, costPrice: 150, sellPrice: 249 }],
      tags: ["pastry", "croissant", "breakfast"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      order: 4,
    },
    {
      name: "Mango Mousse Cake",
      description: "Tropical mango mousse layered on a vanilla sponge base with mango glaze.",
      caketype: "cake",
      type: "eggless",
      category: "Wedding",
      slug: "mango-mousse-cake",
      images: [{ url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80", alt: "Mango Mousse Cake" }],
      prices: [
        { weight: 500, costPrice: 350, sellPrice: 549 },
        { weight: 1000, costPrice: 650, sellPrice: 999 },
      ],
      tags: ["mango", "mousse", "eggless", "summer"],
      isFeatured: true,
      isAvailable: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      order: 5,
    },
  ];

  for (const cake of cakes) {
    await db.collection("cakes").updateOne(
      { slug: cake.slug },
      { $set: { ...cake, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }

  // 6. Seed Addons
  console.log("Seeding addons...");
  const addons = [
    { name: "Birthday Candles (Pack of 10)", slug: "birthday-candles-10", description: "Colorful birthday candles", category: "candles", price: 49, stock: 100, isAvailable: true, order: 0 },
    { name: "Number Candle (Gold)", slug: "number-candle-gold", description: "Gold number candle (specify number)", category: "candles", price: 79, stock: 50, isAvailable: true, order: 1 },
    { name: "Happy Birthday Topper", slug: "happy-birthday-topper", description: "Acrylic Happy Birthday cake topper", category: "toppers", price: 129, stock: 30, isAvailable: true, order: 2 },
    { name: "Gift Box Premium", slug: "gift-box-premium", description: "Premium gift box with ribbon", category: "packaging", price: 199, stock: 20, isAvailable: true, order: 3 },
    { name: "Knife & Server Set", slug: "knife-server-set", description: "Cake knife and server set", category: "extras", price: 149, stock: 15, isAvailable: true, order: 4 },
  ];

  for (const addon of addons) {
    await db.collection("addons").updateOne(
      { slug: addon.slug },
      { $set: { ...addon, image: "", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }

  // 7. Seed Footer
  console.log("Seeding footer...");
  await db.collection("footers").updateOne(
    {},
    {
      $set: {
        logo: { imageUrl: "", altText: "Sweet Delights Bakery" },
        description: "Handcrafted premium cakes and pastries made with love for every special occasion.",
        sections: [
          {
            title: "Quick Links",
            links: [
              { label: "Home", href: "/", isExternal: false },
              { label: "Menu", href: "/menu", isExternal: false },
              { label: "About Us", href: "/about", isExternal: false },
              { label: "Contact", href: "/contact", isExternal: false },
            ],
            order: 0,
          },
          {
            title: "Customer Service",
            links: [
              { label: "My Orders", href: "/orders", isExternal: false },
              { label: "My Profile", href: "/profile", isExternal: false },
              { label: "Wishlist", href: "/profile/wishlist", isExternal: false },
            ],
            order: 1,
          },
        ],
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com", icon: "instagram" },
          { platform: "facebook", url: "https://facebook.com", icon: "facebook" },
        ],
        copyrightText: "© 2026 Sweet Delights Bakery. All rights reserved.",
        newsletterEnabled: false,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 8. Seed Visit
  console.log("Seeding visit...");
  await db.collection("visits").updateOne(
    {},
    {
      $set: {
        sectionTitle: "Visit Us",
        heading: "Come Experience the Magic",
        description: "Visit our bakery to see the magic happen. Freshly baked cakes daily!",
        address: { street: "42 Baker Street", city: "Mumbai", state: "Maharashtra", zipCode: "400001", country: "India" },
        phone: "+91 98765 43210",
        email: "hello@sweetdelights.com",
        businessHours: [
          { day: "Monday", openTime: "09:00", closeTime: "21:00", isClosed: false },
          { day: "Tuesday", openTime: "09:00", closeTime: "21:00", isClosed: false },
          { day: "Wednesday", openTime: "09:00", closeTime: "21:00", isClosed: false },
          { day: "Thursday", openTime: "09:00", closeTime: "21:00", isClosed: false },
          { day: "Friday", openTime: "09:00", closeTime: "22:00", isClosed: false },
          { day: "Saturday", openTime: "10:00", closeTime: "22:00", isClosed: false },
          { day: "Sunday", openTime: "10:00", closeTime: "20:00", isClosed: false },
        ],
        mapEmbedUrl: "",
        images: [],
        isVisible: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 9. Seed Site Settings
  console.log("Seeding site settings...");
  await db.collection("sitesettings").updateOne(
    {},
    {
      $set: {
        siteName: "Sweet Delights Bakery",
        tagline: "Handcrafted Cakes & Pastries",
        favicon: "",
        seo: {
          defaultTitle: "Sweet Delights Bakery — Premium Cakes & Pastries",
          defaultDescription: "Handcrafted premium cakes and pastries for every occasion. Order online for delivery.",
          ogImage: "",
        },
        theme: {
          primaryColor: "#D4A574",
          secondaryColor: "#8B4513",
          accentColor: "#F5E6D3",
          fontHeading: "Playfair Display",
          fontBody: "Lato",
        },
        maintenance: { isEnabled: false, message: "We'll be back soon!" },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("\nSeed completed successfully!");
  console.log("Admin login: admin@cakeshop.com / admin123");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
