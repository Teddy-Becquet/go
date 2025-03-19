// Fonction pour gérer la connexion
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://192.168.64.175:9100/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            alert('Échec de la connexion');
            return;
        }
        
        const data = await response.json();
        document.cookie = `token=${data.accessToken}; path=/; HttpOnly`;
        fetchStandings();
    } catch (error) {
        console.error('Erreur de connexion', error);
    }
}

// Fonction pour récupérer et afficher le classement
async function fetchStandings() {
    try {
        const response = await fetch('http://192.168.64.175:9100/classement');
        
        if (!response.ok) {
            alert('Accès refusé');
            return;
        }
        
        const standings = await response.json();
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('standings-container').style.display = 'block';
        
        const tbody = document.getElementById('standings-body');
        tbody.innerHTML = '';
        standings.forEach(team => {
            const row = `<tr>
                            <td>${team.nom}</td>
                            <td>${team.matchsJoues}</td>
                            <td>${team.points}</td>
                            <td>${team.butsPour}</td>
                            <td>${team.butsContre}</td>
                            <td>${team.differenceButs}</td>
                        </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Erreur de chargement du classement', error);
    }
}