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
const port = 9100; 
const app = express();
 
// Limite de requêtes pour éviter le spam (5 requêtes max par minute par IP)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: "Trop de tentatives. Réessayez plus tard.",
});

app.use(limiter); // Appliquer à toutes les routes

// Route sécurisée pour l'ajout d'admin avec hachage du mot de passe
app.post('/admin', async (req, res) => {
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

//------------------------

// Route sécurisée pour la connexion de l'admin
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM Admin WHERE username = ?";
    bddConnection.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erreur lors de la connexion de l'admin" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Admin non trouvé" });
        }

        const hashedPassword = results[0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        // Générer un token d'authentification
        const accessToken = jwt.sign({ username: results[0].username }, process.env.ACCESS_TOKEN_SECRET);

        res.json({ accessToken: accessToken });
    });
});
//------------------------

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Utilisation de cookie-parser

//Connexion à la base de données
const bddConnection = mysql.createConnection({
    host: 'localhost',
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
        res.status(500).send();
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
                res.send('Mot de passe incorrect');
            }
        } catch {
            res.status(500).send();
        }
    });
});

// Route à emprunter dans le navigateur
app.get('/', (req, res) => {
    res.send('Bonjour, ceci est notre serveur (back-end), soyez les bienvenus ! ajouter un /accueil dans URL pour accéder à la page d\'accueil');
});

// Route pour la page d'accueil (protégée)
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
    let user = { equipe: 'Equipe 1', classement: 1 };
    bddConnection.query('INSERT INTO users SET ?', user, function (err, rows) {
        if (err) throw err;
        res.send('Utilisateur ajouté à la base de données');
    });
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
        } else if (Butequipe2 > Butequipe1) {
            // Équipe 2 gagne
            classement[Equipe2].points += 3;
        } else {
            // Match nul
            classement[Equipe1].points += 1;
            classement[Equipe2].points += 1;
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
            return b.butsPour - a.butsPour; // Tri par buts pour
        }
    });
  
    return classementArray;
}