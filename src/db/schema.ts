import {
  pgTable,
  serial,
  text,
  bigint,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull().default("wedding"),
  title: text("title"),
  shamsiDate: text("shamsi_date").notNull(),
  gregorianDate: text("gregorian_date").notNull(),
  venue: text("venue"),
  location: text("location"),
  fee: bigint("fee", { mode: "number" }).notNull().default(0),
  deposit: bigint("deposit", { mode: "number" }).notNull().default(0),
  equipmentNeeded: text("equipment_needed"),
  soundLightProvider: text("sound_light_provider"),
  soundLightProviderPhone: text("sound_light_provider_phone"),
  soundLightRequirements: text("sound_light_requirements"),
  soundLightCost: bigint("sound_light_cost", { mode: "number" }).notNull().default(0),
  musicianName: text("musician_name"),
  musicianInstrument: text("musician_instrument"),
  musicianPhone: text("musician_phone"),
  musicianFee: bigint("musician_fee", { mode: "number" }).notNull().default(0),
  colleagueName: text("colleague_name"),
  colleagueRole: text("colleague_role"),
  colleaguePhone: text("colleague_phone"),
  colleagueFee: bigint("colleague_fee", { mode: "number" }).notNull().default(0),
  /** JSON arrays so an event can have several of each */
  musiciansJson: text("musicians_json"),
  providersJson: text("providers_json"),
  colleaguesJson: text("colleagues_json"),
  description: text("description"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  guestCount: integer("guest_count").default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  shamsiDate: text("shamsi_date").notNull(),
  gregorianDate: text("gregorian_date").notNull(),
  time: text("time"),
  notifyBefore: text("notify_before").default("0"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  description: text("description"),
  completed: integer("completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bankCards = pgTable("bank_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  cardNumber: text("card_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  googleSub: text("google_sub").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  instagram: text("instagram"),
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  /** ceremony | restaurant | club | dj | other */
  category: text("category").notNull().default("other"),
  /** Name of the venue/company for the chosen category */
  businessName: text("business_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const musicians = pgTable("musicians", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  /** Instrument played, e.g. تنبک / ویولن */
  instrument: text("instrument").notNull(),
  phone: text("phone").notNull(),
  /** Default performance fee in Toman */
  fee: bigint("fee", { mode: "number" }).notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const soundProviders = pgTable("sound_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  /** Legacy column: cost is entered per event, not stored on the provider */
  cost: bigint("cost", { mode: "number" }).notNull().default(0),
  /** Service type key, e.g. sound | light | soundLight | cityTv ... */
  equipment: text("equipment"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const colleagues = pgTable("colleagues", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  /** dj | showman | singer | vipMusic */
  role: text("role").notNull().default("dj"),
  phone: text("phone").notNull(),
  fee: bigint("fee", { mode: "number" }).notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
