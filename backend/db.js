import {PrismaClient} from "./generated/prisma/client.ts"
import "dotenv/config"

export const prisma = new PrismaClient()
