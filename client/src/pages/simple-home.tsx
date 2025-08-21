import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SimpleHome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(""); // Ajout d'un état pour le retour

  // Fonction de gestion du clic sur le bouton principal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }
    if (isLogin) {
      // Simuler une connexion
      setMessage("Connexion réussie ! (simulation)");
    } else {
      // Simuler une création de compte
      setMessage("Compte créé ! (simulation)");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Community Hub
            </CardTitle>
            <CardDescription className="text-center">
              Bienvenue dans votre portail communautaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Application en cours de développement
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage(""); // Réinitialise le message lors du changement de mode
                }}
                variant="outline"
                className="w-full"
              >
                {isLogin ? "Créer un compte" : "Se connecter"}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <Button className="w-full" type="submit">
                  {isLogin ? "Se connecter" : "Créer le compte"}
                </Button>
                {message && (
                  <div className="text-center text-sm text-red-500 mt-2">{message}</div>
                )}
              </div>
            </form>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Version de développement</p>
              <p>Backend: ✓ Connecté</p>
              <p>Frontend: En cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}