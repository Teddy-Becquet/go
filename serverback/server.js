//Déclaration de constantes & des paramètres du serveur
const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser'); // Ajout de cookie-parser
const cooking = require('cooking');
const { request } = require('http');
const { response } = require('express');
const { json } = require('express');
const { urlencoded } = require('express');
const { use } = require('express');
const process = require('process');
const { Console } = require('console');
const { error } = require('console');
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const pm2 = require("pm2");
const port = 9100; 
const app = express();
 
// Limite de requêtes pour éviter le spam (5 requêtes max par 2 minutes par IP)
const limiter = rateLimit({
    windowMs: 1 * 120 * 10000, // 2 minutes
    max: 25,
    message: "hahahahah!!!! Trop de tentatives. Réessayez plus tard.",
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.json());
app.use(limiter); // Appliquer à toutes les routes

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const token = req.cookies.token; // Récupérer le token depuis les cookies
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

//Connexion à la base de données
const bddConnection = mysql.createConnection({
    host: '192.168.64.175',
    user: 'site1',
    password: 'yuzu007',
    database: 'Classements'
});

bddConnection.connect(function (err) {
    if (err) throw err;
    console.log("Vous êtes enfin connecté sur le serveur !");
});

// Route à emprunter dans le navigateur
app.get('/', (req, res) => {
    res.json('Bonjour, ceci est notre serveur (back-end), soyez les bienvenus ! ajouter un /accueil dans URL pour accéder à la page d\'accueil');
});

// Route pour l'inscription  *********************** errrrreur
app.post('/inscription', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword };
        bddConnection.query('SELECT * FROM users WHERE user_name = ?', [username], async function (err, rows) {
            if (err) throw err;
            res.status(201).send('Utilisateur enregistré');
        });
    } catch {
        res.status(500).json();
    }
});

// Route pour la déconnexion
app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Supprimer le cookie de session
    res.json('Déconnexion réussie');
});

// Route pour la connexion  
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Veuillez remplir tous les champs.');
    bddConnection.query('SELECT * FROM users WHERE username = ?', [username], async (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        if (rows.length === 0) return res.status(400).send('Utilisateur non trouvé');
        try {
            const match = await bcrypt.compare(password, rows[0].password);
            if (!match) return res.status(401).send('Mot de passe incorrect');
            const user = { name: username };
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict' });
            res.json({ accessToken });
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de l\'authentification');
        }
    });
});

// Route sécurisée pour l'ajout d'admin avec hachage du mot de passe 
app.post('/admin/connexion', async (req, res) => {
    const { nom, mdp } = req.body;

    if (!nom || !mdp) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }
    try {
        const hashedmdp = await bcrypt.hash(mdp, 10); // Hachage du mot de passe

        const query = "INSERT INTO Admin (nom, mdp) VALUES (?, ?)";
        bddConnection.query(query, [nom, hashedmdp], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de l'ajout de l'admin" });
            }
            res.status(201).json({ message: "Admin ajouté avec succès !" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
    }
});

// Route GET pour récupérer les utilisateurs *********************** errrrreur
app.get('/admin/users', (req, res) => {
    console.log("Requête reçue pour récupérer les utilisateurs"); // Debug   
    if (!bddConnection) {
        console.error("Erreur : la connexion à la base de données n'est pas établie.");
        return res.status(500).json({ message: "Erreur serveur : connexion DB manquante" });
    }

    const sql = "SELECT * FROM users";
    bddConnection.query(sql, (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé" });
        }
        console.log("Utilisateurs récupérés :", result); // Debug
        res.status(200).json(result);
    });
});

// Route POST pour insérer un utilisateur
app.post('/admin/users', (req, res) => {
    const { id, nom, prenom, mdp } = req.body;

    if (!id || !nom || !prenom || !mdp) {
        return res.status(400).json({ message: "Données manquantes" });
    }
    const sql = "INSERT INTO users (id, nom, prenom, mdp) VALUES (?, ?, ?, ?)";
    bddConnection.query(sql, [id, nom, prenom, mdp], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'insertion :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(201).json({ message: "Utilisateur ajouté !" });
    });
});

// Route GET pour récupérer un utilisateur par ID
app.get('/admin/users/:id', (req, res) => {
    const id = req.params.id;
    console.log("ID reçu :", id); // Debug
    if (!bddConnection) {
        console.error("Erreur : connexion à la base de données manquante.");
        return res.status(500).json({ message: "Erreur serveur : connexion DB manquante" });
    }
    const sql = "SELECT * FROM users WHERE id = ?";
    console.log("Requête SQL exécutée :", sql, "avec ID :", id); // Debug
    bddConnection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        console.log("Résultat MySQL :", result); // Debug
        if (result.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json(result[0]);
    });
});

// Route PUT pour mettre à jour un utilisateur     ***************** errrrreur
app.put('/admin/users/:id', (req, res) => {
    const id = req.params.id;
    const { nom, prenom, mdp } = req.body;
    // Vérifier si l'ID est valide (uniquement si c'est un entier)
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID invalide" });
    }
    // Vérifier si tous les champs sont fournis
    if (!nom || !prenom || !mdp) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    // Vérifier si l'utilisateur existe
    bddConnection.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Erreur SQL :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        console.log("Utilisateur trouvé :", result[0]); // Debug
        // Hachage du mot de passe
        bcrypt.hash(mdp, 10, (err, hash) => {
            if (err) {
                console.error("Erreur lors du hash du mot de passe :", err);
                return res.status(500).json({ message: "Erreur serveur" });
            }
            const sql = "UPDATE users SET nom = ?, prenom = ?, mdp = ? WHERE id = ?";
            bddConnection.query(sql, [nom, prenom, hash, id], (err, result) => {
                if (err) {
                    console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
                    return res.status(500).json({ message: "Erreur serveur" });
                }
                if (result.affectedRows === 0) {
                    return res.status(400).json({ message: "Aucune modification effectuée" });
                }
                res.status(200).json({ message: "Utilisateur mis à jour avec succès !" });
            });
        });
    });
});

// Route DELETE pour supprimer un utilisateur
app.delete('/admin/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    bddConnection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de l'utilisateur :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(200).json({ message: "Utilisateur supprimé !" });
    });
});

// Route pour la page d'accueil = index.html (protégée)  *********************** errrrreur car Unauthorized
app.get('/accueil', authenticateToken, (req, res) => {
    res.json('Vous êtes dans la page d\'accueil. Soyez les bienvenus sur cette page');
});

//route pour les matchs 
app.get('/matchs', (req, res) => {
    const query = `
    SELECT 
        m.id, 
        m.Equipe1, 
        m.Equipe2, 
        m.Butequipe1, 
        m.Butequipe2, 
        e1.nom AS nom_equipe1, 
        e2.nom AS nom_equipe2
    FROM 
        Matchs m
    JOIN 
        equipe e1 ON m.Equipe1 = e1.id
    JOIN 
        equipe e2 ON m.Equipe2 = e2.id;
    `;

    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
});

//route pour ajouter un matchs   ******************** errrrreur  car seule le message de erreur s'affiche
app.post('/matchs', (req, res) => {
    const { equipe1, equipe2, butsEquipe1, butsEquipe2 } = req.body;

    console.log("Données reçues :", req.body); // Debug
    
    if (!equipe1 || !equipe2 || butsEquipe1 === undefined || butsEquipe2 === undefined) {
        return res.status(400).json({ error: "Toutes les informations sont requises" });
    }

    const query = "INSERT INTO Matchs (Equipe1, Equipe2, Butequipe1, Butequipe2) VALUES (?, ?, ?, ?)";
    
    bddConnection.query(query, [equipe1, equipe2, butsEquipe1, butsEquipe2], (err, result) => {
        if (err) {
            console.error("Erreur MySQL :", err);
            return res.status(500).json({ error: "Erreur lors de l'ajout du match" });
        }
        res.status(201).json({ message: "Match ajouté avec succès !" });
    });
});

//route pour les equipes    ******************** errrrreur  car me fait sortir du sever
app.get('/equipes', (req, res) => {
    const query = "SELECT * FROM equipe";
    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
        res.json(results);
    });
});

//route pour les equipes   ******************** errrrreur  car seule le message de erreur s'affiche
app.post('/admin/equipes', (req, res) => {
  const { nom } = req.body;
  
  const query = "INSERT INTO equipe (nom) VALUES (?)";
  bddConnection.query(query, [nom], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erreur lors de l'ajout de l'équipe" });
      }
      res.status(201).json({ message: "Equipe ajoutée avec succès !" });
  });
});

//route pour les equipes en fonction de l'id
app.get('/equipes/:id', (req, res) => {
    const id = req.params.id;
    const query = "SELECT * FROM Equipe WHERE id = ?";
    bddConnection.query(query, [id], (error, results, fields) => {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).json({ message: "Equipe non trouvée" });
        }
        res.json(results[0]);
    });
});

//route pour modifier une equipe en fonction de l'id
app.put('/admin/equipes/:id', (req, res) => {
    const id = req.params.id;
    const { nom } = req.body;
    const query = "UPDATE Equipe SET nom = ? WHERE id = ?";
    bddConnection.query(query, [nom, id], (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Equipe non trouvée" });
        }
        res.json({ message: "Equipe mise à jour avec succès !" });
    });
});

//route pour supprimer une equipe en fonction de l'id
app.delete('/admin/equipes/:id', (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM Equipe WHERE id = ?";
    bddConnection.query(query, [id], (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Equipe non trouvée" });
        }
        res.json({ message: "Equipe supprimée avec succès !" });
    });
});

//route pour ajouter un classement   ***************** errrrreur  car seule le message de erreur s'affiche
app.post('/admin/classement', (req, res) => {
    const { nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs } = req.body;
    
    const query = "INSERT INTO Classement (nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    bddConnection.query(query, [nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'ajout du Classement" });
        }
        res.status(201).json({ message: "Classement ajouté avec succès !" });
    });
});

// Route pour la page de classement
app.get('/classement', (req, res) => {
    const query = `
    SELECT 
        m.id, 
        m.Equipe1, 
        m.Equipe2, 
        m.Butequipe1, 
        m.Butequipe2, 
        e1.nom AS nom_equipe1, 
        e2.nom AS nom_equipe2
    FROM 
        Matchs m
    JOIN 
        equipe e1 ON m.Equipe1 = e1.id
    JOIN 
        equipe e2 ON m.Equipe2 = e2.id;
    `;

    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
      
        // Traiter les résultats pour calculer le classement
        const classement = calculerClassement(results);
      
        console.log(classement);
        res.json(classement);
    });
});

// route pour le vainqueur du match
app.get('/vainqueur', (req, res) => {
    const query = `
    SELECT 
        m.id, 
        m.Equipe1, 
        m.Equipe2, 
        m.Butequipe1, 
        m.Butequipe2, 
        e1.nom AS nom_equipe1, 
        e2.nom AS nom_equipe2
    FROM 
        Matchs m
    JOIN 
        equipe e1 ON m.Equipe1 = e1.id
    JOIN 
        equipe e2 ON m.Equipe2 = e2.id;
    `;

    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
      
        // Traiter les résultats pour déterminer le vainqueur
        const vainqueur = determinerVainqueur(results);
      
        console.log(vainqueur);
        res.json(vainqueur);
    });
});

// route pour ajouter un vainqueur  ***************** errrrreur  car seule le message de erreur s'affiche
app.post('/vainqueur', (req, res) => {
    const { nom } = req.body;
    
    const query = "INSERT INTO Vainqueur (nom) VALUES (?)";
    bddConnection.query(query, [nom], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'ajout du vainqueur" });
        }
        res.status(201).json({ message: "Vainqueur ajouté avec succès !" });
    });
});
// Route pour la page de classement
app.get('/classement', (req, res) => {
    const query = `
    SELECT 
        m.id, 
        m.Equipe1, 
        m.Equipe2, 
        m.Butequipe1, 
        m.Butequipe2, 
        e1.nom AS nom_equipe1, 
        e2.nom AS nom_equipe2
    FROM 
        Matchs m
    JOIN 
        equipe e1 ON m.Equipe1 = e1.id
    JOIN 
        equipe e2 ON m.Equipe2 = e2.id;
    `;

    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
      
        // Traiter les résultats pour calculer le classement
        const classement = calculerClassement(results);
      
        console.log(classement);
        res.json(classement);
    });
});

// Route pour déterminer le vainqueur
function determinerVainqueur(matchs) {
    const vainqueurs = [];

    matchs.forEach(match => {
        const { Equipe1, Equipe2, Butequipe1, Butequipe2, nom_equipe1, nom_equipe2 } = match;

        if (Butequipe1 > Butequipe2) {
            vainqueurs.push({ vainqueur: nom_equipe1 });
        } else if (Butequipe2 > Butequipe1) {
            vainqueurs.push({ vainqueur: nom_equipe2 });
        } else {
            vainqueurs.push({ vainqueur: "Match nul" });
        }
    });

    return vainqueurs;
}
// Route pour la page de classement
app.get('/classement', (req, res) => {
    const query = `
    SELECT 
        m.id, 
        m.Equipe1, 
        m.Equipe2, 
        m.Butequipe1, 
        m.Butequipe2, 
        e1.nom AS nom_equipe1, 
        e2.nom AS nom_equipe2
    FROM 
        Matchs m
    JOIN 
        equipe e1 ON m.Equipe1 = e1.id
    JOIN 
        equipe e2 ON m.Equipe2 = e2.id;
    `;

    bddConnection.query(query, (error, results, fields) => {
        if (error) throw error;
      
        // Traiter les résultats pour calculer le classement
        const classement = calculerClassement(results);
      
        console.log(classement);
        res.json(classement);
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Le serveur est en écoute sur le port ${port}`);
});

// Récupérer les données de la table 
app.get('/users', (req, res) => {
    bddConnection.query('SELECT * FROM users', function (err, rows) {
        if (err) throw err;
        res.send(rows);
    });
});

// Ajouter des données dans la table 
app.post('/users', (req, res) => {
const { nom, mdp } = req.body;
console.log("nom: " + nom + " mdp: " + mdp);


////////////////////////////////////////////////////////////////////////////////////

// Vérification des données reçues
if (!nom || !mdp) {
    return res.status(400).json({ message: "Nom et mot de passe requis" });
}
// Hachage du mot de passe
const hashedPassword = await
bcrypt.hash(mdp, 10);

///////////////////////////////////////////////////////////////////////////////////


try {
    bddConnection.query('INSERT INTO users (nom, mdp) VALUES (?, ?)', [nom, mdp], function (err, result) {
        if (err) {
            // Gestion de l'erreur en renvoyant un message d'erreur
            return res.status(500).json({ message: "Erreur lors de l'insertion dans la base de données", error: err.message });
        }
        
        // Si l'insertion réussit, on renvoie les résultats
        res.json({ message: "Utilisateur ajouté avec succès", result: result });
    });
} catch (error) {
    // Capturer toutes les autres erreurs et renvoyer un message générique
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
}
});

// Modifier des données dans la table
app.put('/users/:id', (req, res) => {
    let id = req.params.id;
    let newClassement = 2;
    bddConnection.query('UPDATE users SET classement = ? WHERE id = ?', [newClassement, id], function (err, rows) {
        if (err) throw err;
        res.send('Classement modifié');
    });
});

// Supprimer les données de la table
app.delete('/users/:id', (req, res) => {
    let id = req.params.id;
    bddConnection.query('DELETE FROM users WHERE id = ?', id, function (err, rows) {
        if (err) throw err;
        res.send('Utilisateur supprimé de la base de données');
    });
});

// Requête SQL
bddConnection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'exécution de la requête :', err.stack);
      return;
    }
    console.log('Résultats de la requête :', results);
});

function calculerClassement(matchs) {
    const classement = {};
  
    matchs.forEach(match => {
        const { Equipe1, Equipe2, Butequipe1, Butequipe2, nom_equipe1, nom_equipe2 } = match;
  
        // Initialiser les équipes dans le classement si elles n'existent pas
        if (!classement[Equipe1]) {
            classement[Equipe1] = {
                id: Equipe1,
                nom: nom_equipe1,
                matchsJoues: 0,
                gagne: 0,
                perdu: 0,
                nul: 0,
                points: 0,
                butsPour: 0,
                butsContre: 0,
                differenceButs: 0,
            };
        }
        if (!classement[Equipe2]) {
            classement[Equipe2] = {
                id: Equipe2,
                nom: nom_equipe2,
                matchsJoues: 0,
                gagne: 0,
                perdu: 0,
                nul: 0,
                points: 0,
                butsPour: 0,
                butsContre: 0,
                differenceButs: 0,
            };
        }
  
        // Mettre à jour les statistiques pour chaque équipe
        classement[Equipe1].matchsJoues += 1;
        classement[Equipe2].matchsJoues += 1;
  
        classement[Equipe1].butsPour += Butequipe1;
        classement[Equipe1].butsContre += Butequipe2;
        classement[Equipe1].differenceButs = classement[Equipe1].butsPour - classement[Equipe1].butsContre;
  
        classement[Equipe2].butsPour += Butequipe2;
        classement[Equipe2].butsContre += Butequipe1;
        classement[Equipe2].differenceButs = classement[Equipe2].butsPour - classement[Equipe2].butsContre;
  
        // Déterminer le résultat du match
        if (Butequipe1 > Butequipe2) {
            // Équipe 1 gagne
            classement[Equipe1].points += 3;
            classement[Equipe1].gagne += 1;
            classement[Equipe2].perdu += 1;
        } else if (Butequipe2 > Butequipe1) {
            // Équipe 2 gagne
            classement[Equipe2].points += 3;
            classement[Equipe2].gagne += 1;
            classement[Equipe1].perdu += 1;
        } else {
            // Match nul
            classement[Equipe1].points += 1;
            classement[Equipe2].points += 1;
            classement[Equipe1].nul += 1;
            classement[Equipe2].nul += 1;
        }
    });
  
    // Convertir l'objet en tableau pour un classement plus lisible
    const classementArray = Object.values(classement);
  
    // Trier le classement selon les critères
    classementArray.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points; // Tri par points décroissants
        } else if (b.differenceButs !== a.differenceButs) {
            return b.differenceButs - a.differenceButs; // Tri par différence de buts
        } else {
            return b.butsPour - a.butsPour; // Tri par buts marqués
        }
    });
  
    return classementArray;
}