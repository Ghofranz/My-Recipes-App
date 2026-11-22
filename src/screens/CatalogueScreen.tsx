import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../theme';
import { CatalogueCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { Recipe } from '../types';
import { normalizeIngredient } from '../utils/normalize';

interface CatalogueScreenProps {
  recipes: Recipe[];
  onRecipePress: (recipeId: string) => void;
  onAddRecipePress: () => void;
}

export function CatalogueScreen({
  recipes,
  onRecipePress,
  onAddRecipePress,
}: CatalogueScreenProps) {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'custom'>('all');

  const customCount = recipes.filter((r) => r.isCustom).length;

  const normalizedSearch = normalizeIngredient(search);

  // Filtrage selon onglet (Toutes vs Mes recettes)
  const tabFiltered = filterTab === 'custom'
    ? recipes.filter((r) => r.isCustom)
    : recipes;

  // Filtrage selon recherche texte
  const finalFiltered = normalizedSearch
    ? tabFiltered.filter((r) =>
        normalizeIngredient(r.name).includes(normalizedSearch) ||
        normalizeIngredient(r.category).includes(normalizedSearch)
      )
    : tabFiltered;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={finalFiltered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CatalogueCard
            recipeName={item.name}
            prepTime={item.prepTime}
            servings={item.servings}
            category={item.category}
            ingredientCount={item.ingredients.length}
            isCustom={item.isCustom}
            onPress={() => onRecipePress(item.id)}
          />
        )}
        ListHeaderComponent={
          <View>
            {/* Barre d'en-tête avec bouton d'ajout */}
            <View style={styles.headerBar}>
              <View style={styles.headerTitles}>
                <Text style={styles.title}>Recettes</Text>
                <Text style={styles.subtitle}>
                  {recipes.length} recette{recipes.length > 1 ? 's' : ''} disponibles
                  {customCount > 0 ? ` (dont ${customCount} perso)` : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addRecipeBtn}
                onPress={onAddRecipePress}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ajouter une recette"
              >
                <Ionicons name="add" size={18} color={Colors.textOnPrimary} />
                <Text style={styles.addRecipeBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {/* Onglets de filtrage */}
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[styles.filterTab, filterTab === 'all' && styles.filterTabActive]}
                onPress={() => setFilterTab('all')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterTab === 'all' && styles.filterTabTextActive,
                  ]}
                >
                  Toutes ({recipes.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, filterTab === 'custom' && styles.filterTabActive]}
                onPress={() => setFilterTab('custom')}
              >
                <View style={styles.customTabLabelRow}>
                  <Ionicons
                    name="sparkles"
                    size={13}
                    color={filterTab === 'custom' ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.filterTabText,
                      filterTab === 'custom' && styles.filterTabTextActive,
                    ]}
                  >
                    Mes recettes ({customCount})
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchRow}>
              <Ionicons
                name="search"
                size={18}
                color={Colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher une recette ou catégorie…"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="while-editing"
                accessibilityLabel="Rechercher une recette"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          filterTab === 'custom' && customCount === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title="Aucune recette personnalisée"
              subtitle="Vous pouvez ajouter vos propres plats, secrets de famille et créations culinaires."
              actionLabel="+ Ajouter ma première recette"
              onAction={onAddRecipePress}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Aucune recette trouvée"
              subtitle={`Aucune recette ne correspond à « ${search} ».`}
              actionLabel="Effacer la recherche"
              onAction={() => setSearch('')}
            />
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  addRecipeBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary,
  },
  customTabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterTabText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  filterTabTextActive: {
    color: Colors.primaryDark,
    fontWeight: FontWeight.bold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    height: '100%',
  },
  clearSearchBtn: {
    padding: Spacing.xs,
  },
  list: {
    paddingBottom: Spacing.xxxl,
  },
});
