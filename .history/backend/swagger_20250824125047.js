// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telehealth System API',
      version: '1.0.0',
      description: 'Tài liệu API đầy đủ cho hệ thống Telehealth',
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
            birthYear: { type: 'number' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            bio: { type: 'string' },
            specialty: { type: 'string' },
            location: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            specialty: { type: 'string' },
            location: { type: 'string' },
            bio: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            address: { type: 'string' },
            bio: { type: 'string' },
            medicalHistory: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            location: { type: 'string' },
            specialty: { type: 'string' },
            doctor: { type: 'string' },
            patient: { type: 'string' },
            datetime: { type: 'string', format: 'date-time' },
            date: { type: 'string' },
            time: { type: 'string' },
            reason: { type: 'string' },
            otp: { type: 'string' },
            otpExpiresAt: { type: 'string', format: 'date-time' },
            isVerified: { type: 'boolean' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            workScheduleId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            specialties: { type: 'array', items: { type: 'string' } },
            doctors: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Specialty: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            locations: { type: 'array', items: { type: 'string' } },
            doctors: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OtpToken: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            contact: { type: 'string' },
            purpose: { type: 'string' },
            otpHash: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            attempts: { type: 'number' },
            lastSentAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sender: { type: 'string' },
            receiver: { type: 'string' },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            doctorId: { type: 'string' },
            date: { type: 'string' },
            slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'string' },
                  isBooked: { type: 'boolean' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Load annotation từ route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
