// All business text lives here. Edit the values and the whole site updates.
// Items marked [CHECK] are drafts or placeholders that you should review before going live.

export const site = {
  name: "Sangama Traders",
  // Small line shown under the name in the footer and in search results.
  strapline: "Farm Fresh Produce Trading",

  tagline: "The Freshest Harvest, Straight to Your Door",

  description:
    "Sangama Traders supplies fresh fruits and vegetables sourced directly from trusted growers, quality-checked, packed and delivered on schedule to buyers in India and overseas.",

  // Logo files live in /public/brand. The wide logo goes in the header, the lion mark in the footer.
  logo: { full: "/brand/logo.png", fullWidth: 1100, fullHeight: 350, mark: "/brand/logo-mark.png" },

  hero: {
    badge: "Sourced directly from growers",
    headline: "The Freshest Harvest, Straight to Your Door",
    paragraph:
      "We source fresh fruits and vegetables from trusted growers, check quality at every step, and pack and deliver on schedule, so your supply stays fresh and dependable.",
    // [CHECK] Only promise what you can really deliver.
    stats: [
      { value: "Direct", label: "From growers" },
      { value: "14+", label: "Fresh products" },
      { value: "100%", label: "Quality checked" },
      { value: "24h", label: "Quote response" },
    ],
    // Video plays once, then the slideshow takes over. Replace the files in /public/hero to change them.
    video: "/hero/hero.mp4",
    poster: "/hero/poster.jpg",
    // [CHECK] Slide 1 is a frame from the video (replace it with your aerial ship photo). Slides 2 to 6 are placeholders cut from the produce photo. Replace the files in /public/hero/slides.
    slides: [
      "/hero/slides/slide-1.jpg",
      "/hero/slides/slide-2.jpg",
      "/hero/slides/slide-3.jpg",
      "/hero/slides/slide-4.jpg",
      "/hero/slides/slide-5.jpg",
      "/hero/slides/slide-6.jpg",
    ],
  },

  // [CHECK] Draft about text. Add the year you started if you like.
  about: {
    headline: "Fresh produce, traded with honesty and care",
    paragraphs: [
      "Sangama Traders is a fresh fruits and vegetables trading company based in Walajapet, Ranipet, Tamil Nadu. We work directly with trusted growers to bring farm-fresh produce to wholesalers, retailers, hotels and businesses that depend on quality and a steady supply.",
      "Every consignment is quality-checked, carefully graded and packed to keep it fresh, then delivered on schedule. We keep our pricing fair and our communication clear, because we want every buyer to come back to us.",
    ],
  },

  // "Why choose us" cards. [CHECK] The photos are placeholders: replace the files in /public/images.
  why: {
    headline: "Why choose us",
    intro:
      "Choose us for a smooth buying experience built on reliable supply, carefully checked quality and fast, dependable delivery.",
    items: [
      { title: "Reliability", text: "Steady supply straight from trusted growers.", image: "/images/why-reliability.jpg" },
      { title: "Quality", text: "Checked and graded at every step before packing.", image: "/images/why-quality.jpg" },
      { title: "Fast Service", text: "Quotes within 24 hours and delivery on schedule.", image: "/images/why-delivery.jpg" },
    ],
  },

  cta: {
    headline: "Let's do business together",
    text: "Tell us what you need, the quantity and the delivery location. We reply with pricing and availability within 24 hours.",
    button: "Contact us",
  },

  // The products we trade most. Shown on the home page. More are available on request.
  majorProducts: {
    fruits: ["Banana", "Mango", "Pomegranate", "Grapes", "Lemon", "Coconut"],
    vegetables: ["Small Onion", "Big Onion", "Tomato", "Green Chilli", "Brinjal", "Okra", "Drumstick", "Beans"],
    note: "...and many more fruits and vegetables available on request.",
  },

  contact: {
    email: "sangamatraders.21@gmail.com",
    phone: "+91 80158 10364",
    // International format, digits only, no plus sign. Used for the WhatsApp link. Leave "" to hide it.
    whatsapp: "918015810364",
    address: "Ramamoorthy Block, opposite Post Office, Anandhalai, Walajapet, Ranipet, Tamil Nadu, India",
    hours: "Monday to Saturday, 9:00 AM to 6:00 PM (closed on Sunday)",
  },

  // Shown in this order.
  targetMarkets: [
    "Singapore",
    "Malaysia",
    "Sri Lanka",
    "China",
    "Russia",
    "Southeast Asia (Indonesia, Thailand, Vietnam, the Philippines, Brunei)",
    "UAE & Middle East",
    "Across India",
  ],

  // Time zone used when showing dates in the admin area
  timezone: "Asia/Kolkata",
};
