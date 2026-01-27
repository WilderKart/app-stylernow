'use server';

import { z } from 'zod';
import { secureAction } from '../actions'; // Import shared security wrapper
import { validateImageFile, sanitizeImage } from '@/lib/security';

// --- Zod Schemas (Strict Backend Contract) ---

// 1. Time Block Schema (Zero Trust Transport Format)
const timeBlockSchema = z.object({
    day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    openMinutes: z.number().int().min(0).max(1439),
    closeMinutes: z.number().int().min(0).max(1439),
    isClosed: z.boolean()
}).refine(data => data.isClosed || data.openMinutes < data.closeMinutes, {
    message: "La hora de cierre debe ser posterior a la de apertura",
    path: ["closeMinutes"]
});

// Full Payload Schema (except files, validated manually)
const payloadSchema = z.object({
    description: z.string().max(500, "La descripción es muy larga (max 500 chars)").optional(),
    schedule: z.array(timeBlockSchema).min(7, "Debes definir el horario para todos los días")
});

export async function saveVisualIdentity(formData: FormData) {
    // Reusing the same "step 3" requirement from the main flow
    return secureAction('SAVE_VISUAL_IDENTITY_V2', 3, async ({ user, supabase }) => {

        console.log("🔒 [ZeroTrust] Starting Visual Identity Update...");

        // 1. Extract & Validate Files
        const logoFile = formData.get('logo') as File | null;
        const facadePhoto = formData.get('facadePhoto') as File | null;
        const interiorPhoto = formData.get('interiorPhoto') as File | null;

        const timestamp = Date.now();
        const updates: any = {};

        // Helper for image processing
        const processImage = async (file: File, path: string) => {
            console.log(`📸 Validating ${file.name}...`);
            const { isValid, error } = await validateImageFile(file);
            if (!isValid) throw new Error(error);

            const buffer = await sanitizeImage(file); // Sharp -> WebP
            await supabase.storage.from('barbershop-docs').upload(path, buffer, { contentType: 'image/webp', upsert: true });
            return path;
        };

        // --- Logo Processing ---
        if (logoFile && logoFile.size > 0) {
            try {
                const path = `logos/${user.id}/logo-${timestamp}.webp`;
                updates.logo_url = await processImage(logoFile, path);
            } catch (e: any) { return { error: `Logo Error: ${e.message}` }; }
        }

        // --- Photos Processing (Fachada + Interior) ---
        // Storing as array strings in DB: [facade_url, interior_url] (or object if DB allows, but usually array text[])
        // Note: The prompt implies separate fields maybe? Or just "Imágenes". 
        // Existing DB schema likely has 'local_photos' array from previous actions.ts reading.
        // We will push to an array.

        const newLocalPhotos = [];

        if (facadePhoto && facadePhoto.size > 0) {
            try {
                const path = `locales/${user.id}/facade-${timestamp}.webp`;
                newLocalPhotos.push(await processImage(facadePhoto, path));
            } catch (e: any) { return { error: `Fachada Error: ${e.message}` }; }
        }

        if (interiorPhoto && interiorPhoto.size > 0) {
            try {
                const path = `locales/${user.id}/interior-${timestamp}.webp`;
                newLocalPhotos.push(await processImage(interiorPhoto, path));
            } catch (e: any) { return { error: `Interior Error: ${e.message}` }; }
        }

        if (newLocalPhotos.length > 0) {
            // Logic decision: Overwrite or Append? Usually overwrite for profile settings.
            updates.local_photos = newLocalPhotos;
        }


        // 2. Extract & Validate Data (Schedule & Desc)
        const schedulesRaw = formData.get('schedules');
        const descriptionRaw = formData.get('description');

        let parsedData;
        try {
            parsedData = payloadSchema.parse({
                description: descriptionRaw?.toString() || "",
                schedule: JSON.parse(schedulesRaw?.toString() || "[]")
            });
        } catch (e: any) {
            console.error("❌ Zod Validation Error:", e);
            return { error: e.errors?.[0]?.message || "Datos de horario inválidos." };
        }

        updates.description = parsedData.description;
        updates.opening_hours = parsedData.schedule; // Saving the strict format directly

        // 3. Persist to DB
        console.log("💾 Persisting to DB...", updates);

        const { error } = await supabase
            .from('barbershops')
            .update(updates)
            .eq('owner_id', user.id);

        if (error) {
            console.error("DB Error:", error);
            throw new Error("Error guardando en base de datos.");
        }

        // 4. Advance Step (StateMachine)
        // Check current step to advance
        const { data: current } = await supabase.from('barbershops').select('onboarding_step').eq('owner_id', user.id).single();
        if (current && current.onboarding_step === 3) {
            await supabase.from('barbershops').update({ onboarding_step: 4 }).eq('owner_id', user.id);
        }

        return { success: true };
    });
}
