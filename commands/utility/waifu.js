const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const axios = require('axios');

// API Endpoint (ĐIỂM TRUY CẬP API) của Waifu.pics
const API_BASE_URL = 'https://api.waifu.pics/sfw/'; 

// ----------------------------------------------------------------------
// --- HÀM LẤY HÌNH ẢNH WAIFU/HUSBANDO TỪ API (FIX LỖI 404) --------------
// ----------------------------------------------------------------------
async function fetchRandomCharacter(type) {
    let endpoint;
    let title;
    
    if (type === 'waifu') {
        endpoint = 'waifu'; // SFW endpoint hợp lệ
        title = '🌸 Waifu Ngẫu Nhiên';
    } else if (type === 'husbando') {
        // 🔥 FIX 404: Endpoint 'husbando' không tồn tại trong SFW.
        // Chuyển sang một SFW endpoint khác (ví dụ: 'lick') hoặc 'neko' (mèo)
        endpoint = 'lick'; // Chọn một hành động an toàn, trung lập và tồn tại trong API
        title = '💖 Lãng Mạn Ngẫu Nhiên (Husbando Tạm Thời)';
    } else {
        throw new Error("Loại nhân vật không hợp lệ.");
    }

    // Sử dụng GET method đã được sửa ở lần trước
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);

    // Dữ liệu trả về thường là { "url": "..." }
    if (response.data && response.data.url) {
        return { url: response.data.url, title: title };
    }
    
    throw new Error("API không trả về URL hình ảnh hợp lệ.");
}

// ----------------------------------------------------------------------
// --- CẤU TRÚC LỆNH CHÍNH (/character và các tùy chọn) ------------------
// ----------------------------------------------------------------------

module.exports.data = {
    name: "character", 
    description: "Lấy một hình ảnh nhân vật anime ngẫu nhiên (Waifu an toàn hoặc Lãng Mạn).",
    type: 1, 
    options: [
        {
            name: "chon_loai",
            description: "Chọn loại nhân vật bạn muốn xem.",
            type: ApplicationCommandOptionType.String,
            required: true, 
            choices: [
                { name: 'Waifu (Nữ - SFW)', value: 'waifu' },
                // Tên được thay đổi để phản ánh sự thay đổi API, tránh gây nhầm lẫn
                { name: 'Hành động Lãng Mạn (Thay thế Husbando)', value: 'husbando' }, 
            ]
        }
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// Hàm thực thi lệnh chính (execute)
module.exports.execute = async (interaction, client) => {
    
    const type = interaction.options.getString("chon_loai");
    const isWaifu = type === 'waifu';
    
    await interaction.deferReply(); 

    try {
        const result = await fetchRandomCharacter(type);

        const embed = new EmbedBuilder()
            .setColor(isWaifu ? 0xFF69B4 : 0x1E90FF) 
            .setTitle(result.title)
            .setImage(result.url) 
            .setFooter({ text: `Nguồn: Waifu.pics API (Sử dụng endpoint SFW)` });
        
        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(`Lỗi khi lấy hình ảnh ${type}:`, error.message);
        
        await interaction.editReply({
            content: `❌ Không thể lấy hình ảnh **${type}** vào lúc này. Lỗi: ${error.message}`,
            ephemeral: true 
        });
    }
};