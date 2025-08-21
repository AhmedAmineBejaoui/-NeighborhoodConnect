import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useRealtimeEvent } from "@/lib/socket";
import { Post } from "@shared/schema";
import ReportButton from "./ReportButton";

interface PollWidgetProps {
  post: Post & { 
    author?: { name: string; email: string };
    commentsCount?: number;
  };
  showActions?: boolean;
}

interface PollTally {
  tally: Record<number, number>;
  totalVotes: number;
}

export default function PollWidget({ post, showActions = true }: PollWidgetProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { toast } = useToast();

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

  // Get poll tally
  const { data: pollData, refetch } = useQuery<PollTally>({
    queryKey: ["/api/posts", post.id, "votes", "tally"],
    queryFn: async () => (await apiClient.getPollTally(post.id)) as PollTally,
    refetchInterval: hasVoted ? false : 5000, // Stop polling after voting
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: (optionIndex: number) => apiClient.voteOnPoll(post.id, optionIndex),
    onSuccess: () => {
      setHasVoted(true);
      refetch();
      toast({
        title: "Vote enregistré",
        description: "Votre vote a été pris en compte !",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer votre vote",
        variant: "destructive",
      });
    },
  });

  // Listen for real-time poll updates
  useRealtimeEvent<{ postId: string; tally: Record<number, number> }>("pollTally", (data) => {
    if (data.postId === post.id) {
      refetch();
    }
  });

  const handleVote = (optionIndex: number) => {
    if (hasVoted) return;
    
    setSelectedOption(optionIndex);
    voteMutation.mutate(optionIndex);
  };

  const options = post.meta?.options || [];
  const tally = pollData?.tally ?? {};
  const totalVotes = pollData?.totalVotes ?? 0;

  // Calculate percentages
  const getPercentage = (optionIndex: number) => {
    if (totalVotes === 0) return 0;
    return Math.round(((tally[optionIndex] || 0) / totalVotes) * 100);
  };

  const getVoteCount = (optionIndex: number) => {
    return tally[optionIndex] || 0;
  };

  // Calculate participation rate (mock data - would need community member count)
  const participationRate = Math.min(Math.round((totalVotes / 75) * 100), 100); // Assuming 75 community members

  return (
    <Card className="p-6" data-testid={`poll-widget-${post.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm" data-testid="text-author-initials">
              {authorInitials}
            </span>
          </div>
          <div>
            <p className="font-medium" data-testid="text-author-name">
              {post.author?.name || 'Conseil Syndical'}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span data-testid="text-post-time">{timeAgo}</span>
              <span>•</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" data-testid="badge-poll">
                <i className="fas fa-poll mr-1"></i>
                Sondage
              </Badge>
              {post.expiresAt && (
                <>
                  <span>•</span>
                  <span className="text-xs text-accent-600 font-medium">
                    Se termine {formatDistanceToNow(new Date(post.expiresAt), { locale: fr })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showActions && (
            <>
              <ReportButton targetType="post" targetId={post.id} />
              <Button variant="ghost" size="sm" data-testid="button-poll-menu">
                <i className="fas fa-ellipsis-h text-gray-400 text-sm"></i>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3" data-testid="text-poll-title">
          {post.title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" data-testid="text-poll-body">
          {post.body}
        </p>

        <div className="space-y-3">
          {options.map((option, index) => {
            const percentage = getPercentage(index);
            const votes = getVoteCount(index);
            const isSelected = selectedOption === index;
            const isWinning = totalVotes > 0 && votes === Math.max(...(Object.values(tally) as number[]));
            
            return (
              <div
                key={index}
                className={`poll-option cursor-pointer p-3 rounded-lg border transition-colors ${
                  hasVoted
                    ? "cursor-default"
                    : "hover:border-primary-300 dark:hover:border-primary-500"
                } ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-600"
                }`}
                onClick={() => !hasVoted && handleVote(index)}
                data-testid={`poll-option-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected || hasVoted
                        ? "border-primary-400"
                        : "border-gray-300"
                    }`}>
                      <div className={`w-3 h-3 bg-primary rounded-full transition-opacity ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}></div>
                    </div>
                    <span className={`font-medium ${isWinning && totalVotes > 0 ? 'text-primary' : ''}`} data-testid={`option-text-${index}`}>
                      {option}
                    </span>
                  </div>
                  {totalVotes > 0 && (
                    <div className="text-right">
                      <span className={`text-sm font-medium ${isWinning ? 'text-primary' : ''}`} data-testid={`option-percentage-${index}`}>
                        {percentage}%
                      </span>
                      <p className="text-xs text-gray-500" data-testid={`option-votes-${index}`}>
                        {votes} vote{votes !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
                {totalVotes > 0 && (
                  <Progress
                    value={percentage}
                    className="h-2"
                    data-testid={`option-progress-${index}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {totalVotes > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total des votants</span>
              <span className="font-medium" data-testid="text-total-votes">
                {totalVotes} résident{totalVotes !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Participation</span>
              <span className="font-medium text-primary" data-testid="text-participation">
                {participationRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-primary" data-testid="button-poll-comments">
              <i className="fas fa-comment mr-2"></i>
              <span data-testid="text-comments-count">{post.commentsCount || 0} commentaires</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-primary" data-testid="button-share-poll">
              <i className="fas fa-share mr-2"></i>
              <span>Partager</span>
            </Button>
          </div>
          {hasVoted && (
            <div className="text-sm text-gray-500 flex items-center" data-testid="text-voted-status">
              <i className="fas fa-check-circle text-green-500 mr-1"></i>
              Vous avez voté
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
