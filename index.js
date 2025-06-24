require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Подключение к Telegram и OpenAI
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  // Отправка индикатора набора текста
  bot.sendChatAction(chatId, 'typing');

  try {
    // === Генерация изображения ===
    if (/^(сгенерируй|нарисуй)/i.test(text)) {
      const prompt = text.replace(/^(сгенерируй|нарисуй)\s*/i, '');

      const image = await openai.images.generate({
        model: 'dall-e-3', // можно заменить на 'dall-e-2'
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const imageUrl = image.data[0].url;
      return bot.sendPhoto(chatId, imageUrl);
    }

    // === Генерация текста ChatGPT ===
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: text }],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    bot.sendMessage(chatId, response);
  } catch (error) {
    console.error('Ошибка:', error.message || error);
    bot.sendMessage(chatId, '⚠️ Произошла ошибка при обработке запроса.');
  }
});

console.log('🤖 Telegram GPT Bot с поддержкой генерации изображений запущен...');

