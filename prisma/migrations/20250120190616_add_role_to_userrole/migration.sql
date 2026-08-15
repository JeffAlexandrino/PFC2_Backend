/*
  Warnings:

  - Added the required column `role` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "role" "Role" NOT NULL;
