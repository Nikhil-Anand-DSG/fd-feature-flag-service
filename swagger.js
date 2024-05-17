const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Feature Flag Service',
            version: '1.0.0',
            description: 'A simple feature flag service',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
        ],
    },
    apis: ['./flags.js'], // Path to your Express app file
};

const specs = swaggerJsdoc(options);

module.exports = specs;
