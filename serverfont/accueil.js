// Description: Script pour la page d'accueil.

// Fonction pour récupérer et afficher le classement
async function fetchStandings() {
    try {
        const response = await fetch('http://192.164.64.175:9100/classement',
            {
                headers: {
                    
                });

document.getElementById('logout').addEventListener('click', () => {
    // Supprimer le cookie 'token' en définissant une date d'expiration passée
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";

    // Afficher un message de confirmation avant la redirection
    alert('Vous avez été déconnecté avec succès.');

    // Rediriger l'utilisateur vers la page de connexion
    window.location.href = 'login.html';
});