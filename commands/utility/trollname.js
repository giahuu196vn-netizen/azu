const { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } = require("discord.js");

// BỘ LƯU TRỮ TÊN CŨ: Map (key: user ID, value: tên cũ)
const nicknameCache = new Map(); 

// Danh sách các biệt danh hài hước (giữ nguyên)
const funnyNicknames = [
    "Khoai Tây Lắc Lư", "Thánh Nhọ Của Năm", "Siêu Nhân Lười Biếng", 
    "Gã Khờ Câm Lặng", "Cá Voi Biết Bay", "Sầu Riêng Hết Hạn", 
    "Đứa Trẻ To Xác", "Phú Ông Online", "Thiên Thần Mắc Cạn", 
    "Độc Giả Chuyên Nghiệp"
];

// Dữ liệu lệnh Slash Command (Bỏ tùy chọn 'biệt-danh-cũ')
module.exports.data = {
    name: "troll-nick",
    description: "Đổi biệt danh của người được gắn thẻ thành tên ngẫu nhiên trong 10 giây và tự khôi phục.",
    type: 1, 
    
    options: [
        {
            name: "người-bị-troll",
            description: "Gắn thẻ người bạn muốn đổi biệt danh.",
            type: ApplicationCommandOptionType.User,
            required: true, 
        },
    ],
    
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

// Hàm thực thi lệnh (execute)
module.exports.execute = async (interaction) => {
    
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
        return interaction.reply({
            content: "❌ Bot thiếu quyền **Quản lý biệt danh**.",
            ephemeral: true
        });
    }

    const targetUser = interaction.options.getMember("người-bị-troll"); 

    if (!targetUser || targetUser.user.id === interaction.guild.ownerId || targetUser.user.id === interaction.client.user.id) {
        // Xử lý lỗi cơ bản
        return interaction.reply({
            content: "❌ Không thể thực hiện với người dùng này.",
            ephemeral: true
        });
    }
    
    // 1. LƯU TÊN CŨ VÀO BỘ NHỚ
    const oldNickname = targetUser.nickname || targetUser.user.username; // Lấy biệt danh hoặc tên người dùng
    
    // Kiểm tra xem người này có đang trong quá trình troll nick không
    if (nicknameCache.has(targetUser.id)) {
        return interaction.reply({
            content: "❌ Người dùng này hiện đang được troll và chưa khôi phục tên cũ. Vui lòng chờ 10 giây.",
            ephemeral: true
        });
    }
    
    nicknameCache.set(targetUser.id, oldNickname); // Lưu tên cũ vào cache
    
    // 2. CHỌN VÀ ĐỔI BIỆT DANH MỚI
    const newNickname = funnyNicknames[Math.floor(Math.random() * funnyNicknames.length)];
    
    await interaction.deferReply(); 

    try {
        await targetUser.setNickname(newNickname, `Troll biệt danh bởi ${interaction.user.tag}`);

        const trollEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("😂 Biệt Danh Tạm Thời!")
            .setDescription(`Biệt danh của **${targetUser.user.tag}** đã được đổi thành **${newNickname}**! Bot sẽ tự động khôi phục lại sau **10 giây**.`);
        
        await interaction.editReply({ embeds: [trollEmbed] });

        // 3. THỰC HIỆN KHÔI PHỤC SAU 10 GIÂY
        setTimeout(async () => {
            try {
                // Lấy tên cũ từ cache
                const savedNickname = nicknameCache.get(targetUser.id); 
                
                if (savedNickname !== undefined) {
                    await targetUser.setNickname(savedNickname, "Khôi phục biệt danh tự động");
                    nicknameCache.delete(targetUser.id); // Xóa khỏi cache sau khi khôi phục
                    
                    const restoreEmbed = new EmbedBuilder()
                        .setColor(0x32CD32)
                        .setTitle("✅ Khôi Phục Hoàn Tất")
                        .setDescription(`Biệt danh của **${targetUser.user.tag}** đã được khôi phục về **${savedNickname}**.`);
                    
                    interaction.followUp({ embeds: [restoreEmbed], ephemeral: false }); // Thông báo công khai
                }

            } catch (err) {
                console.error("Lỗi khi khôi phục biệt danh:", err);
                nicknameCache.delete(targetUser.id); // Xóa khỏi cache để tránh kẹt
            }
        }, 100000); // 10000ms = 10 giây

    } catch (error) {
        console.error("Lỗi khi đổi biệt danh:", error);
        nicknameCache.delete(targetUser.id); // Xóa khỏi cache nếu bước troll lỗi
        
        if (error.code === 50013) {
            await interaction.followUp({
                content: `❌ Lỗi: Bot không thể đổi biệt danh của ${targetUser.user.tag} vì vai trò của họ cao hơn vai trò của Bot.`,
                ephemeral: true
            });
        } else {
            await interaction.followUp({
                content: "❌ Đã xảy ra lỗi khi thực hiện đổi biệt danh.",
                ephemeral: true
            });
        }
    }
};