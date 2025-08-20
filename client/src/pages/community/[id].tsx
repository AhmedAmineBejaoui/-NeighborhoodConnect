import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import FilterBar from "@/components/FilterBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ["/api/communities", id],
    enabled: !!id,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/communities", id, "posts"],
    enabled: !!id,
  });

  if (communityLoading) {
    return (
      <Layout>
        <div className="p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Communauté non trouvée
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cette communauté n'existe pas ou vous n'y avez pas accès.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <header className="hidden lg:flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-community-name">
            {community.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="text-community-address">
            {community.address}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <i className="fas fa-bell mr-2"></i>
            Notifications
          </Button>
          <Button data-testid="button-new-post">
            <i className="fas fa-plus mr-2"></i>
            Nouveau post
          </Button>
        </div>
      </header>

      <main className="p-4 lg:p-6 pt-20 lg:pt-6">
        <FilterBar />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {postsLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))
            ) : posts?.items?.length ? (
              posts.items.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <i className="fas fa-stream text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aucun post pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Soyez le premier à partager quelque chose dans cette communauté !
                </p>
                <Button data-testid="button-create-first-post">
                  <i className="fas fa-plus mr-2"></i>
                  Créer le premier post
                </Button>
              </Card>
            )}

            {posts?.hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" data-testid="button-load-more">
                  Charger plus de posts
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden xl:block space-y-6">
            {/* Community Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistiques de la communauté</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Résidents actifs</span>
                  <span className="font-medium" data-testid="text-active-residents">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Posts cette semaine</span>
                  <span className="font-medium" data-testid="text-weekly-posts">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sondages actifs</span>
                  <span className="font-medium text-primary" data-testid="text-active-polls">3</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" data-testid="button-create-announcement">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-bullhorn text-red-600 dark:text-red-400 text-sm"></i>
                  </div>
                  Créer une annonce
                </Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="button-create-poll">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-poll text-blue-600 dark:text-blue-400 text-sm"></i>
                  </div>
                  Lancer un sondage
                </Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="button-create-listing">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-store text-green-600 dark:text-green-400 text-sm"></i>
                  </div>
                  Vendre un objet
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Activité récente</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">PM</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">Pierre Martin</span>
                      <span className="text-gray-600 dark:text-gray-400"> a commenté sur </span>
                      <span className="font-medium">"Travaux d'ascenseur"</span>
                    </p>
                    <p className="text-xs text-gray-500">Il y a 15 min</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-xs">SL</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">Sophie Lévy</span>
                      <span className="text-gray-600 dark:text-gray-400"> a voté dans le sondage </span>
                      <span className="font-medium">"Couleur cage d'escalier"</span>
                    </p>
                    <p className="text-xs text-gray-500">Il y a 1h</p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
