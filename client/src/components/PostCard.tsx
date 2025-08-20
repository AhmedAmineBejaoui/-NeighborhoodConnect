import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post } from "@shared/schema";
import PollWidget from "./PollWidget";
import ReportButton from "./ReportButton";

interface PostCardProps {
  post: Post & { 
    author?: { name: string; email: string };
    commentsCount?: number;
    likesCount?: number;
    userHasLiked?: boolean;
  };
  showActions?: boolean;
}

export default function PostCard({ post, showActions = true }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.userHasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const authorInitials = post.author?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'announcement':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: 'fas fa-bullhorn',
          label: 'Annonce'
        };
      case 'service':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: 'fas fa-handshake',
          label: 'Service'
        };
      case 'market':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: 'fas fa-store',
          label: post.meta?.price ? 'À vendre' : 'Marketplace'
        };
      case 'poll':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: 'fas fa-poll',
          label: 'Sondage'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: 'fas fa-file-text',
          label: 'Post'
        };
    }
  };

  const typeConfig = getTypeConfig(post.type);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    // TODO: API call to like/unlike post
  };

  if (post.type === 'poll') {
    return <PollWidget post={post} />;
  }

  return (
    <Card className="p-6" data-testid={`post-card-${post.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm" data-testid="text-author-initials">
              {authorInitials}
            </span>
          </div>
          <div>
            <p className="font-medium" data-testid="text-author-name">
              {post.author?.name || 'Utilisateur anonyme'}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span data-testid="text-post-time">{timeAgo}</span>
              <span>•</span>
              <Badge className={typeConfig.color} data-testid="badge-post-type">
                <i className={`${typeConfig.icon} mr-1`}></i>
                {typeConfig.label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.meta?.price && (
            <div className="text-right">
              <p className="text-2xl font-bold text-primary" data-testid="text-price">
                {post.meta.price}€
              </p>
            </div>
          )}
          {showActions && (
            <>
              <ReportButton targetType="post" targetId={post.id} />
              <Button variant="ghost" size="sm" data-testid="button-post-menu">
                <i className="fas fa-ellipsis-h text-gray-400 text-sm"></i>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3" data-testid="text-post-title">
          {post.title}
        </h2>
        
        {/* Display image for marketplace items */}
        {post.type === 'market' && post.meta?.images && post.meta.images.length > 0 && (
          <div className="mb-3">
            <img 
              src={post.meta.images[0]} 
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg"
              data-testid="img-post-image"
            />
          </div>
        )}
        
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed" data-testid="text-post-body">
          {post.body}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                data-testid={`tag-${tag}`}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={liked ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}
              data-testid="button-like-post"
            >
              <i className={`fas ${liked ? 'fa-heart' : 'fa-heart'} mr-2`}></i>
              <span data-testid="text-likes-count">{likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="text-gray-600 dark:text-gray-400 hover:text-primary"
              data-testid="button-toggle-comments"
            >
              <i className="fas fa-comment mr-2"></i>
              <span data-testid="text-comments-count">{post.commentsCount || 0} commentaires</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary"
              data-testid="button-share-post"
            >
              <i className="fas fa-share mr-2"></i>
              <span>Partager</span>
            </Button>
          </div>
          
          {post.type === 'market' && (
            <Button data-testid="button-contact-seller">
              <i className="fas fa-envelope mr-2"></i>
              Contacter
            </Button>
          )}
        </div>
      )}

      {/* Comments section would go here */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-sm">Chargement des commentaires...</p>
        </div>
      )}
    </Card>
  );
}
