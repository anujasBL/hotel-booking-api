import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

// Swagger UI setup options
const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'Hotel Booking API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true,
  },
};

// Serve OpenAPI JSON spec
router.get('/openapi.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Alternative JSON documentation endpoint
router.get('/json', (req: Request, res: Response) => {
  res.json(swaggerSpec);
});

// API documentation info endpoint
router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      title: swaggerSpec.info.title,
      version: swaggerSpec.info.version,
      description: swaggerSpec.info.description,
      endpoints: {
        documentation: '/docs',
        openapi: '/docs/openapi.json',
        json: '/docs/json',
      },
      totalEndpoints: Object.keys(swaggerSpec.paths || {}).length,
      tags: swaggerSpec.tags?.map(tag => tag.name) || [],
    },
    message: 'API documentation information',
  });
});

export default router;
