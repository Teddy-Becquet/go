// Description: Script pour la page d'accueil.

// Fonction pour récupérer et afficher le classement
async function fetchStandings() {
    try {
        const response = await fetch('http://192.164.64.175:9100/classement', {
            headers: {
                'Content-Type': 'application/json', // Indique que le contenu est au format JSON
                'Accept': 'application/json', // Indique que la réponse attendue est au format JSON
                'Authorization': `Bearer ${getCookie('token')}` // Ajoute le token d'authentification si nécessaire
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const standings = await response.json();
        console.log(standings);

        // Afficher le classement dans la console ou sur la page
        const standingsContainer = document.getElementById('standings');
        standingsContainer.innerHTML = ''; // Réinitialiser le contenu

        standings.forEach(team => {
            const teamElement = document.createElement('div');
            teamElement.textContent = `${team.nom} - Points : ${team.points}`;
            standingsContainer.appendChild(teamElement);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du classement :', error);
    }
}

// Fonction utilitaire pour récupérer un cookie par son nom
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.getElementById('logout').addEventListener('click', () => {
    // Supprimer le cookie 'token' en définissant une date d'expiration passée
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";

    // Afficher un message de confirmation avant la redirection
    alert('Vous avez été déconnecté avec succès.');

    // Rediriger l'utilisateur vers la page de connexion
    window.location.href = 'login.html';
});

// Appeler la fonction fetchStandings au chargement de la page
document.addEventListener('DOMContentLoaded', fetchStandings);