
import { prisma } from "../src/prisma"; 
import * as bcrypt from "bcrypt";

async function main() {
  console.log("Iniciando povoamento da base de dados (Seed)...");

  // 1. Limpar dados antigos para não haver conflitos de IDs únicos ao repetir o seed
  // A ordem aqui importa devido às chaves estrangeiras!
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.speciality.deleteMany();

  console.log("Base de dados limpa com sucesso.");

  // 2. Criar Especialidades
  console.log("Criando especialidades...");
  const cardio = await prisma.speciality.create({ data: { name: "Cardiologia" } });
  const ped = await prisma.speciality.create({ data: { name: "Pediatria" } });
  const geral = await prisma.speciality.create({ data: { name: "Clínica Geral" } });

  // Password padrão encriptada para os utilizadores de teste
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // 3. Criar Utilizadores (Admin, Médicos e Pacientes)
  console.log("👥 Criando utilizadores...");
  
  const adminUser = await prisma.user.create({
    data: { name: "Admin Geral", email: "admin@clinica.com", password: hashedPassword, role: "ADMIN" }
  });

  const doctorUser1 = await prisma.user.create({
    data: { name: "Dr. Carlos Silva", email: "carlos@clinica.com", password: hashedPassword, role: "DOCTOR" }
  });

  const doctorUser2 = await prisma.user.create({
    data: { name: "Dra. Mariana Costa", email: "mariana@clinica.com", password: hashedPassword, role: "DOCTOR" }
  });

  const patientUser1 = await prisma.user.create({
    data: { name: "Karen Almeida", email: "karen@paciente.com", password: hashedPassword, role: "PATIENT" }
  });

  const patientUser2 = await prisma.user.create({
    data: { name: "João Soure", email: "joao@paciente.com", password: hashedPassword, role: "PATIENT" }
  });

  // 4. Criar Perfis de Médicos (Doctor) ligando aos Users e Especialidades
  console.log("Criando perfis de médicos...");
  
  const doctor1 = await prisma.doctor.create({
    data: { licenseId: "CÉDULA-PT-12345", userId: doctorUser1.id, specialityId: cardio.id }
  });

  const doctor2 = await prisma.doctor.create({
    data: { licenseId: "CÉDULA-PT-67890", userId: doctorUser2.id, specialityId: ped.id }
  });

  // 5. Criar Slots de Disponibilidade (AvailabilitySlot)
  console.log("Criando horários disponíveis...");
  
  // Slots para o Dr. Carlos (Cardiologista)
  const slot1 = await prisma.availabilitySlot.create({
    data: { doctorId: doctor1.id, dateTime: new Date("2026-07-20T14:00:00.000Z"), isBooked: false }
  });
  const slot2 = await prisma.availabilitySlot.create({
    data: { doctorId: doctor1.id, dateTime: new Date("2026-07-20T15:00:00.000Z"), isBooked: false }
  });

  // Slots para a Dra. Mariana (Pediatra)
  const slot3 = await prisma.availabilitySlot.create({
    data: { doctorId: doctor2.id, dateTime: new Date("2026-07-21T10:00:00.000Z"), isBooked: false }
  });
  const slot4 = await prisma.availabilitySlot.create({
    data: { doctorId: doctor2.id, dateTime: new Date("2026-07-21T11:00:00.000Z"), isBooked: false }
  });

  // 6. Criar um Agendamento prévio (Appointment) de teste
  console.log("Criando agendamentos de teste...");
  // Marcar uma consulta com a Dra. Mariana no slot das 10:00
  await prisma.appointment.create({
    data: {
      patientId: patientUser1.id,
      slotId: slot3.id,
      status: "SCHEDULED"
    }
  });

  // IMPORTANTE: Como o slot3 foi agendado, temos de atualizar o isBooked dele para true!
  await prisma.availabilitySlot.update({
    where: { id: slot3.id },
    data: { isBooked: true }
  });

  console.log("Base de dados povoada com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });