/*
  Warnings:

  - You are about to drop the column `tag` on the `Tag` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("color", "createdAt", "id", "name", "updatedAt", "userId") SELECT "color", "createdAt", "id", "name", "updatedAt", "userId" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
