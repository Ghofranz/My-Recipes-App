/**
 * shoppingStore.ts
 * Persistance et gestion de la liste de courses via AsyncStorage.
 * Expose un hook React useShoppingList() pour manipuler les articles à acheter.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { RecipeIngredient, ShoppingItem, ShoppingRecipeSource } from '../types';
import { ingredientsMatch, normalizeIngredient } from '../utils/normalize';

const STORAGE_KEY = '@quoi_manger:shopping_list';

interface ShoppingStore {
  shoppingList: ShoppingItem[];
  isLoading: boolean;
  addToShoppingList: (
    ingredient: RecipeIngredient | { id: string; label: string; quantity: string },
    recipeId: string,
    recipeName: string
  ) => Promise<void>;
  addAllToShoppingList: (
    ingredients: (RecipeIngredient | { id: string; label: string; quantity: string })[],
    recipeId: string,
    recipeName: string
  ) => Promise<void>;
  removeFromShoppingList: (itemId: string) => Promise<void>;
  checkItemAsBought: (
    item: ShoppingItem,
    onAddIngredient: (name: string) => Promise<{ success: boolean; error?: string }>
  ) => Promise<void>;
  isIngredientInShoppingList: (ingredientId: string) => boolean;
  clearShoppingList: () => Promise<void>;
}

/** Charge la liste persistée depuis AsyncStorage */
export async function loadShoppingList(): Promise<ShoppingItem[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as ShoppingItem[];
    return [];
  } catch {
    return [];
  }
}

/** Sauvegarde la liste dans AsyncStorage */
export async function saveShoppingList(list: ShoppingItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Silently ignore storage errors
  }
}

/**
 * Fonction pure pour ajouter ou fusionner un ingrédient dans une liste de courses
 */
export function mergeIngredientIntoList(
  currentList: ShoppingItem[],
  ingredient: { id: string; label: string; quantity: string },
  recipeId: string,
  recipeName: string
): ShoppingItem[] {
  const normId = normalizeIngredient(ingredient.id);
  const existingIndex = currentList.findIndex(
    (item) => ingredientsMatch(item.id, normId) || ingredientsMatch(item.label, ingredient.label)
  );

  const cleanQuantity = ingredient.quantity.trim() || 'Au goût';
  const newSource: ShoppingRecipeSource = {
    recipeId,
    recipeName,
    quantity: cleanQuantity,
  };

  if (existingIndex >= 0) {
    const existingItem = currentList[existingIndex];
    const sourceIndex = existingItem.sources.findIndex((s) => s.recipeId === recipeId);

    let updatedSources: ShoppingRecipeSource[];
    if (sourceIndex >= 0) {
      // Met à jour la quantité si déjà présent pour cette recette
      updatedSources = existingItem.sources.map((s, idx) =>
        idx === sourceIndex ? { ...s, recipeName, quantity: cleanQuantity } : s
      );
    } else {
      // Ajoute la nouvelle recette source
      updatedSources = [...existingItem.sources, newSource];
    }

    const updatedItem: ShoppingItem = {
      ...existingItem,
      sources: updatedSources,
    };

    const nextList = [...currentList];
    nextList[existingIndex] = updatedItem;
    return nextList;
  }

  // Création d'un nouvel article dans la liste
  const newItem: ShoppingItem = {
    id: normId,
    label: ingredient.label.charAt(0).toUpperCase() + ingredient.label.slice(1),
    sources: [newSource],
    addedAt: new Date().toISOString(),
  };

  return [...currentList, newItem];
}

export function useShoppingList(): ShoppingStore {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial
  useEffect(() => {
    loadShoppingList().then((list) => {
      setShoppingList(list);
      setIsLoading(false);
    });
  }, []);

  const addToShoppingList = useCallback(
    async (
      ingredient: RecipeIngredient | { id: string; label: string; quantity: string },
      recipeId: string,
      recipeName: string
    ): Promise<void> => {
      setShoppingList((prev) => {
        const next = mergeIngredientIntoList(prev, ingredient, recipeId, recipeName);
        saveShoppingList(next);
        return next;
      });
    },
    []
  );

  const addAllToShoppingList = useCallback(
    async (
      ingredients: (RecipeIngredient | { id: string; label: string; quantity: string })[],
      recipeId: string,
      recipeName: string
    ): Promise<void> => {
      setShoppingList((prev) => {
        let current = prev;
        for (const ing of ingredients) {
          current = mergeIngredientIntoList(current, ing, recipeId, recipeName);
        }
        saveShoppingList(current);
        return current;
      });
    },
    []
  );

  const removeFromShoppingList = useCallback(async (itemId: string): Promise<void> => {
    setShoppingList((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveShoppingList(next);
      return next;
    });
  }, []);

  const checkItemAsBought = useCallback(
    async (
      item: ShoppingItem,
      onAddIngredient: (name: string) => Promise<{ success: boolean; error?: string }>
    ): Promise<void> => {
      // 1. Ajouter l'article à « Mes ingrédients »
      await onAddIngredient(item.label);

      // 2. Retirer l'article de la liste de courses
      setShoppingList((prev) => {
        const next = prev.filter((i) => i.id !== item.id);
        saveShoppingList(next);
        return next;
      });
    },
    []
  );

  const isIngredientInShoppingList = useCallback(
    (ingredientId: string): boolean => {
      const norm = normalizeIngredient(ingredientId);
      return shoppingList.some(
        (item) => ingredientsMatch(item.id, norm) || ingredientsMatch(item.label, ingredientId)
      );
    },
    [shoppingList]
  );

  const clearShoppingList = useCallback(async (): Promise<void> => {
    setShoppingList([]);
    await saveShoppingList([]);
  }, []);

  return {
    shoppingList,
    isLoading,
    addToShoppingList,
    addAllToShoppingList,
    removeFromShoppingList,
    checkItemAsBought,
    isIngredientInShoppingList,
    clearShoppingList,
  };
}
