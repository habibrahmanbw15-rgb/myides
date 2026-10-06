const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findAll = async () => {
  return await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

const findById = async (id) => {
  return await prisma.idea.findUnique({ where: { id } });
};

const create = async (data) => {
  return await prisma.idea.create({ data });
};

const update = async (id, data) => {
  return await prisma.idea.update({
    where: { id },
    data
  });
};

const remove = async (id) => {
  return await prisma.idea.delete({ where: { id } });
};

module.exports = { findAll, findById, create, update, remove };