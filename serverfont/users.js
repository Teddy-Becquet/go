async function getUsers() {
    const response = await fetch('http://192.168.64.175:9100/users');
    const users = await response.json();
    const table = document.getElementById('usersTable');
    users.forEach(user => {
        const row = table.insertRow();
        row.insertCell(0).textContent = user.nom;
        row.insertCell(1).textContent = user.email;
        row.insertCell(2).textContent = user.role;
    });
}

document.addEventListener("DOMContentLoaded", getUsers);
