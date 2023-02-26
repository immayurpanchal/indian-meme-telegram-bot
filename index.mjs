import * as dotenv from 'dotenv';
dotenv.config();

const TENOR_KEY = process.env.TENOR_API_KEY;
const TELEGRAM_KEY = process.env.TELEGRAM_API_KEY;

import { Telegraf } from 'telegraf';
import axios from 'axios';

const tenorGIF = axios.create({
	baseURL: 'https://tenor.googleapis.com/v2/',
	timeout: 1000,
});
const bot = new Telegraf(TELEGRAM_KEY);
bot.start((ctx) => ctx.reply('Welcome'));

bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.on('inline_query', async (ctx) => {
	const query = ctx.update.inline_query.query;

	if (query.length >= 5) {
		const {
			data: { results = [] },
		} = await tenorGIF.get('/search', {
			params: {
				key: TENOR_KEY,
				q: query,
			},
		});

		const response = results.map((gif) => ({
			type: 'gif',
			id: gif.id,
			thumb_url: gif.media_formats.nanogif.url,
			gif_url: gif.media_formats.gif.url,
		}));

		ctx.answerInlineQuery(response);
	}
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
