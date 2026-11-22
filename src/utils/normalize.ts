/**
 * normalize.ts
 * Utilitaires pour normaliser les noms d'ingrédients :
 * minuscules, sans accents, sans espaces parasites.
 */

/**
 * Supprime les accents d'une chaîne de caractères.
 * Exemple : "Tomates" → "tomates", "Œufs" → "oeufs"
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritiques
    .replace(/Œ/g, 'OE')
    .replace(/œ/g, 'oe')
    .replace(/Æ/g, 'AE')
    .replace(/æ/g, 'ae');
}

/**
 * Normalise un nom d'ingrédient pour la comparaison :
 * - trim
 * - minuscules
 * - accents retirés
 */
export function normalizeIngredient(name: string): string {
  return removeAccents(name.trim().toLowerCase());
}

/**
 * Vérifie si deux chaînes d'ingrédients correspondent,
 * indépendamment de la casse, des accents et des pluriels simples (s/x).
 */
export function ingredientsMatch(a: string, b: string): boolean {
  const normA = normalizeIngredient(a);
  const normB = normalizeIngredient(b);
  if (normA === normB) return true;
  // Pluriels simples en 's' ou 'x' (ex: tomate / tomates, poireau / poireaux)
  if (normA + 's' === normB || normB + 's' === normA) return true;
  if (normA + 'x' === normB || normB + 'x' === normA) return true;
  // Pluriel composé (ex: pommes de terre / pomme de terre)
  const stripS = (s: string) => s.replace(/\bs\b|s(?=\s|$)/g, '');
  if (stripS(normA) === stripS(normB)) return true;
  return false;
}
