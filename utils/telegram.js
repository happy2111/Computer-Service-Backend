const axios = require('axios');
require('dotenv').config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  for (const chatId of TELEGRAM_CHAT_IDS) {
    try {
      await axios.post(url, {
        chat_id: chatId.trim(),
        text: text,
      });
      console.log(`✅ Отправлено в chat_id: ${chatId}`);
    } catch (error) {
      console.error(`❌ Ошибка в chat_id ${chatId}:`, error.response?.data || error.message);
    }
  }
}


async function formatDeviceStatus(status) {
  switch (status) {
    case 'pending':
      return '🕒 Kutilmoqda';
    case 'in-progress':
      return '🔧 Ta\'mirlanmoqda';
    case 'completed':
      return '✅ Tayyor';
    case 'unrepairable':
      return '❌ Ta\'mirlanmaydi';
    default:
      return "🕒 Kutilmoqda";
  }
}

async function formatMessage(device, userName, heading ) {
  const status = await formatDeviceStatus(device.status);
  const cost = device.cost ? `\n💰 Narxi: ${device.cost} so'm` : '' ;
  const costOr = device.costOr ? `\n💰 Taxminiy narxi: ${device.costOr} so'm` : '';
  const master = device.master ? `\n👨‍🔧 Javobgar Shaxs: ${device.master}` : '';
  const imei = device.imei ? `\nIMEI: ${device.imei}` : '';
  const comment = device.statusComment ? `\n💬 Izoh: ${device.statusComment}` : '';

  return `${heading}

👤 Mijoz: ${userName}
📞 Telefon: ${device.phone}
🔧 Xizmat turi: ${device.deviceType}
📱 Model: ${device.deviceModel}
🚫 Muammo: ${device.issueDescription}
${imei}
📋 Qo'shimcha ma'lumot: ${device.additionalInfo || 'Yo\'q'}
${master}
${cost}${costOr}
${comment}
🏷 Holati: ${status}

${device.packedUp ? '📤Olib ketilgan' : '🙅Olib ketilmagan'}`;
}


module.exports = {
  sendTelegramMessage,
  formatDeviceStatus,
  formatMessage
};