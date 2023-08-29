const { prefix } = require("../config.json");

module.exports = async (message) => {
  const client = message.client;
  const content = message.content;

  if (message.author.bot || !content.startsWith(prefix)) return;
  if (!message.guild) return message.reply("Komutlarım sadece sunucularda kullanılabilir.");

  const args = content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));

  if (!command) return;

  command.calistir(client, message, args, prefix);
};
