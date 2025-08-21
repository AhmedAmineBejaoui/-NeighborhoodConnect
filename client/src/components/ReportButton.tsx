import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { createReportSchema, CreateReportData } from "@/lib/zodSchemas";

interface ReportButtonProps {
  targetType: "post" | "comment" | "user";
  targetId: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
}

const reportReasons = [
  { value: "spam", label: "Spam ou contenu indésirable" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement ou intimidation" },
  { value: "false", label: "Fausses informations" },
  { value: "violence", label: "Violence ou contenu dangereux" },
  { value: "copyright", label: "Violation de droits d'auteur" },
  { value: "other", label: "Autre" },
];

export default function ReportButton({ targetType, targetId, size = "sm", variant = "ghost" }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateReportData>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      targetType,
      targetId,
      reason: "",
    },
  });

  const reportMutation = useMutation({
    mutationFn: (data: CreateReportData) =>
      apiClient.createReport(data.targetType, data.targetId, data.reason),
    onSuccess: () => {
      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été transmis aux modérateurs.",
      });
      setIsOpen(false);
      form.reset();
      
      // Invalidate reports queries if user has moderation access
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le signalement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateReportData) => {
    const customReason = (form.getValues() as any).customReason as string | undefined;
    const finalReason: string =
      data.reason === "other" && customReason
        ? customReason
        : reportReasons.find((r) => r.value === data.reason)?.label || data.reason;

    reportMutation.mutate({
      ...data,
      reason: finalReason,
    });
  };

  const selectedReason = form.watch("reason");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} data-testid="button-report">
          <i className="fas fa-flag text-gray-400 text-sm"></i>
          {size !== "sm" && <span className="ml-2">Signaler</span>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler ce contenu</DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir une communauté sûre en signalant les contenus inappropriés.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison du signalement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-report-reason">
                        <SelectValue placeholder="Sélectionnez une raison" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === "other" && (
              <FormField
                control={form.control}
                // store customReason alongside form values without strict typing
                name={"customReason" as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Précisez la raison</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le problème avec ce contenu..."
                        className="resize-none"
                        {...field}
                        data-testid="textarea-custom-reason"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-report"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={reportMutation.isPending}
                data-testid="button-submit-report"
              >
                {reportMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Envoi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-flag mr-2"></i>
                    Signaler
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
