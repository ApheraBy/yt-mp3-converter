const { MessageAttachment, MessageActionRow, MessageButton } = require("discord.js");
const { Modal, TextInputComponent, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const {
  videoConverter: { logChannelId },
} = require("../config.json");

const mp3Input = new TextInputComponent()
  .setCustomId("convert-input")
  .setLabel("Dönüştürülecek video linki")
  .setPlaceholder("YouTube linklerini kullanınız")
  .setStyle("SHORT")
  .setMinLength(1)
  .setRequired(true);

const mp3Row = new MessageActionRow().addComponents(mp3Input);

const mp3Modal = new Modal()
  .setCustomId("convert")
  .addComponents(mp3Row)
  .setTitle("Müzik Dönüştürme Sistemi");

function urlBaşarısız(user) {
  return new MessageEmbed()
    .setColor("ff0000")
    .setDescription(`**Youtube Müzik Link Giriniz.**`)
    .setFooter({
      text: `${user.tag}, tarafından kullanıldı.`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });
}

function dönüştürülüyor(user) {
  return new MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`**Müzik Dönüştürülüyor.**`)
    .setFooter({
      text: `${user.tag}, tarafından kullanıldı.`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });
}

function urlHata(user) {
  return new MessageEmbed()
    .setColor("ff0000")
    .setDescription(`**Müzik Süresi Fazla.**`)
    .setFooter({
      text: `${user.tag}, tarafından kullanıldı.`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });
}

function müzikHata(user) {
  return new MessageEmbed()
    .setColor("ff0000")
    .setDescription(`**Müzik Dönüştürülemedi.**`)
    .setFooter({
      text: `${user.tag}, tarafından kullanıldı.`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    });
}

function müzikİndirildi(user, songInfo, message) {
  const audioEmbed = new MessageEmbed()
    .setColor("BLUE")
    .setAuthor({
      name: songInfo.videoDetails.ownerChannelName,
      iconURL: songInfo.videoDetails.author.thumbnails[0].url,
      url: songInfo.videoDetails.author.channel_url,
    })
    .setDescription(`**Şarkı Dönüştürüldü.** \n${songInfo.videoDetails.title}`)
    .setThumbnail(songInfo.videoDetails.thumbnails[0].url)
    .setFooter({
      text: `${user.tag}, tarafından kullanıldı.`,
      iconURL: user.avatarURL({ dynamic: true }),
    });
  const audioRow = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel("İndir")
      .setURL(message.attachments.first()?.url ?? "")
      .setStyle("LINK")
  );

  return {
    components: [audioRow],
    embeds: [audioEmbed],
  };
}

module.exports = {
  name: "interactionCreate",
  execute: async (interaction) => {
    const guild = interaction.guild;

    if (guild) {
      const user = interaction.user;
      if (interaction.isButton()) {
        const customId = interaction.customId;

        switch (customId) {
          case "convert": {
            return interaction.showModal(mp3Modal);
          }
        }
      } else if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        switch (customId) {
          case "convert": {
            const url = interaction.components[0].components[0].value;

            if (!url.includes("youtu")) {
              return interaction.reply({ embeds: [urlBaşarısız(user)], ephemeral: true });
            }

            await interaction.reply({ embeds: [dönüştürülüyor(user)], ephemeral: true });
            const songInfo = await ytdl.getInfo(url);

            if (+songInfo.videoDetails.lengthSeconds > 500) {
              return interaction.followUp({ embeds: [urlHata(user)], ephemeral: true });
            }

            const download = ytdl(url, { filter: "audioonly", format: "mp3" });
            const attachment = new MessageAttachment(
              download,
              `${songInfo.videoDetails.videoId}.mp3`
            );
            const channel = interaction.client.channels.cache.get(logChannelId);

            if (!channel || channel.type !== "GUILD_TEXT") {
              return interaction.followUp({ embeds: [müzikHata(user)], ephemeral: true });
            }

            try {
              const message = await channel.send({ files: [attachment] });

              return interaction.followUp({
                ...müzikİndirildi(user, songInfo, message),
                ephemeral: true,
              });
            } catch (error) {
              return interaction.followUp({ embeds: [müzikHata(user)], ephemeral: true });
            }
          }
        }
      }
    }
  },
};
