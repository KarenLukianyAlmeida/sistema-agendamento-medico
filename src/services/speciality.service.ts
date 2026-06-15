import { prisma } from "../prisma";


export class SpecialityService {
    //Lista todas as especialidades médicas
    async listAll() {
        return await prisma.speciality.findMany({
            orderBy: { name: "asc"},
        });
    }

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

    //Atualiza especialidade médica
    async update(id: string, newName: string) {
        //Verifica se a especialidade existe
        const exists = await prisma.speciality.findUnique({
            where: { id },
        });
        if (!exists) {
            throw new Error("Especialidade não encontrada.");
        }

        const formattedName = newName.trim().toUpperCase();

        //verifica se já há uma especialidade com mesmo nome
        const nameDuplicate = await prisma.speciality.findUnique({
            where: { name: formattedName },
        });
        if (nameDuplicate && nameDuplicate.id !== id) {
            throw new Error("Já existe outra especialidade com esse nome.");
        }   

        //Atualiza especialidade com novo nome
        const speciality = await prisma.speciality.update({
            where : { id },
            data: { name: formattedName }
        });
    }

    //Exclui especialidade médica
    async delete(id: string) {
        // 1. Verifica se a especialidade existe primeiro
        const specialityExists = await prisma.speciality.findUnique({
            where: { id }
        });

        if (!specialityExists) {
            throw new Error("A especialidade indicada não existe no sistema."); // Erro de negócio (404)
        }

        // 2. Verifica se existem médicos associados a esta especialidade
        const linkedDoctors = await prisma.doctor.findFirst({
            where: { specialityId: id }
        });

        if (linkedDoctors) {
            throw new Error("Não é possível eliminar uma especialidade que possui médicos vinculados."); // Erro de negócio (400)
        }

        // 3. Se passou pelas validações, apaga com segurança
        return await prisma.speciality.delete({
            where: { id }
        });
    }
}