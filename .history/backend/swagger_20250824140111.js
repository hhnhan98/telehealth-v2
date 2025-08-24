// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telehealth System API',
      version: '1.0.0',
      description: 'Tài liệu API đầy đủ cho hệ thống Telehealth với ví dụ mẫu để test trực tiếp trên Swagger UI',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1f2c7d9f2c3f9b0a1e7b2' },
            fullName: { type: 'string', example: 'Nguyễn Văn A' },
            email: { type: 'string', example: 'nva@example.com' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin'], example: 'patient' },
            birthYear: { type: 'number', example: 1990 },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
            phone: { type: 'string', example: '0123456789' },
            avatar: { type: 'string', example: '/uploads/avatar-123.png' },
            bio: { type: 'string', example: 'Bác sĩ chuyên khoa nội tổng quát' },
            specialty: { type: 'string', example: '64a1f2c7d9f2c3f9b0a1e7b3' },
            location: { type: 'string', example: '64a1f2c7d9f2c3f9b0a1e7b4' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-08-24T05:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-08-24T05:00:00.000Z' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64fabc1234def56789abcd01' },
            doctor: { $ref: '#/components/schemas/User' },
            patient: { $ref: '#/components/schemas/User' },
            date: { type: 'string', format: 'date', example: '2025-09-01' },
            timeSlot: { type: 'string', example: '08:30-09:00' },
            reason: { type: 'string', example: 'Khám sức khỏe tổng quát' },
            status: { type: 'string', enum: ['pending','confirmed','cancelled','completed'], example: 'pending' },
            otp: { type: 'string', example: '123456' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-08-24T05:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-08-24T05:00:00.000Z' },
          },
        },
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1f2c7d9f2c3f9b0a1e7b4' },
            name: { type: 'string', example: 'Bệnh viện Đa khoa Trung ương' },
            address: { type: 'string', example: '123 Nguyễn Trãi, Hà Nội' },
            phone: { type: 'string', example: '0123456789' },
          },
        },
        Specialty: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1f2c7d9f2c3f9b0a1e7b3' },
            name: { type: 'string', example: 'Nội tổng quát' },
            description: { type: 'string', example: 'Khám và điều trị các bệnh lý nội khoa' },
          },
        },
        OTPToken: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string', example: '64fabc1234def56789abcd01' },
            otp: { type: 'string', example: '123456' },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64fabc1234def56789abcd99' },
            doctor: { $ref: '#/components/schemas/User' },
            date: { type: 'string', format: 'date', example: '2025-09-01' },
            slots: { type: 'array', items: { type: 'string', example: '08:30-09:00' } },
          },
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Hành động thành công' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    './routes/auth/*.js',
    './routes/*.js',
    './routes/user/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
