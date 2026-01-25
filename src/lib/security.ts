import { createClient } from '@/lib/supabase/server';
import sharp from 'sharp';

// --- Magic Bytes for Image Validation ---
const MAGIC_BYTES: Record<string, string> = {
    'ffd8ffe0': 'image/jpeg',
    'ffd8ffe1': 'image/jpeg',
    'ffd8ffe2': 'image/jpeg',
    '89504e47': 'image/png',
    '52494646': 'image/webp', // RIFF...WEBP part
};

export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        return { isValid: false, error: 'La imagen excede el límite de 5MB.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const header = buffer.toString('hex', 0, 4);

    let mime: string | undefined;

    // Simple check - for WebP check extended RIFF (usually 'RIFF' at 0, 'WEBP' at 8)
    if (header === '52494646') {
        const subType = buffer.toString('utf8', 8, 12);
        if (subType === 'WEBP') mime = 'image/webp';
    } else {
        mime = MAGIC_BYTES[header] || Object.keys(MAGIC_BYTES).find(key => header.startsWith(key)) ? 'image/jpeg' /* simplify match */ : undefined;
        // Proper lookup logic:
        if (!mime) {
            if (header === '89504e47') mime = 'image/png';
            else if (header.startsWith('ffd8')) mime = 'image/jpeg';
        }
    }

    if (!mime) {
        return { isValid: false, error: 'Formato de archivo no válido (Magic Bytes check failed).' };
    }

    // Explicitly reject SVG even if renamed
    if (buffer.toString('utf8').includes('<svg')) {
        return { isValid: false, error: 'Formato SVG no permitido por seguridad.' };
    }

    return { isValid: true };
}

export async function sanitizeImage(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Re-encode to WebP, Strip Metadata, Resize
    return await sharp(buffer)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
}

// --- Rate Limiting ---
// We use the DB index for this check
export async function checkRateLimit(userId: string, actionType: string, limit: number, windowSeconds: number) {
    const supabase = await createClient();
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

    const { count, error } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', actionType)
        .gte('created_at', windowStart);

    if (error) {
        console.error("Rate Limit DB Error:", error);
        return false; // Fail open or closed? Closed for security.
    }

    return (count || 0) < limit;
}

export async function logAudit(userId: string, action: string, metadata: any, ip?: string, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') {
    const supabase = await createClient();
    // Fire and forget usually, but await here to ensure write
    await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        metadata,
        ip_address: ip, // Would need headers() passage or similar context
        severity
    });
}
