const express = require('express');
const skillController = require('./skill.controller');
const { requireAuth } = require('../auth/auth.middleware');
const { validateBody, skillCreateSchema, skillUpdateSchema, skillGoalMapSchema } = require('./skill.validators');

const router = express.Router();

router.post('/', requireAuth, validateBody(skillCreateSchema), skillController.addSkill);
router.get('/', requireAuth, skillController.getSkills);
router.get('/:id', requireAuth, skillController.getSkillById);
router.patch('/:id', requireAuth, validateBody(skillUpdateSchema), skillController.updateSkill);
router.post('/:id/map-goal', requireAuth, validateBody(skillGoalMapSchema), skillController.mapSkillToGoal);

module.exports = router;
