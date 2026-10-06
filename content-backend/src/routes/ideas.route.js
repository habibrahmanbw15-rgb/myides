const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideas.controller');

router.get('/', ideaController.getIdeas);
router.post('/', ideaController.postIdea);
router.delete('/:id', ideaController.destroyIdea);

module.exports = router;