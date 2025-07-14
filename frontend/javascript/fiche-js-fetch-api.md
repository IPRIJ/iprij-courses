# � Fiche JS-012 : Fetch API - Récupérer des données

[![Niveau](https://img.shields.io/badge/Niveau-Intermédiaire-orange.svg)](https://shie---

## 💡 Pour aller plus loin

### 🚀 **Améliorations possibles :**
- Afficher le corps de l'article (`data.body`)
- Afficher plusieurs articles dans une boucle
- Ajouter un champ `<input>` pour charger un article par ID
- Implémenter un système de pagination
- Ajouter un indicateur de chargement (spinner)

### 🔧 **Concepts avancés :**
- **Headers personnalisés** : Authentification, type de contenu
- **Méthodes HTTP** : POST, PUT, DELETE avec fetch()
- **AbortController** : Annuler des requêtes en cours
- **Cache HTTP** : Optimiser les performances réseau

---

## 🧠 Quiz de validation

<details>
<summary><strong>Question 1 : Quelle est la différence entre fetch().then() et async/await ?</strong></summary>

**Réponse :** Les deux approches sont équivalentes fonctionnellement. `async/await` offre une syntaxe plus lisible et plus proche du code synchrone, tandis que `.then()` utilise le chaînage de promesses.
</details>

<details>
<summary><strong>Question 2 : Pourquoi utiliser try/catch avec fetch() ?</strong></summary>

**Réponse :** Pour gérer les erreurs réseau, les erreurs de parsing JSON, et les codes de statut HTTP d'erreur (4xx, 5xx).
</details>

<details>
<summary><strong>Question 3 : Comment vérifier si une requête fetch a réussi ?</strong></summary>

**Réponse :** Vérifier `response.ok` ou `response.status` car fetch() ne rejette que pour les erreurs réseau, pas pour les codes 4xx/5xx.
</details>

---

## 🔗 Ressources

### Documentation officielle
- [MDN - Fetch API](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API) - Documentation complète
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) - API de test gratuite
- [HTTP Status Codes](https://httpstatuses.com/) - Guide des codes de réponse

### APIs publiques pour s'exercer
- **[Rick and Morty API](https://rickandmortyapi.com/)** - Données de personnages
- **[OpenWeatherMap](https://openweathermap.org/api)** - Données météo
- **[PokeAPI](https://pokeapi.co/)** - Base de données Pokémon

---

## ❓ FAQ

<details>
<summary><strong>Fetch() fonctionne-t-il dans tous les navigateurs ?</strong></summary>
Fetch() est supporté dans tous les navigateurs modernes (Chrome 42+, Firefox 39+, Safari 10.1+). Pour Internet Explorer, utilisez un polyfill.
</details>

<details>
<summary><strong>Comment envoyer des données avec fetch() ?</strong></summary>

```javascript
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  })
})
```
</details>

---

**Prochaine étape :** [Manipulation du DOM](../manipulation-dom.md)

---

*Dernière mise à jour : 14 juillet 2025 | Durée estimée : 1h | Difficulté : Intermédiaire*

---

### 🏠 [← Retour formation Frontend](../README.md) | [Cours suivant : DOM →](../manipulation-dom.md)Durée](https://img.shields.io/badge/Durée-1h-blue.svg)](https://shields.io/)
[![Type](https://img.shields.io/badge/Type-Pratique-green.svg)](https://shields.io/)

> **Prérequis :** Bases JavaScript (variables, fonctions, événements DOM)  
> **Objectif :** Maîtriser les requêtes HTTP asynchrones avec l'API Fetch  

---

## 🎯 Objectifs d'apprentissage

À la fin de cette fiche, vous serez capable de :
- ✅ Utiliser `fetch()` pour envoyer une requête HTTP
- ✅ Manipuler les promesses et les données JSON
- ✅ Gérer les erreurs réseau et de parsing
- ✅ Afficher dynamiquement des données sur une page HTML
- ✅ Utiliser la syntaxe moderne `async/await`

---

## 📖 Table des matières

1. [Notions clés](#-notions-clés)
2. [Syntaxe de base](#-syntaxe-de-base)
3. [Version moderne async/await](#-version-moderne-asyncawait)
4. [Exercice pratique](#-exercice-pratique)
5. [Projet complet](#-projet-complet)
6. [Pour aller plus loin](#-pour-aller-plus-loin)

---

Apprendre à :
- Utiliser `fetch()` pour envoyer une requête HTTP
- Manipuler les promesses et le JSON
- Gérer les erreurs réseau
- Afficher dynamiquement des données sur une page HTML

---

## 🔧 Notions clés

| Terme         | Définition |
|---------------|------------|
| `fetch()`     | Lance une requête HTTP asynchrone |
| `.then()`     | Enchaîne une action après réception d’une réponse |
| `.json()`     | Convertit la réponse brute en objet JavaScript |
| `.catch()`    | Gère les erreurs (réseau ou parsing) |
| `async/await` | Syntaxe moderne pour les opérations asynchrones |

---

## 🧪 Exemple de base avec `fetch()` (GET)

```javascript
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erreur :', error));
````

---

## ✅ Version avec `async/await`

```javascript
async function getPost() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Erreur :', error);
  }
}
```

---

## 📁 Exercice : Créer une page HTML interactive

### 🎯 Objectif

Créer une page web avec :

* un titre récupéré depuis l'API
* un bouton pour relancer la requête

### 🔤 Code HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Exercice Fetch</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 2em;
      background: #f9f9f9;
    }
    h1 {
      color: #333;
    }
    button {
      margin-top: 1em;
      padding: 0.5em 1em;
      font-size: 1em;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <h1 id="title">Chargement...</h1>
  <button id="reload">Recharger l’article</button>

  <script>
    async function fetchArticle() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        document.getElementById('title').textContent = data.title;
      } catch (error) {
        document.getElementById('title').textContent = "Erreur de chargement.";
        console.error('Erreur :', error);
      }
    }

    // Chargement initial
    fetchArticle();

    // Bouton pour relancer la requête
    document.getElementById('reload').addEventListener('click', fetchArticle);
  </script>

</body>
</html>
```

---

## 💡 Pour aller plus loin

* Afficher le corps de l’article (`data.body`)
* Afficher plusieurs articles dans une boucle
* Ajouter un champ `<input>` pour charger un article par ID

---

## 📚 Ressource utilisée

API gratuite : [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com)
