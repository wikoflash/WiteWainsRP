import { pgTable, serial, text, integer, boolean, uuid, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Profiles ────────────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  discordUsername: text('discord_username'),
  characterName: text('character_name').notNull().default('Unknown'),
  role: text('role', { enum: ['viewer', 'editor', 'admin'] }).default('viewer').notNull(),
  avatarUrl: text('avatar_url'),
  rank: text('rank').default('Member'),
  bio: text('bio'),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Laws ────────────────────────────────────────────────────────────────────
export const laws = pgTable('laws', {
  id: serial('id').primaryKey(),
  orderNum: integer('order_num').notNull().default(0),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedBy: uuid('updated_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Gallery ─────────────────────────────────────────────────────────────────
export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  memberId: uuid('member_id').references(() => profiles.id, { onDelete: 'set null' }),
  uploadedBy: uuid('uploaded_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Storage Locations ───────────────────────────────────────────────────────
export const storageLocations = pgTable('storage_locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Storage Items ───────────────────────────────────────────────────────────
export const storageItems = pgTable('storage_items', {
  id: serial('id').primaryKey(),
  category: text('category', { enum: ['gun', 'resource', 'ammo'] }).notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').default(0).notNull(),
  locationId: integer('location_id').references(() => storageLocations.id, { onDelete: 'set null' }),
  lastUpdatedBy: uuid('last_updated_by').references(() => profiles.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Storage Logs ────────────────────────────────────────────────────────────
export const storageLogs = pgTable('storage_logs', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').references(() => storageItems.id, { onDelete: 'cascade' }),
  changedBy: uuid('changed_by').references(() => profiles.id, { onDelete: 'set null' }),
  oldQuantity: integer('old_quantity'),
  newQuantity: integer('new_quantity').notNull(),
  action: text('action', { enum: ['create', 'add', 'remove', 'update', 'delete'] }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────
export const storageItemsRelations = relations(storageItems, ({ one, many }) => ({
  location: one(storageLocations, { fields: [storageItems.locationId], references: [storageLocations.id] }),
  lastEditor: one(profiles, { fields: [storageItems.lastUpdatedBy], references: [profiles.id] }),
  logs: many(storageLogs),
}));

export const storageLogsRelations = relations(storageLogs, ({ one }) => ({
  item: one(storageItems, { fields: [storageLogs.itemId], references: [storageItems.id] }),
  editor: one(profiles, { fields: [storageLogs.changedBy], references: [profiles.id] }),
}));

export const storageLocationsRelations = relations(storageLocations, ({ many }) => ({
  items: many(storageItems),
}));

export const galleryRelations = relations(gallery, ({ one }) => ({
  member: one(profiles, { fields: [gallery.memberId], references: [profiles.id] }),
  uploader: one(profiles, { fields: [gallery.uploadedBy], references: [profiles.id] }),
}));

// ─── Types ───────────────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect;
export type Law = typeof laws.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type StorageLocation = typeof storageLocations.$inferSelect;
export type StorageItem = typeof storageItems.$inferSelect;
export type StorageLog = typeof storageLogs.$inferSelect;
