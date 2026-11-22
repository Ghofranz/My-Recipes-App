import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../theme';
import { Recipe, RecipeIngredient, RecipeMatch, UserIngredient } from '../types';
import { isIngredientAvailable } from '../utils/matching';
import { SwipeBackContainer } from '../components/SwipeBackContainer';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  userIngredients: UserIngredient[];
  match?: RecipeMatch;
  onBack: () => void;
  onDelete?: (id: string) => void;
  isIngredientInShoppingList?: (id: string) => boolean;
  onAddToShoppingList?: (ingredient: RecipeIngredient, recipeId: string, recipeName: string) => void;
  onAddAllToShoppingList?: (ingredients: RecipeIngredient[], recipeId: string, recipeName: string) => void;
}

export function RecipeDetailScreen({
  recipe,
  userIngredients,
  match,
  onBack,
  onDelete,
  isIngredientInShoppingList,
  onAddToShoppingList,
  onAddAllToShoppingList,
}: RecipeDetailScreenProps) {
  const missingIngredients = useMemo(() => {
    return recipe.ingredients.filter(
      (ing) => !isIngredientAvailable(ing.id, userIngredients)
    );
  }, [recipe.ingredients, userIngredients]);

  const hasIngredientsRegistered = userIngredients.length > 0;
  const isComplete = recipe.ingredients.length > 0 && missingIngredients.length === 0;

  // Calcul pour savoir s'il reste au moins un ingrédient manquant à ajouter aux courses
  const hasUnaddedMissing = useMemo(() => {
    if (!isIngredientInShoppingList) return true;
    return missingIngredients.some((ing) => !isIngredientInShoppingList(ing.id));
  }, [missingIngredients, isIngredientInShoppingList]);
  const handleDelete = () => {
    Alert.alert(
      'Supprimer la recette',
      `Êtes-vous sûr de vouloir supprimer définitivement « ${recipe.name} » ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onDelete?.(recipe.id);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SwipeBackContainer onBack={onBack}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Barre de navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>
        {recipe.isCustom && onDelete && (
          <TouchableOpacity
            style={styles.deleteHeaderBtn}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Supprimer la recette"
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête de la recette */}
        <View style={styles.recipeHeader}>
          <View style={styles.topBadgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{recipe.category}</Text>
            </View>
            {recipe.isCustom && (
              <View style={styles.customHeaderBadge}>
                <Ionicons name="sparkles" size={12} color={Colors.primary} />
                <Text style={styles.customHeaderBadgeText}>Ma recette</Text>
              </View>
            )}
          </View>
          <Text style={styles.recipeName}>{recipe.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaChipText}>{recipe.prepTime}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaChipText}>{recipe.servings} personnes</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="list-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaChipText}>{recipe.ingredients.length} ingrédients</Text>
            </View>
          </View>

          {/* Badge de statut global */}
          {hasIngredientsRegistered && (
            <View style={[styles.statusBox, isComplete ? styles.statusBoxOk : styles.statusBoxWarn]}>
              <Ionicons
                name={isComplete ? 'checkmark-circle' : 'alert-circle-outline'}
                size={18}
                color={isComplete ? Colors.success : Colors.warning}
              />
              <Text style={[styles.statusBoxText, { color: isComplete ? Colors.success : Colors.warning }]}>
                {isComplete
                  ? 'Vous avez tous les ingrédients !'
                  : `Il manque ${missingIngredients.length} ingrédient${missingIngredients.length > 1 ? 's' : ''}`}
              </Text>
            </View>
          )}
        </View>

        {/* Section ingrédients */}
        <SectionTitle icon="nutrition-outline" title="Ingrédients" />
        <View style={styles.card}>
          {recipe.ingredients.map((ing, index) => {
            const available = isIngredientAvailable(ing.id, userIngredients);
            return (
              <View
                key={`${ing.id}-${index}`}
                style={[
                  styles.ingredientRow,
                  index < recipe.ingredients.length - 1 && styles.ingredientRowBorder,
                ]}
              >
                <View style={styles.ingredientLeft}>
                  <View
                    style={[
                      styles.ingredientDot,
                      { backgroundColor: available ? Colors.available : Colors.border },
                    ]}
                  />
                  <Text
                    style={[
                      styles.ingredientLabel,
                      !available && userIngredients.length > 0 && styles.ingredientMissing,
                    ]}
                  >
                    {ing.label}
                  </Text>
                </View>
                <View style={styles.ingredientRight}>
                  <Text style={styles.ingredientQuantity}>{ing.quantity}</Text>
                  {userIngredients.length > 0 && (
                    <Ionicons
                      name={available ? 'checkmark-circle' : 'close-circle-outline'}
                      size={18}
                      color={available ? Colors.available : Colors.missing}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Section ingrédients manquants / À acheter */}
        {missingIngredients.length > 0 && (
          <View style={styles.missingBox}>
            <View style={styles.missingHeaderRow}>
              <View style={styles.missingTitleRow}>
                <Ionicons name="cart-outline" size={19} color={Colors.missing} />
                <Text style={styles.missingTitle}>
                  À acheter ({missingIngredients.length})
                </Text>
              </View>

              {missingIngredients.length > 1 && onAddAllToShoppingList && hasUnaddedMissing && (
                <TouchableOpacity
                  style={styles.addAllBtn}
                  onPress={() => onAddAllToShoppingList(missingIngredients, recipe.id, recipe.name)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Tout ajouter aux courses"
                >
                  <Ionicons name="cart" size={14} color={Colors.textOnPrimary} />
                  <Text style={styles.addAllBtnText}>Tout ajouter aux courses</Text>
                </TouchableOpacity>
              )}
            </View>

            {missingIngredients.map((ing, i) => {
              const inList = isIngredientInShoppingList ? isIngredientInShoppingList(ing.id) : false;
              return (
                <View
                  key={`${ing.id}-${i}`}
                  style={[
                    styles.missingItemRow,
                    i > 0 && styles.missingItemBorder,
                  ]}
                >
                  <View style={styles.missingItemTextContainer}>
                    <Text style={styles.missingItemName}>{ing.label}</Text>
                    <Text style={styles.missingItemQty}> — {ing.quantity}</Text>
                  </View>

                  {inList ? (
                    <View style={styles.inListBadge}>
                      <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
                      <Text style={styles.inListText}>Dans la liste</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addSingleBtn}
                      onPress={() => onAddToShoppingList?.(ing, recipe.id, recipe.name)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Ajouter ${ing.label} aux courses`}
                    >
                      <Ionicons name="add" size={15} color={Colors.primary} />
                      <Text style={styles.addSingleBtnText}>Ajouter aux courses</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Section étapes */}
        <SectionTitle icon="clipboard-outline" title="Préparation" />
        <View style={styles.card}>
          {recipe.steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepRow,
                index < recipe.steps.length - 1 && styles.stepRowBorder,
              ]}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {recipe.isCustom && onDelete && (
          <TouchableOpacity
            style={styles.deleteBottomBtn}
            onPress={handleDelete}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Supprimer définitivement cette recette"
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteBottomBtnText}>Supprimer cette recette</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  </SwipeBackContainer>
  );
}

function SectionTitle({ icon, title }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  deleteHeaderBtn: {
    padding: Spacing.xs,
  },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing.xxxl },
  recipeHeader: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  customHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  customHeaderBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeight.bold,
  },
  recipeName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    lineHeight: FontSize.xxxl * 1.3,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
  },
  metaChipText: {
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
    fontWeight: FontWeight.medium,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  statusBoxOk: { backgroundColor: Colors.successLight },
  statusBoxWarn: { backgroundColor: Colors.warningLight },
  statusBoxText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  sectionTitleText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  card: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ingredientRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ingredientLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  ingredientMissing: {
    color: Colors.textSecondary,
  },
  ingredientRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ingredientQuantity: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  missingBox: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.missingLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.missing,
  },
  missingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  missingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  missingTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.missing,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.missing,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  addAllBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  missingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  missingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  missingItemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginRight: Spacing.sm,
  },
  missingItemName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  missingItemQty: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  inListBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  inListText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  addSingleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  addSingleBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  stepRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: FontSize.md * 1.6,
  },
  deleteBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  deleteBottomBtnText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  bottomPad: { height: Spacing.xxxl },
});
