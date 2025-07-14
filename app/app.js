/**
 * Application principale SPA
 */
class App {
    constructor() {
        this.router = new Router();
        this.courses = null;
        this.currentFormation = null;
        this.currentCourse = null;
        
        // Éléments DOM
        this.sidebarElement = document.getElementById('sidebar');
        this.contentElement = document.getElementById('markdown-viewer');
        this.loadingElement = document.getElementById('loading');
        this.searchInput = document.getElementById('search-input');
        this.menuToggle = document.getElementById('menu-toggle');
        this.navigationElement = document.getElementById('course-navigation');

        // Table des matières
        this.tocElement = document.getElementById('table-of-contents');
        this.tocContent = document.getElementById('toc-content');
        this.toggleTocButton = document.getElementById('toggle-toc');
        
        this.init();
    }

    async init() {
        try {
            await this.loadCourses();
            this.setupRouter();
            this.setupEventListeners();
            this.router.start();
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            this.showError('Erreur lors du chargement de l\'application');
        }
    }

    /**
     * Charger la configuration des cours
     */
    async loadCourses() {
        try {
            const response = await fetch('./data/courses.json');
            if (!response.ok) {
                throw new Error('Impossible de charger les cours');
            }
            this.courses = await response.json();
        } catch (error) {
            console.error('Erreur chargement cours:', error);
            // Fallback avec données par défaut
            this.courses = this.getDefaultCourses();
        }
    }

    /**
     * Configuration des routes
     */
    setupRouter() {
        // Route d'accueil
        this.router.addRoute('/', () => this.showHome());
        
        // Route pour une formation
        this.router.addRoute('/formation/:formationId', (params) => {
            this.showFormation(params.formationId);
        });
        
        // Route pour un cours spécifique
        this.router.addRoute('/formation/:formationId/cours/:courseId', (params) => {
            this.loadCourse(params.formationId, params.courseId);
        });

        // Route de recherche
        this.router.addRoute('/search/:query', (params) => {
            this.showSearchResults(params.query);
        });

        // Route 404
        this.router.setNotFoundHandler(() => this.show404());
    }

    /**
     * Configuration des événements
     */
    setupEventListeners() {
        // Toggle menu mobile
        this.menuToggle?.addEventListener('click', () => {
            this.sidebarElement.classList.toggle('open');
        });

        // Fermer menu au clic sur contenu (mobile)
        this.contentElement?.addEventListener('click', () => {
            this.sidebarElement.classList.remove('open');
        });

        // Recherche
        this.searchInput?.addEventListener('input', (e) => {
            this.debounceSearch(e.target.value);
        });

        // Clic sur cartes formation
        document.addEventListener('click', (e) => {
            const formationCard = e.target.closest('.formation-card:not(.disabled)');
            if (formationCard) {
                const formationId = formationCard.getAttribute('data-formation');
                this.router.navigate(`/formation/${formationId}`);
            }
        });

        // Toggle table des matières
        this.toggleTocButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTableOfContents();
        });

        // Toggle TOC en cliquant sur le header
        this.tocElement?.querySelector('.toc-header')?.addEventListener('click', () => {
            this.toggleTableOfContents();
        });
    }

    /**
     * Afficher l'écran d'accueil
     */
    showHome() {
        this.currentFormation = null;
        this.currentCourse = null;
        this.updateNavigation();
        this.hideTableOfContents();
        
        const welcomeHTML = this.generateWelcomeScreen();
        this.contentElement.innerHTML = welcomeHTML;
        this.hideLoading();
    }

    /**
     * Afficher une formation
     */
    showFormation(formationId) {
        const formation = this.courses.formations.find(f => f.id === formationId);
        if (!formation) {
            this.show404();
            return;
        }

        this.currentFormation = formation;
        this.currentCourse = null;
        this.updateNavigation();

        const formationHTML = this.generateFormationOverview(formation);
        this.contentElement.innerHTML = formationHTML;
        this.hideLoading();
    }

    /**
     * Charger et afficher un cours
     */
    async loadCourse(formationId, courseId) {
        const formation = this.courses.formations.find(f => f.id === formationId);
        if (!formation) {
            this.show404();
            return;
        }

        const course = formation.courses.find(c => c.id === courseId);
        if (!course) {
            this.show404();
            return;
        }

        this.currentFormation = formation;
        this.currentCourse = course;
        this.updateNavigation();
        
        this.showLoading();

        try {
            const response = await fetch(course.file);
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const markdown = await response.text();
            const html = this.renderMarkdown(markdown);
            
            this.contentElement.innerHTML = html;
            this.generateTableOfContents();
            this.applySyntaxHighlighting();
            this.addNavigationButtons(formationId, courseId);
            this.markCourseAsViewed(courseId);
            
        } catch (error) {
            console.error('Erreur chargement cours:', error);
            this.showError(`Impossible de charger le cours: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Convertir Markdown en HTML
     */
    renderMarkdown(markdown) {
        try {
            // Configuration de marked (inspirée du markdown-viewer qui fonctionne)
            if (typeof marked !== 'undefined') {
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    highlight: function(code, lang) {
                        if (typeof hljs !== 'undefined' && lang) {
                            try {
                                return hljs.highlight(code, { language: lang }).value;
                            } catch (e) {
                                console.warn('Erreur coloration syntaxique:', e);
                                return code;
                            }
                        }
                        return code;
                    }
                });

                // Conversion du markdown avec l'API moderne
                return marked.parse ? marked.parse(markdown) : marked(markdown);
            } else {
                throw new Error('marked.js non disponible');
            }
        } catch (error) {
            console.error('Erreur parsing Markdown:', error);
            // Fallback: conversion basique
            return this.basicMarkdownToHtml(markdown);
        }
    }

    /**
     * Conversion Markdown basique en cas de problème avec marked.js
     */
    basicMarkdownToHtml(markdown) {
        let html = markdown;
        
        // Conversions basiques
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Entourer dans un paragraphe
        html = '<p>' + html + '</p>';
        
        // Nettoyer les paragraphes vides
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p><br>/g, '<p>');
        
        return html;
    }

    /**
     * Appliquer la coloration syntaxique
     */
    applySyntaxHighlighting() {
        // Highlight.js s'applique automatiquement
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }

    /**
     * Mettre à jour la navigation
     */
    updateNavigation() {
        if (!this.currentFormation) {
            this.navigationElement.innerHTML = this.generateFormationsList();
        } else {
            this.navigationElement.innerHTML = this.generateCoursesList(this.currentFormation);
        }
    }

    /**
     * Générer la liste des formations
     */
    generateFormationsList() {
        return `
            <div class="nav-section">
                <h3>📚 Formations disponibles</h3>
                <ul class="nav-list">
                    ${this.courses.formations.map(formation => `
                        <li class="nav-item">
                            <a href="#/formation/${formation.id}" 
                               data-route="/formation/${formation.id}"
                               class="nav-link ${formation.courses.length === 0 ? 'disabled' : ''}">
                                ${formation.icon} ${formation.title}
                                <span class="course-count">${formation.courses.length} cours</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Générer la liste des cours d'une formation
     */
    generateCoursesList(formation) {
        return `
            <div class="nav-section">
                <div class="nav-header">
                    <a href="#/" data-route="/" class="back-link">← Formations</a>
                    <h3>${formation.icon} ${formation.title}</h3>
                </div>
                <ul class="nav-list">
                    ${formation.courses.map((course, index) => `
                        <li class="nav-item">
                            <a href="#/formation/${formation.id}/cours/${course.id}" 
                               data-route="/formation/${formation.id}/cours/${course.id}"
                               class="nav-link ${this.currentCourse?.id === course.id ? 'active' : ''}">
                                <span class="course-number">${String(index + 1).padStart(2, '0')}</span>
                                ${course.title}
                                <span class="course-duration">${course.duration}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Générer l'écran d'accueil
     */
    generateWelcomeScreen() {
        return `
            <div class="welcome-screen">
                <h1>🎓 Bienvenue sur iprij.com</h1>
                <p>Choisissez une formation pour commencer votre apprentissage</p>
                
                <div class="formations-grid">
                    ${this.courses.formations.map(formation => `
                        <div class="formation-card ${formation.courses.length === 0 ? 'disabled' : ''}" 
                             data-formation="${formation.id}">
                            <div class="card-icon">${formation.icon}</div>
                            <h3>${formation.title}</h3>
                            <p>${formation.description}</p>
                            <div class="card-stats">
                                <span>📚 ${formation.courses.length || 'En préparation'} ${formation.courses.length > 1 ? 'cours' : 'cours'}</span>
                                <span>⏱️ ${formation.duration}</span>
                                <span>🎯 ${formation.level}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Générer l'aperçu d'une formation
     */
    generateFormationOverview(formation) {
        return `
            <div class="formation-overview">
                <div class="formation-header">
                    <h1>${formation.icon} ${formation.title}</h1>
                    <p class="formation-description">${formation.description}</p>
                    
                    <div class="formation-stats">
                        <span class="stat">📚 ${formation.courses.length} cours</span>
                        <span class="stat">⏱️ ${formation.duration}</span>
                        <span class="stat">🎯 ${formation.level}</span>
                    </div>
                </div>

                <div class="courses-list">
                    <h2>📋 Cours disponibles</h2>
                    ${formation.courses.length > 0 ? `
                        <div class="courses-grid">
                            ${formation.courses.map((course, index) => `
                                <div class="course-card">
                                    <div class="course-number">${String(index + 1).padStart(2, '0')}</div>
                                    <h3>${course.title}</h3>
                                    <p class="course-duration">⏱️ ${course.duration}</p>
                                    <a href="#/formation/${formation.id}/cours/${course.id}" 
                                       data-route="/formation/${formation.id}/cours/${course.id}"
                                       class="btn-primary">Commencer le cours</a>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <p class="no-courses">Cette formation est en cours de préparation.</p>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Ajouter les boutons de navigation entre cours
     */
    addNavigationButtons(formationId, courseId) {
        const formation = this.currentFormation;
        const currentIndex = formation.courses.findIndex(c => c.id === courseId);
        
        let navigationHTML = '<div class="course-navigation">';
        
        // Cours précédent
        if (currentIndex > 0) {
            const prevCourse = formation.courses[currentIndex - 1];
            navigationHTML += `
                <a href="#/formation/${formationId}/cours/${prevCourse.id}" 
                   data-route="/formation/${formationId}/cours/${prevCourse.id}"
                   class="nav-btn prev">
                    ← ${prevCourse.title}
                </a>
            `;
        }
        
        // Cours suivant
        if (currentIndex < formation.courses.length - 1) {
            const nextCourse = formation.courses[currentIndex + 1];
            navigationHTML += `
                <a href="#/formation/${formationId}/cours/${nextCourse.id}" 
                   data-route="/formation/${formationId}/cours/${nextCourse.id}"
                   class="nav-btn next">
                    ${nextCourse.title} →
                </a>
            `;
        }
        
        navigationHTML += '</div>';
        
        this.contentElement.insertAdjacentHTML('beforeend', navigationHTML);
    }

    /**
     * Marquer un cours comme vu
     */
    markCourseAsViewed(courseId) {
        const viewedCourses = JSON.parse(localStorage.getItem('viewedCourses') || '[]');
        if (!viewedCourses.includes(courseId)) {
            viewedCourses.push(courseId);
            localStorage.setItem('viewedCourses', JSON.stringify(viewedCourses));
        }
    }

    /**
     * Recherche avec debounce
     */
    debounceSearch = this.debounce((query) => {
        if (query.length > 2) {
            this.router.navigate(`/search/${encodeURIComponent(query)}`);
        }
    }, 300);

    /**
     * Fonction debounce
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Afficher les résultats de recherche
     */
    showSearchResults(query) {
        // Implémentation de la recherche
        this.contentElement.innerHTML = `
            <div class="search-results">
                <h1>🔍 Résultats pour "${decodeURIComponent(query)}"</h1>
                <p>Fonction de recherche en cours de développement...</p>
            </div>
        `;
        this.hideLoading();
    }

    /**
     * Afficher page 404
     */
    show404() {
        this.contentElement.innerHTML = `
            <div class="error-page">
                <h1>404 - Page non trouvée</h1>
                <p>Le contenu demandé n'existe pas.</p>
                <a href="#/" data-route="/" class="btn-primary">Retour à l'accueil</a>
            </div>
        `;
        this.hideLoading();
    }

    /**
     * Afficher une erreur
     */
    showError(message) {
        this.contentElement.innerHTML = `
            <div class="error-page">
                <h1>❌ Erreur</h1>
                <p>${message}</p>
                <a href="#/" data-route="/" class="btn-primary">Retour à l'accueil</a>
            </div>
        `;
        this.hideLoading();
    }

    /**
     * Afficher le chargement
     */
    showLoading() {
        this.loadingElement.style.display = 'block';
        this.contentElement.style.display = 'none';
    }

    /**
     * Masquer le chargement
     */
    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.contentElement.style.display = 'block';
    }

    /**
     * Générer la table des matières automatiquement
     */
    generateTableOfContents() {
        const headings = this.contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            this.tocElement.style.display = 'none';
            return;
        }

        let tocHtml = '<ul class="toc-list">';
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            
            // Limiter la longueur du texte pour l'affichage
            const displayText = text.length > 50 ? text.substring(0, 47) + '...' : text;
            
            tocHtml += `
                <li>
                    <a href="#${id}" class="toc-link toc-level-${level}" data-target="${id}">${displayText}</a>
                </li>
            `;
        });
        tocHtml += '</ul>';
        
        this.tocContent.innerHTML = tocHtml;
        this.tocElement.style.display = 'block';
        
        // Ajouter le scroll smooth et la gestion des états actifs
        this.setupTocNavigation();
        this.setupScrollSpy();
    }

    /**
     * Configuration de la navigation dans la table des matières
     */
    setupTocNavigation() {
        const tocLinks = this.tocContent.querySelectorAll('.toc-link');
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Décalage pour compenser la hauteur de la TOC fixe
                    const offsetTop = targetElement.offsetTop - 120;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Mettre à jour l'état actif
                    this.setActiveTocLink(targetId);
                }
            });
        });
    }

    /**
     * Surveillance du scroll pour mettre à jour la TOC
     */
    setupScrollSpy() {
        let ticking = false;
        
        const updateActiveToc = () => {
            const headings = this.contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const scrollTop = window.pageYOffset;
            
            let activeHeading = null;
            
            headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 150) {
                    activeHeading = heading.id;
                }
            });
            
            if (activeHeading) {
                this.setActiveTocLink(activeHeading);
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateActiveToc);
                ticking = true;
            }
        });
    }

    /**
     * Définir le lien actif dans la TOC
     */
    setActiveTocLink(activeId) {
        const tocLinks = this.tocContent.querySelectorAll('.toc-link');
        tocLinks.forEach(link => {
            if (link.getAttribute('data-target') === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Basculer l'affichage de la table des matières
     */
    toggleTableOfContents() {
        const tocContent = this.tocContent;
        const button = this.toggleTocButton;
        
        if (tocContent.classList.contains('collapsed')) {
            tocContent.classList.remove('collapsed');
            button.textContent = 'Masquer';
        } else {
            tocContent.classList.add('collapsed');
            button.textContent = 'Afficher';
        }
    }

    /**
     * Masquer la table des matières
     */
    hideTableOfContents() {
        this.tocElement.style.display = 'none';
    }

    /**
     * Données par défaut si le fichier JSON n'est pas trouvé
     */
    getDefaultCourses() {
        return {
            formations: [
                {
                    id: "wordpress",
                    title: "Formation WordPress",
                    description: "Maîtrisez WordPress de A à Z",
                    icon: "🌐",
                    level: "débutant à expert",
                    duration: "~20h",
                    courses: [
                        {
                            id: "wp-001",
                            title: "Qu'est-ce que WordPress ?",
                            file: "wordpress/cours-qu-est-ce-que-wordpress.md",
                            duration: "30min"
                        }
                    ]
                },
                {
                    id: "frontend",
                    title: "Développement Frontend",
                    description: "HTML, CSS, JavaScript moderne",
                    icon: "💻",
                    level: "tous niveaux",
                    duration: "~25h",
                    courses: []
                }
            ]
        };
    }
}

// Démarrer l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
