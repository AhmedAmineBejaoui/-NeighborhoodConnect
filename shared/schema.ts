import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(z.enum(['admin', 'moderator', 'resident'])),
  communityIds: z.array(z.string()),
  unitId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  roles: z.array(z.enum(['admin', 'moderator', 'resident'])).default(['resident']),
  communityIds: z.array(z.string()).default([]),
  unitId: z.string().optional(),
});

// Community schemas
export const communitySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  settings: z.object({
    postMaxLength: z.number().default(8000),
    allowedMediaTypes: z.array(z.string()).default(['image/jpeg', 'image/png']),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCommunitySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  settings: z.object({
    postMaxLength: z.number().default(8000),
    allowedMediaTypes: z.array(z.string()).default(['image/jpeg', 'image/png']),
  }).default({}),
});

// Post schemas
export const postMetaSchema = z.object({
  price: z.number().optional(),
  images: z.array(z.string()).optional(),
  options: z.array(z.string()).optional(),
});

export const postSchema = z.object({
  id: z.string(),
  communityId: z.string(),
  authorId: z.string(),
  type: z.enum(['announcement', 'service', 'market', 'poll']),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['published', 'hidden']).default('published'),
  meta: postMetaSchema.optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPostSchema = z.object({
  communityId: z.string(),
  type: z.enum(['announcement', 'service', 'market', 'poll']),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
  tags: z.array(z.string()).default([]),
  meta: postMetaSchema.optional(),
  expiresAt: z.date().optional(),
});

// Comment schemas
export const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  body: z.string(),
  status: z.enum(['published', 'hidden']).default('published'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCommentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1).max(2000),
});

// Vote schemas
export const voteSchema = z.object({
  id: z.string(),
  postId: z.string(),
  userId: z.string(),
  optionIndex: z.number(),
  createdAt: z.date(),
});

export const insertVoteSchema = z.object({
  postId: z.string(),
  optionIndex: z.number(),
});

// Report schemas
export const reportSchema = z.object({
  id: z.string(),
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string(),
  reporterId: z.string(),
  reason: z.string(),
  status: z.enum(['open', 'closed']).default('open'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string(),
  reason: z.string().min(1),
});

// Notification schemas
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Community = z.infer<typeof communitySchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Post = z.infer<typeof postSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Report = z.infer<typeof reportSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
