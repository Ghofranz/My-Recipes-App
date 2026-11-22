/**
 * verify-matching.ts
 * Script de vérification de la logique de correspondance.
 * Exécuter avec : npx ts-node --project tsconfig.json src/scripts/verify-matching.ts
 *
 * Couvre : correspondance exacte, partielle, entrée vide, casse, accents.
 */

// Polyfill for Node.js environment (no React Native)
// We only import pure TS files here

import { normalizeIngredient, ingredientsMatch } from '../utils/normalize';
import { getSuggestions, analyzeRecipe, getStatusLabel } from '../utils/matching';
import { RECIPES } from '../data/recipes';
import { UserIngredient } from '../types';

// ─── Helper ───────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ÉCHEC : ${description}`);
    failed++;
  }
}

// ─── Tests de normalisation ────────────────────────────
console.log('\n📐 Normalisation des ingrédients');
assert('Minuscules', normalizeIngredient('TOMATES') === 'tomates');
assert('Accents retirés', normalizeIngredient('Œufs') === 'oeufs');
assert('Espaces taillés', normalizeIngredient('  ail  ') === 'ail');
assert('Accent complexe', normalizeIngredient('Courgètte') === 'courgette');
assert('Correspondance casse+accent', ingredientsMatch('Tomate', 'tomate'));
assert('Correspondance accent', ingredientsMatch('Œufs', 'oeufs'));
assert('Non-correspondance', !ingredientsMatch('tomate', 'pomme de terre'));

// ─── Entrée vide ──────────────────────────────────────
console.log('\n📭 Entrée vide');
const emptyResult = getSuggestions(RECIPES, []);
assert('Aucune suggestion pour liste vide', emptyResult.length === 0);

// ─── Correspondance exacte ────────────────────────────
console.log('\n✅ Correspondance exacte — Brik à l\'œuf');
const brikIngredients: UserIngredient[] = [
  { id: 'feuille de brik', label: 'Feuille de brik' },
  { id: 'oeuf', label: 'Œufs' },
  { id: 'thon en boite', label: 'Thon en boîte' },
  { id: 'persil', label: 'Persil' },
  { id: 'oignon', label: 'Oignon' },
  { id: 'câpre', label: 'Câpres' },
  { id: 'huile de friture', label: 'Huile de friture' },
  { id: 'sel', label: 'Sel' },
  { id: 'poivre', label: 'Poivre' },
];
const brikRecipe = RECIPES.find((r) => r.id === 'brik')!;
const brikMatch = analyzeRecipe(brikRecipe, brikIngredients);
assert('Brik est complet', brikMatch.isComplete);
assert('0 ingrédient manquant', brikMatch.missingCount === 0);
assert('Statut correct', getStatusLabel(brikMatch) === 'Vous avez tout !');
assert('Brik en tête des suggestions', getSuggestions(RECIPES, brikIngredients)[0].recipe.id === 'brik');

// ─── Correspondance partielle ─────────────────────────
console.log('\n🟡 Correspondance partielle — Omelette aux légumes');
const partialIngredients: UserIngredient[] = [
  { id: 'oeuf', label: 'Œufs' },
  { id: 'tomate', label: 'Tomates' },
];
const omelette = RECIPES.find((r) => r.id === 'omelette')!;
const omelettMatch = analyzeRecipe(omelette, partialIngredients);
assert('Omelette partiellement correspondante', omelettMatch.availableCount === 2);
assert('Ingrédients manquants > 0', omelettMatch.missingCount > 0);
assert('Statut indique manquants', getStatusLabel(omelettMatch).includes('manque'));

// ─── Priorité de tri ──────────────────────────────────
console.log('\n📊 Tri des suggestions');
const mixedIngredients: UserIngredient[] = [
  { id: 'oeuf', label: 'Œufs' },
  { id: 'tomate', label: 'Tomates' },
  { id: 'oignon', label: 'Oignon' },
  { id: 'huile d\'olive', label: 'Huile d\'olive' },
  { id: 'sel', label: 'Sel' },
  { id: 'poivre', label: 'Poivre' },
  { id: 'persil', label: 'Persil' },
  { id: 'poivron rouge', label: 'Poivron rouge' },
  { id: 'poivron vert', label: 'Poivron vert' },
  { id: 'ail', label: 'Ail' },
  { id: 'cumin', label: 'Cumin' },
  { id: 'paprika', label: 'Paprika' },
];
const mixedSuggestions = getSuggestions(RECIPES, mixedIngredients);
assert('Des suggestions existent', mixedSuggestions.length > 0);
// La première doit avoir le ratio le plus élevé (ou être complète)
if (mixedSuggestions.length > 1) {
  const first = mixedSuggestions[0];
  const second = mixedSuggestions[1];
  assert(
    'Première suggestion ≥ deuxième en ratio',
    first.isComplete || first.ratio >= second.ratio
  );
}
assert('Zéro ingrédient correspond → absent des suggestions',
  mixedSuggestions.every((m) => m.availableCount > 0));

// ─── Correspondance insensible à la casse ─────────────
console.log('\n🔡 Casse et accents dans la recherche utilisateur');
const camelIngredients: UserIngredient[] = [
  { id: normalizeIngredient('TOMATE'), label: 'Tomate' },
  { id: normalizeIngredient('ŒUF'), label: 'Œuf' },
  { id: normalizeIngredient('Oignon'), label: 'Oignon' },
  { id: normalizeIngredient('Huile D\'Olive'), label: "Huile d'olive" },
  { id: normalizeIngredient('Sel'), label: 'Sel' },
  { id: normalizeIngredient('Poivre'), label: 'Poivre' },
  { id: normalizeIngredient('Persil'), label: 'Persil' },
  { id: normalizeIngredient('Poivron Rouge'), label: 'Poivron rouge' },
  { id: normalizeIngredient('Poivron Vert'), label: 'Poivron vert' },
  { id: normalizeIngredient('Ail'), label: 'Ail' },
  { id: normalizeIngredient('Cumin'), label: 'Cumin' },
  { id: normalizeIngredient('Paprika'), label: 'Paprika' },
];
const chakchSuggestions = getSuggestions(RECIPES, camelIngredients);
assert('Chakchouka trouvée malgré casse/accents', chakchSuggestions.some((m) => m.recipe.id === 'shakshuka'));

// ─── Recette personnalisée de l'utilisateur ───────────
console.log('\n🧑‍🍳 Recettes personnalisées créées par l\'utilisateur');
const customRecipe = {
  id: 'custom_123',
  name: 'Tajine spécial de ma grand-mère',
  prepTime: '40 min',
  servings: 4,
  category: 'Maison',
  isCustom: true,
  ingredients: [
    { id: normalizeIngredient('Poulet'), label: 'Poulet', quantity: '400 g' },
    { id: normalizeIngredient('Pommes de terre'), label: 'Pommes de terre', quantity: '3' },
    { id: normalizeIngredient('Curcuma'), label: 'Curcuma', quantity: '1 cuillère à café' },
  ],
  steps: ['Couper le poulet', 'Cuire les pommes de terre', 'Mijoter à feu doux'],
};

const combinedRecipes = [customRecipe, ...RECIPES];
const userHasAll = [
  { id: 'poulet', label: 'Poulet' },
  { id: 'pomme de terre', label: 'Pomme de terre' },
  { id: 'curcuma', label: 'Curcuma' },
];

const customSuggestions = getSuggestions(combinedRecipes, userHasAll);
assert('La recette personnalisée apparaît dans les suggestions', customSuggestions.some((m) => m.recipe.id === 'custom_123'));
const customMatch = customSuggestions.find((m) => m.recipe.id === 'custom_123')!;
assert('La recette personnalisée est complète (100%)', customMatch.isComplete);
assert('Elle conserve le drapeau isCustom', customMatch.recipe.isCustom === true);

// ─── Résumé ───────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Résultats : ${passed} réussis, ${failed} échec(s)`);
if (failed === 0) {
  console.log('🎉 Tous les tests ont réussi !\n');
} else {
  console.error(`⚠️  ${failed} test(s) ont échoué.\n`);
  (globalThis as any).process?.exit(1);
}
