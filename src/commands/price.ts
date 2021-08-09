import { CommandContext, SlashCommand } from 'slash-create';
import fetch from 'node-fetch';
import { formatPercentageChange } from '../utils';
import { cache } from '../cache';

module.exports = class HelloCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'price',
      description: 'Get current price (as a millionaire).',
      guildIDs: [process.env.GUILD_ID, process.env.BACKUP_GUILD_ID],
    });

    // Not required initially, but required for reloading with a fresh file.
    this.filePath = __filename;
  }

  async run(ctx: CommandContext) {
    console.log(process.env.NOMICS_API_TOKEN);
    const apiUrl = `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_TOKEN}&ids=MM4`;
    const init = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    const cacheKey = 'price';

    let commandResponse;
    try {
      if (await cache.has(cacheKey)) {
        commandResponse = await cache.get(cacheKey);
      } else {
        const apiResponse = await fetch(apiUrl, init);
        const apiResponseBody = await apiResponse.json();
        const priceChange = apiResponseBody[0]['1d'].price_change_pct;
        commandResponse = `<:mm:861734660081451018> Price is **$${parseFloat(
          apiResponseBody[0].price,
        ).toFixed(4)}** (${formatPercentageChange(priceChange)}%).`;

        await cache.set(cacheKey, commandResponse);
      }
    } catch {
      commandResponse = `Something went wrong - try again a bit later.`;
    }

    await ctx.send(commandResponse);
  }
};
