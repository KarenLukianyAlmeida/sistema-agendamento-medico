import { prisma } from "../prisma";


export class SpecialityService {
    //Cria nova especialidade médica
    async create(name: string) {
        const formattedName = name.toUpperCase().trim();

        //Valida se especialidade já exite
        const exists = await prisma.speciality.findUnique({
            where: { name: formattedName },
        });

        if (exists) {
            throw new Error("Especialidade já se encontra registrada.");
        }

        return await prisma.speciality.create({
            data: {
                name: formattedName,
            },
        });
    }

    //Lista todas as especialidades médicas
    async listAll() {
        return await prisma.speciality.findMany({
            orderBy: { name: "asc"},
        });
    }
}