// Colecciones de contenido. Preparadas en la Fase 2 de la migracion (09/2026),
// sin piezas todavia: sumar una guia es escribir un markdown en
// src/content/guias/<slug>.md y aparece en /guias/<slug> y en el sitemap.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Eslabon que trabaja la guia; sirve para preseleccionar el diagnostico
    // desde la guia (?origen=guia-<slug>) sin perder la atribucion.
    eslabon: z.enum(['costos', 'resultado', 'cashflow', 'gestion']).optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guias };
