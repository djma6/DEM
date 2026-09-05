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
