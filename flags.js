const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger'); // Import your Swagger config

const flags = express();
const port = 3000;


flags.use(cors());
flags.use(express.json()); // For parsing JSON request bodies

// Feature flags (in-memory for this example)
const featureFlags = {
    welcomeMessage: true,
};

// --- RESTful API Endpoints ---
/**
 * @swagger
 * /flags:
 *   get:
 *     summary: Get all feature flags
 *     description: Returns a list of all feature flags and their current values.
 *     responses:
 *       200:
 *         description: Successful response with feature flags.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 welcomeMessage:
 *                   type: boolean
 *                   description: Whether the welcome message feature is enabled.
 */
flags.get('/flags', (req, res) => {
    res.json(featureFlags);
});

/**
 * @swagger
 * /flags/{flagName}:
 *   get:
 *     summary: Get a specific feature flag
 *     description: Returns the value of a specific feature flag.
 *     parameters:
 *       - in: path
 *         name: flagName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the feature flag to retrieve.
 *     responses:
 *       200:
 *         description: Successful response with the feature flag value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flagName:
 *                   type: boolean
 *                   description: The value of the requested feature flag.
 *       404:
 *         description: Feature flag not found.
 */
flags.get('/flags/:flagName', (req, res) => {
    const flagName = req.params.flagName;
    const flagValue = featureFlags[flagName];
    if (flagValue === undefined) {
        res.status(404).json({ error: 'Feature flag not found' });
    } else {
        res.json({ [flagName]: flagValue });
    }
});

/**
 * @swagger
 * /flags/{flagName}:
 *   put:
 *     summary: Update a feature flag
 *     description: Updates the value of an existing feature flag.
 *     parameters:
 *       - in: path
 *         name: flagName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the feature flag to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isEnabled:
 *                 type: boolean
 *                 description: The new value for the feature flag.
 *     responses:
 *       200:
 *         description: Feature flag updated successfully.
 *       400:
 *         description: Invalid isEnabled value (not a boolean).
 *       404:
 *         description: Feature flag not found.
 */
flags.put('/flags/:flagName', (req, res) => {
    const flagName = req.params.flagName;
    const newIsEnabled = req.body.isEnabled; // Get new status from request body

    if (typeof newIsEnabled !== 'boolean') {
        res.status(400).json({ error: 'Invalid isEnabled value' });
    } else if (featureFlags[flagName] === undefined) {
        res.status(404).json({ error: 'Feature flag not found' });
    } else {
        featureFlags[flagName] = newIsEnabled;
        res.json({ message: `Feature flag '${flagName}' updated successfully` });
    }
});

/**
 * @swagger
 * /flags:
 *   post:
 *     summary: Create a new feature flag
 *     description: Creates a new feature flag with the specified name and initial value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the new feature flag.
 *               isEnabled:
 *                 type: boolean
 *                 description: The initial value for the feature flag.
 *     responses:
 *       201:
 *         description: Feature flag created successfully.
 *       400:
 *         description: Invalid input (missing or incorrect parameters).
 *       409:
 *         description: Feature flag with the same name already exists.
 */
flags.post('/flags', (req, res) => {
    const newFlagName = req.body.name;
    const newIsEnabled = req.body.isEnabled;

    if (!newFlagName || typeof newIsEnabled !== 'boolean') {
        res.status(400).json({ error: 'Invalid flag name or isEnabled value' });
    } else if (featureFlags[newFlagName]) {
        res.status(409).json({ error: 'Feature flag already exists' });
    } else {
        featureFlags[newFlagName] = newIsEnabled;
        res.status(201).json({ message: `Feature flag '${newFlagName}' created successfully` });
    }
});

/**
 * @swagger
 * /flags/{flagName}:
 *   delete:
 *     summary: Delete a feature flag
 *     description: Deletes an existing feature flag.
 *     parameters:
 *       - in: path
 *         name: flagName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the feature flag to delete.
 *     responses:
 *       200:
 *         description: Feature flag deleted successfully.
 *       404:
 *         description: Feature flag not found.
 */
flags.delete('/flags/:flagName', (req, res) => {
    const flagName = req.params.flagName;

    if (featureFlags[flagName] === undefined) {
        res.status(404).json({ error: 'Feature flag not found' });
    } else {
        delete featureFlags[flagName];
        res.json({ message: `Feature flag '${flagName}' deleted successfully` });
    }
});

flags.use(
    '/api/v1/api-docs', //new route
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

flags.listen(port, () => {
    console.log(`Feature flag service running at http://localhost:${port}/`);
    console.log(`Swagger UI available at http://localhost:${port}/api/v1/api-docs`); //new route
});
