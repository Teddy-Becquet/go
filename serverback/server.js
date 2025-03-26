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
const port = 9000; 
const app = express();
 
// Limite de requêtes pour éviter le spam (5 requêtes max par 2 minutes par IP)
const limiter = rateLimit({
    windowMs: 1 * 120 * 10000, // 2 minutes
    max: 25,
    message: "hahahahah!!!! Trop de tentatives. Réessayez plus tard.",
});

app.use(limiter); // Appliquer à toutes les routes

// Route sécurisée pour l'ajout d'admin avec hachage du mot de passe
app.post('/admin/connexion', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe

        const query = "INSERT INTO Admin (username, password) VALUES (?, ?)";
        bddConnection.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erreur lors de l'ajout de l'admin" });
            }
            res.status(201).json({ message: "Admin ajouté avec succès !" });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
    }
});

// Route POST pour insérer un utilisateur
app.post('/admin/users', (req, res) => {
    const { id, nom, prenom, mdp } = req.body;

    if (!id || !nom || !prenom || !mdp) {
        return res.status(400).json({ message: "Données manquantes" });
    }

    const sql = "INSERT INTO utilisateurs (id, nom, prenom, mdp) VALUES (?, ?, ?, ?)";
    db.query(sql, [id, nom, prenom, mdp], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'insertion :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        res.status(201).json({ message: "Utilisateur ajouté !" });
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Utilisation de cookie-parser

//Connexion à la base de données
const bddConnection = mysql.createConnection({
    host: '192.168.64.175',
    user: 'site1',
    password: 'yuzu007',
    database: 'Classement'
});

bddConnection.connect(function (err) {
    if (err) throw err;
    console.log("Vous êtes enfin connecté sur le serveur !");
});

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

// Route pour l'inscription
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

// Route pour la connexion
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    bddConnection.query('SELECT * FROM users WHERE username = ?', [username], async function (err, rows) {
        if (err) throw err;
        if (rows.length === 0) return res.status(400).send('Utilisateur non trouvé');
        try {
            if (await bcrypt.compare(password, rows[0].password)) {
                const user = { name: username };
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.cookie('token', accessToken, { httpOnly: true }); // Stocker le token dans un cookie
                res.json({ accessToken: accessToken });
            } else {
                res.json('Mot de passe incorrect'); // ici j'ai changé le status en "send" en json
            }
        } catch {
            res.status(500).send();
        }
    });
});

// Route à emprunter dans le navigateur
app.get('/192.168.64.175', (req, res) => { // ici j'ai changer le "/" en "/192.168.64.175"
    res.json('Bonjour, ceci est notre serveur (back-end), soyez les bienvenus ! ajouter un /accueil dans URL pour accéder à la page d\'accueil');
});

// Route pour la page d'accueil = index.html (protégée)
app.get('/accueil', authenticateToken, (req, res) => {
    res.json('Vous êtes dans la page d\'accueil. Soyez les bienvenus sur cette page');
});

//route pour les matchs
app.post('/matchs', (req, res) => {
  const { equipe1, equipe2, butsEquipe1, butsEquipe2 } = req.body;
  
  const query = "INSERT INTO Matchs (Equipe1, Equipe2, Butequipe1, Butequipe2) VALUES (?, ?, ?, ?)";
  bddConnection.query(query, [equipe1, equipe2, butsEquipe1, butsEquipe2], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erreur lors de l'ajout du match" });
      }
      res.status(201).json({ message: "Match ajouté avec succès !" });
  });
});

//route pour les equipes
app.post('/equipes', (req, res) => {
  const { nom } = req.body;
  
  const query = "INSERT INTO Equipe (nom) VALUES (?)";
  bddConnection.query(query, [nom], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erreur lors de l'ajout de l'équipe" });
      }
      res.status(201).json({ message: "Equipe ajoutée avec succès !" });
  });
});

//route pour ajouter un classement 
app.post('/classement', (req, res) => {
    const { nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs } = req.body;
    
    const query = "INSERT INTO Classement (nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    bddConnection.query(query, [nom, matchsJoues, gagne, perdu, nul, points, butsPour, butsContre, differenceButs], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de l'ajout du classement" });
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

// route pour ajouter un vainqueur 
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
const { nom } = req.body;
console.log("nom: " + nom);

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