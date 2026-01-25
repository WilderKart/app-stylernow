import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LocationContactClient from "./client";

export default async function LocationContactPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    // Check Barbershop Draft
    const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id, address, phone, whatsapp, latitude, longitude")
        .eq("owner_id", user.id)
        .single();

    if (!barbershop) {
        // Must fill business info first
        redirect("/create-barbershop/business-info");
    }

    return <LocationContactClient initialData={barbershop} />;
}
