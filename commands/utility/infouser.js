const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

// Hàm để đưa ra lời khen ngẫu nhiên
function getCompliment(username) {
    const compliments = [
        `Tất cả thông tin về **${username}** đã được thu thập. Tôi là bot giỏi nhất! 😎`,
        `Thật vinh dự khi được phục vụ **${username}**. Thông tin đây nhé!`,
        `Phân tích dữ liệu hoàn tất! **${username}** là một người dùng tuyệt vời! ✨`,
        `Tôi đã tìm thấy mọi thứ về **${username}** chỉ trong tích tắc. Code tôi siêu nhanh! 🚀`,
        `Món quà thông tin này dành cho **${username}** từ bot đáng tin cậy của bạn. 🤖`,
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
}

module.exports.data = {
    name: "userinfo",
    description: "Xem thông tin chi tiết về người dùng cụ thể hoặc chính bạn, bao gồm tin nhắn gần nhất.",
    type: 1, 
    options: [
        {
            name: "user",
            description: "Chọn người dùng bạn muốn xem thông tin.",
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ], 
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

module.exports.execute = async (interaction, client) => {
    
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const targetMember = interaction.guild.members.cache.get(targetUser.id);
    
    await interaction.deferReply(); 

    // --- LOGIC TÌM TIN NHẮN GẦN NHẤT ---
    let lastMessageInfo = 'Không tìm thấy trong 50 tin nhắn gần nhất của kênh này.';
    try {
        const messages = await interaction.channel.messages.fetch({ limit: 50 }); 
        const lastUserMessage = messages.find(msg => msg.author.id === targetUser.id);
        
        if (lastUserMessage) {
            const content = lastUserMessage.content.length > 70 ? 
                            lastUserMessage.content.substring(0, 70) + '...' : 
                            lastUserMessage.content || '*Chỉ có file đính kèm/Embed*';

            lastMessageInfo = `
[Xem tin nhắn](${lastUserMessage.url})
\`\`\`
${content.replace(/`/g, '`\u200b')}
\`\`\`
Đăng: <t:${Math.floor(lastUserMessage.createdTimestamp / 1000)}:R>
            `;
        }
    } catch (e) {
        lastMessageInfo = '⚠️ Bot không có quyền đọc lịch sử tin nhắn trong kênh này.';
    }
    // --- KẾT THÚC LOGIC TÌM TIN NHẮN GẦN NHẤT ---

    // 1. Dữ liệu chung
    const botBadge = targetUser.bot ? '🤖 CÓ' : '❌ KHÔNG';
    const createDate = `<t:${Math.floor(targetUser.createdAt.getTime() / 1000)}:f>`;
    const relativeCreateDate = `<t:${Math.floor(targetUser.createdAt.getTime() / 1000)}:R>`;

    // 2. Dữ liệu Server (chỉ hiển thị nếu là thành viên)
    let serverInfoValue = 'Người dùng này không còn trong server.';
    let rolesCount = 0;
    let roleList = 'Không có vai trò đặc biệt.';
    let statusInfo = 'KHÔNG RÕ';
    let activitiesInfo = 'Không có hoạt động';
    let displayColor = 0x0099ff;

    if (targetMember) {
        const joinDate = `<t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:f>`;
        const relativeJoinDate = `<t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:R>`;
        const roles = targetMember.roles.cache
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position);
        
        rolesCount = roles.size;
        // Loại bỏ Markdown mạnh để tránh lỗi format
        roleList = roles.map(role => role.toString()).join(', ').substring(0, 1024) || 'Không có';
        
        serverInfoValue = `
**Nickname:** ${targetMember.nickname || 'Không có'}
**Vai Trò Cao Nhất:** ${targetMember.roles.highest.name}
**Màu Hiển Thị:** \`${targetMember.displayHexColor}\`
        `;

        const presence = targetMember.presence;
        statusInfo = presence ? presence.status.toUpperCase() : 'KHÔNG RÕ';
        activitiesInfo = presence?.activities.map(a => `**${a.type}:** ${a.name}`).join('\n') || 'Không có hoạt động';
        displayColor = targetMember.displayHexColor;
    }


    const userInfoEmbed = new EmbedBuilder()
        .setColor(displayColor) 
        .setTitle(`👤 THÔNG TIN CHI TIẾT VỀ ${targetUser.username.toUpperCase()}`)
        .setDescription(getCompliment(targetUser.username)) 
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            // ---- DÒNG 1: THÔNG TIN TÀI KHOẢN ----
            { name: 'ID Người Dùng', value: `\`${targetUser.id}\``, inline: true },
            { name: 'Là Bot', value: botBadge, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }, // Khoảng trắng 

            { name: 'NGÀY TẠO TÀI KHOẢN', value: createDate, inline: true },
            { name: 'THỜI GIAN', value: relativeCreateDate, inline: true },
            { name: '\u200B', value: '\u200B', inline: true }, // Khoảng trắng
            
            // ---- DÒNG 2: THÔNG TIN SERVER ----
            { 
                name: 'CỘNG ĐỒNG SERVER', 
                value: serverInfoValue, 
                inline: true 
            },
            { 
                name: '\u200B', 
                value: targetMember ? 
                    `
                    **Ngày Tham Gia:** ${targetMember ? `<t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:f>` : 'N/A'}
                    **Thời Gian:** ${targetMember ? `<t:${Math.floor(targetMember.joinedAt.getTime() / 1000)}:R>` : 'N/A'}
                    `
                    : '\u200B',
                inline: true
            },
            { name: '\u200B', value: '\u200B', inline: true }, // Khoảng trắng

            // ---- DÒNG 3: TRẠNG THÁI VÀ VAI TRÒ ----
            { 
                name: 'TRẠNG THÁI HOẠT ĐỘNG',
                value: `
                    **Trạng Thái:** **${statusInfo}**
                    **Hoạt Động:** ${activitiesInfo}
                `,
                inline: true
            },
            { 
                name: `VAI TRÒ (${rolesCount})`,
                value: rolesCount > 0 ? roleList : 'Không có',
                inline: true 
            },
            { name: '\u200B', value: '\u200B', inline: true }, // Khoảng trắng
            
            // --- DÒNG CUỐI: TIN NHẮN GẦN NHẤT ---
            { 
                name: '💬 TIN NHẮN GẦN NHẤT (Kênh hiện tại)',
                value: lastMessageInfo,
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` });

    await interaction.editReply({ embeds: [userInfoEmbed] });
};