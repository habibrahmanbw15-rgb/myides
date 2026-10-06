const ideaRepository = require('../repositories/ideas.repository');

const getAllIdeas = async () => {
  const ideas = await ideaRepository.findAll();
  // Format ulang platform dari string kembali ke Array untuk Frontend
  return ideas.map(idea => ({
    ...idea,
    platforms: idea.platforms ? idea.platforms.split(',') : []
  }));
};

const createIdea = async (payload) => {
  // Validasi Aturan Bisnis: Platform tidak boleh kosong
  if (!payload.platforms || payload.platforms.length === 0) {
    throw new Error('Pilih minimal satu target platform!');
  }

  const dataToSave = {
    title: payload.title,
    platforms: Array.isArray(payload.platforms) ? payload.platforms.join(',') : payload.platforms,
    status: payload.status || 'Draft',
    pillar: payload.pillar || 'Umum',
    notes: payload.notes || ''
  };

  return await ideaRepository.create(dataToSave);
};

const deleteIdea = async (id) => {
  const existing = await ideaRepository.findById(id);
  if (!existing) {
    throw new Error('Ide konten tidak ditemukan!');
  }
  return await ideaRepository.remove(id);
};

module.exports = { getAllIdeas, createIdea, deleteIdea };