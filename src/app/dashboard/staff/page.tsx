import { createClient } from "@/lib/supabase/server";
import StaffManager from "./StaffManager";

export default async function StaffPage() {
    const supabase = await createClient();

    // Fetch staff (RLS restricted to owner)
    const { data: staff } = await supabase.from("staff_members").select("*").order('created_at', { ascending: false });

    return <StaffManager initialStaff={staff || []} />;
}
