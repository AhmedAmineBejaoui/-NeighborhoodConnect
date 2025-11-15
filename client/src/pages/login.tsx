import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async () => {
      try { localStorage.setItem('hasLoggedInBefore', '1'); } catch {}
      const meRes = await apiRequest("GET", "/api/auth/me");
      const user = await meRes.json();
      setAuth(user, null);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      setLocation("/dashboard");
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
    mutationFn: async (data: LoginForm & { name: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: async () => {
      try { localStorage.setItem('hasLoggedInBefore', '1'); } catch {}
      const meRes = await apiRequest("GET", "/api/auth/me");
      const user = await meRes.json();
      setAuth(user, null);
      toast({
        title: "Compte créé",
        description: "Votre compte a été créé avec succès !",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de création",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    if (isRegister) {
      registerMutation.mutate({
        ...data,
        name: data.email.split("@")[0], // Simple name extraction
      });
    } else {
      loginMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-home text-white text-xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegister ? "Créer un compte" : "Se connecter"}
          </CardTitle>
          <CardDescription>
            {isRegister 
              ? "Rejoignez votre communauté" 
              : "Accédez à votre hub communautaire"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="votre@email.com" 
                        data-testid="input-email"
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
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-submit"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {(loginMutation.isPending || registerMutation.isPending) ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Chargement...
                  </>
                ) : (
                  isRegister ? "Créer le compte" : "Se connecter"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              data-testid="link-toggle-mode"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister 
                ? "Déjà un compte ? Se connecter" 
                : "Pas de compte ? S'inscrire"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
