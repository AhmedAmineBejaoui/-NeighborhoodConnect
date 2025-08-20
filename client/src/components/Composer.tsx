import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useComposerStore, useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/apiClient";
import { createPostSchema, CreatePostData } from "@/lib/zodSchemas";
import Uploader from "./Uploader";

const postTypes = [
  {
    id: "announcement",
    label: "Annonce",
    icon: "fas fa-bullhorn",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    description: "Information importante pour la communauté",
  },
  {
    id: "service",
    label: "Service",
    icon: "fas fa-handshake",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    description: "Offre ou demande de service",
  },
  {
    id: "market",
    label: "Marketplace",
    icon: "fas fa-store",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    description: "Vendre ou acheter un objet",
  },
  {
    id: "poll",
    label: "Sondage",
    icon: "fas fa-poll",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    description: "Poser une question à la communauté",
  },
];

export default function Composer() {
  const { user } = useAuthStore();
  const {
    isOpen,
    type,
    closeComposer,
    reset,
    pollOptions,
    setPollOptions,
  } = useComposerStore();
  
  const [selectedType, setSelectedType] = useState<CreatePostData["type"]>(type as CreatePostData["type"]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pollOptionInputs, setPollOptionInputs] = useState(["", ""]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: selectedType,
      title: "",
      body: "",
      tags: [],
      meta: {},
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostData & { communityId: string }) =>
      apiClient.createPost(data),
    onSuccess: () => {
      toast({
        title: "Post créé",
        description: "Votre post a été publié avec succès !",
      });
      handleClose();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["/api/communities", user?.communityIds?.[0], "posts"] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le post",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    closeComposer();
    reset();
    form.reset();
    setUploadedImages([]);
    setPollOptionInputs(["", ""]);
    setSelectedType("announcement");
  };

  const onSubmit = (data: CreatePostData) => {
    if (!user?.communityIds?.[0]) {
      toast({
        title: "Erreur",
        description: "Vous devez être membre d'une communauté",
        variant: "destructive",
      });
      return;
    }

    // Parse tags from comma-separated string
    const tagsInput = (data as any).tagsInput || "";
    const tags = tagsInput
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    const postData: CreatePostData = {
      ...data,
      type: selectedType,
      tags,
      meta: {
        ...(selectedType === "market" && {
          price: data.meta?.price,
          images: uploadedImages,
        }),
        ...(selectedType === "poll" && {
          options: pollOptionInputs.filter(opt => opt.trim().length > 0),
        }),
      },
    };

    createPostMutation.mutate({
      ...postData,
      communityId: user.communityIds[0],
    });
  };

  const addPollOption = () => {
    if (pollOptionInputs.length < 6) {
      setPollOptionInputs([...pollOptionInputs, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptionInputs.length > 2) {
      setPollOptionInputs(pollOptionInputs.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptionInputs];
    newOptions[index] = value;
    setPollOptionInputs(newOptions);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Créer un nouveau post</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              {/* Post Type Selection */}
              <div>
                <FormLabel className="text-base font-medium">Type de post</FormLabel>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {postTypes.map((postType) => (
                    <button
                      key={postType.id}
                      type="button"
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedType === postType.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setSelectedType(postType.id as CreatePostData["type"]);
                        form.setValue("type", postType.id as CreatePostData["type"]);
                      }}
                      data-testid={`post-type-${postType.id}`}
                    >
                      <div className={`w-8 h-8 ${postType.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                        <i className={`${postType.icon} ${postType.color}`}></i>
                      </div>
                      <p className="font-medium text-sm">{postType.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {postType.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Donnez un titre à votre post..."
                        {...field}
                        data-testid="input-post-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Body */}
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Écrivez votre message..."
                        rows={6}
                        className="resize-none"
                        {...field}
                        data-testid="textarea-post-body"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tagsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ajoutez des tags séparés par des virgules..."
                        {...field}
                        data-testid="input-post-tags"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Exemple: travaux, ascenseur, bâtiment-a
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price field for marketplace */}
              {selectedType === "market" && (
                <FormField
                  control={form.control}
                  name="meta.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          data-testid="input-post-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Image upload for marketplace */}
              {selectedType === "market" && (
                <div>
                  <FormLabel>Images</FormLabel>
                  <Uploader
                    onUploadComplete={setUploadedImages}
                    maxFiles={5}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Poll options */}
              {selectedType === "poll" && (
                <div>
                  <FormLabel>Options du sondage</FormLabel>
                  <div className="space-y-2 mt-2">
                    {pollOptionInputs.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          data-testid={`input-poll-option-${index}`}
                        />
                        {pollOptionInputs.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePollOption(index)}
                            data-testid={`button-remove-option-${index}`}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    ))}
                    {pollOptionInputs.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPollOption}
                        data-testid="button-add-poll-option"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Ajouter une option
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 -mx-6 -mb-6 px-6 py-4">
          <div className="text-sm text-gray-500 flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            Votre post sera visible par tous les membres de la communauté
          </div>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-post"
            >
              Annuler
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createPostMutation.isPending}
              data-testid="button-publish-post"
            >
              {createPostMutation.isPending ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  Publication...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Publier
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
