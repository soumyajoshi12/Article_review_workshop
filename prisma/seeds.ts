// import { PrismaClient } from "../generated/prisma";

// const prisma = new PrismaClient();

// async function main() {
//   const org1 = await prisma.organization.create({
//     data: {
//       name: "EasySLR Research",
//     },
//   });

//   const org2 = await prisma.organization.create({
//     data: {
//       name: "University Research",
//     },
//   });

//   await prisma.project.createMany({
//     data: [
//       {
//         name: "AI Healthcare Review",
//         organizationId: org1.id,
//       },
//       {
//         name: "Cancer Research Review",
//         organizationId: org1.id,
//       },
//       {
//         name: "Machine Learning Study",
//         organizationId: org2.id,
//       },
//       {
//         name: "Data Analytics Study",
//         organizationId: org2.id,
//       },
//     ],
//   });

//   console.log("Seeded successfully");
// }

// main()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });