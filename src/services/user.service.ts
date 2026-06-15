import { Role } from "../generated/prisma"; 
import { prisma } from "../prisma"; 
import bcrypt from "bcrypt";

export class UserService {
    
    async create(name: string, email: string, passwordPlain: string, role?: Role) {
        if (!name || !email || !passwordPlain) {
            throw new Error("Nome, email e palavra-passe são obrigatórios.");
        }

        const emailExists = await prisma.user.findUnique({
            where: { email }
        });
        if (emailExists) {
            throw new Error("Este email já se encontra registado.");
        }

        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        return await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || Role.PATIENT // Se não passarmos papel, assume PATIENT por padrão
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
                // Excluímos a password do select para ela nunca ser devolvida na resposta HTTP!
            }
        });
    }

    async listAll() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
    }

    async update(id: string, name?: string, email?: string) {
        // Verifica se o utilizador existe
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            throw new Error("Utilizador não encontrado.");
        }

        // Verifica se já não pertence a outra pessoa
        if (email && email !== userExists.email) {
            const emailDuplicate = await prisma.user.findUnique({
                where: { email }
            });

            if (emailDuplicate) {
                throw new Error("Este email já está a ser utilizado por outro utilizador.");
            }
        }

        return await prisma.user.update({
            where: { id },
            data: {
                name: name ?? userExists.name,
                email: email ?? userExists.email
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
    }

    async delete(id: string) {
        const userExists = await prisma.user.findUnique({ where: { id } });

        if (!userExists) {
            throw new Error("Utilizador não encontrado.");
        }

        // 1. Se for DOCTOR, precisamos de limpar os slots de disponibilidade e o perfil de médico
        if (userExists.role === "DOCTOR") {
            const doctorProfile = await prisma.doctor.findUnique({ where: { userId: id } });
            
            if (doctorProfile) {
                // Apaga as consultas associadas aos slots deste médico
                await prisma.appointment.deleteMany({
                    where: { slot: { doctorId: doctorProfile.id } }
                });
                // Apaga os slots de disponibilidade do médico
                await prisma.availabilitySlot.deleteMany({ where: { doctorId: doctorProfile.id } });
                // Apaga o perfil de médico
                await prisma.doctor.delete({ where: { id: doctorProfile.id } });
            }
        }

        // 2. Se for PATIENT, precisamos de apagar as consultas que ele agendou
        if (userExists.role === "PATIENT") {
            await prisma.appointment.deleteMany({ where: { patientId: id } });
        }

        // 3. Agora que a casa está limpa, podemos apagar o utilizador sem dar erro!
        return await prisma.user.delete({
            where: { id }
        });
    }
}