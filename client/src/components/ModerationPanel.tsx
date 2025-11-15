import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { useRealtimeEvent } from "@/lib/socket";

interface Report {
  id: string;
  targetType: "post" | "comment" | "user";
  targetId: string;
  reason: string;
  status: "open" | "closed";
  createdAt: string;
  reporter: {
    name: string;
    email: string;
  };
}

export default function ModerationPanel() {
  const [statusFilter, setStatusFilter] = useState<"open" | "closed" | "all">("open");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["/api/moderation/reports", { status: statusFilter === "all" ? undefined : statusFilter }],
    queryFn: () => apiClient.getModerationReports({ 
      status: statusFilter === "all" ? undefined : statusFilter 
    }),
  });

  // Listen for new reports via WebSocket
  useRealtimeEvent("newReport", () => {
    queryClient.invalidateQueries({ queryKey: ["/api/moderation/reports"] });
  });

  // Hide content mutation
  const hideContentMutation = useMutation({
    mutationFn: ({ id, targetType }: { id: string; targetType: string }) =>
      apiClient.hideContent(id, targetType),
    onSuccess: () => {
      toast({
        title: "Contenu masqué",
        description: "Le contenu a été masqué avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de masquer le contenu",
        variant: "destructive",
      });
    },
  });

  // Resolve report mutation
  const resolveReportMutation = useMutation({
    mutationFn: (reportId: string) => apiClient.resolveReport(reportId),
    onSuccess: () => {
      toast({
        title: "Signalement résolu",
        description: "Le signalement a été marqué comme résolu.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de résoudre le signalement",
        variant: "destructive",
      });
    },
  });

  const handleHideContent = (report: Report) => {
    hideContentMutation.mutate({
      id: report.targetId,
      targetType: report.targetType,
    });
  };

  const handleResolveReport = (reportId: string) => {
    resolveReportMutation.mutate(reportId);
  };

  const getReportTypeIcon = (targetType: string) => {
    switch (targetType) {
      case "post":
        return "fas fa-file-alt";
      case "comment":
        return "fas fa-comment";
      case "user":
        return "fas fa-user";
      default:
        return "fas fa-flag";
    }
  };

  const getReportTypeLabel = (targetType: string) => {
    switch (targetType) {
      case "post":
        return "Post";
      case "comment":
        return "Commentaire";
      case "user":
        return "Utilisateur";
      default:
        return "Inconnu";
    }
  };

  const reports = reportsData?.items || [];

  return (
    <div className="space-y-6" data-testid="moderation-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Modération</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les signalements et contenus de la communauté
          </p>
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Signalements ouverts</SelectItem>
            <SelectItem value="closed">Signalements résolus</SelectItem>
            <SelectItem value="all">Tous les signalements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports" data-testid="tab-reports">
            Signalements
          </TabsTrigger>
          <TabsTrigger value="hidden" data-testid="tab-hidden">
            Contenu masqué
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Signalements</CardTitle>
              <CardDescription>
                {statusFilter === "open" && "Signalements en attente de traitement"}
                {statusFilter === "closed" && "Signalements résolus"}
                {statusFilter === "all" && "Tous les signalements"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner animate-spin text-2xl text-gray-400 mb-2"></i>
                  <p>Chargement des signalements...</p>
                </div>
              ) : reports.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {reports.map((report: Report) => (
                      <div
                        key={report.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        data-testid={`report-${report.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                              <i className={`${getReportTypeIcon(report.targetType)} text-red-600 dark:text-red-400`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" data-testid="badge-report-type">
                                  {getReportTypeLabel(report.targetType)}
                                </Badge>
                                <Badge 
                                  variant={report.status === "open" ? "destructive" : "secondary"}
                                  data-testid="badge-report-status"
                                >
                                  {report.status === "open" ? "Ouvert" : "Résolu"}
                                </Badge>
                              </div>
                              
                              <p className="font-medium mb-1" data-testid="text-report-reason">
                                {report.reason}
                              </p>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Signalé par {report.reporter?.name || "Utilisateur inconnu"} •{" "}
                                <span data-testid="text-report-time">
                                  {formatDistanceToNow(new Date(report.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </span>
                              </p>
                            </div>
                          </div>

                          {report.status === "open" && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleHideContent(report)}
                                disabled={hideContentMutation.isPending}
                                data-testid={`button-hide-content-${report.id}`}
                              >
                                <i className="fas fa-eye-slash mr-2"></i>
                                Masquer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveReport(report.id)}
                                disabled={resolveReportMutation.isPending}
                                data-testid={`button-resolve-report-${report.id}`}
                              >
                                <i className="fas fa-check mr-2"></i>
                                Résoudre
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-clipboard-check text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {statusFilter === "open" ? "Aucun signalement en attente" : "Aucun signalement"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {statusFilter === "open" 
                      ? "Votre communauté se porte bien !" 
                      : "Aucun signalement trouvé pour ce filtre."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hidden" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu masqué</CardTitle>
              <CardDescription>
                Posts et commentaires masqués par l'équipe de modération
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-eye-slash text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Fonctionnalité à venir
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La liste du contenu masqué sera bientôt disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Signalements ouverts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {reports.filter((r: Report) => r.status === "open").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Signalements résolus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reports.filter((r: Report) => r.status === "closed").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Posts signalés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter((r: Report) => r.targetType === "post").length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commentaires signalés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter((r: Report) => r.targetType === "comment").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
