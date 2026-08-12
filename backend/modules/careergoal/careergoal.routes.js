const express = require('express');
const careerGoalController = require('./careergoal.controller');
const { requireAuth } = require('../auth/auth.middleware');
const { validateBody, careerGoalCreateSchema, careerGoalUpdateSchema } = require('./careergoal.validators');

const router = express.Router();

router.post('/', requireAuth, validateBody(careerGoalCreateSchema), careerGoalController.createGoal);
router.get('/', requireAuth, careerGoalController.getGoals);
router.get('/:id', requireAuth, careerGoalController.getGoalById);
router.patch('/:id', requireAuth, validateBody(careerGoalUpdateSchema), careerGoalController.updateGoal);
router.delete('/:id', requireAuth, careerGoalController.deleteGoal);

module.exports = router;
