-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 15, 2026 at 11:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `idf_tdg`
--
CREATE DATABASE IF NOT EXISTS `idf_tdg` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `idf_tdg`;

-- --------------------------------------------------------

--
-- Table structure for table `achievement`
--

DROP TABLE IF EXISTS `achievement`;
CREATE TABLE `achievement` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `icon` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `achievement`
--

INSERT INTO `achievement` (`id`, `name`, `description`, `icon`) VALUES
('00c6733d-f4d5-4214-a7a1-d0935fd42d53', 'First Blood', 'Kill your first enemy', '🩸'),
('10d5245b-b37f-4ca5-87c5-a12c87ddb39d', 'Wave Warrior', 'Survive 10 waves', '⚔️'),
('2616fd04-353e-4b1d-ab19-a91099835612', 'Untouchable', 'Finish a wave without losing a life', '🛡️'),
('934093fc-21b9-4d90-ad56-733ced3e1674', 'Gold Hoarder', 'Accumulate 1000 gold', '💰'),
('be1a97d4-a1d5-4b7b-8bf0-26b071ff12c8', 'Tower Master', 'Place 20 towers in one game', '🏰');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`) VALUES
('bef76584-f873-44c0-90d6-1f65ed036165', 'admin'),
('0cfb282f-58e6-47e8-a032-a7073cf699de', 'guest'),
('d0eeb308-5b7e-4b38-99bf-1e93c6b8570a', 'moderator'),
('0d69c2f0-b345-4d4f-8ff2-be11db5b2e35', 'owner'),
('3191c428-1083-4226-8657-5657494753f9', 'player');

-- --------------------------------------------------------

--
-- Table structure for table `score`
--

DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `score` int(11) NOT NULL,
  `wavesReached` int(11) NOT NULL,
  `playedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `score`
--

INSERT INTO `score` (`id`, `userId`, `score`, `wavesReached`, `playedAt`) VALUES
('2a7d19f8-f4a4-4955-9b90-f3198f6ca91c', '3d0dc6ac-585f-458d-be21-03aa83f7875f', 75540, 21, '2026-04-15 15:34:12.144'),
('44ef1bce-f5ca-4ee2-8172-b7d16213f8b4', '3d0dc6ac-585f-458d-be21-03aa83f7875f', 310, 2, '2026-04-15 15:47:10.943');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `roleId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `username`, `passwordHash`, `createdAt`, `roleId`) VALUES
('3d0dc6ac-585f-458d-be21-03aa83f7875f', 'Micha@gmail.com', 'Micha', '$2b$10$D.gM6OU6Mu/7aqJcq2cDhOWDdhyXW6.5zklJCShbvT/L5vyR6LAR.', '2026-04-15 11:09:11.348', '0d69c2f0-b345-4d4f-8ff2-be11db5b2e35'),
('49c476b7-bb1b-4ef7-85cd-7c5ca3717f7e', 'Admin@gmail.com', 'Admin', '$2b$10$Va6gaLfVHJZHMmfKvcrHwO8DaMDSR33p.P1deLdpq9TNiUB/o8R0K', '2026-04-15 20:55:44.138', 'bef76584-f873-44c0-90d6-1f65ed036165'),
('6c3b9913-3d8a-4cbc-bcdc-98c7bcff6e55', 'User@gmail.com', 'User', '$2b$10$mKBvfgKdMBoZ4XyHphN5uOenD4Fuo.2CXERG.nzWiuBaqyvANpZOG', '2026-04-15 16:04:14.834', '3191c428-1083-4226-8657-5657494753f9'),
('6dd7af03-3441-4f4e-9914-bcc9fa699acb', 'Moderator@gmail.com', 'Moderator', '$2b$10$vfqI5201KJ2h7U795QqNC.gtPOtw2ktZeJn9WeQF8Tu.W4akTIOym', '2026-04-15 20:56:06.174', 'd0eeb308-5b7e-4b38-99bf-1e93c6b8570a');

-- --------------------------------------------------------

--
-- Table structure for table `userachievement`
--

DROP TABLE IF EXISTS `userachievement`;
CREATE TABLE `userachievement` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `achievementId` varchar(191) NOT NULL,
  `unlockedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `userachievement`
--

INSERT INTO `userachievement` (`id`, `userId`, `achievementId`, `unlockedAt`) VALUES
('ac550131-a441-4511-a12a-d1de60f7e608', '3d0dc6ac-585f-458d-be21-03aa83f7875f', '10d5245b-b37f-4ca5-87c5-a12c87ddb39d', '2026-04-15 15:34:12.178');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievement`
--
ALTER TABLE `achievement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Achievement_name_key` (`name`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Indexes for table `score`
--
ALTER TABLE `score`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Score_userId_fkey` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_username_key` (`username`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Indexes for table `userachievement`
--
ALTER TABLE `userachievement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserAchievement_userId_achievementId_key` (`userId`,`achievementId`),
  ADD KEY `UserAchievement_achievementId_fkey` (`achievementId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `score`
--
ALTER TABLE `score`
  ADD CONSTRAINT `Score_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `userachievement`
--
ALTER TABLE `userachievement`
  ADD CONSTRAINT `UserAchievement_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `achievement` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `UserAchievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
