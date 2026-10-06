/* ==========================================================================
   MKUYU AFRICA — preview content
   --------------------------------------------------------------------------
   SAMPLE / DEMONSTRATION DATA ONLY.

   The real property catalogue lives in the internal MKUYU system, managed by
   the Sales Officer. Nothing in this file is a real MKUYU listing. It exists
   so the site can be reviewed before it is connected (see config.js), and
   every record carries `sample: true` so it can never be mistaken for real
   inventory.

   PROPERTIES and PROJECTS use exactly the shape the public API returns
   (docs/PUBLIC-API.md), so connecting the site is a drop-in replacement.
   Amounts are in Tanzanian shillings (TZS).
   ========================================================================== */

export const COMPANY = {
  name: "MKUYU Africa",
  tagline: "Quality homes. Real ownership.",
  vision: "One million modern, affordable homes across Tanzania.",
  ceo: "Juneid Othman",
  // Verified from Tanzanian press coverage (The Citizen / Daily News, 2026).
  // No public contact channel is published, so these are left EMPTY rather
  // than invented. Fill them from an official source before launch.
  phone: "",
  email: "",
  address: "Dar es Salaam, Tanzania",
};

export const SERVICES = [
  { icon: "home", title: "Property development", text: "Homes, apartments and mixed developments built to a standard families can be proud of, in locations that stay useful for years." },
  { icon: "tag", title: "Property sales", text: "A clear buying journey: verified titles, transparent pricing, and written terms agreed before any money changes hands." },
  { icon: "key", title: "Property rental", text: "Rental homes managed professionally, with proper agreements for both owner and tenant." },
  { icon: "handshake", title: "Sell with MKUYU", text: "Own a property? Our sales team reviews it and helps you reach serious, verified buyers." },
  { icon: "card", title: "Flexible payment plans", text: "Instalment arrangements that let ordinary Tanzanians purchase gradually instead of paying everything at once." },
  { icon: "shield", title: "Title & due diligence", text: "Ownership documents, contract terms, project location and payment terms explained clearly before you commit." },
];

export const FAQS = [
  { q: "Can I buy a home in instalments?", a: "Instalment payment plans are available on applicable terms. The arrangement is agreed in writing in your contract, so there is no ambiguity about what is owed and when." },
  { q: "Do I need an account to rent, buy or sell?", a: "No. To rent or buy, choose a property and leave your name, phone, email and budget. To sell, fill in the Sell form with your property and contact details. Our team contacts you the way you prefer." },
  { q: "Can I sell my own property through MKUYU?", a: "Yes. Submit it through the Sell page. Our sales team reviews every submission before anything is published, and will contact you about the next steps." },
  { q: "Do you work with Tanzanians living abroad?", a: "Yes. The Miliki Ardhi Diaspora programme exists specifically to help Tanzanians in the diaspora start owning property in Tanzania while still overseas." },
];

/* ---- SAMPLE PROJECTS ---- */
export const PROJECTS = [
  // services: chosen by the Sales Officer when the project's photos are uploaded.
  { slug: "sample-riverside-estate", name: "Riverside Estate", location: "Dar es Salaam", summary: "A sample master-planned residential development shown to demonstrate the project layout.", status: "Selling now", services: ["buy"], photos: [], sample: true },
  { slug: "sample-hillside-residences", name: "Hillside Residences", location: "Arusha", summary: "A sample hillside residential project with homes to rent and to buy, used for layout demonstration only.", status: "Selling and letting", services: ["rent", "buy"], photos: [], sample: true },
  { slug: "sample-mbeach-gardens", name: "Mbeach Gardens", location: "Nyerere Road, Dar es Salaam", summary: "A sample urban garden development used for layout demonstration only.", status: "Phase 2", services: ["buy"], photos: [], sample: true },
];

/* ---- SAMPLE PROPERTIES ----
   services: which public services the Sales Officer has opened it for.
   status:   the system-controlled lifecycle state. Only the internal system
             changes it; the website only reads it.
   A sold and a rented record are included on purpose, to show that such a
   property drops out of the listings by itself. */
export const PROPERTIES = [
  {
    id: 101, slug: "sample-villa-12", title: "Villa 12 · 3 Bedroom", type: "Villa",
    services: ["buy"], status: "available",
    price: { sale: 185000000 },
    location: "Riverside Estate, Dar es Salaam", project: { slug: "sample-riverside-estate", name: "Riverside Estate" },
    bedrooms: 3, bathrooms: 2, area: 240, featured: true, photos: [], sample: true,
    summary: "Three-bedroom villa with a private garden in a gated estate.",
    description: "A sample three-bedroom villa record used to demonstrate the property detail layout. In the live site this text comes from the property record the Sales Officer maintains.",
    features: ["Private garden", "Off-street parking", "Fitted kitchen", "Water and power backup"],
  },
  {
    id: 102, slug: "sample-apartment-7", title: "Apartment 7 · 2 Bedroom", type: "Apartment",
    services: ["rent", "buy"], status: "available",
    price: { sale: 95000000, rent: { amount: 1200000, period: "month" } },
    location: "Hillside Residences, Arusha", project: { slug: "sample-hillside-residences", name: "Hillside Residences" },
    bedrooms: 2, bathrooms: 2, area: 110, featured: true, photos: [], sample: true,
    summary: "Bright two-bedroom apartment with a balcony and mountain views.",
    description: "A sample two-bedroom apartment record, offered both to rent and to buy, used to show how one property can appear under both services.",
    features: ["Secure building", "Balcony", "Shared water", "Resident parking"],
  },
  {
    id: 103, slug: "sample-plot-21", title: "Plot 21 · Residential Land", type: "Land",
    services: ["buy"], status: "available",
    price: { sale: 42000000 },
    location: "Mbeach Gardens, Nyerere Road", project: { slug: "sample-mbeach-gardens", name: "Mbeach Gardens" },
    bedrooms: 0, bathrooms: 0, area: 600, featured: true, photos: [], sample: true,
    summary: "Serviced corner plot with road access and utilities nearby.",
    description: "A sample serviced-plot record used to demonstrate the land listing layout.",
    features: ["Title available", "Serviced road access", "Utilities nearby", "Corner plot"],
  },
  {
    id: 104, slug: "sample-house-mikocheni", title: "Family House · 4 Bedroom", type: "House",
    services: ["rent"], status: "available",
    price: { rent: { amount: 2800000, period: "month" } },
    location: "Mikocheni, Dar es Salaam", project: null,
    bedrooms: 4, bathrooms: 3, area: 320, featured: true, photos: [], sample: true,
    summary: "Spacious family home with a walled compound and staff quarters.",
    description: "A sample four-bedroom house offered for rent, used to demonstrate a rental listing.",
    features: ["Walled compound", "Staff quarters", "Borehole water", "Generator"],
  },
  {
    id: 105, slug: "sample-studio-masaki", title: "Studio · Serviced", type: "Apartment",
    services: ["rent"], status: "available",
    price: { rent: { amount: 850000, period: "month" } },
    location: "Masaki, Dar es Salaam", project: null,
    bedrooms: 1, bathrooms: 1, area: 48, featured: false, photos: [], sample: true,
    summary: "Compact serviced studio close to the Msasani peninsula.",
    description: "A sample serviced studio offered for rent.",
    features: ["Furnished", "Weekly cleaning", "Backup power", "Secure parking"],
  },
  {
    id: 106, slug: "sample-office-posta", title: "Office Floor · Posta", type: "Commercial",
    services: ["rent", "buy"], status: "available",
    price: { sale: 640000000, rent: { amount: 9500000, period: "month" } },
    location: "Posta, Dar es Salaam", project: null,
    bedrooms: 0, bathrooms: 2, area: 410, featured: false, photos: [], sample: true,
    summary: "Open-plan office floor in the city centre with lift access.",
    description: "A sample commercial floor offered to rent or to buy.",
    features: ["Lift access", "Open plan", "Backup power", "Basement parking"],
  },
  {
    id: 107, slug: "sample-penthouse-oysterbay", title: "Penthouse · Ocean View", type: "Penthouse",
    services: ["buy"], status: "reserved",
    price: { sale: 1150000000 },
    location: "Oyster Bay, Dar es Salaam", project: null,
    bedrooms: 4, bathrooms: 4, area: 380, featured: false, photos: [], sample: true,
    summary: "Top-floor penthouse with a wraparound terrace.",
    description: "A sample RESERVED record: temporarily held while a transaction is processed. Whether reserved properties appear publicly is still being decided (config.js).",
    features: ["Wraparound terrace", "Private lift", "Ocean view", "Two parking bays"],
  },
  {
    id: 108, slug: "sample-villa-3", title: "Villa 3 · 3 Bedroom", type: "Villa",
    services: ["buy"], status: "sold",
    price: { sale: 178000000 },
    location: "Riverside Estate, Dar es Salaam", project: { slug: "sample-riverside-estate", name: "Riverside Estate" },
    bedrooms: 3, bathrooms: 2, area: 235, featured: false, photos: [], sample: true,
    summary: "Sold — shown only to demonstrate that sold homes leave the listings.",
    description: "A sample SOLD record. It never appears in the Buy listings; opening it directly shows that it is no longer available.",
    features: [],
  },
  {
    id: 109, slug: "sample-apartment-2", title: "Apartment 2 · 1 Bedroom", type: "Apartment",
    services: ["rent"], status: "rented",
    price: { rent: { amount: 700000, period: "month" } },
    location: "Hillside Residences, Arusha", project: { slug: "sample-hillside-residences", name: "Hillside Residences" },
    bedrooms: 1, bathrooms: 1, area: 60, featured: false, photos: [], sample: true,
    summary: "Rented — shown only to demonstrate that rented homes leave the listings.",
    description: "A sample RENTED record. It never appears in the Rent listings.",
    features: [],
  },
];

export const PROPERTY_TYPES = ["Villa", "Apartment", "House", "Land", "Penthouse", "Commercial"];

/* ---- SAMPLE CUSTOMER PORTALS ----
   Preview only (portal.html?demo=...). Three customers show how ONE portal
   adapts to the services a customer actually uses. The stage labels are the
   customer-facing wording of the internal contract workflow; steps whose
   business rules are still undecided say so instead of inventing detail. */
const buyRentStages = (currentIndex, dates = []) => [
  "Request received",
  "Reviewed by our sales team",
  "Contract being prepared",
  "Legal review",
  "Financial check",
  "Management approval",
  "Ready for your signature",
  "Signed — contract active",
  "Completion and handover",
].map((label, index) => ({
  label,
  state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
  date: dates[index] || null,
  note: index === 8 && index >= currentIndex ? "Handover details will be confirmed by MKUYU." : null,
}));

export const DEMO_PORTALS = {
  "rent-sell": {
    label: "Renting + selling",
    customer: { name: "Amina Hassan (sample)", email: "amina@example.com" },
    services: {
      rent: [{
        id: "R-1042", sample: true,
        property: { slug: "sample-house-mikocheni", title: "Family House · 4 Bedroom", location: "Mikocheni, Dar es Salaam", type: "House" },
        status: "Rental active",
        stages: buyRentStages(9, ["2 Jun 2026", "4 Jun 2026", "9 Jun 2026", "12 Jun 2026", "13 Jun 2026", "16 Jun 2026", "18 Jun 2026", "20 Jun 2026", "1 Jul 2026"]),
        contract: { number: "MKY-2026-0187", status: "Active", signed: "20 Jun 2026" },
        rental: { start: "1 Jul 2026", end: "30 Jun 2027", period: "12 months" },
        payments: {
          currency: "TZS", total: 33600000, paid: 11200000, balance: 22400000,
          next_due: { amount: 2800000, date: "1 Nov 2026" },
          installments: [
            { label: "Rent · Jul–Sep 2026", due: "1 Jul 2026", amount: 8400000, status: "paid" },
            { label: "Rent · Oct 2026", due: "1 Oct 2026", amount: 2800000, status: "paid" },
            { label: "Rent · Nov 2026", due: "1 Nov 2026", amount: 2800000, status: "pending" },
            { label: "Rent · Dec 2026", due: "1 Dec 2026", amount: 2800000, status: "pending" },
          ],
          history: [
            { date: "28 Jun 2026", amount: 8400000, method: "Bank transfer", reference: "CRDB-55120", receipt: true },
            { date: "30 Sep 2026", amount: 2800000, method: "Mobile money", reference: "MP-8830211", receipt: true },
          ],
        },
        documents: [{ name: "Rental agreement MKY-2026-0187", kind: "Contract" }, { name: "Receipt CRDB-55120", kind: "Receipt" }, { name: "Receipt MP-8830211", kind: "Receipt" }],
      }],
      sell: [{
        id: "S-0311", sample: true,
        property: { title: "3 Bedroom House · Kimara", location: "Kimara, Dar es Salaam", type: "House" },
        status: "Under review",
        asking_price: 150000000, currency: "TZS",
        officer: { name: "Sales & Marketing Officer" },
        stages: [
          { label: "Submitted", state: "done", date: "22 Sep 2026" },
          { label: "Under review by our sales team", state: "current", date: "23 Sep 2026" },
          { label: "Next steps", state: "upcoming", note: "The steps after review (agreement, publishing, sale, payment to you) are being finalised by MKUYU." },
        ],
        documents: [{ name: "Photos (6)", kind: "Your upload" }],
      }],
    },
  },
  buy: {
    label: "Buying in instalments",
    customer: { name: "Joseph Mrema (sample)", email: "joseph@example.com" },
    services: {
      buy: [{
        id: "B-0877", sample: true,
        property: { slug: "sample-villa-12", title: "Villa 12 · 3 Bedroom", location: "Riverside Estate, Dar es Salaam", type: "Villa" },
        status: "Contract active",
        stages: buyRentStages(8, ["3 Mar 2026", "5 Mar 2026", "11 Mar 2026", "14 Mar 2026", "16 Mar 2026", "19 Mar 2026", "21 Mar 2026", "25 Mar 2026"]),
        contract: { number: "MKY-2026-0102", status: "Active", signed: "25 Mar 2026" },
        ownership: "Ownership transfer follows completion of payment, as set out in your contract.",
        payments: {
          currency: "TZS", total: 185000000, paid: 74000000, balance: 111000000,
          next_due: { amount: 14800000, date: "25 Aug 2026" },
          installments: [
            { label: "Deposit", due: "25 Mar 2026", amount: 37000000, status: "paid" },
            { label: "Instalment 1 of 10", due: "25 Apr 2026", amount: 14800000, status: "paid" },
            { label: "Instalment 2 of 10", due: "25 May 2026", amount: 14800000, status: "paid" },
            { label: "Instalment 3 of 10", due: "25 Jun 2026", amount: 14800000, status: "partial" },
            { label: "Instalment 4 of 10", due: "25 Jul 2026", amount: 14800000, status: "overdue" },
            { label: "Instalment 5 of 10", due: "25 Aug 2026", amount: 14800000, status: "pending" },
          ],
          history: [
            { date: "25 Mar 2026", amount: 37000000, method: "Bank transfer", reference: "NMB-10233", receipt: true },
            { date: "24 Apr 2026", amount: 14800000, method: "Bank transfer", reference: "NMB-10891", receipt: true },
            { date: "25 May 2026", amount: 14800000, method: "Mobile money", reference: "MP-7712090", receipt: true },
            { date: "27 Jun 2026", amount: 7400000, method: "Cash", reference: "RCPT-0441", receipt: true },
          ],
        },
        documents: [{ name: "Sale agreement MKY-2026-0102", kind: "Contract" }, { name: "Receipt NMB-10233", kind: "Receipt" }],
      }],
    },
  },
  new: {
    label: "New customer",
    customer: { name: "Neema Juma (sample)", email: "neema@example.com" },
    services: {},
  },
};
