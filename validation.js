const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(), // Regex for phone validation
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("personal", "business", "admin").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/),
  password: Joi.string().required(),
}).or('email', 'phone'); // Требует хотя бы одно из полей

module.exports = { registerSchema, loginSchema };
