/**
 * matching.ts
 * Logique de correspondance recettes ↔ ingrédients de l'utilisateur.
 *
 * Algorithme :
 * 1. Pour chaque recette, comparer ses ingrédients (via leur ID normalisé)
 *    avec les ingrédients normalisés de l'utilisateur.
 * 2. Calculer ratio = disponibles / total.
 * 3. Exclure les recettes avec 0 correspondance.
 * 4. Trier : complètes d'abord, puis par ratio décroissant,
 *    puis par nombre de manquants croissant.
 */

import { Recipe, RecipeIngredient, RecipeMatch, UserIngredient } from '../types';
import { normalizeIngredient, ingredientsMatch } from './normalize';

/**
 * Vérifie si un ingrédient de recette est disponible dans les ingrédients utilisateur.
 */
export function isIngredientAvailable(
  ingredientId: string,
  userIngredients: UserIngredient[]
): boolean {
  return userIngredients.some(
    (u) => ingredientsMatch(u.id, ingredientId) || ingredientsMatch(u.label, ingredientId)
  );
}

/**
 * Analyse une recette par rapport aux ingrédients de l'utilisateur.
 */
export function analyzeRecipe(
  recipe: Recipe,
  userIngredients: UserIngredient[]
): RecipeMatch {
  const availableIngredients: RecipeIngredient[] = [];
  const missingIngredients: RecipeIngredient[] = [];

  for (const ing of recipe.ingredients) {
    if (isIngredientAvailable(ing.id, userIngredients)) {
      availableIngredients.push(ing);
    } else {
      missingIngredients.push(ing);
    }
  }

  const totalCount = recipe.ingredients.length;
  const availableCount = availableIngredients.length;
  const missingCount = missingIngredients.length;
  const ratio = totalCount > 0 ? availableCount / totalCount : 0;
  const isComplete = missingCount === 0 && totalCount > 0;

  return {
    recipe,
    availableCount,
    missingCount,
    totalCount,
    ratio,
    missingIngredients,
    availableIngredients,
    isComplete,
  };
}

/**
 * Calcule les suggestions à partir du catalogue et des ingrédients utilisateur.
 * Retourne uniquement les recettes avec au moins 1 ingrédient disponible,
 * triées par pertinence décroissante.
 */
export function getSuggestions(
  recipes: Recipe[],
  userIngredients: UserIngredient[]
): RecipeMatch[] {
  if (userIngredients.length === 0) return [];

  const matches = recipes
    .map((r) => analyzeRecipe(r, userIngredients))
    .filter((m) => m.availableCount > 0);

  // Tri : complètes d'abord, puis ratio décroissant, puis manquants croissants
  matches.sort((a, b) => {
    if (a.isComplete && !b.isComplete) return -1;
    if (!a.isComplete && b.isComplete) return 1;
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    return a.missingCount - b.missingCount;
  });

  return matches;
}

/**
 * Génère le libellé de statut affiché sur une carte de suggestion.
 * Ex : « Vous avez tout ! » | « Il manque 2 ingrédients »
 */
export function getStatusLabel(match: RecipeMatch): string {
  if (match.isComplete) return 'Vous avez tout !';
  if (match.missingCount === 1) return 'Il manque 1 ingrédient';
  return `Il manque ${match.missingCount} ingrédients`;
}
