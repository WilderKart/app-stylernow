"use server";

import { saveLocationAndContact } from "../actions";

// --- Re-export logic for client compatibility ---
export { saveLocationAndContact };

// --- Simple In-Memory Rate Limiter ---
// Note: In a serverless environment (like Vercel), this map might reset frequently.
// For production robust rate limiting, use Redis (Upstash/KV).
// This suffices for a single-instance or sticky-session MVP to prevent bombing.
const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();

interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
}

export async function searchLocationAction(query: string) {
    console.log(`[GeoProxy] Request for: "${query}"`);

    // 1. Input Validation
    if (!query || query.trim().length < 3) {
        return { error: "La consulta debe tener al menos 3 caracteres", data: [] };
    }

    const normalizedQuery = query.trim().toLowerCase();

    // 2. Rate Limiting (Hard Limit: 1 request/sec approx per user logic)
    // Using a simple global bucket for MVP if no auth context passed, 
    // or IP based if we had headers access easily here. 
    // For now, using a global user bucket simulation or random session ID logic if passed.
    // We'll use a "global_user_limit" bucket for this demo to just limit TOTAL flooding from this server instance.
    // Ideally, pass a session ID.
    const userIdentifier = "global_rate_user";

    // Config: 20 requests per minute per identifier
    const windowTime = 60 * 1000;
    const maxRequests = 20;

    const now = Date.now();
    const userRecord = rateLimitMap.get(userIdentifier) || { count: 0, lastRequest: now };

    if (now - userRecord.lastRequest > windowTime) {
        // Reset window
        userRecord.count = 1;
        userRecord.lastRequest = now;
    } else {
        userRecord.count++;
    }

    rateLimitMap.set(userIdentifier, userRecord);

    if (userRecord.count > maxRequests) {
        console.warn(`[GeoProxy] Rate Limit Exceeded for ${userIdentifier}`);
        return { error: "Demasiadas búsquedas. Por favor espera un momento.", data: [] };
    }

    try {
        // 3. Construct Query (Focus on Colombia/Cali context as requested, or Keep generic)
        // User asked for "Cali, Valle del Cauca, Colombia" context in the example property.
        // We will append it if it looks like a simple address without city.
        let searchQuery = normalizedQuery;
        if (!searchQuery.includes("cali") && !searchQuery.includes("colombia")) {
            searchQuery = `${searchQuery}, Cali, Colombia`;
        }

        // 4. Call Nominatim (Server-Side)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=3`;

        console.log(`[GeoProxy] Fetching: ${url}`);

        const response = await fetch(url, {
            headers: {
                // REQUIRED by Nominatim Usage Policy
                "User-Agent": "StylerNow/1.0 (contact@stylernow.app)",
                "Referer": "https://stylernow.app"
            },
            // 5. Next.js Native Caching
            // Cache results for 1 hour (3600s) uniqueness based on URL
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.status}`);
        }

        const data: NominatimResult[] = await response.json();
        console.log(`[GeoProxy] Success. Found ${data.length} results.`);

        return { data };

    } catch (error: any) {
        console.error("[GeoProxy] Error:", error.message);
        return { error: "No se pudo conectar con el servicio de mapas", data: [] };
    }
}
