import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma";

// O adaptador nesta versão precisa apenas do objeto com o caminho do ficheiro
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});

// Inicializamos o PrismaClient injetando o adaptador corrigido
export const prisma = new PrismaClient({ adapter });