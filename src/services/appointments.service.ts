import { prisma } from "../prisma";

export class AppointmentService {

    // Cria um agendamento de consulta
    async create(patientId: string, slotId: string) {
        if (!patientId || !slotId) {
            throw new Error("ID do paciente e ID do slot são obrigatórios.");
        }

        // 1. Verifica se o paciente existe
        const patientExists = await prisma.user.findUnique({
            where: { id: patientId }
        });
        if (!patientExists) {
            throw new Error("O paciente indicado não existe.");
        }

        // 2. Verifica se o slot de disponibilidade existe
        const slot = await prisma.availabilitySlot.findUnique({
            where: { id: slotId }
        });
        if (!slot) {
            throw new Error("O horário selecionado não existe.");
        }

        // 3. REQUISITO CRÍTICO: Verifica se o slot já está ocupado
        if (slot.isBooked) {
            throw new Error("Este horário já se encontra reservado por outro paciente.");
        }

        // 4. Cria o agendamento e atualiza o slot para ocupado (Tudo junto e seguro!)
        const [newAppointment] = await prisma.$transaction([
            // Cria o registo na tabela Appointment
            prisma.appointment.create({
                data: {
                    patientId,
                    slotId,
                    status: "SCHEDULED"
                },
                include: {
                    slot: {
                        include: {
                            doctor: {
                                include: {
                                    user: { select: { name: true } },
                                    speciality: { select: { name: true } }
                                }
                            }
                        }
                    },
                    patient: {
                        select: { name: true, email: true }
                    }
                }
            }),
            // Atualiza o slot para reservado
            prisma.availabilitySlot.update({
                where: { id: slotId },
                data: { isBooked: true }
            })
        ]);

        return newAppointment;
    }

    // Listar todas as consultas (Útil para o painel do Administrador)
    async listAll() {
        return await prisma.appointment.findMany({
            include: {
                patient: { select: { name: true, email: true } },
                slot: { include: { doctor: { include: { user: { select: { name: true } } } } } }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    // Cancelar uma consulta e libertar o horário
    async cancel(id: string, reason?: string) {
        if (!id) {
            throw new Error("O ID do agendamento é obrigatório.");
        }

        // 1. Verifica se a consulta existe
        const appointment = await prisma.appointment.findUnique({
            where: { id }
        });

        if (!appointment) {
            throw new Error("Agendamento não encontrado.");
        }

        // 2. Se já estiver cancelada, não faz nada
        if (appointment.status === "CANCELLED") {
            throw new Error("Esta consulta já se encontra cancelada.");
        }

        // 3. Executa a transação: Atualiza o status da consulta E liberta o slot
        const [updatedAppointment] = await prisma.$transaction([
            prisma.appointment.update({
                where: { id },
                data: {
                    status: "CANCELLED",
                    cancellationReason: reason ?? "Cancelado pelo utilizador."
                }
            }),
            prisma.availabilitySlot.update({
                where: { id: appointment.slotId },
                data: { isBooked: false } // O horário volta a ficar LIVRE!
            })
        ]);

        return updatedAppointment;
    }

    // Procura uma consulta específica pelo ID (Auxiliar para validação de segurança)
    async findById(id: string) {
        return await prisma.appointment.findUnique({
            where: { id },
            include: {
                slot: { select: { doctorId: true } }
            }
        });
    }

    // Listar consultas de um Paciente específico
    async listByPatient(patientId: string) {
        return await prisma.appointment.findMany({
            where: { patientId },
            include: {
                slot: { include: { doctor: { include: { user: { select: { name: true } } } } } }
            },
            orderBy: { createdAt: "desc" }
        });
    }

    // Listar consultas de un Médico específico (Filtrando através do slot)
    async listByDoctor(doctorId: string) {
        return await prisma.appointment.findMany({
            where: {
                slot: { doctorId }
            },
            include: {
                patient: { select: { name: true, email: true } },
                slot: { select: { dateTime: true } }
            },
            orderBy: { slot: { dateTime: "asc" } }
        });
    }
}