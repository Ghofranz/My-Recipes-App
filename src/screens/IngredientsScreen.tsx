import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '../theme';
import { IngredientTag } from '../components/IngredientTag';
import { EmptyState } from '../components/EmptyState';
import { ShoppingItem, UserIngredient } from '../types';

interface IngredientsScreenProps {
  ingredients: UserIngredient[];
  isLoading: boolean;
  onAdd: (name: string) => Promise<{ success: boolean; error?: string }>;
  onRemove: (id: string) => Promise<void>;
  onClear: () => Promise<void>;
  shoppingList?: ShoppingItem[];
  onCheckShoppingItem?: (item: ShoppingItem) => Promise<void>;
  onRemoveShoppingItem?: (itemId: string) => Promise<void>;
}

export function IngredientsScreen({
  ingredients,
  isLoading,
  onAdd,
  onRemove,
  onClear,
  shoppingList = [],
  onCheckShoppingItem,
  onRemoveShoppingItem,
}: IngredientsScreenProps) {
  const [text, setText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [isShoppingCollapsed, setIsShoppingCollapsed] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const handleAdd = async () => {
    setInputError(null);
    const result = await onAdd(text);
    if (result.success) {
      setText('');
      inputRef.current?.focus();
    } else {
      setInputError(result.error ?? 'Erreur inconnue.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Vider la liste',
      'Supprimer tous les ingrédients ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: onClear },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mes ingrédients</Text>
            <Text style={styles.subtitle}>
              {ingredients.length === 0
                ? 'Ajoutez vos ingrédients disponibles'
                : `${ingredients.length} ingrédient${ingredients.length > 1 ? 's' : ''} enregistré${ingredients.length > 1 ? 's' : ''}`}
            </Text>
          </View>
          {ingredients.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear} accessibilityLabel="Vider la liste">
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Champ de saisie */}
        <View style={styles.inputSection}>
          <View style={[styles.inputRow, inputError ? styles.inputRowError : null]}>
            <Ionicons name="leaf-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={(t) => { setText(t); setInputError(null); }}
              placeholder="Ex. : tomates, ail, œufs…"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Nom de l'ingrédient"
            />
            {text.length > 0 && (
              <TouchableOpacity onPress={() => { setText(''); setInputError(null); }} style={styles.clearInput}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {inputError && <Text style={styles.errorText}>{inputError}</Text>}
          <TouchableOpacity
            style={[styles.addBtn, !text.trim() && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!text.trim()}
            accessibilityRole="button"
            accessibilityLabel="Ajouter l'ingrédient"
          >
            <Ionicons name="add" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Section Liste de courses (repliable) */}
        <View style={styles.shoppingSection}>
          <TouchableOpacity
            style={styles.shoppingHeader}
            onPress={() => setIsShoppingCollapsed((prev) => !prev)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Liste de courses, ${shoppingList.length} articles`}
          >
            <View style={styles.shoppingHeaderLeft}>
              <Ionicons name="cart-outline" size={20} color={Colors.primary} />
              <Text style={styles.shoppingHeaderTitle}>Liste de courses</Text>
              <View
                style={[
                  styles.shoppingBadge,
                  shoppingList.length === 0 ? styles.shoppingBadgeEmpty : styles.shoppingBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.shoppingBadgeText,
                    shoppingList.length === 0 && styles.shoppingBadgeTextEmpty,
                  ]}
                >
                  {shoppingList.length}
                </Text>
              </View>
            </View>

            <Ionicons
              name={isShoppingCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {!isShoppingCollapsed && (
            <View style={styles.shoppingBody}>
              {shoppingList.length === 0 ? (
                <View style={styles.shoppingEmptyBox}>
                  <Text style={styles.shoppingEmptyText}>
                    Aucun ingrédient à acheter pour le moment.
                  </Text>
                  <Text style={styles.shoppingEmptySubtext}>
                    Ouvrez une recette pour ajouter ses ingrédients manquants en un clic.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.shoppingScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {shoppingList.map((item, idx) => (
                    <View
                      key={item.id}
                      style={[
                        styles.shoppingItemRow,
                        idx > 0 && styles.shoppingItemBorder,
                      ]}
                    >
                      {/* Case à cocher : acheté */}
                      <TouchableOpacity
                        style={styles.checkboxBtn}
                        onPress={() => onCheckShoppingItem?.(item)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Cocher ${item.label} comme acheté`}
                      >
                        <Ionicons name="square-outline" size={22} color={Colors.primary} />
                      </TouchableOpacity>

                      {/* Libellé et sources par recette */}
                      <View style={styles.shoppingItemInfo}>
                        <Text style={styles.shoppingItemLabel}>{item.label}</Text>
                        <View style={styles.sourcesContainer}>
                          {item.sources.map((src, sIdx) => (
                            <Text key={`${src.recipeId}-${sIdx}`} style={styles.sourceText}>
                              · {src.recipeName} · {src.quantity}
                            </Text>
                          ))}
                        </View>
                      </View>

                      {/* Action retirer des courses */}
                      <TouchableOpacity
                        style={styles.removeShoppingBtn}
                        onPress={() => onRemoveShoppingItem?.(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Retirer ${item.label} de la liste de courses`}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        {/* Liste des ingrédients enregistrés */}
        {isLoading ? (
          <View style={styles.flex} />
        ) : ingredients.length === 0 ? (
          <EmptyState
            icon="basket-outline"
            title="Votre liste est vide"
            subtitle="Ajoutez les ingrédients que vous avez chez vous pour découvrir les recettes que vous pouvez préparer."
          />
        ) : (
          <View style={styles.tagsWrapper}>
            <FlatList
              data={ingredients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <IngredientTag ingredient={item} onRemove={onRemove} />
              )}
              numColumns={3}
              columnWrapperStyle={styles.tagRow}
              contentContainerStyle={styles.tagList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
  clearBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorLight,
  },
  inputSection: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    ...Shadow.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    height: 48,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    height: '100%',
  },
  clearInput: {
    padding: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 46,
  },
  addBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  addBtnText: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  shoppingSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  shoppingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
  },
  shoppingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  shoppingHeaderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  shoppingBadge: {
    paddingHorizontal: Spacing.xs + 3,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  shoppingBadgeActive: {
    backgroundColor: Colors.accentLight,
  },
  shoppingBadgeEmpty: {
    backgroundColor: Colors.surfaceAlt,
  },
  shoppingBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  shoppingBadgeTextEmpty: {
    color: Colors.textMuted,
  },
  shoppingBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.background,
  },
  shoppingEmptyBox: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  shoppingEmptyText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  shoppingEmptySubtext: {
    fontSize: FontSize.xs - 1,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  shoppingScroll: {
    maxHeight: 180,
  },
  shoppingItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  shoppingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  checkboxBtn: {
    paddingRight: Spacing.sm,
    paddingTop: 1,
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sourcesContainer: {
    marginTop: 2,
    gap: 1,
  },
  sourceText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: FontSize.xs * 1.4,
  },
  removeShoppingBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  tagsWrapper: {
    flex: 1,
  },
  tagRow: {
    flexWrap: 'wrap',
  },
  tagList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});
