import prisma from "../config/prisma.js";

const getNextOrderNumber = async (tx = prisma) => {
  const result = await tx.$queryRaw`
    SELECT nextval('order_number_seq') AS sequence
  `;

  const sequence = Number(result[0].sequence);

  const year = new Date().getFullYear();

  return `EW-${year}-${String(sequence).padStart(6, "0")}`;
};

export default getNextOrderNumber;