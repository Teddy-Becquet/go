//route pour les matchs 
export async function obtenirTousLesMatchs() {
  return effectuerRequete('/matchs');
}

export async function obtenirMatchAdmin(id) {
  return effectuerRequete(`/admin/matchs/${id}`);
}

export async function ajouterMatchAdmin(Equipe1, Equipe2, Butequipe1, Butequipe2) {
  return effectuerRequete('/admin/matchs', 'POST', { Equipe1, Equipe2, Butequipe1, Butequipe2 });
}

export async function modifierMatchAdmin(id, Equipe1, Equipe2, Butequipe1, Butequipe2) {
  return effectuerRequete(`/admin/matchs/${id}`, 'PUT', { Equipe1, Equipe2, Butequipe1, Butequipe2 });
}

export async function supprimerMatchAdmin(id) {
  return effectuerRequete(`/admin/matchs/${id}`, 'DELETE');
}

// -------------------- Routes pour les équipes --------------------

export async function obtenirToutesLesEquipes() {
    return effectuerRequete('/equipes');
  }
  
  export async function obtenirEquipeAdmin(id) {
    return effectuerRequete(`/admin/equipes/${id}`);
  }
  
  export async function ajouterEquipeAdmin(nom) {
    return effectuerRequete('/admin/equipes', 'POST', { nom });
  }
  
  export async function modifierEquipeAdmin(id, nom) {
    return effectuerRequete(`/admin/equipes/${id}`, 'PUT', { nom });
  }
  
  export async function supprimerEquipeAdmin(id) {
    return effectuerRequete(`/admin/equipes/${id}`, 'DELETE');
  }
  