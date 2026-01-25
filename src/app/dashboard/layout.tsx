import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/welcome");
    }

    // Optional: Check if barbershop exists to allow access
    const { data: shop } = await supabase.from("barbershops").select("id, name").eq("owner_id", user.id).single();
    if (!shop) {
        redirect("/create-barbershop");
    }

    return (
        <DashboardShell userName={shop.name || "Barbería"}>
            {children}
        </DashboardShell>
    );
}
