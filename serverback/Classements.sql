-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 23 avr. 2025 à 02:11
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `classements`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_classements` ()  DETERMINISTIC BEGIN
    -- Réinitialiser le classement
    UPDATE Classement SET 
        matchsJoues = 0, 
        gagne = 0, 
        perdu = 0, 
        nul = 0, 
        points = 0, 
        butsPour = 0, 
        butsContre = 0, 
        differenceButs = 0;

    -- Mettre à jour à partir des matchs terminés
    UPDATE Classement c
    JOIN equipe e ON c.equipe = e.id
    LEFT JOIN (
        SELECT 
            Equipe1 as equipe_id,
            COUNT(*) as joues,
            SUM(CASE WHEN Butequipe1 > Butequipe2 THEN 1 ELSE 0 END) as victoires,
            SUM(CASE WHEN Butequipe1 < Butequipe2 THEN 1 ELSE 0 END) as defaites,
            SUM(CASE WHEN Butequipe1 = Butequipe2 THEN 1 ELSE 0 END) as nuls,
            SUM(CASE WHEN Butequipe1 > Butequipe2 THEN 3 WHEN Butequipe1 = Butequipe2 THEN 1 ELSE 0 END) as pts,
            SUM(Butequipe1) as bp,
            SUM(Butequipe2) as bc
        FROM Matchs
        WHERE statut = 'terminé'
        GROUP BY Equipe1
    ) as home ON home.equipe_id = c.equipe
    SET 
        c.matchsJoues = IFNULL(home.joues, 0),
        c.gagne = IFNULL(home.victoires, 0),
        c.perdu = IFNULL(home.defaites, 0),
        c.nul = IFNULL(home.nuls, 0),
        c.points = IFNULL(home.pts, 0),
        c.butsPour = IFNULL(home.bp, 0),
        c.butsContre = IFNULL(home.bc, 0);

    -- Ajouter les matchs à l'extérieur
    UPDATE Classement c
    JOIN equipe e ON c.equipe = e.id
    LEFT JOIN (
        SELECT 
            Equipe2 as equipe_id,
            COUNT(*) as joues,
            SUM(CASE WHEN Butequipe2 > Butequipe1 THEN 1 ELSE 0 END) as victoires,
            SUM(CASE WHEN Butequipe2 < Butequipe1 THEN 1 ELSE 0 END) as defaites,
            SUM(CASE WHEN Butequipe2 = Butequipe1 THEN 1 ELSE 0 END) as nuls,
            SUM(CASE WHEN Butequipe2 > Butequipe1 THEN 3 WHEN Butequipe2 = Butequipe1 THEN 1 ELSE 0 END) as pts,
            SUM(Butequipe2) as bp,
            SUM(Butequipe1) as bc
        FROM Matchs
        WHERE statut = 'terminé'
        GROUP BY Equipe2
    ) as away ON away.equipe_id = c.equipe
    SET 
        c.matchsJoues = c.matchsJoues + IFNULL(away.joues, 0),
        c.gagne = c.gagne + IFNULL(away.victoires, 0),
        c.perdu = c.perdu + IFNULL(away.defaites, 0),
        c.nul = c.nul + IFNULL(away.nuls, 0),
        c.points = c.points + IFNULL(away.pts, 0),
        c.butsPour = c.butsPour + IFNULL(away.bp, 0),
        c.butsContre = c.butsContre + IFNULL(away.bc, 0);

    -- Calculer les différences de buts
    UPDATE Classement
    SET differenceButs = butsPour - butsContre;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `matchs` int(11) NOT NULL DEFAULT 0,
  `users` int(11) NOT NULL DEFAULT 0,
  `equipe1` int(11) NOT NULL DEFAULT 0,
  `equipe2` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin`
--

INSERT INTO `admin` (`id`, `nom`, `mdp`, `email`, `matchs`, `users`, `equipe1`, `equipe2`) VALUES
(1, 'admin', '$2b$10$rIU60nWMiMhKVFMdKNUY9e2zxIOTe.CuLx1Yb8mQNYdXKWh.1XqiW', 'admin@tournoi.fr', 0, 0, 0, 0),
(2, 'moderateur', '$2b$10$xJKL39TvQPzI5bQ.8TpmY.E3V3K4XZ5rBGYZl7fH3zOXrhd8wyXJO', 'mod@tournoi.fr', 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `classement`
--

CREATE TABLE `classement` (
  `id` int(11) NOT NULL,
  `equipe` int(11) NOT NULL,
  `matchsJoues` int(11) NOT NULL DEFAULT 0,
  `gagne` int(11) NOT NULL DEFAULT 0,
  `perdu` int(11) NOT NULL DEFAULT 0,
  `nul` int(11) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  `butsPour` int(11) NOT NULL DEFAULT 0,
  `butsContre` int(11) NOT NULL DEFAULT 0,
  `differenceButs` int(11) NOT NULL DEFAULT 0,
  `annee` varchar(20) DEFAULT '2024-2025'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `equipe`
--

CREATE TABLE `equipe` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `equipe`
--

INSERT INTO `equipe` (`id`, `nom`) VALUES
(11, '1 BAC PRO'),
(10, '2TNE'),
(13, '3PM'),
(9, 'BTS ELEC'),
(7, 'CIEL1'),
(8, 'CIEL2'),
(12, 'TLES BAC PRO');

-- --------------------------------------------------------

--
-- Structure de la table `inscription`
--

CREATE TABLE `inscription` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `mail` varchar(100) NOT NULL,
  `mdp` varchar(100) NOT NULL,
  `DateDeNaissance` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `journal`
--

CREATE TABLE `journal` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `operation` varchar(20) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `date_operation` datetime DEFAULT current_timestamp(),
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `journal`
--

INSERT INTO `journal` (`id`, `table_name`, `operation`, `admin_id`, `date_operation`, `details`) VALUES
(7, 'admin_toto', 'admin_admin', 1, '2025-04-01 21:47:48', 'premier matchs');

-- --------------------------------------------------------

--
-- Structure de la table `login`
--

CREATE TABLE `login` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `mdp` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matchs`
--

CREATE TABLE `matchs` (
  `id` int(11) NOT NULL,
  `Equipe1` int(11) NOT NULL,
  `Equipe2` int(11) NOT NULL,
  `Butequipe1` int(11) NOT NULL DEFAULT 0,
  `Butequipe2` int(11) NOT NULL DEFAULT 0,
  `date_match` datetime DEFAULT current_timestamp(),
  `lieu` varchar(100) DEFAULT NULL,
  `statut` enum('programmé','en cours','terminé','annulé') DEFAULT 'programmé'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `matchs`
--

INSERT INTO `matchs` (`id`, `Equipe1`, `Equipe2`, `Butequipe1`, `Butequipe2`, `date_match`, `lieu`, `statut`) VALUES
(8, 11, 7, 3, 0, '2025-04-01 21:37:24', NULL, 'terminé'),
(9, 11, 8, 2, 4, '2025-04-02 21:37:24', NULL, 'terminé'),
(10, 11, 9, 3, 3, '2025-04-03 21:37:24', NULL, 'terminé'),
(11, 11, 10, 2, 1, '2025-04-04 21:37:24', NULL, 'terminé'),
(12, 11, 12, 2, 5, '2025-04-05 21:37:24', NULL, 'terminé'),
(13, 11, 13, 9, 0, '2025-04-06 21:37:24', NULL, 'terminé'),
(14, 10, 7, 4, 2, '2025-04-07 21:37:24', NULL, 'terminé'),
(15, 10, 8, 2, 6, '2025-04-08 21:37:24', NULL, 'terminé'),
(16, 10, 9, 4, 5, '2025-04-09 21:37:24', NULL, 'terminé'),
(17, 10, 12, 4, 3, '2025-04-10 21:37:24', NULL, 'terminé'),
(18, 10, 13, 8, 1, '2025-04-11 21:37:24', NULL, 'terminé'),
(19, 13, 7, 1, 10, '2025-04-12 21:37:24', NULL, 'terminé'),
(20, 13, 8, 0, 12, '2025-04-13 21:37:24', NULL, 'terminé'),
(21, 13, 9, 0, 10, '2025-04-14 21:37:24', NULL, 'terminé'),
(22, 13, 12, 0, 9, '2025-04-15 21:37:24', NULL, 'terminé'),
(23, 9, 7, 0, 0, '2025-04-16 21:37:24', NULL, 'terminé'),
(24, 9, 8, 0, 0, '2025-04-20 21:37:24', NULL, 'terminé'),
(25, 9, 12, 2, 3, '2025-04-21 21:37:24', NULL, 'terminé'),
(26, 7, 8, 1, 1, '2025-04-22 21:37:24', NULL, 'terminé'),
(27, 7, 9, 2, 3, '2025-04-23 21:37:24', NULL, 'terminé'),
(28, 11, 7, 3, 0, '2025-04-01 21:37:24', NULL, 'terminé'),
(29, 11, 8, 2, 4, '2025-04-02 21:37:24', NULL, 'terminé'),
(30, 11, 9, 3, 3, '2025-04-03 21:37:24', NULL, 'terminé'),
(31, 11, 10, 2, 1, '2025-04-04 21:37:24', NULL, 'terminé'),
(32, 11, 12, 2, 5, '2025-04-05 21:37:24', NULL, 'terminé'),
(33, 11, 13, 9, 0, '2025-04-06 21:37:24', NULL, 'terminé'),
(34, 10, 7, 4, 2, '2025-04-07 21:37:24', NULL, 'terminé'),
(35, 10, 8, 2, 6, '2025-04-08 21:37:24', NULL, 'terminé'),
(36, 10, 9, 4, 5, '2025-04-09 21:37:24', NULL, 'terminé'),
(37, 10, 12, 4, 3, '2025-04-10 21:37:24', NULL, 'terminé'),
(38, 10, 13, 8, 1, '2025-04-11 21:37:24', NULL, 'terminé'),
(39, 13, 7, 1, 10, '2025-04-12 21:37:24', NULL, 'terminé'),
(40, 13, 8, 0, 12, '2025-04-13 21:37:24', NULL, 'terminé'),
(41, 13, 9, 0, 10, '2025-04-14 21:37:24', NULL, 'terminé'),
(42, 13, 12, 0, 9, '2025-04-15 21:37:24', NULL, 'terminé'),
(43, 9, 7, 0, 0, '2025-04-16 21:37:24', NULL, 'terminé'),
(44, 9, 8, 0, 0, '2025-04-20 21:37:24', NULL, 'terminé'),
(45, 9, 12, 2, 3, '2025-04-21 21:37:24', NULL, 'terminé'),
(46, 7, 8, 1, 1, '2025-04-22 21:37:24', NULL, 'terminé'),
(47, 7, 9, 2, 3, '2025-04-23 21:37:24', NULL, 'terminé');

--
-- Déclencheurs `matchs`
--
DELIMITER $$
CREATE TRIGGER `after_match_update` AFTER UPDATE ON `matchs` FOR EACH ROW BEGIN
    IF NEW.statut = 'terminé' AND OLD.statut != 'terminé' THEN
        CALL update_classements();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `role` enum('user','moderator') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `mdp`, `role`) VALUES
(5, 'Jojo123', 'Jojo', 'user'),
(6, 'toto1', 'toto', 'moderator');

-- --------------------------------------------------------

--
-- Structure de la table `vainqueur`
--

CREATE TABLE `vainqueur` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `equipe` int(11) DEFAULT NULL,
  `annee` varchar(20) DEFAULT '2024'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_matchs`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_matchs` (
`id` int(11)
,`Equipe1` int(11)
,`Equipe2` int(11)
,`Butequipe1` int(11)
,`Butequipe2` int(11)
,`nom_equipe1` varchar(100)
,`nom_equipe2` varchar(100)
,`date_match` datetime
,`lieu` varchar(100)
,`statut` enum('programmé','en cours','terminé','annulé')
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_matchs`
--
DROP TABLE IF EXISTS `vue_matchs`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_matchs`  AS SELECT `m`.`id` AS `id`, `m`.`Equipe1` AS `Equipe1`, `m`.`Equipe2` AS `Equipe2`, `m`.`Butequipe1` AS `Butequipe1`, `m`.`Butequipe2` AS `Butequipe2`, `e1`.`nom` AS `nom_equipe1`, `e2`.`nom` AS `nom_equipe2`, `m`.`date_match` AS `date_match`, `m`.`lieu` AS `lieu`, `m`.`statut` AS `statut` FROM ((`matchs` `m` join `equipe` `e1` on(`m`.`Equipe1` = `e1`.`id`)) join `equipe` `e2` on(`m`.`Equipe2` = `e2`.`id`)) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `classement`
--
ALTER TABLE `classement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipe_id` (`equipe`);

--
-- Index pour la table `equipe`
--
ALTER TABLE `equipe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `inscription`
--
ALTER TABLE `inscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `journal`
--
ALTER TABLE `journal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Index pour la table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `matchs`
--
ALTER TABLE `matchs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Equipe1` (`Equipe1`),
  ADD KEY `Equipe2` (`Equipe2`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`nom`);

--
-- Index pour la table `vainqueur`
--
ALTER TABLE `vainqueur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`),
  ADD KEY `equipe_id` (`equipe`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `classement`
--
ALTER TABLE `classement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `equipe`
--
ALTER TABLE `equipe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `inscription`
--
ALTER TABLE `inscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `journal`
--
ALTER TABLE `journal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `login`
--
ALTER TABLE `login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `matchs`
--
ALTER TABLE `matchs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `vainqueur`
--
ALTER TABLE `vainqueur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `classement`
--
ALTER TABLE `classement`
  ADD CONSTRAINT `classement_ibfk_1` FOREIGN KEY (`equipe`) REFERENCES `equipe` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `journal`
--
ALTER TABLE `journal`
  ADD CONSTRAINT `journal_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `matchs`
--
ALTER TABLE `matchs`
  ADD CONSTRAINT `matchs_ibfk_1` FOREIGN KEY (`Equipe1`) REFERENCES `equipe` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matchs_ibfk_2` FOREIGN KEY (`Equipe2`) REFERENCES `equipe` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vainqueur`
--
ALTER TABLE `vainqueur`
  ADD CONSTRAINT `vainqueur_ibfk_1` FOREIGN KEY (`equipe`) REFERENCES `equipe` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
