// fichier: api.js

const API_BASE_URL = 'http://192.168.65.127/resume/api/go/serverfont/html/classement.html'; //URL de l'API

async function effectuerRequete(url, methode = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method: methode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur HTTP : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la requête vers ${url} :`, error);
    throw error;
  }
}

// -------------------- Routes d'authentification --------------------

// -------------------- Routes pour les utilisateurs (générales) --------------------

export async function obtenirTousLesUtilisateurs() {
  return effectuerRequete('/users');
}

export async function ajouterUtilisateur(nom, mdp) {
  return effectuerRequete('/users', 'POST', { nom, mdp });
}

export async function modifierClassementUtilisateur(id, nouveauClassement) {
  return effectuerRequete(`/users/${id}`, 'PUT', { classement: nouveauClassement });
}

export async function supprimerUtilisateur(id) {
  return effectuerRequete(`/users/${id}`, 'DELETE');
}

// -------------------- Routes admin pour les utilisateurs --------------------

export async function obtenirTousLesUtilisateursAdmin() {
  return effectuerRequete('/admin/users');
}

export async function obtenirUtilisateurAdmin(id) {
  return effectuerRequete(`/admin/users/${id}`);
}

export async function ajouterUtilisateurAdmin(id, nom, mdp, role) {
  return effectuerRequete('/admin/users', 'POST', { id, nom, mdp, role });
}

export async function modifierUtilisateurAdmin(id, nom, mdp, role) {
  return effectuerRequete(`/admin/users/${id}`, 'PUT', { nom, mdp, role });
}

export async function supprimerUtilisateurAdmin(id) {
  return effectuerRequete(`/admin/users/${id}`, 'DELETE');
}

// -------------------- Routes pour l'administration (connexion admin) --------------------

export async function obtenirTousLesAdmins() {
  return effectuerRequete('/admin/connexion');
}

export async function obtenirAdmin(id) {
  return effectuerRequete(`/admin/connexion/${id}`);
}

export async function ajouterAdmin(nom, mdp) {
  return effectuerRequete('/admin/connexion', 'POST', { nom, mdp });
}

// Il manque les routes PUT et DELETE pour /admin/connexion si vous souhaitez les implémenter
// export async function modifierAdmin(id, nom, mdp) {
//   return effectuerRequete(`/admin/connexion/${id}`, 'PUT', { nom, mdp });
// }

// export async function supprimerAdmin(id) {
//   return effectuerRequete(`/admin/connexion/${id}`, 'DELETE');
// }

// -------------------- Routes pour les équipes --------------------


// -------------------- Routes pour les matchs --------------------


// -------------------- Routes pour les classements --------------------
