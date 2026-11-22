/**
 * types.ts
 * Types partagés dans toute l'application.
 */

/** Un ingrédient dans une recette : ID normalisé + étiquette affichée + quantité */
export interface RecipeIngredient {
  /** Identifiant normalisé utilisé pour la correspondance (ex: "tomate") */
  id: string;
  /** Étiquette affichée (ex: "Tomates") */
  label: string;
  /** Quantité affichée (ex: "3 moyennes", "200 g", "1 pincée") */
  quantity: string;
}

/** Une recette complète du catalogue ou créée par l'utilisateur */
export interface Recipe {
  id: string;
  name: string;
  /** Temps de préparation + cuisson (ex: "30 min") */
  prepTime: string;
  servings: number;
  /** Catégorie (ex: "Tunisien", "Végétarien", "Rapide"…) */
  category: string;
  ingredients: RecipeIngredient[];
  /** Étapes de préparation dans l'ordre */
  steps: string[];
  /** Vrai si la recette a été créée par l'utilisateur */
  isCustom?: boolean;
  /** Date de création ISO si personnalisée */
  createdAt?: string;
}

/** Un ingrédient saisi par l'utilisateur */
export interface UserIngredient {
  /** Identifiant normalisé */
  id: string;
  /** Étiquette telle que saisie par l'utilisateur */
  label: string;
}

/** Résultat d'analyse d'une recette par rapport aux ingrédients de l'utilisateur */
export interface RecipeMatch {
  recipe: Recipe;
  /** Nombre d'ingrédients disponibles */
  availableCount: number;
  /** Nombre d'ingrédients manquants */
  missingCount: number;
  /** Total d'ingrédients de la recette */
  totalCount: number;
  /** Proportion disponible (0–1) */
  ratio: number;
  /** Ingrédients manquants */
  missingIngredients: RecipeIngredient[];
  /** Ingrédients disponibles */
  availableIngredients: RecipeIngredient[];
  /** Vrai si l'utilisateur a tous les ingrédients */
  isComplete: boolean;
}

/** Origine d'un ingrédient dans la liste de courses (recette source + quantité) */
export interface ShoppingRecipeSource {
  recipeId: string;
  recipeName: string;
  quantity: string;
}

/** Un article dans la liste de courses */
export interface ShoppingItem {
  /** Identifiant normalisé de l'ingrédient */
  id: string;
  /** Nom affiché de l'ingrédient */
  label: string;
  /** Liste des recettes sources avec leurs quantités respectives */
  sources: ShoppingRecipeSource[];
  /** Date d'ajout */
  addedAt: string;
}
