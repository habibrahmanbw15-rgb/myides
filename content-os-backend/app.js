const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware wajib
app.use(cors({
  origin: '*', // Bisa dibatasi ke domain frontend production nanti
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ==========================================
// 1. GET: Ambil semua ide konten
// ==========================================
app.get('/api/ideas', async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. POST: Tambah ide konten baru
// ==========================================
app.post('/api/ideas', async (req, res) => {
  try {
    const { title, platforms, status, pillar, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Judul ide wajib diisi!' });
    }

    const newIdea = await prisma.idea.create({
      data: {
        title,
        // Jika di Prisma schema platforms bertipe String/JSON
        platforms: JSON.stringify(platforms),
        status: status || 'Draft',
        pillar: pillar || 'Umum',
        notes: notes || ''
      }
    });

    res.status(201).json(newIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. PUT: Edit ide konten berdasarkan ID
// ==========================================
app.put('/api/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, platforms, status, pillar, notes } = req.body;

    const updatedIdea = await prisma.idea.update({
      where: { id: id }, // Sesuaikan dengan tipe ID kamu (Int atau String)
      data: {
        title,
        platforms: JSON.stringify(platforms),
        status,
        pillar,
        notes
      }
    });

    res.json(updatedIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. DELETE: Hapus ide konten berdasarkan ID
// ==========================================
app.delete('/api/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.idea.delete({
      where: { id: id } // Sesuaikan jika ID di Prisma berupa Int: parseInt(id)
    });

    res.json({ message: 'Ide berhasil dihapus!' });
  } catch (error) {
    res.status(404).json({ error: 'Ide tidak ditemukan!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});