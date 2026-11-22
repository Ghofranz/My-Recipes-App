import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../theme';
import { RecipeMatch } from '../types';
import { getStatusLabel } from '../utils/matching';

interface RecipeCardProps {
  match: RecipeMatch;
  onPress: () => void;
}

export function RecipeCard({ match, onPress }: RecipeCardProps) {
  const { recipe, isComplete, missingCount, totalCount, availableCount } = match;
  const statusLabel = getStatusLabel(match);

  const statusColor = isComplete ? Colors.success : missingCount <= 2 ? Colors.warning : Colors.error;
  const statusBg = isComplete ? Colors.successLight : missingCount <= 2 ? Colors.warningLight : Colors.missingLight;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.name}. ${statusLabel}`}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>{recipe.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{recipe.servings} pers.</Text>
          </View>
          <View style={[styles.categoryBadge]}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          {recipe.isCustom && (
            <View style={styles.customBadge}>
              <Ionicons name="sparkles" size={11} color={Colors.primary} />
              <Text style={styles.customBadgeText}>Ma recette</Text>
            </View>
          )}
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(match.ratio * 100)}%` as `${number}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {availableCount}/{totalCount} ingrédients
        </Text>
      </View>

      {/* Badge de statut */}
      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Ionicons
          name={isComplete ? 'checkmark-circle' : 'alert-circle-outline'}
          size={15}
          color={statusColor}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      {/* Ingrédients manquants */}
      {!isComplete && match.missingIngredients.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={styles.missingLabel}>Manquants : </Text>
          <Text style={styles.missingItems} numberOfLines={2}>
            {match.missingIngredients.map((i) => i.label).join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/** Version simplifiée pour le catalogue (sans matching info) */
interface CatalogueCardProps {
  recipeName: string;
  prepTime: string;
  servings: number;
  category: string;
  ingredientCount: number;
  isCustom?: boolean;
  onPress: () => void;
}

export function CatalogueCard({
  recipeName,
  prepTime,
  servings,
  category,
  ingredientCount,
  isCustom,
  onPress,
}: CatalogueCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={recipeName}
    >
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={2}>{recipeName}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{prepTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{servings} pers.</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{ingredientCount} ing.</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        {isCustom && (
          <View style={styles.customBadge}>
            <Ionicons name="sparkles" size={11} color={Colors.primary} />
            <Text style={styles.customBadgeText}>Ma recette</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
    lineHeight: FontSize.lg * 1.4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  customBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeight.bold,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    minWidth: 70,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  missingSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  missingLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  missingItems: {
    fontSize: FontSize.xs,
    color: Colors.error,
    flex: 1,
  },
});
