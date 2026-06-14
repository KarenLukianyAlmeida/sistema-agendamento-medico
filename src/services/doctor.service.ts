import { prisma } from "../prisma";

export class DoctorService {

    // Cria o perfil do Médico associado a um User e a uma Speciality
    async create(licenseId: string, userId: string, specialityId: string) {
        // 1. Validação de campos obrigatórios
        if (!licenseId || !userId || !specialityId) {
            throw new Error("Cédula profissional, ID do utilizador e ID da especialidade são obrigatórios.");
        }

        // 2. Verifica se já existe algum médico com esta Cédula Profissional (Deve ser única)
        const licenseExists = await prisma.doctor.findUnique({
            where: { licenseId }
        });
        if (licenseExists) {
            throw new Error("Esta cédula profissional já se encontra registada.");
        }

        // 3. Verifica se o Utilizador existe na base de dados
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userExists) {
            throw new Error("O utilizador indicado não existe.");
        }

        // 4. Garante que este Utilizador já não tem OUTRO perfil de médico (Relação 1:1)
        const userAlreadyHasProfile = await prisma.doctor.findUnique({
            where: { userId }
        });
        if (userAlreadyHasProfile) {
            throw new Error("Este utilizador já possui um perfil de médico associado.");
        }

        // 5. Verifica se a Especialidade indicada realmente existe
        const specialityExists = await prisma.speciality.findUnique({
            where: { id: specialityId }
        });
        if (!specialityExists) {
            throw new Error("A especialidade indicada não existe.");
        }

        // 6. Cria o registo do Médico na base de dados
        return await prisma.doctor.create({
            data: {
                licenseId,
                userId,
                specialityId
            },
            // Fazemos um include para a resposta vir rica com os dados do User e da Especialidade!
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                speciality: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    // Lista todos os médicos do sistema com os dados do utilizador e especialidade
    async listAll() {
        return await prisma.doctor.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                speciality: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    // Filtra médicos por uma especialidade específica
    async listBySpeciality(specialityId: string) {
        if (!specialityId) {
            throw new Error("O ID da especialidade é obrigatório para o filtro.");
        }

        // Verifica primeiro se a especialidade existe
        const specialityExists = await prisma.speciality.findUnique({
            where: { id: specialityId }
        });

        if (!specialityExists) {
            throw new Error("A especialidade indicada não existe.");
        }

        // Procura todos os médicos onde a FK specialityId seja igual à informada
        return await prisma.doctor.findMany({
            where: { specialityId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                speciality: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }

    // Atualiza os dados profissionais do médico (Cédula e/ou Especialidade)
    async update(id: string, licenseId?: string, specialityId?: string) {
        // 1. Verifica se o perfil do médico existe
        const doctorExists = await prisma.doctor.findUnique({
            where: { id }
        });

        if (!doctorExists) {
            throw new Error("Perfil de médico não encontrado.");
        }

        // 2. Se a cédula for alterada, garante que não colide com a de outro médico
        if (licenseId && licenseId !== doctorExists.licenseId) {
            const licenseDuplicate = await prisma.doctor.findUnique({
                where: { licenseId }
            });
            if (licenseDuplicate) {
                throw new Error("Esta cédula profissional já está a ser utilizada por outro médico.");
            }
        }

        // 3. Se a especialidade for alterada, garante que a nova especialidade existe
        if (specialityId && specialityId !== doctorExists.specialityId) {
            const specialityExists = await prisma.speciality.findUnique({
                where: { id: specialityId }
            });
            if (!specialityExists) {
                throw new Error("A nova especialidade indicada não existe.");
            }
        }

        // 4. Executa a atualização parcial com o operador ??
        return await prisma.doctor.update({
            where: { id },
            data: {
                licenseId: licenseId ?? doctorExists.licenseId,
                specialityId: specialityId ?? doctorExists.specialityId
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                speciality: {
                    select: { name: true }
                }
            }
        });
    }

    // Elimina o perfil do médico
    async delete(id: string) {
        const doctorExists = await prisma.doctor.findUnique({
            where: { id }
        });

        if (!doctorExists) {
            throw new Error("Perfil de médico não encontrado.");
        }

        return await prisma.doctor.delete({
            where: { id }
        });
    }
}