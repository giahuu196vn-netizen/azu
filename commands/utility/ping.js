const { Client } = require("discord.js"); // Bỏ Options vì không dùng

module.exports.data = {
    name:"ping",
    description:"xem t nè hẹ hẹ hẹ",
    type: 1 ,
    options:[] , // SỬA LỖI Ở ĐÂY
    integration_types: [0,1],
    contexts : [0,1,2] ,
}
// C:\Users\hoang\OneDrive\Tài liệu\GitHub\azu\commands\utility\ping.js

// ... (phần data) ...

// Không cần quan tâm thứ tự tham số, chỉ cần đảm bảo 'interaction' là tham số đầu tiên
module.exports.execute = async(interaction, client) => { // Giả sử thứ tự này
    
    // SỬA: Lấy đối tượng bot từ interaction.client
    const botClient = interaction.client;
    
    // Lấy ping từ đối tượng botClient
    const ping = botClient.ws.ping; 
    
    await interaction.reply({
        content: `Pong! 🏓 Độ trễ hiện tại là: **${ping}ms**@everyone`,
        ephemeral: true 
    });
};