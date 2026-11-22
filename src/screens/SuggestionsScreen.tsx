import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';
import { RecipeCard } from '../components/RecipeCard';
import { EmptyState } from '../components/EmptyState';
import { UserIngredient, RecipeMatch } from '../types';
import { Recipe } from '../types';
import { getSuggestions } from '../utils/matching';

interface SuggestionsScreenProps {
  ingredients: UserIngredient[];
  recipes: Recipe[];
  onRecipePress: (recipeId: string, match?: RecipeMatch) => void;
  onGoToIngredients: () => void;
  onGoToCatalogue: () => void;
}

export function SuggestionsScreen({
  ingredients,
  recipes,
  onRecipePress,
  onGoToIngredients,
  onGoToCatalogue,
}: SuggestionsScreenProps) {
  const suggestions = useMemo(
    () => getSuggestions(recipes, ingredients),
    [recipes, ingredients]
  );

  if (ingredients.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Suggestions</Text>
        </View>
        <EmptyState
          icon="nutrition-outline"
          title="Aucun ingrédient"
          subtitle="Ajoutez les ingrédients que vous avez chez vous pour découvrir ce que vous pouvez cuisiner."
          actionLabel="Ajouter des ingrédients"
          onAction={onGoToIngredients}
        />
      </SafeAreaView>
    );
  }

  if (suggestions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <Text style={styles.title}>Suggestions</Text>
        </View>
        <EmptyState
          icon="sad-outline"
          title="Aucune correspondance"
          subtitle={`Avec vos ${ingredients.length} ingrédient${ingredients.length > 1 ? 's' : ''}, aucune recette ne peut être proposée. Essayez d'en ajouter d'autres ou explorez le catalogue.`}
          actionLabel="Voir toutes les recettes"
          onAction={onGoToCatalogue}
        />
      </SafeAreaView>
    );
  }

  const complete = suggestions.filter((m) => m.isComplete);
  const partial = suggestions.filter((m) => !m.isComplete);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.recipe.id}
        renderItem={({ item }) => (
          <RecipeCard
            match={item}
            onPress={() => onRecipePress(item.recipe.id, item)}
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.headerBar}>
              <Text style={styles.title}>Suggestions</Text>
              <Text style={styles.subtitle}>
                {ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''} · {suggestions.length} recette{suggestions.length > 1 ? 's' : ''}
              </Text>
            </View>
            {complete.length > 0 && (
              <SectionHeader
                icon="✅"
                label={`Prêtes à cuisiner (${complete.length})`}
                color={Colors.success}
              />
            )}
            {/* After complete section: show partial header if needed */}
            {complete.length > 0 && partial.length > 0 && null}
          </View>
        }
        ItemSeparatorComponent={() => null}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
  list: {
    paddingBottom: Spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
