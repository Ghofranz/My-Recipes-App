/**
 * ingredientsStore.ts
 * Persistance des ingrédients de l'utilisateur via AsyncStorage.
 * Expose un hook React useIngredients() pour gérer l'état et la persistance.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { UserIngredient } from '../types';
import { normalizeIngredient } from '../utils/normalize';

const STORAGE_KEY = '@quoi_manger:ingredients';

/** Génère un ID normalisé à partir d'un nom d'ingrédient saisi. */
function makeIngredientId(name: string): string {
  return normalizeIngredient(name);
}

interface IngredientsStore {
  ingredients: UserIngredient[];
  isLoading: boolean;
  addIngredient: (name: string) => Promise<{ success: boolean; error?: string }>;
  removeIngredient: (id: string) => Promise<void>;
  clearIngredients: () => Promise<void>;
}

/** Charge la liste persistée depuis AsyncStorage. */
async function loadIngredients(): Promise<UserIngredient[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as UserIngredient[];
    return [];
  } catch {
    return [];
  }
}

/** Sauvegarde la liste dans AsyncStorage. */
async function saveIngredients(list: UserIngredient[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Silently ignore storage errors
  }
}

/** Hook principal pour gérer les ingrédients de l'utilisateur. */
export function useIngredients(): IngredientsStore {
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    loadIngredients().then((list) => {
      setIngredients(list);
      setIsLoading(false);
    });
  }, []);

  const addIngredient = useCallback(
    async (name: string): Promise<{ success: boolean; error?: string }> => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { success: false, error: 'Le nom ne peut pas être vide.' };
      }

      const id = makeIngredientId(trimmed);

      // Vérification des doublons
      if (ingredients.some((ing) => ing.id === id)) {
        return { success: false, error: 'Cet ingrédient est déjà dans votre liste.' };
      }

      // Label : première lettre en majuscule
      const label = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      const newIngredient: UserIngredient = { id, label };

      const updated = [...ingredients, newIngredient];
      setIngredients(updated);
      await saveIngredients(updated);
      return { success: true };
    },
    [ingredients]
  );

  const removeIngredient = useCallback(
    async (id: string): Promise<void> => {
      const updated = ingredients.filter((ing) => ing.id !== id);
      setIngredients(updated);
      await saveIngredients(updated);
    },
    [ingredients]
  );

  const clearIngredients = useCallback(async (): Promise<void> => {
    setIngredients([]);
    await saveIngredients([]);
  }, []);

  return { ingredients, isLoading, addIngredient, removeIngredient, clearIngredients };
}
