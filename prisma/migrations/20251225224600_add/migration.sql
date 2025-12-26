-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

-- CreateIndex
CREATE UNIQUE INDEX "Session_code_key" ON "Session"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Like_jellyfinItemId_jellyfinUserId_key" ON "Like"("jellyfinItemId", "jellyfinUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Hidden_jellyfinItemId_jellyfinUserId_key" ON "Hidden"("jellyfinItemId", "jellyfinUserId");
