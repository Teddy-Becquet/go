-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 02 avr. 2025 à 11:43
-- Version du serveur : 10.5.23-MariaDB-0+deb11u1
-- Version de PHP : 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Classements`
--

-- --------------------------------------------------------

--
-- Structure de la table `Admin`
--

CREATE TABLE `Admin` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `mdp` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `Admin`
--

INSERT INTO `Admin` (`id`, `nom`, `mdp`) VALUES
(1, 'admin', '$2b$10$WxGxT1AIfLqgtmxyVx7iwe2QrAP2i.FDBr9ezmV.Sz96UbiPVMKLK'),
(2, 'admin1', '$2b$10$WbCcbIdCkB1bpO3aTFJOu.xcPVsE07GaXqzg.2Te/7gjnQRD24jkG'),
(3, 'admin1', '$2b$10$C2HAcD0o5zx725.5sH3Ige7WBO7NdHYoDNxKHTEsjpiqUdm9BMRSu'),
(4, 'admin1', '$2b$10$r7aAQ0w5QDy1NOb5eoYue.FgI.GYAAyAMFZcv6DC5HvebIYGwqu0y'),
(5, 'admin1', '$2b$10$gtpDB2AMN/xOczoU6tk9u.OXgxe5qSnL5UMlWt5tPIYxeuv4zUUY.');

-- --------------------------------------------------------

--
-- Structure de la table `Classement`
--

CREATE TABLE `Classement` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `matchsJoues` int(11) NOT NULL DEFAULT 0,
  `gagne` int(11) NOT NULL DEFAULT 0,
  `perdu` int(11) NOT NULL DEFAULT 0,
  `nul` int(11) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0,
  `butsPour` int(11) NOT NULL DEFAULT 0,
  `butsContre` int(11) NOT NULL DEFAULT 0,
  `differenceButs` int(11) NOT NULL DEFAULT 0
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
(4, '1BAC PRO'),
(5, '2TNE'),
(7, '3PM'),
(3, 'BTS ELEC'),
(1, 'CIEL1'),
(2, 'CIEL2'),
(6, 'TLES BAC PRO');

-- --------------------------------------------------------

--
-- Structure de la table `Matchs`
--

CREATE TABLE `Matchs` (
  `id` int(11) NOT NULL,
  `Equipe1` int(11) NOT NULL,
  `Equipe2` int(11) NOT NULL,
  `Butequipe1` int(11) NOT NULL DEFAULT 0,
  `Butequipe2` int(11) NOT NULL DEFAULT 0
) ;

--
-- Déchargement des données de la table `Matchs`
--

INSERT INTO `Matchs` (`id`, `Equipe1`, `Equipe2`, `Butequipe1`, `Butequipe2`) VALUES
(5, 1, 2, 3, 1),
(6, 3, 4, 2, 2),
(7, 1, 3, 2, 0),
(8, 2, 4, 1, 3),
(9, 1, 2, 3, 1),
(10, 3, 4, 2, 2),
(11, 4, 3, 2, 0);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nom` varchar(50) DEFAULT NULL,
  `mdp` varchar(255) DEFAULT NULL,
  `classement` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nom`, `mdp`, `classement`) VALUES
(1, 'admin', '$2b$10$WxGxT1AIfLqgtmxyVx7iwe2QrAP2i.FDBr9ezmV.Sz96UbiPVMKLK', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `Vainqueur`
--

CREATE TABLE `Vainqueur` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `Admin`
--
ALTER TABLE `Admin`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `Classement`
--
ALTER TABLE `Classement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nom` (`nom`);

--
-- Index pour la table `equipe`
--
ALTER TABLE `equipe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `Matchs`
--
ALTER TABLE `Matchs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Equipe1` (`Equipe1`),
  ADD KEY `Equipe2` (`Equipe2`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Index pour la table `Vainqueur`
--
ALTER TABLE `Vainqueur`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nom` (`nom`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `Admin`
--
ALTER TABLE `Admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `Classement`
--
ALTER TABLE `Classement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `equipe`
--
ALTER TABLE `equipe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `Matchs`
--
ALTER TABLE `Matchs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `Vainqueur`
--
ALTER TABLE `Vainqueur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Classement`
--
ALTER TABLE `Classement`
  ADD CONSTRAINT `Classement_ibfk_1` FOREIGN KEY (`nom`) REFERENCES `equipe` (`nom`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `Matchs`
--
ALTER TABLE `Matchs`
  ADD CONSTRAINT `Matchs_ibfk_1` FOREIGN KEY (`Equipe1`) REFERENCES `equipe` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Matchs_ibfk_2` FOREIGN KEY (`Equipe2`) REFERENCES `equipe` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `Vainqueur`
--
ALTER TABLE `Vainqueur`
  ADD CONSTRAINT `Vainqueur_ibfk_1` FOREIGN KEY (`nom`) REFERENCES `equipe` (`nom`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
