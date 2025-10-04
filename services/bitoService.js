const axios = require("axios");
// {
//   "_id": "653b57fb3fc2bcb3cce2822b",
//   "name": "Development",
//   "type": "main",
//   "is_default": true,
//   "director_id": "653b57f93fc2bcb3cce2807c",
//   "phone_number": "+998942700550"
// },
const { BITO_API_KEY, BITO_API_URL, BITO_ORGANIZATION_ID } = process.env;

const bitoApi = axios.create({
  baseURL: BITO_API_URL,
  headers: {
    "Content-Type": "application/json",
    "api-key": BITO_API_KEY
  }
});

/**
 * Создание кастомера в Bito
 */

const createCustomer = async (user) => {
  const body = {
    name: user.name,
    type: "natural",
    gender: user.gender,
    status: "inactive",
    organization_ids: [BITO_ORGANIZATION_ID],
  };

  console.log("👉 Отправляем данные в Bito:", body);

  try {
    const { data } = await bitoApi.post("/customer/create", body);
    console.log("✅ Успешный ответ от Bito:", data);
    return data;
  } catch (err) {
    console.error("❌ Ошибка при создании кастомера в Bito:");
    console.error("Статус:", err.response?.status);
    console.error("Ответ:", err.response?.data);
    throw err;
  }
};

module.exports = { createCustomer };
