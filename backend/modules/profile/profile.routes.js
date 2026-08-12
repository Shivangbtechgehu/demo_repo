const express = require('express');
const profileController = require('./profile.controller');
const { requireAuth } = require('../auth/auth.middleware');
const { validateBody, profileBodySchema, profilePatchSchema } = require('./profile.validators');

const router = express.Router();

router.post('/', requireAuth, validateBody(profileBodySchema), profileController.upsertProfile);
router.get('/me', requireAuth, profileController.getMyProfile);
router.patch('/me', requireAuth, validateBody(profilePatchSchema), profileController.patchMyProfile);

module.exports = router;
