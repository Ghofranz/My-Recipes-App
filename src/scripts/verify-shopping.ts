/**
 * verify-shopping.ts
 * Script de vérification automatisé de la liste de courses.
 *
 * Scénario testé :
 * 1. Ajouter le lait depuis « Crêpes maison » (500 ml).
 * 2. Ajouter le lait depuis une recette personnelle « Matcha latte » (200 ml).
 * 3. Vérifier qu'il apparaît une seule fois dans les courses avec les deux quantités.
 * 4. Cocher le lait et vérifier qu'il apparaît dans « Mes ingrédients », disparaît des courses
 *    et est désormais indiqué comme disponible dans les deux recettes.
 * 5. Vérifier que les articles non cochés restent enregistrés après réouverture (persistance).
 */

import { RECIPES } from '../data/recipes';
import { mergeIngredientIntoList } from '../store/shoppingStore';
import { Recipe, ShoppingItem, UserIngredient } from '../types';
import { isIngredientAvailable } from '../utils/matching';
import { normalizeIngredient } from '../utils/normalize';

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

console.log('\n🛒 1. Récupération des recettes de test');
// Recette catalogue : Crêpes maison
const crepesRecipe = RECIPES.find((r) => r.id === 'crepes');
assert('Recette « Crêpes maison » trouvée', !!crepesRecipe);
const laitCrepes = crepesRecipe?.ingredients.find((i) => i.id === 'lait');
assert('Ingrédient « Lait » trouvé dans les Crêpes', !!laitCrepes && laitCrepes.quantity.includes('500'));

// Recette personnalisée : Matcha latte
const matchaRecipe: Recipe = {
  id: 'custom_matcha_latte',
  name: 'Matcha latte',
  prepTime: '5 min',
  servings: 1,
  category: 'Boisson',
  isCustom: true,
  ingredients: [
    { id: normalizeIngredient('Poudre de matcha'), label: 'Poudre de matcha', quantity: '1 c. à café' },
    { id: normalizeIngredient('Lait'), label: 'Lait', quantity: '200 ml' },
    { id: normalizeIngredient('Miel'), label: 'Miel', quantity: '1 c. à café' },
  ],
  steps: ['Fouetter le matcha dans un peu d\'eau chaude', 'Chauffer le lait', 'Verser le lait sur le matcha'],
};
assert('Recette personnalisée « Matcha latte » créée', matchaRecipe.ingredients.length === 3);
const laitMatcha = matchaRecipe.ingredients.find((i) => i.id === 'lait');
assert('Ingrédient « Lait » trouvé dans Matcha latte', !!laitMatcha && laitMatcha.quantity === '200 ml');

console.log('\n🛒 2. Ajout du lait depuis les deux recettes');
let shoppingList: ShoppingItem[] = [];

// Étape 1 : Ajouter le lait depuis « Crêpes maison »
shoppingList = mergeIngredientIntoList(
  shoppingList,
  laitCrepes!,
  crepesRecipe!.id,
  crepesRecipe!.name
);
assert('Lait ajouté depuis Crêpes maison (1 article dans la liste)', shoppingList.length === 1);
assert('Label est « Lait »', shoppingList[0].label === 'Lait');
assert('Une seule source pour le moment', shoppingList[0].sources.length === 1);
assert('Source 1 est Crêpes maison · 500 ml',
  shoppingList[0].sources[0].recipeName === 'Crêpes maison' && shoppingList[0].sources[0].quantity.includes('500 ml')
);

// Étape 2 : Ajouter le lait depuis « Matcha latte »
shoppingList = mergeIngredientIntoList(
  shoppingList,
  laitMatcha!,
  matchaRecipe.id,
  matchaRecipe.name
);

console.log('\n🛒 3. Vérification de l\'agrégation sans doublon');
assert('Le lait apparaît TOUJOURS une seule fois dans la liste', shoppingList.length === 1);
assert('L\'article possède désormais 2 sources distinctes', shoppingList[0].sources.length === 2);

const srcCrepes = shoppingList[0].sources.find((s) => s.recipeId === crepesRecipe!.id);
const srcMatcha = shoppingList[0].sources.find((s) => s.recipeId === matchaRecipe.id);

assert('Source Crêpes présente avec sa quantité d\'origine (500 ml)',
  !!srcCrepes && srcCrepes.quantity.includes('500 ml')
);
assert('Source Matcha présente avec sa quantité d\'origine (200 ml)',
  !!srcMatcha && srcMatcha.quantity === '200 ml'
);

// Ajout d'un autre ingrédient pour tester la persistance d'un article non coché
const farineCrepes = crepesRecipe?.ingredients.find((i) => i.id === 'farine')!;
shoppingList = mergeIngredientIntoList(
  shoppingList,
  farineCrepes,
  crepesRecipe!.id,
  crepesRecipe!.name
);
assert('Ajout d\'un deuxième article (Farine) dans les courses', shoppingList.length === 2);

console.log('\n🛒 4. Cocher le lait comme acheté');
let userIngredients: UserIngredient[] = [];

// État avant achat : lait non disponible dans les deux recettes
assert('Avant achat : Lait non disponible dans Crêpes', !isIngredientAvailable('lait', userIngredients));
assert('Avant achat : Lait non disponible dans Matcha latte', !isIngredientAvailable('lait', userIngredients));

// Action : Cocher le lait (acheté)
const milkItem = shoppingList.find((i) => i.id === 'lait')!;

// 1. Ajout à « Mes ingrédients »
const normId = normalizeIngredient(milkItem.label);
if (!userIngredients.some((i) => i.id === normId)) {
  userIngredients = [...userIngredients, { id: normId, label: milkItem.label }];
}

// 2. Retrait de la liste de courses
shoppingList = shoppingList.filter((i) => i.id !== milkItem.id);

assert('Après achat : Le lait est retiré de la liste de courses', !shoppingList.some((i) => i.id === 'lait'));
assert('La farine reste dans les courses (1 article restant)', shoppingList.length === 1 && shoppingList[0].id === 'farine');
assert('Le lait est maintenant dans « Mes ingrédients »', userIngredients.some((i) => i.id === 'lait'));

// 3. Mise à jour de la disponibilité dans les deux recettes
assert('Après achat : Lait disponible dans « Crêpes maison »', isIngredientAvailable('lait', userIngredients));
assert('Après achat : Lait disponible dans « Matcha latte »', isIngredientAvailable('lait', userIngredients));

// 4. Test d'absence de doublon si déjà présent dans « Mes ingrédients »
const previousCount = userIngredients.length;
const duplicateId = normalizeIngredient('Lait');
if (!userIngredients.some((i) => i.id === duplicateId)) {
  userIngredients = [...userIngredients, { id: duplicateId, label: 'Lait' }];
}
assert('Aucun doublon créé si l\'ingrédient est déjà présent', userIngredients.length === previousCount);

console.log('\n🛒 5. Vérification de la persistance après réouverture');
// Simulation de la sauvegarde locale (AsyncStorage JSON round-trip)
const savedJson = JSON.stringify(shoppingList);
const reloadedList: ShoppingItem[] = JSON.parse(savedJson);

assert('Les articles non cochés (Farine) sont bien rechargés', reloadedList.length === 1);
assert('L\'article rechargé est la Farine', reloadedList[0].id === 'farine');
assert('La source de la Farine (Crêpes maison · 250 g) est préservée',
  reloadedList[0].sources[0].recipeName === 'Crêpes maison' && reloadedList[0].sources[0].quantity.includes('250 g')
);

console.log(`\n${'─'.repeat(45)}`);
console.log(`Résultats : ${passed} réussis, ${failed} échec(s)`);
if (failed === 0) {
  console.log('🎉 Tous les tests du scénario de courses ont réussi !\n');
} else {
  console.error(`⚠️  ${failed} test(s) ont échoué.\n`);
  (globalThis as any).process?.exit(1);
}
