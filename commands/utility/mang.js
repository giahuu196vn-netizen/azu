const { ApplicationCommandOptionType } = require("discord.js");

// Danh sách các câu mắng ngẫu nhiên
const randomInsults = [
    "đúng là không biết nghe lời, cứ làm trò hề mãi!",
    "hôm nay lại quên mang theo não à?",
    "nhìn kìa, 'thiên tài' của năm vừa xuất hiện!",
    "sao hôm nay lại 'nguy hiểm' đến thế hả?",
    "thật hết cứu, đi chỗ khác chơi đi!",
    "nghĩ kĩ rồi hẳn làm nhé, đừng có mà 'ngáo'!",
];

// Định nghĩa dữ liệu lệnh (data)
module.exports.data = {
    name: "mắng",
    description: "Mắng một người nào đó.",
    type: 1, 
    
    options: [
        {
            name: "người-bị-mắng",
            description: "Chọn người mà bạn muốn mắng (Bắt buộc).",
            // Loại tùy chọn: USER (Người dùng)
            type: ApplicationCommandOptionType.User, 
            required: true, // BẮT BUỘC phải chọn người
        },
        {
            name: "câu-mắng",
            description: "Nhập câu mắng tùy chỉnh (Tối đa 100 ký tự).",
            type: ApplicationCommandOptionType.String,
            required: false, // Tùy chọn
            maxLength: 100
        }
    ],
    
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// Hàm thực thi lệnh (execute)
module.exports.execute = async (interaction, client) => {
    // Giờ interaction là biến thứ nhất, nên code sẽ hoạt động
    const targetUser = interaction.options.getUser("người-bị-mắng"); 
    // ... code còn lại ...
    // 2. Lấy câu mắng tùy chỉnh
    const customInsult = interaction.options.getString("câu-mắng");
    
    // 3. Xử lý câu mắng: Dùng câu tùy chỉnh, nếu không thì chọn ngẫu nhiên
    let finalInsult;
    
    if (customInsult) {
        finalInsult = customInsult;
    } else {
        const randomIndex = Math.floor(Math.random() * randomInsults.length);
        finalInsult = randomInsults[randomIndex];
    }
    
    // 4. Chuẩn bị nội dung phản hồi
    const responseContent = 
        `${interaction.user}  muốn nói với **${targetUser}**  rằng: **"${finalInsult}"**`;

    // 5. Gửi phản hồi
    await interaction.reply({
        content: responseContent,
    });
};