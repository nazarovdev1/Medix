'use strict';
require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const morgan       = require('morgan');
const swaggerUi    = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const config         = require('./config');
const logger         = require('./utils/logger');
const errorHandler   = require('./middlewares/error.middleware');
const { defaultLimiter } = require('./middlewares/rateLimiter');

// Routes
const authRoutes         = require('./routes/auth.routes');
const patientRoutes      = require('./routes/patient.routes');
const doctorRoutes       = require('./routes/doctor.routes');
const appointmentRoutes  = require('./routes/appointment.routes');
const paymentRoutes      = require('./routes/payment.routes');
const diagnosticRoutes   = require('./routes/diagnostic.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const miscRoutes         = require('./routes/misc.routes');

const app = express();

// ─── Security & Performance ──────────────────────────────────
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.set('trust proxy', 1);

// ─── Logging ─────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Global Rate Limiter ─────────────────────────────────────
app.use('/api/', defaultLimiter);

// ─── Swagger Docs ────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cinick Clinic Management API',
      version: '1.0.0',
      description: 'Production-ready clinic management system REST API',
      contact: { name: 'Cinick Dev Team' },
    },
    servers: [
      { url: `http://localhost:${config.port}/api`, description: 'Development' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #1a1a2e }',
  customSiteTitle: 'Cinick API Docs',
}));

app.get('/api/swagger.json', (_req, res) => res.json(swaggerSpec));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/diagnostics',   diagnosticRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api',               miscRoutes);   // services, departments, audit-logs, health

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, statusCode: 404, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
