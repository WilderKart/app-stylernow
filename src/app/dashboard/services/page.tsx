import { createClient } from "@/lib/supabase/server";
import ServiceManager from "./ServiceManager";

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch services via RLS (join not strictly needed if we trust RLS, but standard query)
    // Actually we need to filter by barbershop owned by user if RLS wasn't enough, but it is.
    // However, to be safe and cleaner, we can get barbershopId first or join.
    // RLS policy: "Owners can manage their services" -> SELECT allowed if exists barbershop owned by user.
    // So simple select works.

    // Explicitly getting barbershop id to ensure we only get OUR services if RLS is loose (it isn't), 
    // but mostly because multiple shops might exist in future? Plan says 1 shop.

    // Using simple select assuming RLS works as tested.
    const { data: services } = await supabase.from("services").select("*").order('created_at', { ascending: false });

    return <ServiceManager initialServices={services || []} />;
}
