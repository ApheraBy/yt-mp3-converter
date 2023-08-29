const { readdirSync } = require("fs");
const ascii = require("ascii-table");

const table = new ascii("Komutlar/Aphera");
table.setHeading("Dosya", "Kullanım", "Diğer Kullanımlar", "Yükleme durumu");

module.exports = (client) => {
  const commands = readdirSync(`./komutlar/`).filter((file) => file.endsWith(".js"));
  for (const file of commands) {
    const pull = require(`../komutlar/${file}`);
    if (pull.name) {
      client.commands.set(pull.name, pull);
      table.addRow(file, pull.name, pull.aliases, "Hazır");
    } else {
      table.addRow(file, pull.name, pull.aliases, `Hata -> Komut klasöründe isim yazılmamış.`);
      continue;
    }
    if (pull.name && Array.isArray(pull.aliases))
      pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
  }
  console.log(table.toString());
};
