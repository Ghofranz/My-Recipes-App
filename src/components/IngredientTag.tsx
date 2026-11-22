import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../theme';
import { UserIngredient } from '../types';

interface IngredientTagProps {
  ingredient: UserIngredient;
  onRemove: (id: string) => void;
}

export function IngredientTag({ ingredient, onRemove }: IngredientTagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label} numberOfLines={1}>
        {ingredient.label}
      </Text>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(ingredient.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Supprimer ${ingredient.label}`}
        accessibilityRole="button"
      >
        <Ionicons name="close" size={14} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    margin: Spacing.xs / 2,
    maxWidth: 180,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primaryDark,
    flexShrink: 1,
    marginRight: Spacing.xs,
  },
  removeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
