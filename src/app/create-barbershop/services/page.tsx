
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ServicesClient from "./client";
import { DEFAULT_SERVICES } from "@/lib/data/services";

export default async function ServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/create-barbershop");

    const { data: shop } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!shop) redirect("/create-barbershop/business-info");

    // Fetch instanced services from DB
    const { data: dbServices } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", shop.id);

    // Merge Logic (Server Side)
    // 1. Map Global Defaults
    const mergedGlobals = DEFAULT_SERVICES.map(def => {
        const existing = dbServices?.find(s => s.name === def.name);
        return {
            ...def,
            // If exists in DB, use DB values (active status, overridden price/duration?)
            // Requirement says "Solo activa o desactiva", but "Si está activo: Cambiar a icono Edit" implies editing.
            // For listing state, we mainly need isActive.
            isActive: existing ? existing.is_active : false,
            dbId: existing?.id // If it exists, we track its UUID
        };
    });

    // 2. Filter Custom Services (those not in global list)
    // We assume any service in DB that matches a global name IS that global service instanced.
    // Any service in DB that DOES NOT match a global name is a custom one.
    const customServices = dbServices?.filter(
        s => !DEFAULT_SERVICES.some(def => def.name === s.name)
    ) || [];

    return (
        <ServicesClient
            initialGlobals={mergedGlobals}
            initialCustoms={customServices}
            barbershopId={shop.id}
        />
    );
}
