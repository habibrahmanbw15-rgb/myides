const ideaService = require('../services/ideas.service');

const getIdeas = async (req, res) => {
  try {
    const ideas = await ideaService.getAllIdeas();
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const postIdea = async (req, res) => {
  try {
    const newIdea = await ideaService.createIdea(req.body);
    res.status(201).json({ success: true, data: newIdea, message: 'Ide baru berhasil disimpan!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const destroyIdea = async (req, res) => {
  try {
    await ideaService.deleteIdea(req.params.id);
    res.status(200).json({ success: true, message: 'Ide berhasil dihapus' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = { getIdeas, postIdea, destroyIdea };