import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useRealtimeEvent } from "@/lib/socket";
import { createCommentSchema, CreateCommentData } from "@/lib/zodSchemas";
import ReportButton from "./ReportButton";

interface CommentListProps {
  postId: string;
  isVisible: boolean;
}

interface Comment {
  id: string;
  body: string;
  authorId: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: string;
}

export default function CommentList({ postId, isVisible }: CommentListProps) {
  const [isComposing, setIsComposing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCommentData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      body: "",
    },
  });

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: () => apiClient.getPostComments(postId),
    enabled: isVisible,
  });

  // Listen for new comments via WebSocket
  useRealtimeEvent<{ postId: string; comment: Comment }>("newComment", (data) => {
    if (data.postId === postId) {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentData) => apiClient.createComment(postId, data.body),
    onSuccess: () => {
      form.reset();
      setIsComposing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de publier le commentaire",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCommentData) => {
    createCommentMutation.mutate(data);
  };

  const comments = commentsData?.items || [];

  if (!isVisible) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" data-testid="comment-list">
      {/* Comment Form */}
      <div className="mb-6">
        {!isComposing ? (
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500"
            onClick={() => setIsComposing(true)}
            data-testid="button-start-comment"
          >
            <i className="fas fa-comment mr-2"></i>
            Ajouter un commentaire...
          </Button>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Écrivez votre commentaire..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="textarea-comment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    form.reset();
                  }}
                  data-testid="button-cancel-comment"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  data-testid="button-submit-comment"
                >
                  {createCommentMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner animate-spin mr-2"></i>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: Comment) => {
            const authorInitials = comment.author?.name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || '??';

            const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: fr,
            });

            return (
              <div key={comment.id} className="flex space-x-3" data-testid={`comment-${comment.id}`}>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-xs" data-testid="text-commenter-initials">
                    {authorInitials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium" data-testid="text-commenter-name">
                        {comment.author?.name || 'Utilisateur anonyme'}
                      </p>
                      <span className="text-xs text-gray-500" data-testid="text-comment-time">
                        {timeAgo}
                      </span>
                    </div>
                    <ReportButton targetType="comment" targetId={comment.id} size="sm" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed" data-testid="text-comment-body">
                    {comment.body}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-primary p-0 h-auto" data-testid="button-like-comment">
                      <i className="fas fa-thumbs-up mr-1"></i>
                      J'aime
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-primary p-0 h-auto" data-testid="button-reply-comment">
                      <i className="fas fa-reply mr-1"></i>
                      Répondre
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">
            Aucun commentaire pour le moment
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Soyez le premier à commenter !
          </p>
        </div>
      )}

      {/* Load More Comments */}
      {commentsData?.hasMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm" data-testid="button-load-more-comments">
            Voir plus de commentaires
          </Button>
        </div>
      )}
    </div>
  );
}
