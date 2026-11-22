/**
 * AppNavigator.tsx
 * Navigation principale :
 * - Bottom Tab Navigator (3 onglets)
 * - Stack imbriqué pour les écrans de détail
 * - Modal / écran de création de recette personnalisée
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

// Screens
import { IngredientsScreen } from '../screens/IngredientsScreen';
import { SuggestionsScreen } from '../screens/SuggestionsScreen';
import { CatalogueScreen } from '../screens/CatalogueScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';

// Data & stores
import { RECIPES } from '../data/recipes';
import { useIngredients } from '../store/ingredientsStore';
import { useCustomRecipes } from '../store/customRecipesStore';
import { useShoppingList } from '../store/shoppingStore';
import { RecipeMatch, Recipe } from '../types';

// ─────────── Types de navigation internes ───────────
type TabName = 'ingredients' | 'suggestions' | 'catalogue';

interface DetailState {
  recipe: Recipe;
  match?: RecipeMatch;
  fromTab: TabName;
}

// ─────────── Tab Bar ───────────
interface TabBarProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

function TabBar({ activeTab, onTabPress }: TabBarProps) {
  const tabs: {
    key: TabName;
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  }[] = [
    { key: 'ingredients', label: 'Ingrédients', icon: 'basket-outline', activeIcon: 'basket' },
    { key: 'suggestions', label: 'Suggestions', icon: 'bulb-outline', activeIcon: 'bulb' },
    { key: 'catalogue', label: 'Recettes', icon: 'book-outline', activeIcon: 'book' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TabBarButton
            key={tab.key}
            label={tab.label}
            icon={isActive ? tab.activeIcon : tab.icon}
            isActive={isActive}
            onPress={() => onTabPress(tab.key)}
          />
        );
      })}
    </View>
  );
}

interface TabBarButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isActive: boolean;
  onPress: () => void;
}

function TabBarButton({ label, icon, isActive, onPress }: TabBarButtonProps) {
  return (
    <TouchableOpacity
      style={tabStyles.button}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={isActive ? Colors.tabActive : Colors.tabInactive}
      />
      <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.tabBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.sm,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.tabInactive,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.tabActive,
    fontWeight: FontWeight.semibold,
  },
});

// ─────────── Navigateur principal ───────────
export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<TabName>('ingredients');
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);

  // Store ingrédients utilisateur
  const { ingredients, isLoading: ingredientsLoading, addIngredient, removeIngredient, clearIngredients } =
    useIngredients();

  // Store recettes personnalisées
  const { customRecipes, addCustomRecipe, deleteCustomRecipe } = useCustomRecipes();

  // Store liste de courses
  const {
    shoppingList,
    addToShoppingList,
    addAllToShoppingList,
    removeFromShoppingList,
    checkItemAsBought,
    isIngredientInShoppingList,
  } = useShoppingList();

  // Fusion des recettes personnalisées et des recettes pré-enregistrées
  const allRecipes = useMemo(
    () => [...customRecipes, ...RECIPES],
    [customRecipes]
  );

  // Ouvrir une recette depuis n'importe quel onglet
  const openRecipe = useCallback(
    (recipeId: string, match?: RecipeMatch, tab?: TabName) => {
      const recipe = allRecipes.find((r) => r.id === recipeId);
      if (!recipe) return;
      setDetailState({ recipe, match, fromTab: tab ?? activeTab });
    },
    [allRecipes, activeTab]
  );

  const closeDetail = useCallback(() => {
    setDetailState(null);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={navStyles.container}>
        {/* Contenu des onglets principaux (préservés en mémoire) */}
        <View style={navStyles.screen}>
          <View
            style={[
              navStyles.tabPane,
              activeTab === 'ingredients' ? navStyles.tabVisible : navStyles.tabHidden,
            ]}
          >
            <IngredientsScreen
              ingredients={ingredients}
              isLoading={ingredientsLoading}
              onAdd={addIngredient}
              onRemove={removeIngredient}
              onClear={clearIngredients}
              shoppingList={shoppingList}
              onCheckShoppingItem={(item) => checkItemAsBought(item, addIngredient)}
              onRemoveShoppingItem={removeFromShoppingList}
            />
          </View>

          <View
            style={[
              navStyles.tabPane,
              activeTab === 'suggestions' ? navStyles.tabVisible : navStyles.tabHidden,
            ]}
          >
            <SuggestionsScreen
              ingredients={ingredients}
              recipes={allRecipes}
              onRecipePress={(id, match) => openRecipe(id, match, 'suggestions')}
              onGoToIngredients={() => setActiveTab('ingredients')}
              onGoToCatalogue={() => setActiveTab('catalogue')}
            />
          </View>

          <View
            style={[
              navStyles.tabPane,
              activeTab === 'catalogue' ? navStyles.tabVisible : navStyles.tabHidden,
            ]}
          >
            <CatalogueScreen
              recipes={allRecipes}
              onRecipePress={(id) => openRecipe(id, undefined, 'catalogue')}
              onAddRecipePress={() => setIsAddingRecipe(true)}
            />
          </View>
        </View>

        {/* Tab bar */}
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

        {/* Écran de détail par-dessus avec geste de retour iOS */}
        {detailState && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <RecipeDetailScreen
              recipe={detailState.recipe}
              userIngredients={ingredients}
              match={detailState.match}
              onBack={closeDetail}
              onDelete={async (id) => {
                await deleteCustomRecipe(id);
                closeDetail();
              }}
              isIngredientInShoppingList={isIngredientInShoppingList}
              onAddToShoppingList={addToShoppingList}
              onAddAllToShoppingList={addAllToShoppingList}
            />
          </View>
        )}

        {/* Écran d'ajout de recette avec geste de retour et confirmation d'abandon */}
        {isAddingRecipe && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <AddRecipeScreen
              onSave={async (data) => {
                const result = await addCustomRecipe(data);
                if (result.success && result.recipe) {
                  setIsAddingRecipe(false);
                  openRecipe(result.recipe.id);
                }
                return result;
              }}
              onCancel={() => setIsAddingRecipe(false)}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const navStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  tabVisible: {
    display: 'flex',
  },
  tabHidden: {
    display: 'none',
  },
});
