function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = "";

    if (!username || !password) {
        errorMessage.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    fetch('http://localhost:9100/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.accessToken) {
            document.cookie = `token=${data.accessToken}; path=/; Secure; HttpOnly`;
            window.location.href = '/admin-dashboard.html';
        } else {
            errorMessage.textContent = "Identifiants incorrects.";
        }
    })
    .catch(error => {
        errorMessage.textContent = "Erreur serveur. Veuillez réessayer.";
    });
}