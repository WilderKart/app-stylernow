import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BusinessInfoClient from "./client";

export default async function BusinessInfoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    // Check Profile Status
    const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

    if (!profile || profile.status !== 'ACCOUNT_ACTIVE') {
        // If they haven't finished previous steps, redirect back
        if (profile?.status === 'PHONE_VERIFIED') redirect("/create-barbershop/create-password");
        redirect("/create-barbershop");
    }

    // Check if Barbershop Draft exists to pre-fill
    const { data: barbershop } = await supabase
        .from("barbershops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

    return <BusinessInfoClient initialData={barbershop} />;
}
