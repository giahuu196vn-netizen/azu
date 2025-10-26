const { ApplicationCommandOptionType } = require("discord.js");
const { GoogleGenAI } = require('@google/genai');

// Khởi tạo GoogleGenAI client (lấy khóa API từ biến môi trường)
// Đảm bảo GEMINI_API_KEY đã được định nghĩa trong file .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// Định nghĩa dữ liệu lệnh (data)
module.exports.data = {
    name: "hỏi",
    description: "Hỏi AI (Gemini) bất kỳ điều gì bạn muốn!",
    type: 1, // Loại Chat Input Command
    
    options: [
        {
            name: "câu-hỏi",
            description: "Nhập câu hỏi của bạn.",
            // Loại tùy chọn: STRING (Chuỗi văn bản)
            type: ApplicationCommandOptionType.String,
            required: true, 
            maxLength: 500 // Giới hạn độ dài câu hỏi
        }
    ],
    
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// Hàm thực thi lệnh (execute)
module.exports.execute = async (interaction, client) => {
    // 1. Lấy câu hỏi từ người dùng
    const prompt = interaction.options.getString("câu-hỏi"); 
    
    // Gửi phản hồi tạm thời ngay lập tức để người dùng biết bot đang xử lý
    // Lệnh AI thường mất vài giây.
    await interaction.deferReply(); 

    try {
        // 2. Gọi Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Mô hình phù hợp cho tác vụ chat
            contents: prompt,
        });

        // 3. Lấy nội dung phản hồi từ AI
        const aiResponseText = response.text.trim();

        // 4. Gửi kết quả trở lại Discord
        await interaction.editReply({
            content: `**❓ Bạn hỏi:** ${prompt}\n\n**🤖 Gemini trả lời:**\n${aiResponseText}`
        });

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        
        // Gửi thông báo lỗi nếu có sự cố
        await interaction.editReply({
            content: "Xin lỗi, đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra khóa API và log bot.",
            ephemeral: true // Chỉ hiển thị cho người dùng gọi lệnh
        });
    }
};