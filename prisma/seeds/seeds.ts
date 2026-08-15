import prisma from "../../src/prisma/prisma";
import { setSeedsInDB } from "./scripts";

setSeedsInDB()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
