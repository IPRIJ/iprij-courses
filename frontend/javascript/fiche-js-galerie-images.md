# 🖼️ Fiche JS-014 : Galerie d'images interactive

[![Niveau](https://img.shields.io/badge/Niveau-Intermédiaire-orange.svg)](https://shields.io/)
[![Durée](https://img.shields.io/badge/Durée-1h-blue.svg)](https://shields.io/)
[![Type](https://img.shields.io/badge/Type-Projet%20Pratique-green.svg)](https://shields.io/)

> **Prérequis :** Manipulation DOM, événements JavaScript, bases CSS  
> **Objectif :** Créer une galerie d'images avec navigation interactive  

---

## 🎯 Objectifs d'apprentissage

À la fin de cette fiche, vous serez capable de :
- ✅ Créer une galerie d'images avec navigation cyclique
- ✅ Gérer les événements de clic et navigation clavier
- ✅ Implémenter le préchargement d'images pour la performance
- ✅ Structurer du code JavaScript modulaire et maintenable
- ✅ Charger dynamiquement des styles CSS depuis JavaScript

---

## 📖 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Architecture du projet](#-architecture-du-projet)
3. [Structure des données](#-structure-des-données)
4. [Navigation cyclique](#-navigation-cyclique)
5. [Processus de chargement](#-processus-de-chargement)
6. [Code complet](#-code-complet)
7. [Améliorations possibles](#-améliorations-possibles)

---

## 🔍 Vue d'ensemble

La galerie affiche une image à la fois avec des boutons de navigation pour passer d'une image à l'autre de manière cyclique.

```
[Bouton ←] [IMAGE ACTUELLE] [Bouton →]
```

## Structure des données

### Tableau d'images
```javascript
galleryImages = [
    {
        src: "/assets/donnees_entreprise.jpg",
        alt: "Données entreprise", 
        title: "Données entreprise"
    },
    // ... 4 autres images
]
```

### Schéma de la structure
```
galleryImages[0] ← Index 0 (première image)
galleryImages[1] ← Index 1
galleryImages[2] ← Index 2  
galleryImages[3] ← Index 3
galleryImages[4] ← Index 4 (dernière image)
```

## Navigation cyclique

### Variable d'index
- `n` = index actuel (0 à 4)
- Détermine quelle image est affichée

### Schéma de navigation
```
    ← Bouton Précédent     Bouton Suivant →
         n--                    n++

[0] ← [1] ← [2] ← [3] ← [4]
 ↑                       ↓
 └───────────────────────┘
    Navigation cyclique
```

### Logique de bouclage
```
Bouton Suivant (→):
n = 0 → 1 → 2 → 3 → 4 → 0 (retour au début)

Bouton Précédent (←):
n = 4 → 3 → 2 → 1 → 0 → 4 (va à la fin)
```

## Processus de chargement

### 1. Initialisation
```
Page chargée
    ↓
DOMContentLoaded
    ↓
├── loadCss()        (charge les styles)
├── preloadImages()  (précharge toutes les images)
└── loadGallery(0)   (affiche la première image)
```

### 2. Préchargement des images
```
Pour chaque image dans galleryImages:
    ↓
Créer un objet Image()
    ↓
Charger l'image en arrière-plan
    ↓
├── Si succès → console.log("Image preloaded")
└── Si erreur → console.warn("Unable to load image")
```

### 3. Affichage d'une image
```
loadGallery(n)
    ↓
Récupérer l'élément #gallery
    ↓
Créer un élément <img>
    ↓
Définir: src, alt, title, classe
    ↓
Ajouter l'image au DOM
```

## Interaction utilisateur

### Navigation avec les boutons

#### Bouton Précédent (←)
```
Clic sur prevBtn
    ↓
Supprimer l'image actuelle du DOM
    ↓
n-- (décrémenter l'index)
    ↓
Si n < 0 → n = 4 (aller à la dernière image)
    ↓
loadGallery(n) (afficher la nouvelle image)
```

#### Bouton Suivant (→)
```
Clic sur nextBtn
    ↓
Supprimer l'image actuelle du DOM
    ↓
n++ (incrémenter l'index)
    ↓
Si n >= 5 → n = 0 (retour à la première image)
    ↓
loadGallery(n) (afficher la nouvelle image)
```

## Styles CSS

### Chargement dynamique
```
loadCss()
    ↓
Créer un élément <link>
    ↓
Définir: rel="stylesheet", href="/gallery/gallery.css"
    ↓
Ajouter au <head> du document
```

## Schéma de flux complet

```
┌─────────────────┐
│   Page chargée  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ DOMContentLoaded│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   loadCss()     │    │ preloadImages() │    │ loadGallery(0)  │
│   Charge CSS    │    │ Précharge toutes│    │ Affiche image 1 │
└─────────────────┘    │   les images    │    └─────────────────┘
                       └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │  Image 1    │ │  Image 2    │ │  Image 3    │
        │ préchargée  │ │ préchargée  │ │ préchargée  │
        └─────────────┘ └─────────────┘ └─────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Utilisateur       │
                    │   clique sur        │
                    │   ← ou →            │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │ Supprimer   │ │ Mettre à    │ │ Afficher    │
        │ image       │ │ jour index  │ │ nouvelle    │
        │ actuelle    │ │     n       │ │   image     │
        └─────────────┘ └─────────────┘ └─────────────┘
```

## Variables globales

| Variable | Type | Description |
|----------|------|-------------|
| `galleryImages` | Array | Tableau des données d'images |
| `n` | Number | Index de l'image actuelle (0-4) |
| `gallery` | Element | Élément DOM du conteneur |
| `prevBtn` | Element | Bouton précédent |
| `nextBtn` | Element | Bouton suivant |

## Structure des fichiers

```
gallery/
├── gallery.js          ← Code JavaScript principal
├── gallery.css         ← Styles CSS
└── gallery-documentation.md ← Cette documentation

assets/
├── donnees_entreprise.jpg
├── fondamentaux_md.jpg
├── intro_md.jpg
├── RS_pour_vous.jpg
└── SEO.jpg
```

---

## 🚀 Améliorations possibles

### ✅ **Fonctionnalités de base implémentées**
- [x] Navigation cyclique (←/→)
- [x] Préchargement des images
- [x] Chargement CSS dynamique
- [x] Gestion d'erreurs
- [x] Interface simple

### 💡 **Extensions recommandées**
- [ ] **Transitions animées** : CSS transitions entre images
- [ ] **Navigation clavier** : Flèches gauche/droite, Espace
- [ ] **Indicateur de position** : "3/5" ou points de navigation
- [ ] **Diaporama automatique** : Lecture automatique avec play/pause
- [ ] **Vignettes de navigation** : Aperçu miniature des images
- [ ] **Zoom et pan** : Agrandissement des images
- [ ] **Plein écran** : Mode fullscreen
- [ ] **Swipe tactile** : Navigation sur mobile

---

## 🧠 Exercices pratiques

### 📝 **Exercice 1 : Ajouter un indicateur de position**
Afficher "Image 3 sur 5" sous la galerie.

<details>
<summary>💡 Indice</summary>

```javascript
function updatePosition() {
    const position = document.getElementById('position');
    position.textContent = `Image ${n + 1} sur ${galleryImages.length}`;
}
```
</details>

### 📝 **Exercice 2 : Navigation clavier**
Permettre la navigation avec les flèches du clavier.

<details>
<summary>💡 Indice</summary>

```javascript
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        // Code du bouton précédent
    } else if (event.key === 'ArrowRight') {
        // Code du bouton suivant
    }
});
```
</details>

### 📝 **Exercice 3 : Transitions CSS**
Ajouter un effet de fondu entre les images.

<details>
<summary>💡 Indice</summary>

```css
.gallery img {
    transition: opacity 0.3s ease;
}

.gallery img.fade-out {
    opacity: 0;
}
```
</details>

---

## 📊 Analyse de performance

### **Avantages du préchargement**
- ✅ **Navigation instantanée** : Les images sont déjà en cache navigateur
- ✅ **Expérience fluide** : Aucun délai d'attente pour l'utilisateur
- ✅ **Détection d'erreurs** : Prévention des images cassées en production

### **Impact mémoire estimé**
```
5 images × ~500KB = ~2.5MB en mémoire
Acceptable pour une galerie de petite/moyenne taille
```

### **Optimisations possibles**
- **Lazy loading** : Précharger seulement les images adjacentes
- **Format WebP** : Réduction de 25-30% de la taille des fichiers
- **Responsive images** : Différentes tailles selon l'écran

---

## 🧠 Quiz de validation

<details>
<summary><strong>Question 1 : Pourquoi précharger les images ?</strong></summary>

**Réponse :** Le préchargement permet une navigation instantanée sans temps d'attente, améliore l'expérience utilisateur et détecte les erreurs de chargement à l'avance.
</details>

<details>
<summary><strong>Question 2 : Comment fonctionne la navigation cyclique ?</strong></summary>

**Réponse :** L'index `n` est incrémenté/décrémenté, avec une vérification des limites : si n < 0, on va à la dernière image ; si n >= longueur, on retourne à la première.
</details>

<details>
<summary><strong>Question 3 : Que fait DOMContentLoaded ?</strong></summary>

**Réponse :** L'événement DOMContentLoaded se déclenche quand le HTML est complètement chargé et parsé, avant que toutes les images et ressources externes soient chargées.
</details>

---

## 🔗 Ressources

### Documentation technique
- [MDN - Image()](https://developer.mozilla.org/fr/docs/Web/API/HTMLImageElement/Image) - Constructeur d'images JavaScript
- [MDN - DOMContentLoaded](https://developer.mozilla.org/fr/docs/Web/API/Window/DOMContentLoaded_event) - Événement de chargement DOM
- [CSS Transitions](https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Transitions) - Animations CSS

### Inspiration et exemples
- **[Swiper.js](https://swiperjs.com/)** - Galerie avancée avec touches
- **[Lightbox2](https://lokeshdhakar.com/projects/lightbox2/)** - Overlay d'images
- **[PhotoSwipe](https://photoswipe.com/)** - Galerie mobile-friendly

---

## ❓ FAQ

<details>
<summary><strong>La galerie fonctionne-t-elle sur mobile ?</strong></summary>
Oui, les boutons sont cliquables sur mobile. Pour améliorer l'expérience, ajoutez la gestion des gestes swipe avec Touch Events ou une librairie comme Hammer.js.
</details>

<details>
<summary><strong>Comment optimiser pour de nombreuses images ?</strong></summary>
Implémentez le lazy loading : ne préchargez que l'image suivante et précédente, chargez les autres à la demande.
</details>

<details>
<summary><strong>Peut-on ajouter des métadonnées aux images ?</strong></summary>

Oui, étendez l'objet galleryImages :
```javascript
{
    src: "image.jpg",
    alt: "Description",
    title: "Titre",
    caption: "Légende détaillée",
    author: "Photographe"
}
```
</details>

---

**Prochaine étape :** [Gestion des événements](../gestion-evenements.md)

---

*Dernière mise à jour : 14 juillet 2025 | Durée estimée : 1h | Difficulté : Intermédiaire*

---

### 🏠 [← Retour formation Frontend](../README.md) | [Cours suivant : Événements →](../gestion-evenements.md)
