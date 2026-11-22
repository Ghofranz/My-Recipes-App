import React, { useState } from 'react';
import {
  Alert,
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
import { BorderRadius, Colors, FontSize, FontWeight, Shadow, Spacing } from '../theme';
import { NewRecipeData } from '../store/customRecipesStore';
import { SwipeBackContainer } from '../components/SwipeBackContainer';

const PRESET_CATEGORIES = [
  'Maison',
  'Tunisien',
  'Plat principal',
  'Entrée',
  'Dessert',
  'Végétarien',
  'Rapide',
];

interface AddRecipeScreenProps {
  onSave: (data: NewRecipeData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function AddRecipeScreen({ onSave, onCancel }: AddRecipeScreenProps) {
  const [name, setName] = useState('');
  const [prepTime, setPrepTime] = useState('30 min');
  const [servings, setServings] = useState(4);
  const [category, setCategory] = useState('Maison');
  const [customCategory, setCustomCategory] = useState('');

  // Ingrédients
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  const [ingredients, setIngredients] = useState<{ label: string; quantity: string }[]>([]);

  // Étapes
  const [stepText, setStepText] = useState('');
  const [steps, setSteps] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddIngredient = () => {
    const trimmedName = ingredientName.trim();
    if (!trimmedName) {
      Alert.alert('Information', 'Veuillez saisir un nom d\'ingrédient.');
      return;
    }
    setIngredients((prev) => [
      ...prev,
      { label: trimmedName, quantity: ingredientQty.trim() || 'Au goût' },
    ]);
    setIngredientName('');
    setIngredientQty('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    const trimmed = stepText.trim();
    if (!trimmed) {
      Alert.alert('Information', 'Veuillez rédiger le texte de l\'étape.');
      return;
    }
    setSteps((prev) => [...prev, trimmed]);
    setStepText('');
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const isDirty =
    name.trim().length > 0 ||
    ingredients.length > 0 ||
    ingredientName.trim().length > 0 ||
    steps.length > 0 ||
    stepText.trim().length > 0 ||
    customCategory.trim().length > 0;

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Abandonner la recette ?',
        'Les informations saisies ne seront pas enregistrées.',
        [
          { text: 'Continuer la saisie', style: 'cancel' },
          { text: 'Abandonner', style: 'destructive', onPress: onCancel },
        ]
      );
      return false;
    }
    onCancel();
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez renseigner un nom pour votre recette.');
      return;
    }

    // Si l'utilisateur a tapé un ingrédient sans cliquer sur "Ajouter", on l'ajoute automatiquement
    let currentIngredients = [...ingredients];
    if (ingredientName.trim()) {
      currentIngredients.push({
        label: ingredientName.trim(),
        quantity: ingredientQty.trim() || 'Au goût',
      });
    }

    if (currentIngredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un ingrédient à votre recette.');
      return;
    }

    // Si l'utilisateur a tapé une étape sans cliquer sur "Ajouter", on l'ajoute automatiquement
    let currentSteps = [...steps];
    if (stepText.trim()) {
      currentSteps.push(stepText.trim());
    }

    if (currentSteps.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une étape de préparation.');
      return;
    }

    const finalCategory = customCategory.trim() || category;

    setIsSubmitting(true);
    const result = await onSave({
      name: name.trim(),
      prepTime: prepTime.trim() || '30 min',
      servings: servings > 0 ? servings : 4,
      category: finalCategory,
      ingredients: currentIngredients,
      steps: currentSteps,
    });
    setIsSubmitting(false);

    if (!result.success) {
      Alert.alert('Erreur', result.error ?? 'Impossible d\'enregistrer la recette.');
    }
  };

  return (
    <SwipeBackContainer onBack={onCancel} beforeBack={handleCancel}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Barre d'action supérieure */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBtn} onPress={handleCancel} accessibilityLabel="Annuler">
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        <Text style={styles.navTitle}>Nouvelle recette</Text>
        <TouchableOpacity
          style={[styles.saveBtnTop, isSubmitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityLabel="Enregistrer"
        >
          <Text style={styles.saveBtnTopText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Informations générales */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Informations générales</Text>

            <Text style={styles.fieldLabel}>Nom de la recette *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex. : Couscous au poisson, Tarte aux pommes…"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Temps de préparation</Text>
                <TextInput
                  style={styles.input}
                  value={prepTime}
                  onChangeText={setPrepTime}
                  placeholder="Ex. : 25 min, 1 h"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Nombre de portions</Text>
                <View style={styles.servingsControl}>
                  <TouchableOpacity
                    style={styles.servingsBtn}
                    onPress={() => setServings((s) => Math.max(1, s - 1))}
                  >
                    <Ionicons name="remove" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.servingsText}>{servings} pers.</Text>
                  <TouchableOpacity
                    style={styles.servingsBtn}
                    onPress={() => setServings((s) => s + 1)}
                  >
                    <Ionicons name="add" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Catégorie</Text>
            <View style={styles.categoryPills}>
              {PRESET_CATEGORIES.map((cat) => {
                const selected = category === cat && !customCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, selected && styles.categoryPillActive]}
                    onPress={() => {
                      setCategory(cat);
                      setCustomCategory('');
                    }}
                  >
                    <Text
                      style={[styles.categoryPillText, selected && styles.categoryPillTextActive]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={[styles.input, styles.customCategoryInput]}
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="Ou saisir une autre catégorie…"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Ingrédients */}
          <View style={styles.card}>
            <View style={styles.headingWithBadge}>
              <Text style={styles.sectionHeading}>Ingrédients</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{ingredients.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Ces ingrédients permettront à l'algorithme de vous suggérer cette recette dès que vous les avez.
            </Text>

            {/* Formulaire d'ajout d'ingrédient */}
            <View style={styles.addIngredientBox}>
              <TextInput
                style={[styles.input, styles.ingredientNameInput]}
                value={ingredientName}
                onChangeText={setIngredientName}
                placeholder="Ingrédient (ex : Tomates, Poulet, Ail)"
                placeholderTextColor={Colors.textMuted}
              />
              <View style={styles.qtyRow}>
                <TextInput
                  style={[styles.input, styles.ingredientQtyInput]}
                  value={ingredientQty}
                  onChangeText={setIngredientQty}
                  placeholder="Quantité (ex : 500 g, 2 pièces)"
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity
                  style={[styles.inlineAddBtn, !ingredientName.trim() && styles.inlineAddBtnDisabled]}
                  onPress={handleAddIngredient}
                  disabled={!ingredientName.trim()}
                >
                  <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
                  <Text style={styles.inlineAddText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Liste des ingrédients déjà ajoutés */}
            {ingredients.length > 0 && (
              <View style={styles.itemsList}>
                {ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemBullet} />
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemTitle}>{ing.label}</Text>
                      <Text style={styles.itemSubtitle}>{ing.quantity}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(idx)}
                      style={styles.removeBtn}
                      accessibilityLabel={`Supprimer ${ing.label}`}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Étapes de préparation */}
          <View style={styles.card}>
            <View style={styles.headingWithBadge}>
              <Text style={styles.sectionHeading}>Étapes de préparation</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{steps.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              Détaillez les étapes successives pour réaliser le plat.
            </Text>

            <View style={styles.addStepBox}>
              <TextInput
                style={[styles.input, styles.stepInput]}
                value={stepText}
                onChangeText={setStepText}
                placeholder="Décrivez l'étape (ex : Couper les oignons et les faire revenir dans l'huile...)"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={[styles.inlineAddBtn, !stepText.trim() && styles.inlineAddBtnDisabled, { alignSelf: 'flex-end', marginTop: Spacing.sm }]}
                onPress={handleAddStep}
                disabled={!stepText.trim()}
              >
                <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
                <Text style={styles.inlineAddText}>Ajouter cette étape</Text>
              </TouchableOpacity>
            </View>

            {/* Liste des étapes */}
            {steps.length > 0 && (
              <View style={styles.itemsList}>
                {steps.map((st, idx) => (
                  <View key={idx} style={styles.stepItemRow}>
                    <View style={styles.stepIndexCircle}>
                      <Text style={styles.stepIndexText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepContentText}>{st}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveStep(idx)}
                      style={styles.removeBtn}
                      accessibilityLabel={`Supprimer l'étape ${idx + 1}`}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Grand bouton Enregistrer */}
          <TouchableOpacity
            style={[styles.bigSaveBtn, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.textOnPrimary} />
            <Text style={styles.bigSaveBtnText}>Enregistrer ma recette</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </SwipeBackContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  navBtn: {
    padding: Spacing.xs,
  },
  navTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  saveBtnTop: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  saveBtnTopText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  sectionHeading: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: FontSize.xs * 1.5,
  },
  headingWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  halfField: {
    flex: 1,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xs,
    height: 44,
  },
  servingsBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  categoryPill: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  categoryPillTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  customCategoryInput: {
    marginTop: Spacing.xs,
  },
  addIngredientBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  ingredientNameInput: {
    marginBottom: Spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ingredientQtyInput: {
    flex: 1,
  },
  inlineAddBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  inlineAddBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  inlineAddText: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  itemsList: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addStepBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  stepItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  stepIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepIndexText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  stepContentText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: FontSize.sm * 1.5,
  },
  bigSaveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  bigSaveBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
