import { useToast } from "@/components/ui";

export function useDemoGuard() {
    const { toast } = useToast();

    const checkDemo = () => {
        if (import.meta.env.VITE_PRODUCT_TYPE === "demo") {
            toast({
                title: "Unauthorized",
                description: "You cannot make changes in demo version",
                variant: "warning",
            });
            return true;
        }
        return false;
    };

    return { checkDemo };
}
