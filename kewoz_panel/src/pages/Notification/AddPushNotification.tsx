import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/Form";
import { useModal } from "@/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import {
    pushNotificationService,
    type NotificationParams,
} from "@/services/global/PushNotificationService";
import { useDemoGuard } from "@/utils/demoGuard";

export function AddNotification() {
    const { close } = useModal();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { checkDemo } = useDemoGuard();

    const form = useForm<NotificationParams>({
        defaultValues: {
            title: "",
            message: "",
        },
        mode: "onChange",
    });

    const handleSubmit = async (data: NotificationParams) => {
        setIsLoading(true);
        try {
            if (checkDemo()) return;

            const notification: NotificationParams = {
                title: data.title,
                message: data.message,
            };

            const response = await pushNotificationService.sendNotification(
                notification
            );

            if (response.status) {
                toast({
                    title: "¡Éxito!",
                    description: "¡Notificación enviada con éxito!",
                    variant: "success",
                });

                form.reset();
                close();
            } else {
                throw new Error(response.message || "Error al enviar la notificación");
            }
        } catch (error) {
            console.error("Error in sending notification", error);
            toast({
                title: "Error",
                description: "Error al enviar la notificación. Por favor, inténtelo de nuevo.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4">
            <Form form={form} onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <FormItem>
                    <FormLabel required>Título</FormLabel>
                    <FormControl>
                        <FormField name="title">
                            <input
                                placeholder="Ingresa el título de la notificación"
                                disabled={isLoading}
                                className="flex h-10 w-full md:w-[60vw] lg:w-[30vw] rounded-md border border-gray-300 px-3 py-2 text-sm text-text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </FormField>
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Message */}
                <FormItem>
                    <FormLabel required>Mensaje</FormLabel>
                    <FormControl>
                        <FormField name="message">
                            <textarea
                                placeholder="Ingresa el mensaje de la notificación"
                                disabled={isLoading}
                                rows={4}
                                className="flex w-full md:w-[60vw] lg:w-[30vw] rounded-md border border-gray-300 px-3 py-2 text-sm text-text-muted resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </FormField>
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Submit */}
                <div className="flex justify-center pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-40 bg-primary text-button-text  font-semibold py-2 rounded-md transition-colors duration-200"
                    >
                        {isLoading ? "Enviando..." : "Enviar"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
