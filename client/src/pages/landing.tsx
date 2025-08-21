import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
// Removed animations for stability

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from "@/lib/store";

const authSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Landing() {
  // Simuler le contexte de thème pour la landing page
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const language = localStorage.getItem('community-hub-language') === 'en' ? 'en' : 'fr';
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      return response.json();
    },
    onSuccess: (data) => {
      try { localStorage.setItem('hasLoggedInBefore', '1'); } catch {}
      setAuth(data.user, data.accessToken);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre communauté !",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        email: data.email,
        password: data.password,
        name: data.name || data.email.split("@")[0],
      });
      return response.json();
    },
    onSuccess: (data) => {
      try { localStorage.setItem('hasLoggedInBefore', '1'); } catch {}
      setAuth(data.user, data.accessToken);
      toast({
        title: "Compte créé avec succès",
        description: "Bienvenue dans votre nouvelle communauté !",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de création",
        description: error.message || "Une erreur est survenue lors de la création du compte",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AuthForm) => {
    if (isRegister) {
      registerMutation.mutate(data);
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header avec boutons de thème et langue */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        {/* Bouton Mode Sombre/Clair */}
        <button
          onClick={() => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('community-hub-theme', 
              document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
          }}
          className="h-10 w-10 rounded-md border border-blue-200 bg-white/80 backdrop-blur-md hover:bg-white/90 transition-all duration-300 flex items-center justify-center"
          data-testid="toggle-theme"
        >
          {document.documentElement.classList.contains('dark') ? '☀️' : '🌙'}
        </button>
        
        {/* Bouton Langue */}
        <button
          onClick={() => {
            const currentLang = localStorage.getItem('community-hub-language') || 'fr';
            const newLang = currentLang === 'fr' ? 'en' : 'fr';
            localStorage.setItem('community-hub-language', newLang);
            window.location.reload();
          }}
          className="h-10 w-10 rounded-md border border-blue-200 bg-white/80 backdrop-blur-md hover:bg-white/90 transition-all duration-300 flex items-center justify-center"
          data-testid="toggle-language"
        >
          {language === 'fr' ? '🇫🇷' : '🇺🇸'}
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
          <div className="max-w-xl">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
              {language === 'fr' ? 'Hub Communautaire' : 'Community Hub'}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {language === 'fr' 
                ? 'Connectez-vous avec vos voisins, partagez des moments, organisez des événements et créez une vraie communauté dans votre quartier.'
                : 'Connect with your neighbors, share moments, organize events and create a real community in your neighborhood.'
              }
            </p>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {language === 'fr' ? 'Communauté Active' : 'Active Community'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'fr' ? 'Discussions en temps réel' : 'Real-time discussions'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM6 8a2 2 0 11-4 0 2 2 0 014 0zm4.07 11c.36-.72 1.31-1.24 2.27-1.24 1.8 0 3.25 1.01 3.25 2.25H6c0-1.24 1.45-2.25 3.25-2.25.96 0 1.91.52 2.27 1.24L12 19z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {language === 'fr' ? 'Événements' : 'Events'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'fr' ? 'Organisez et participez' : 'organize and participate'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md">
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                  {isRegister ? 
                    (language === 'fr' ? "Rejoignez-nous" : "Join us") : 
                    (language === 'fr' ? "Bon retour" : "Welcome back")
                  }
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {isRegister 
                    ? (language === 'fr' ? "Créez votre compte et découvrez votre communauté" : "Create your account and discover your community")
                    : (language === 'fr' ? "Reconnectez-vous avec vos voisins" : "Reconnect with your neighbors")
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {isRegister && (
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">
                              {language === 'fr' ? 'Nom complet' : 'Full name'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Votre nom complet" 
                                data-testid="input-name"
                                className="bg-white/50 dark:bg-gray-700/50 border-white/30 focus:border-blue-400 transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="votre@email.com" 
                              data-testid="input-email"
                              className="bg-white/50 dark:bg-gray-700/50 border-white/30 focus:border-blue-400 transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            {language === 'fr' ? 'Mot de passe' : 'Password'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              data-testid="input-password"
                              className="bg-white/50 dark:bg-gray-700/50 border-white/30 focus:border-blue-400 transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                      data-testid="button-submit"
                      disabled={loginMutation.isPending || registerMutation.isPending}
                    >
                      {(loginMutation.isPending || registerMutation.isPending) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin"/>
                      ) : null}
                      {isRegister ? "Créer mon compte" : "Se connecter"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    data-testid="link-toggle-mode"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      form.reset();
                    }}
                  >
                    {isRegister 
                      ? "Déjà membre ? Se connecter" 
                      : "Nouveau ici ? Créer un compte"
                    }
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}