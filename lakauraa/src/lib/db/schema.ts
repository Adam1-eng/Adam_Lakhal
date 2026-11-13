import { pgTable, text, integer, boolean, timestamp, jsonb, serial, index, uniqueIndex } from 'drizzle-orm/pg-core';

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

/* ---------- Administration ---------- */
export const admins = pgTable('admins', {
  id: id(),
  email: text('email').notNull(),
  name: text('name').notNull().default(''),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
}, (t) => [uniqueIndex('admins_email_idx').on(t.email)]);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // hash SHA-256 du jeton (le jeton brut n'est jamais stocké)
  adminId: text('admin_id').notNull().references(() => admins.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  userAgent: text('user_agent').notNull().default(''),
}, (t) => [index('sessions_admin_idx').on(t.adminId)]);

export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  success: boolean('success').notNull().default(false),
  createdAt: createdAt(),
}, (t) => [index('login_attempts_key_idx').on(t.key, t.createdAt)]);

/* ---------- Portfolio ---------- */
export const categories = pgTable('categories', {
  id: id(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  sort: integer('sort').notNull().default(0),
  createdAt: createdAt(),
}, (t) => [uniqueIndex('categories_slug_idx').on(t.slug)]);

export type ProjectKind = 'client' | 'personnel' | 'exemple' | 'maquette';
export type ProjectStatus = 'draft' | 'published';

export const projects = pgTable('projects', {
  id: id(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  client: text('client').notNull().default(''),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  kind: text('kind').$type<ProjectKind>().notNull().default('client'),
  location: text('location').notNull().default(''),
  summary: text('summary').notNull().default(''),
  body: text('body').notNull().default(''),
  challenge: text('challenge').notNull().default(''),
  solution: text('solution').notNull().default(''),
  features: jsonb('features').$type<{ title: string; text: string }[]>().notNull().default([]),
  technologies: jsonb('technologies').$type<string[]>().notNull().default([]),
  completedOn: text('completed_on').notNull().default(''), // AAAA-MM
  liveUrl: text('live_url').notNull().default(''),
  githubUrl: text('github_url').notNull().default(''),
  videoUrl: text('video_url').notNull().default(''),
  videoPoster: text('video_poster').notNull().default(''),
  status: text('status').$type<ProjectStatus>().notNull().default('draft'),
  featured: boolean('featured').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  coverImageId: text('cover_image_id'),
  createdAt: createdAt(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (t) => [uniqueIndex('projects_slug_idx').on(t.slug), index('projects_status_idx').on(t.status, t.sort)]);

export type ImageVariant = 'desktop' | 'mobile' | 'autre';

export const projectImages = pgTable('project_images', {
  id: id(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbUrl: text('thumb_url').notNull(),
  storageKey: text('storage_key').notNull(),
  thumbKey: text('thumb_key').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  variant: text('variant').$type<ImageVariant>().notNull().default('desktop'),
  caption: text('caption').notNull().default(''),
  visible: boolean('visible').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  createdAt: createdAt(),
}, (t) => [index('project_images_project_idx').on(t.projectId, t.sort)]);

/* ---------- Contenus ---------- */
export const faqs = pgTable('faqs', {
  id: id(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  published: boolean('published').notNull().default(true),
  sort: integer('sort').notNull().default(0),
  createdAt: createdAt(),
});

export const testimonials = pgTable('testimonials', {
  id: id(),
  quote: text('quote').notNull(),
  author: text('author').notNull(),
  business: text('business').notNull().default(''),
  sourceUrl: text('source_url').notNull().default(''),
  published: boolean('published').notNull().default(false),
  sort: integer('sort').notNull().default(0),
  createdAt: createdAt(),
});

export const services = pgTable('services', {
  id: text('id').primaryKey(), // vitrine, pro, boutique, entretien
  title: text('title').notNull(),
  text: text('text').notNull(),
  price: text('price').notNull(),
  points: jsonb('points').$type<string[]>().notNull().default([]),
  sort: integer('sort').notNull().default(0),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Service = typeof services.$inferSelect;
