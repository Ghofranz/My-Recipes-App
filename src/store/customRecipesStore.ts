/**
 * customRecipesStore.ts
 * Persistance des recettes personnalisées créées par l'utilisateur via AsyncStorage.
 * Expose un hook React useCustomRecipes() pour créer, charger et supprimer ses propres recettes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Recipe, RecipeIngredient } from '../types';
import { normalizeIngredient } from '../utils/normalize';

const STORAGE_KEY = '@quoi_manger:custom_recipes';

export interface NewRecipeData {
  name: string;
  prepTime: string;
  servings: number;
  category: string;
  ingredients: { label: string; quantity: string }[];
  steps: string[];
}

interface CustomRecipesStore {
  customRecipes: Recipe[];
  isLoading: boolean;
  addCustomRecipe: (data: NewRecipeData) => Promise<{ success: boolean; recipe?: Recipe; error?: string }>;
  deleteCustomRecipe: (id: string) => Promise<void>;
  refreshCustomRecipes: () => Promise<void>;
}

async function loadCustomRecipes(): Promise<Recipe[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as Recipe[];
    return [];
  } catch {
    return [];
  }
}

async function saveCustomRecipes(list: Recipe[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Silently ignore storage errors
  }
}

export function useCustomRecipes(): CustomRecipesStore {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCustomRecipes = useCallback(async () => {
    const list = await loadCustomRecipes();
    setCustomRecipes(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshCustomRecipes();
  }, [refreshCustomRecipes]);

  const addCustomRecipe = useCallback(
    async (data: NewRecipeData): Promise<{ success: boolean; recipe?: Recipe; error?: string }> => {
      const trimmedName = data.name.trim();
      if (!trimmedName) {
        return { success: false, error: 'Le nom de la recette est obligatoire.' };
      }

      if (!data.ingredients || data.ingredients.length === 0) {
        return { success: false, error: 'Ajoutez au moins un ingrédient.' };
      }

      // Valider et normaliser chaque ingrédient
      const normalizedIngredients: RecipeIngredient[] = [];
      for (const ing of data.ingredients) {
        const trimmedLabel = ing.label.trim();
        if (!trimmedLabel) continue;
        const id = normalizeIngredient(trimmedLabel);
        normalizedIngredients.push({
          id,
          label: trimmedLabel.charAt(0).toUpperCase() + trimmedLabel.slice(1),
          quantity: ing.quantity.trim() || 'Au goût',
        });
      }

      if (normalizedIngredients.length === 0) {
        return { success: false, error: 'Chaque ingrédient doit avoir un nom valide.' };
      }

      // Valider les étapes
      const cleanedSteps = data.steps
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (cleanedSteps.length === 0) {
        return { success: false, error: 'Ajoutez au moins une étape de préparation.' };
      }

      const newRecipe: Recipe = {
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        prepTime: data.prepTime.trim() || '30 min',
        servings: Number(data.servings) > 0 ? Number(data.servings) : 4,
        category: data.category.trim() || 'Maison',
        ingredients: normalizedIngredients,
        steps: cleanedSteps,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [newRecipe, ...customRecipes];
      setCustomRecipes(updated);
      await saveCustomRecipes(updated);
      return { success: true, recipe: newRecipe };
    },
    [customRecipes]
  );

  const deleteCustomRecipe = useCallback(
    async (id: string): Promise<void> => {
      const updated = customRecipes.filter((r) => r.id !== id);
      setCustomRecipes(updated);
      await saveCustomRecipes(updated);
    },
    [customRecipes]
  );

  return {
    customRecipes,
    isLoading,
    addCustomRecipe,
    deleteCustomRecipe,
    refreshCustomRecipes,
  };
}
