const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { GoogleGenAI } = require('@google/genai');

// Khởi tạo GoogleGenAI client (đảm bảo GEMINI_API_KEY đã có trong .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// Định nghĩa dữ liệu lệnh (data)
module.exports.data = {
    name: "sua-loi",
    description: "Phân tích code hoặc log lỗi và gợi ý cách sửa bằng AI.",
    type: 1, 
    
    options: [
        {
            name: "code-va-loi",
            description: "Dán đoạn code/log lỗi cần phân tích (tối đa 2000 ký tự).",
            type: ApplicationCommandOptionType.String,
            required: true, 
            maxLength: 2000 // Giới hạn cho log lỗi dài
        }
    ],
    
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// Hàm thực thi lệnh (execute)
module.exports.execute = async (interaction, client) => {
    // 1. Lấy nội dung từ người dùng
    const user_input = interaction.options.getString("code-va-loi"); 
    
    await interaction.deferReply(); // Phản hồi tạm thời

    // 2. Xây dựng Prompt cho AI
    const prompt = `
        Bạn là một trợ lý lập trình chuyên nghiệp. 
        Hãy phân tích đoạn mã/log lỗi sau. 
        Nhiệm vụ của bạn là: 
        1. Giải thích ngắn gọn nguyên nhân gây ra lỗi.
        2. Đưa ra các bước hoặc đoạn mã sửa lỗi cụ thể (dùng Markdown cho code).
        
        NGÔN NGỮ PHẢN HỒI: TIẾNG VIỆT
        
        INPUT CẦN PHÂN TÍCH:
        ---
        ${user_input}
        ---
    `;

    try {
        // 3. Gọi Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
        });

        const aiResponseText = response.text.trim();

        // 4. Kiểm tra độ dài và gửi phản hồi
        if (aiResponseText.length > 4096) {
            // Nếu quá dài, hãy gửi nó thành file hoặc cắt ngắn
            await interaction.editReply({
                content: "Kết quả phân tích quá dài (>4096 ký tự). Vui lòng kiểm tra log bot để xem toàn bộ nội dung.",
                files: [{ attachment: Buffer.from(aiResponseText), name: 'phan_tich_loi.txt' }]
            });
            return;
        }

        // 5. Gửi Embed kết quả
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("🔬 Phân Tích Lỗi Code/Log bằng AI")
            .setDescription(aiResponseText)
            .setFooter({ text: `Được yêu cầu bởi: ${interaction.user.tag} | Powered by Gemini` });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        await interaction.editReply({
            content: "Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại `GEMINI_API_KEY`.",
            ephemeral: true 
        });
    }
};