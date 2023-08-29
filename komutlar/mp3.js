const { MessageActionRow, MessageButton, MessageEmbed, Message } = require("discord.js");
const { owners } = require("../config.json");

module.exports = {
  calistir: async (client, message, args) => {
    if (!owners.includes(message.author.id)) return;

    const embed = new MessageEmbed()
      .setTitle(
        "Aşağıdaki butona tıklayarak açılan formdan gireceğiniz YouTube müzik linkini mp3 olarak indirebilirsiniz."
      )
      .setImage("https://getwallpapers.com/wallpaper/full/5/5/b/469368.jpg");
    const button = new MessageButton()
      .setCustomId("convert")
      .setLabel("Dönüştür")
      .setStyle("SECONDARY");
    const row = new MessageActionRow().addComponents(button);

    return message.channel.send({ components: [row], embeds: [embed] });
  },

  name: "mp3",
  description: "",
  aliases: [],
  kategori: "",
  usage: "",
};
