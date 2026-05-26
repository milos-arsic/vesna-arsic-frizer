import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "manual",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  phone: text("phone"),
  role: userRoleEnum("role").default("customer").notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slotStart: timestamp("slot_start", { mode: "date", withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").notNull(),
    customerUserId: text("customer_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    customerNote: text("customer_note"),
    adminMessage: text("admin_message"),
    googleCalendarEventId: text("google_calendar_event_id"),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("unique_active_slot")
      .on(table.slotStart)
      .where(
        sql`${table.status} NOT IN ('rejected', 'cancelled')`,
      ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(users, {
    fields: [appointments.customerUserId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [appointments.createdBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AppointmentStatus = Appointment["status"];
