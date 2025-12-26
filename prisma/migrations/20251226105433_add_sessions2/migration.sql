/*
  Warnings:

  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Swipe` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hostUserId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SessionUser_userId_sessionId_key";

-- DropIndex
DROP INDEX "Swipe_userId_itemId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Match";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SessionUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Swipe";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jellyfinItemId" TEXT NOT NULL,
    "jellyfinUserId" TEXT NOT NULL,
    "isMatch" BOOLEAN NOT NULL DEFAULT false,
    "sessionCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_sessionCode_fkey" FOREIGN KEY ("sessionCode") REFERENCES "Session" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hidden" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jellyfinItemId" TEXT NOT NULL,
    "jellyfinUserId" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Session" ("code", "createdAt", "id") SELECT "code", "createdAt", "id" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_code_key" ON "Session"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Like_jellyfinItemId_jellyfinUserId_key" ON "Like"("jellyfinItemId", "jellyfinUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Hidden_jellyfinItemId_jellyfinUserId_key" ON "Hidden"("jellyfinItemId", "jellyfinUserId");
