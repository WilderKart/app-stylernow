import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CreatePasswordClient from "./client";

export default async function CreatePasswordPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    // Strict Status Check for Linear Flow
    const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

    // Must have passed WhatsApp verification
    if (!profile || profile.status !== "PHONE_VERIFIED") {
        if (profile?.status === "EMAIL_VERIFIED") {
            // Back to previous step
            const phone = user.user_metadata.phone || "";
            redirect(`/create-barbershop/verify-whatsapp?phone=${encodeURIComponent(phone)}`);
        }
        if (profile?.status === "ACCOUNT_ACTIVE") {
            redirect("/create-barbershop/business-info");
        }

        // Fallback
        redirect("/create-barbershop");
    }

    return <CreatePasswordClient />;
}
