import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Backend API',
      version: '1.0.0',
      description: 'API documentation for Blog Backend with Google OAuth2',
    },
    servers: [
      {
        url: 'http://localhost:5500',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi }; 