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
    phone_number: user.phone_number,
  };

  console.log("👉 Отправляем данные в Bito:", body);

  try {
    const { data } = await bitoApi.post("/customer/create", body);
    console.log("✅ Успешный ответ от Bito:", data);
    return data;
  } catch (err) {
    const status = err.response?.status || 500;
    const bito = err.response?.data;
    console.error("❌ Ошибка при создании кастомера в Bito:");
    console.error("Статус:", status);
    console.error("Ответ:", bito);

    // Нормализуем сообщение для фронта
    if (status === 400 && bito) {
      // Пример: у Bito есть messages.ru|uz|en и поле data (какое поле неверно)
      const field = bito.data || "request";
      const humanMessage =
        bito.messages?.ru ||
        bito.message ||
        "Неверные данные для создания клиента";
      // Пробрасываем как стандартную ошибку
      throw new CustomError(`${humanMessage} (${field})`, 400);
    }

    // Прочие статусы — сконвертируем в CustomError с безопасным сообщением
    const genericMsg =
      "Не удалось создать клиента в Bito. Попробуйте позже.";
    throw new CustomError(genericMsg, status >= 400 && status < 600 ? status : 500);
  }
};

module.exports = { createCustomer };
