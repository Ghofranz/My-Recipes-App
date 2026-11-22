# Qu’est-ce qu’on mange ? 🍳

Application mobile React Native / Expo développée en TypeScript, 100 % hors-ligne (aucun backend, aucune clé d'API, aucun compte requis).

Elle suggère des recettes gourmandes en fonction des ingrédients que vous possédez déjà à la maison, tout en vous permettant de **créer et conserver vos propres recettes personnalisées** !

---

## 📱 Fonctionnalités

1. **Mes ingrédients & Liste de courses** 🧺
   - Saisie simple et rapide des ingrédients disponibles chez vous.
   - Normalisation automatique (insensible à la casse, aux accents, aux espaces et aux pluriels en s/x).
   - Détection des doublons.
   - **Section repliable « Liste de courses »** directement sous le formulaire :
     - Case à cocher pour marquer un article comme acheté (l'ajoute immédiatement à « Mes ingrédients » et le retire des courses).
     - Agrégation intelligente : si un ingrédient est nécessaire dans plusieurs recettes, il apparaît sur une seule ligne avec le détail de chaque recette et sa quantité (ex. : *« Crêpes maison · 500 ml »* et *« Matcha latte · 200 ml »*).
     - Bouton de suppression pour retirer un article des courses sans l'ajouter aux ingrédients.
   - Sauvegarde locale automatique avec `AsyncStorage` (les courses et ingrédients restent après fermeture de l'app).

2. **Suggestions intelligentes** 💡
   - Algorithme de tri prioritaire :
     - Les recettes prêtes à cuisiner en premier (« Vous avez tout ! »).
     - Puis les recettes partielles ordonnées par ratio d'ingrédients disponibles le plus élevé, avec le nombre d'ingrédients manquants en cas d'égalité.
     - Exclusion des recettes à zéro correspondance.
   - Intègre automatiquement **les recettes du catalogue ET vos recettes personnelles** !
   - Indicateurs visuels clairs (barre de progression, ingrédients manquants surlignés).

3. **Catalogue complet & Création de recettes** 📖
   - Plus de 15 recettes complètes intégrées (spécialités tunisiennes comme le Brik à l'œuf, Ojja aux merguez, Chakchouka, Couscous, Lablabi, ainsi que des classiques rapides et familiaux).
   - **Création de vos propres recettes** (bouton « + Ajouter » dans l'onglet Recettes) :
     - Nom de la recette, temps de préparation, nombre de portions, catégorie.
     - Ajout dynamique d'ingrédients avec quantités.
     - Ajout des étapes ordonnées de préparation.
     - Sauvegarde persistante locale sur le téléphone.
   - Badge spécial **« ⭐ Ma recette »** sur toutes vos créations.
   - Onglets de filtrage (« Toutes » / « Mes recettes ») et barre de recherche instantanée.

4. **Détail de la recette** 📋
   - Liste des ingrédients avec repère visuel (vert = possédé, rouge = manquant).
   - **Section « À acheter » interactive** pour tous les ingrédients manquants (pour les recettes du catalogue et vos recettes personnelles) :
     - Affiche la quantité exacte (ex. : *« Lait — 500 ml »*).
     - Bouton individuel **« Ajouter aux courses »** qui passe en **« Dans la liste »** dès l'ajout.
     - Bouton **« Tout ajouter aux courses »** lorsqu'il manque plusieurs ingrédients.
   - Étapes de préparation numérotées et détaillées.
   - Bouton de suppression sécurisé avec confirmation pour vos recettes créées.
   - **Geste natif de retour iOS** (balayage fluide depuis le bord gauche vers la droite) avec conservation de la recherche et de la position dans la liste.

---

## 🚀 Démarrer avec Expo Go (iPhone & Android)

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure) installé.
- L'application gratuite **Expo Go** installée sur votre smartphone :
  - [Expo Go sur l'App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
  - [Expo Go sur Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Lancement du serveur de développement
Dans un terminal, placez-vous dans le dossier du projet :

```bash
cd "mobile projet/recipe-app"
npx expo start
```

### Ouvrir sur iPhone (Expo Go)
1. Assurez-vous que votre iPhone et votre ordinateur sont connectés au **même réseau Wi-Fi**.
2. Ouvrez l'application **Appareil photo** de l'iPhone et scannez le QR code affiché dans le terminal.
3. Touchez la bannière jaune pour ouvrir dans Expo Go.

*(Astuce si votre Wi-Fi isole les appareils : lancez avec `npx expo start --tunnel`)*

---

## 🎭 Scénario de démonstration (pour présentation)

1. **Onglet « Ingrédients »** :
   - Ajoutez : `Œufs`, `Tomates`, `Oignon`, `Huile d'olive`, `Thon en boîte`.
   - Fermez complètement l'application puis rouvrez-la : vos ingrédients sont toujours là grâce à la persistance locale !
2. **Onglet « Suggestions »** :
   - Observez les recettes suggérées :
     - L'*Omelette aux légumes* ou le *Brik à l'œuf* apparaissent en haut.
     - Les pourcentages de faisabilité et les ingrédients manquants sont affichés.
   - Touchez une recette pour afficher les étapes et la liste des ingrédients possédés / à acheter.
3. **Onglet « Recettes » (Création de recette)** :
   - Touchez le bouton **« + Ajouter »** en haut à droite.
   - Saisissez :
     - Nom : `Salade tunisienne rapide`
     - Temps : `15 min`
     - Catégorie : `Tunisien`
     - Ingrédients : `Tomates` (2), `Oignon` (1), `Thon en boîte` (1 boîte), `Huile d'olive` (2 c. à soupe)
     - Étape 1 : `Couper les tomates et l'oignon en petits dés.`
     - Étape 2 : `Ajouter le thon et arroser d'huile d'olive.`
   - Touchez **« Enregistrer ma recette »**.
4. **Scénario Liste de courses** :
   - Ouvrez la recette **« Crêpes maison »** : dans la section « À acheter », touchez **« Ajouter aux courses »** sur la ligne du **Lait (500 ml)**. La ligne affiche désormais **« Dans la liste »**.
   - Créez une recette personnelle **« Matcha latte »** avec l'ingrédient **Lait (200 ml)**.
   - Ouvrez « Matcha latte » et ajoutez le lait aux courses.
   - Rendez-vous sur l'onglet **« Ingrédients »** : dans la section repliable **« Liste de courses (1) »**, le **Lait** apparaît en **une seule ligne**, avec ses deux sources : *« Crêpes maison · 500 ml »* et *« Matcha latte · 200 ml »*.
   - Cochez la case du lait : il est marqué comme acheté, disparaît de la liste de courses et est ajouté immédiatement à **« Mes ingrédients »**.
   - Ouvrez à nouveau les deux recettes : le lait est désormais indiqué en vert comme possédé dans les deux plats !

---

## 📦 Générer un fichier APK Android autonome (sans PC / sans serveur)

Le projet est configuré avec un profil EAS (`eas.json`) pour générer un fichier `.apk` directement installable sur n'importe quel smartphone Android :

### 1. Se connecter à EAS (gratuit)
```bash
npx eas-cli login
```

### 2. Configurer le projet EAS
```bash
npx eas-cli project:init
```

### 3. Lancer la compilation de l'APK autonome
```bash
npx eas-cli build -p android --profile preview
```

> **Note :** Le profil `preview` dans `eas.json` utilise `"buildType": "apk"`. Une fois le build terminé sur les serveurs EAS, un lien de téléchargement direct du fichier `.apk` vous est fourni. Il vous suffit de le télécharger sur votre smartphone Android pour l'installer.

---

## 🏗️ Architecture du projet

```
recipe-app/
├── App.tsx                     # Point d'entrée avec barre d'état et navigation
├── app.json                    # Métadonnées Expo (com.quoimanger.app)
├── eas.json                    # Profils de compilation autonome (APK)
├── src/
│   ├── components/             # Composants réutilisables
│   │   ├── EmptyState.tsx      # États vides conviviaux
│   │   ├── IngredientTag.tsx   # Badge ingrédient avec suppression
│   │   └── RecipeCard.tsx      # Cartes suggestions & catalogue (avec badge custom)
│   ├── data/
│   │   └── recipes.ts          # 15 recettes complètes hors-ligne (dont 5 tunisiennes)
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Navigation par onglets & gestion des modales
│   ├── screens/
│   │   ├── AddRecipeScreen.tsx # Écran complet de création de recette
│   │   ├── CatalogueScreen.tsx # Recherche, filtres « Toutes » / « Mes recettes »
│   │   ├── IngredientsScreen.tsx # Gestion du placard d'ingrédients
│   │   ├── RecipeDetailScreen.tsx# Détail, ingrédients manquants, étapes, suppression
│   │   └── SuggestionsScreen.tsx # Moteur de suggestions en temps réel
│   ├── store/
│   │   ├── customRecipesStore.ts # Persistance AsyncStorage des recettes créées
│   │   ├── ingredientsStore.ts   # Persistance AsyncStorage des ingrédients
│   │   └── shoppingStore.ts      # Persistance AsyncStorage & fusion de la liste de courses
│   ├── theme/
│   │   └── index.ts            # Palette chaleureuse cuisine & tokens de style
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript partagées
│   └── utils/
│       ├── matching.ts         # Algorithme de tri et de correspondance
│       └── normalize.ts        # Normalisation insensible casse, accents & pluriels
```
