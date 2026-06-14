import { prisma } from "../prisma";

export class AvailabilityService {

    // Cria um slot de tempo livre para um médico
    async create(doctorId: string, dateTimeInput: string) {
        if (!doctorId || !dateTimeInput) {
            throw new Error("ID do médico e a data/hora do slot são obrigatórios.");
        }

        // 1. Converte a string que vem do Postman em objeto Date
        const slotDateTime = new Date(dateTimeInput);

        // 2. Verifica se o perfil do médico realmente existe
        const doctorExists = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });
        if (!doctorExists) {
            throw new Error("O médico indicado não existe.");
        }

        // 3. VALIDAÇÃO DE SOBREPOSIÇÃO (Evita duplicar exatamente o mesmo horário)
        const overlappingSlot = await prisma.availabilitySlot.findFirst({
            where: {
                doctorId: doctorId,
                dateTime: slotDateTime
            }
        });

        if (overlappingSlot) {
            throw new Error("Este médico já tem uma disponibilidade registada para este mesmo horário.");
        }

        // 4. Cria o slot (O isBooked já começa como false por padrão no teu schema)
        return await prisma.availabilitySlot.create({
            data: {
                doctorId,
                dateTime: slotDateTime
            }
        });
    }

    // Listar disponibilidades livres (Onde isBooked é false)
    async listAllAvailable() {
        return await prisma.availabilitySlot.findMany({
            where: { isBooked: false }, // No teu schema, livre significa isBooked: false
            include: {
                doctor: {
                    include: {
                        user: { select: { name: true } },
                        speciality: { select: { name: true } }
                    }
                }
            },
            orderBy: { dateTime: "asc" }
        });
    }

    // Listar todos os slots (livres ou ocupados) de um médico específico
    async listByDoctor(doctorId: string) {
        if (!doctorId) {
            throw new Error("O ID do médico é obrigatório.");
        }

        return await prisma.availabilitySlot.findMany({
            where: { doctorId },
            include: {
                appointment: true // Permite ver se o slot já gerou uma consulta marcada
            },
            orderBy: { dateTime: "asc" }
        });
    }

    // Atualizar a data/hora de um slot existente
    async update(id: string, dateTimeInput: string) {
        if (!id || !dateTimeInput) {
            throw new Error("ID do slot e a nova data/hora são obrigatórios.");
        }

        const slotExists = await prisma.availabilitySlot.findUnique({
            where: { id }
        });

        if (!slotExists) {
            throw new Error("Slot de disponibilidade não encontrado.");
        }

        // Se o slot já estiver reservado (isBooked: true), não faz sentido mudá-lo de hora sem avisar o paciente
        if (slotExists.isBooked) {
            throw new Error("Não é possível alterar um horário que já possui um agendamento marcado.");
        }

        const newDateTime = new Date(dateTimeInput);

        // Verifica se o novo horário não vai colidir com outro slot do MESMO médico
        const overlappingSlot = await prisma.availabilitySlot.findFirst({
            where: {
                doctorId: slotExists.doctorId,
                dateTime: newDateTime,
                NOT: { id } // Ignora o próprio slot que estamos a atualizar
            }
        });

        if (overlappingSlot) {
            throw new Error("Este médico já tem uma disponibilidade registada para este mesmo horário.");
        }

        return await prisma.availabilitySlot.update({
            where: { id },
            data: { dateTime: newDateTime }
        });
    }

    // Eliminar um slot de disponibilidade
    async delete(id: string) {
        if (!id) {
            throw new Error("O ID do slot é obrigatório.");
        }

        const slotExists = await prisma.availabilitySlot.findUnique({
            where: { id }
        });

        if (!slotExists) {
            throw new Error("Slot de disponibilidade não encontrado.");
        }

        if (slotExists.isBooked) {
            throw new Error("Não é possível eliminar um horário que já possui uma consulta marcada.");
        }

        return await prisma.availabilitySlot.delete({
            where: { id }
        });
    }
}