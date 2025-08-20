import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/apiClient";
import { useRealtimeEvent } from "@/lib/socket";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount, refetch: refetchCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: () => apiClient.getUnreadCount(),
  });

  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => apiClient.getNotifications(),
    enabled: isOpen,
  });

  // Listen for new notifications via WebSocket
  useRealtimeEvent("newNotification", () => {
    refetchCount();
    if (isOpen) {
      refetchNotifications();
    }
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      refetchCount();
      refetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "post.created":
        return "fas fa-file-alt";
      case "comment.created":
        return "fas fa-comment";
      case "poll.tally":
        return "fas fa-poll";
      case "report.opened":
        return "fas fa-flag";
      default:
        return "fas fa-bell";
    }
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case "post.created":
        return "Nouveau post dans votre communauté";
      case "comment.created":
        return "Nouveau commentaire sur votre post";
      case "poll.tally":
        return "Nouveau vote sur un sondage";
      case "report.opened":
        return "Nouveau signalement à traiter";
      default:
        return "Nouvelle notification";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
          <i className="fas fa-bell text-gray-600 dark:text-gray-400"></i>
          {unreadCount?.count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
              data-testid="badge-notification-count"
            >
              {unreadCount.count > 9 ? "9+" : unreadCount.count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount?.count > 0 && (
            <Button variant="ghost" size="sm" data-testid="button-mark-all-read">
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications?.length ? (
            <div className="space-y-2">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.readAt
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-blue-50 dark:bg-blue-900/20"
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className={`${getNotificationIcon(notification.type)} text-primary text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-bell-slash text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">
                Aucune notification
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
