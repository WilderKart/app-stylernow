import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DocumentsClient from "./client";

export default async function DocumentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    // Check Barbershop Draft
    const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id, business_type, status")
        .eq("owner_id", user.id)
        .single();

    if (!barbershop) {
        redirect("/create-barbershop/business-info");
    }

    // Fetch existing documents status
    const { data: existingDocs } = await supabase
        .from("barbershop_documents")
        .select("type, status")
        .eq("barbershop_id", barbershop.id);

    return <DocumentsClient
        barbershopId={barbershop.id}
        businessType={barbershop.business_type}
        existingDocs={existingDocs || []}
    />;
}
