import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WhatsAppVerificationClient from "./client"; // We'll move UI to client component

export default async function VerifyWhatsAppPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop"); // Back to start if no session
    }

    // Strict Status Check
    const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

    if (!profile || profile.status !== "EMAIL_VERIFIED") {
        // If trying to skip ahead or status not updated
        if (profile?.status === "CREATED") {
            // Maybe missed email verify step?
            // We don't have email in params here easily, better send to start
            redirect("/create-barbershop");
        }
        // If already passed this step (e.g. PHONE_VERIFIED), logic might vary, 
        // but for linear flow, we allow them to proceed or redirect to next step if already done.
        // For now, strictly block if NOT EMAIL_VERIFIED (or PHONE_VERIFIED, implicitly ok?)
        // User said: "El usuario NO puede avanzar al paso de WhatsApp OTP si: profiles.status !== 'EMAIL_VERIFIED'"
        // This implies EXACT match for this step.

        // Allow if already verified phone too? No, that would be next step.
        if (profile?.status === "PHONE_VERIFIED" || profile?.status === "ACCOUNT_ACTIVE") {
            // Already done, move next
            redirect("/create-barbershop/create-password");
        }

        // If neither, blocking.
        redirect("/create-barbershop");
    }

    return <WhatsAppVerificationClient phone={user.user_metadata.phone || ""} />;
}
