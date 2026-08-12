const express = require('express');
const roadmapController = require('./roadmap.controller');
const { requireAuth } = require('../auth/auth.middleware');
const { validateBody, validateParams, roadmapGenerateSchema, roadmapParamsSchema } = require('./roadmap.validators');

const router = express.Router();

router.post('/', requireAuth, validateBody(roadmapGenerateSchema), roadmapController.generateRoadmap);
router.get('/', requireAuth, roadmapController.getRoadmaps);
router.get('/:id', requireAuth, validateParams(roadmapParamsSchema), roadmapController.getRoadmapById);

module.exports = router;
