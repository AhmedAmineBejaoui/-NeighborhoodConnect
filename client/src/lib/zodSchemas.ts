import { z } from "zod";

// Post creation schema
export const createPostSchema = z.object({
  type: z.enum(["announcement", "service", "market", "poll"]),
  title: z.string().min(1, "Le titre est requis").max(200, "Le titre est trop long"),
  body: z.string().min(1, "Le contenu est requis").max(8000, "Le contenu est trop long"),
  tags: z.array(z.string()).default([]),
  meta: z.object({
    price: z.number().positive().optional(),
    images: z.array(z.string().url()).optional(),
    options: z.array(z.string()).optional(),
  }).optional(),
});

export type CreatePostData = z.infer<typeof createPostSchema>;

// Comment creation schema
export const createCommentSchema = z.object({
  body: z.string().min(1, "Le commentaire ne peut pas être vide").max(2000, "Le commentaire est trop long"),
});

export type CreateCommentData = z.infer<typeof createCommentSchema>;

// Report creation schema
export const createReportSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string().min(1, "ID de la cible requis"),
  reason: z.string().min(1, "La raison du signalement est requise"),
});

export type CreateReportData = z.infer<typeof createReportSchema>;

// Poll vote schema
export const voteSchema = z.object({
  optionIndex: z.number().min(0, "Index d'option invalide"),
});

export type VoteData = z.infer<typeof voteSchema>;

// Upload file schema
export const uploadFileSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, "Le fichier ne peut pas dépasser 5MB"),
  contentType: z.string().refine((type) => 
    ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type), 
    "Type de fichier non supporté"
  ),
});

export type UploadFileData = z.infer<typeof uploadFileSchema>;

// Filter schema
export const filterSchema = z.object({
  type: z.enum(["all", "announcement", "service", "market", "poll"]).default("all"),
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type FilterData = z.infer<typeof filterSchema>;
