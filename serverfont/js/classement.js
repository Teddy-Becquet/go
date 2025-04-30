// -------------------- Routes pour les classements --------------------

export async function obtenirClassementGeneral() {
    return effectuerRequete('/classement');
  }
  
  export async function obtenirClassementAdmin() {
    return effectuerRequete('/admin/classement');
  }
  
  export async function ajouterClassementAdmin(nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs) {
    return effectuerRequete('/admin/classement', 'POST', { nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs });
  }
  
  export async function modifierClassementAdmin(id, nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs, rang) {
    return effectuerRequete(`/admin/classement/${id}`, 'PUT', { nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs, rang });
  }
  
  export async function supprimerClassementAdmin(id) {
    return effectuerRequete(`/admin/classement/${id}`, 'DELETE');
  }