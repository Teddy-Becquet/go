// Routes d'authentification
export async function inscrireUtilisateur(nom, mdp) {
  return effectuerRequete('/inscription', 'POST', { nom, mdp });
}

export async function connecterUtilisateur(nom, mdp) {
  return effectuerRequete('/login', 'POST', { nom, mdp });
}

export async function deconnecterUtilisateur() {
  return effectuerRequete('/logout', 'POST');
}

export async function accederPageAccueil(token) {
  return effectuerRequete('/accueil', 'GET', null, { 'Authorization': `Bearer ${token}` });
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