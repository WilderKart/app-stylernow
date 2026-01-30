
export type ServiceCategory = 'BARBERSHOP' | 'MANICURE' | 'OTHER';

export interface DefaultService {
    id: string; // Internal ID for seed (slug)
    name: string;
    category: ServiceCategory;
    defaultPrice: number;
    defaultDuration: number; // minutes
    imageName: string; // filename in /public/servicios/...
}

export const DEFAULT_SERVICES: DefaultService[] = [
    // --- BARBERIA (NUEVO LISTADO COMPLETO) ---
    // --- 1. FADES & DEGRADADOS ---
    { id: 'low-fade', name: 'Low Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'Low Fade.webp' },
    { id: 'low-fade-raya', name: 'Low Fade con raya a un lado', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'low-fade-raya.webp' },
    { id: 'mid-fade', name: 'Mid Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'mid-fade.webp' },
    { id: 'high-fade', name: 'High Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'high-fade.webp' },
    { id: 'high-fade-barba', name: 'High Fade con barba', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 50, imageName: 'high-fade-barba.webp' },
    { id: 'drop-fade', name: 'Drop Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'drop-fade.webp' },
    { id: 'drop-fade-rizado', name: 'Drop Fade rizado', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 45, imageName: 'drop-fade-rizado.webp' },
    { id: 'drop-fade-ondulado', name: 'Drop Fade ondulado', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'drop-fade-ondulado.webp' },
    { id: 'skin-fade', name: 'Skin Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'skin-fade.webp' },
    { id: 'skin-fade-undercut', name: 'Skin Fade Undercut con textura', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'skin-fade-undercut.webp' },
    { id: 'bald-fade', name: 'Bald Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'bald-fade.webp' },
    { id: 'burst-fade', name: 'Burst Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'burst-fade.webp' },
    { id: 'blurry-fade', name: 'Blurry Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'blurry-fade.webp' },
    { id: 'blowout', name: 'Blowout', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'blowout.webp' },
    { id: 'temple-fade-cepillado', name: 'Temple Fade con cepillado lateral', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'temple-fade-cepillado.webp' },
    { id: 'temple-fade-quiff', name: 'Temple Fade con quiff', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'temple-fade-quiff.webp' },
    { id: 'fade-side-comb', name: 'Fade Side Comb', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'fade-side-comb.webp' },
    { id: 'high-top-fade', name: 'High Top Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'high-top-fade.webp' },
    { id: 'high-fade-rizado', name: 'High Fade rizado', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'high-fade-rizado.webp' },
    { id: 'fade-afro', name: 'Fade afro', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'fade-afro.webp' },
    { id: 'comb-over-drop-fade', name: 'Comb Over Drop Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'comb-over-drop-fade.webp' },
    { id: 'fade-pompadour', name: 'Fade Pompadour', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'fade-pompadour.webp' },
    { id: 'french-crop-mid-fade', name: 'French Crop con Mid Fade', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'french-crop-mid-fade.webp' },

    // --- 2. CLÁSICOS & CORTOS ---
    { id: 'buzz', name: 'Buzz', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'buzz.webp' },
    { id: 'crew-cut', name: 'Crew Cut', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'crew-cut.webp' },
    { id: 'butch-cut', name: 'Butch Cut', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'butch-cut.webp' },
    { id: 'militar', name: 'Militar', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'militar.webp' },
    { id: 'militar-degradado', name: 'Militar (Degradado)', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'militar-degradado.webp' },
    { id: 'french-crop', name: 'French Crop', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'french-crop.webp' },
    { id: 'romano', name: 'Romano', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'romano.webp' },
    { id: 'ivy-league', name: 'Ivy League', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'ivy-league.webp' },
    { id: 'boxeo', name: 'Boxeo', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'boxeo.webp' },
    { id: 'corto-crecido', name: 'Corto crecido', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'corto-crecido.webp' },
    { id: 'cuadrado', name: 'Cuadrado', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'cuadrado.webp' },
    { id: 'en-pico', name: 'En pico', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'en-pico.webp' },
    { id: 'inclinado', name: 'Inclinado', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 30, imageName: 'inclinado.webp' },
    { id: 'para-pelo-fino', name: 'Para pelo fino', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'para-pelo-fino.webp' },
    { id: 'para-cabello-fino', name: 'Para cabello fino', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'para-cabello-fino.webp' },
    { id: 'casual', name: 'Casual', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'casual.webp' },

    // --- 3. MODERNOS & TEXTURIZADOS ---
    { id: 'mullet', name: 'Mullet', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'mullet.webp' },
    { id: 'mullet-corto', name: 'Mullet corto', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'mullet-corto.webp' },
    { id: 'mullet-textura', name: 'Mullet con textura', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 45, imageName: 'mullet-textura.webp' },
    { id: 'mullet-quiff', name: 'Mullet Quiff', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'mullet-quiff.webp' },
    { id: 'mullet-mohicano', name: 'Mullet mohicano', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'mullet-mohicano.webp' },
    { id: 'mullet-rizado', name: 'Mullet rizado', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'mullet-rizado.webp' },
    { id: 'soft-mullet', name: 'Soft Mullet', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'soft-mullet.webp' },
    { id: 'fade-mullet', name: 'Fade Mullet', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'fade-mullet.webp' },
    { id: 'shaggy', name: 'Shaggy', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'shaggy.webp' },
    { id: 'soft-shaggy', name: 'Soft Shaggy', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'soft-shaggy.webp' },
    { id: 'short-shaggy', name: 'Short Shaggy', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'short-shaggy.webp' },
    { id: 'mohicano', name: 'Mohicano', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'mohicano.webp' },
    { id: 'mohicano-linea', name: 'Mohicano con línea', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'mohicano-linea.webp' },
    { id: 'texturizado', name: 'Texturizado', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'texturizado.webp' },
    { id: 'con-textura', name: 'Con textura', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'con-textura.webp' },
    { id: 'con-capas-desconectadas', name: 'Con capas desconectadas', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'con-capas-desconectadas.webp' },

    // --- 4. ESTILO & PEINADO ---
    { id: 'pompadour', name: 'Pompadour', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'pompadour.webp' },
    { id: 'pompadour-barba', name: 'Pompadour con barba', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 50, imageName: 'pompadour-barba.webp' },
    { id: 'pompadour-capas', name: 'Pompadour con capas', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 45, imageName: 'pompadour-capas.webp' },
    { id: 'quiff', name: 'Quiff', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'quiff.webp' },
    { id: 'messy-quiff', name: 'Messy Quiff', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'messy-quiff.webp' },
    { id: 'quiff-suave-barba', name: 'Quiff suave con barba', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 50, imageName: 'quiff-suave-barba.webp' },
    { id: 'brush-up', name: 'Brush Up', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'brush-up.webp' },
    { id: 'mini-brush-up', name: 'Mini Brush Up', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'mini-brush-up.webp' },
    { id: 'slicked-back', name: 'Slicked Back', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'slicked-back.webp' },
    { id: 'slicked-back-barba', name: 'Slicked Back con barba', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 50, imageName: 'slicked-back-barba.webp' },
    { id: 'side-part', name: 'Side Part', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'side-part.webp' },
    { id: 'comb-over', name: 'Comb Over', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'comb-over.webp' },
    { id: 'undercut', name: 'Undercut', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 40, imageName: 'undercut.webp' },
    { id: 'undercut-asimetrico', name: 'Undercut asimétrico', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 45, imageName: 'undercut-asimetrico.webp' },
    { id: 'undercut-falso-mohawk', name: 'Undercut con falso mohawk', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'undercut-falso-mohawk.webp' },
    { id: 'hipster-undercut', name: 'Hipster Undercut', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'hipster-undercut.webp' },
    { id: 'pelo-corto-volumen', name: 'Pelo corto con volumen', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'pelo-corto-volumen.webp' },
    { id: 'con-volumen', name: 'Con volumen', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'con-volumen.webp' },
    { id: 'elegante', name: 'Elegante', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'elegante.webp' },

    // --- 5. RIZADOS & AFRO ---
    { id: 'afro', name: 'Afro', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'afro.webp' },
    { id: 'rizado-corto', name: 'Rizado corto', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'rizado-corto.webp' },
    { id: 'corto-rizado', name: 'Corto rizado', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'corto-rizado.webp' },
    { id: 'rizado-midi', name: 'Rizado midi', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'rizado-midi.webp' },
    { id: 'rizado-flequillo', name: 'Rizado con flequillo', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'rizado-flequillo.webp' },
    { id: 'rizado-degradado', name: 'Rizado (Degradado)', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'rizado-degradado.webp' },
    { id: 'largo-rizado', name: 'Largo rizado', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 50, imageName: 'largo-rizado.webp' },
    { id: 'midi-rizado', name: 'Midi rizado', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'midi-rizado.webp' },
    { id: 'midi-rizado-degradado', name: 'Midi rizado con degradado', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 55, imageName: 'midi-rizado-degradado.webp' },
    { id: 'mid-part-ondulado', name: 'Mid Part ondulado', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'mid-part-ondulado.webp' },

    // --- 6. LARGO & MEDIA MELENA ---
    { id: 'largo', name: 'Largo', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'largo.webp' },
    { id: 'midi-largo', name: 'Midi (Largo)', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'midi-largo.webp' },
    { id: 'por-los-hombros', name: 'Por los hombros', category: 'BARBERSHOP', defaultPrice: 22, defaultDuration: 50, imageName: 'por-los-hombros.webp' },
    { id: 'undercut-pelo-largo', name: 'Undercut con pelo largo', category: 'BARBERSHOP', defaultPrice: 25, defaultDuration: 60, imageName: 'undercut-pelo-largo.webp' },
    { id: 'fade-short-top', name: 'Fade Short Top', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'fade-short-top.webp' },

    // --- 7. OTROS/NICHE ---
    { id: 'con-flequillo', name: 'Con flequillo', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'con-flequillo.webp' },
    { id: 'con-flequillo-cortina', name: 'Con flequillo cortina', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'con-flequillo-cortina.webp' },
    { id: 'con-flequillo-recto', name: 'Con flequillo recto', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'con-flequillo-recto.webp' },
    { id: 'con-flequillo-degradado', name: 'Con flequillo (Degradado)', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'con-flequillo-degradado.webp' },
    { id: 'con-linea', name: 'Con línea', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'con-linea.webp' },
    { id: 'a-tazon', name: 'A tazón', category: 'BARBERSHOP', defaultPrice: 15, defaultDuration: 30, imageName: 'a-tazon.webp' },
    { id: 'a-tazon-rizado', name: 'A tazón rizado', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 35, imageName: 'a-tazon-rizado.webp' },
    { id: 'eboy', name: 'Eboy', category: 'BARBERSHOP', defaultPrice: 20, defaultDuration: 45, imageName: 'eboy.webp' },
    { id: 'para-cara-redonda', name: 'Para cara redonda', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'para-cara-redonda.webp' },
    { id: 'para-cara-cuadrada', name: 'Para cara cuadrada', category: 'BARBERSHOP', defaultPrice: 18, defaultDuration: 40, imageName: 'para-cara-cuadrada.webp' },

    // --- MANICURE ---
    // --- MANICURE ---
    { id: 'manicure-basica', name: 'Manicura Básica', category: 'MANICURE', defaultPrice: 15, defaultDuration: 45, imageName: 'manicura-basica.webp' },
    { id: 'manicure-estetica', name: 'Manicura Estética (Esmalte)', category: 'MANICURE', defaultPrice: 20, defaultDuration: 60, imageName: 'manicura-estetica.webp' },
    { id: 'manicure-gel', name: 'Esmalte en Gel (Semipermanente)', category: 'MANICURE', defaultPrice: 25, defaultDuration: 60, imageName: 'esmalte-gel.webp' },
    { id: 'manicure-spa', name: 'Manicura Spa', category: 'MANICURE', defaultPrice: 30, defaultDuration: 50, imageName: 'manicura-spa.webp' },
    { id: 'tratamiento-parafina', name: 'Tratamiento de Parafina', category: 'MANICURE', defaultPrice: 15, defaultDuration: 20, imageName: 'tratamiento-parafina.webp' },
    { id: 'corte-unas', name: 'Corte de Uñas', category: 'MANICURE', defaultPrice: 10, defaultDuration: 15, imageName: 'corte-unas.webp' },
    { id: 'pedicure-basica', name: 'Pedicura Básica', category: 'MANICURE', defaultPrice: 20, defaultDuration: 60, imageName: 'pedicura-basica.webp' },
    { id: 'pedicure-spa', name: 'Pedicura Spa', category: 'MANICURE', defaultPrice: 35, defaultDuration: 75, imageName: 'pedicura-spa.webp' },
    { id: 'limpieza-profunda-pies', name: 'Limpieza Profunda de Pies', category: 'MANICURE', defaultPrice: 25, defaultDuration: 45, imageName: 'limpieza-profunda-pies.webp' },
    { id: 'masaje-pies', name: 'Masaje de Pies', category: 'MANICURE', defaultPrice: 15, defaultDuration: 20, imageName: 'masaje-pies.webp' },
];
