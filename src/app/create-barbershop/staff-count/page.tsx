import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StaffCountClient from "./client";

export default async function StaffCountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id, staff_count")
        .eq("owner_id", user.id)
        .single();

    if (!barbershop) {
        redirect("/create-barbershop/business-info");
    }

    return <StaffCountClient initialCount={barbershop.staff_count || 1} />;
}
