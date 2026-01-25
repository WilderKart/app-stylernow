'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { validateImageFile, sanitizeImage } from '@/lib/security'

// --- Zod Schemas ---

const serviceSchema = z.object({
    name: z.string().min(3, "Nombre muy corto"),
    price: z.coerce.number().min(0, "Precio inválido"),
    duration_min: z.coerce.number().int().min(5, "Mínimo 5 min").max(480, "Máximo 8 horas"),
    description: z.string().optional()
}).strict();

const staffSchema = z.object({
    full_name: z.string().min(3, "Nombre requerido"),
    role: z.string().min(3, "Rol inválido"),
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal(''))
}).strict();

// --- Actions ---

export async function createService(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const rawData = {
        name: formData.get('name'),
        price: formData.get('price'),
        duration_min: formData.get('duration_min'),
        description: formData.get('description')
    };

    const val = serviceSchema.safeParse(rawData);
    if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single();
    if (!shop) return { error: "Barbería no encontrada." };

    const { error } = await supabase.from('services').insert({
        barbershop_id: shop.id,
        ...val.data
    });

    if (error) {
        console.error("Create Service Error:", error);
        return { error: "Error al crear servicio." };
    }

    revalidatePath('/dashboard/services');
    return { success: true };
}

export async function createStaff(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const rawData = {
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        phone: formData.get('phone'),
        email: formData.get('email')
    };

    const val = staffSchema.safeParse(rawData);
    if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single();
    if (!shop) return { error: "Barbería no encontrada." };

    let avatarPath = null;
    const avatarFile = formData.get('avatar') as File;

    if (avatarFile && avatarFile.size > 0) {
        const { isValid, error } = await validateImageFile(avatarFile);
        if (!isValid) return { error: error };

        const buffer = await sanitizeImage(avatarFile);
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}.webp`;

        // Use 'staff-profiles' bucket as requested
        const { error: uploadError } = await supabase.storage
            .from('staff-profiles')
            .upload(filePath, buffer, { contentType: 'image/webp' });

        if (uploadError) {
            // Fallback if bucket doesn't exist? Or return error?
            // Assuming bucket exists or we create it.
            // If upload fails, we fail the staff creation to be safe or just skip image.
            console.error("Avatar Upload Error:", uploadError);
            return { error: "Error subiendo foto. Verifique el bucket 'staff-profiles'." };
        }
        avatarPath = filePath;
    }

    const { error } = await supabase.from('staff_members').insert({
        barbershop_id: shop.id,
        ...val.data,
        avatar_url: avatarPath
    });

    if (error) {
        console.error("Create Staff Error:", error);
        return { error: "Error al agregar miembro." };
    }

    revalidatePath('/dashboard/staff');
    return { success: true };
}
