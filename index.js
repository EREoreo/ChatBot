require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Подключаемся к Telegram и OpenAI
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Обработка сообщений от пользователей
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const prompt = msg.text;

  // Отправка индикатора набора текста
  bot.sendChatAction(chatId, 'typing');

  try {
    // Запрос к ChatGPT (OpenAI API)
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4', // или 'gpt-4'
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    // Отправка ответа пользователю
    bot.sendMessage(chatId, response);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка при обработке запроса.');
  }
});

console.log('🤖 Telegram GPT Bot запущен...');
