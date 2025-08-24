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
      {
        url: 'http://localhost:5000/api',
        description: 'Local server',
      },
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
        // Copy toàn bộ schema User, Doctor, Patient, Appointment, Location, Specialty, OtpToken, Message, Schedule
        // như bạn đã viết, đảm bảo Swagger UI hiển thị đầy đủ
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
        // Các schema khác giữ nguyên như bạn viết
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Load annotation trực tiếp từ các route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
