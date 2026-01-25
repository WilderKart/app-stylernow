import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VisualIdentityClient from "./client";

export default async function VisualIdentityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/create-barbershop");
    }

    // Check Barbershop Draft
    const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id, logo_url, banner_url, name")
        .eq("owner_id", user.id)
        .single();

    if (!barbershop) {
        // Must fill business info first
        redirect("/create-barbershop/business-info");
    }

    // Generate Signed URLs for preview if they exist (Private Bucket)
    let logoUrl = barbershop.logo_url;
    let bannerUrl = barbershop.banner_url;

    if (logoUrl && !logoUrl.startsWith("http")) {
        const { data } = await supabase.storage.from("barbershop-docs").createSignedUrl(logoUrl, 3600);
        if (data) logoUrl = data.signedUrl;
    }
    if (bannerUrl && !bannerUrl.startsWith("http")) {
        const { data } = await supabase.storage.from("barbershop-docs").createSignedUrl(bannerUrl, 3600);
        if (data) bannerUrl = data.signedUrl;
    }

    return <VisualIdentityClient
        barbershopId={barbershop.id}
        initialLogo={logoUrl}
        initialBanner={bannerUrl}
        businessName={barbershop.name}
    />;
}
