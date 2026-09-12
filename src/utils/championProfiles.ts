export interface ChampionProfile {
  pros: string[];
  cons: string[];
  keyTip: string;
  archetype: 'TANK' | 'BRUISER' | 'ASSASSIN' | 'MAGE' | 'MARKSMAN' | 'SUPPORT';
}

export const CHAMPION_PROFILES: Record<string, ChampionProfile> = {
  Malphite: {
    pros: [
      'Lượng giáp khổng lồ, kỹ năng E giảm tới 50% tốc đánh làm tê liệt đấu sĩ và xạ thủ.',
      'Chiêu cuối Không Thể Cản Phá (R) lật kèo giao tranh tổng trong tích tắc.',
      'Trụ đường an toàn nhờ nội tại Tạo Giáp và chiêu Q cấu rỉa làm chậm từ xa.',
    ],
    cons: [
      'Giai đoạn cấp 1-5 rất tốn năng lượng và dọn lính chậm.',
      'Rất phụ thuộc vào chiêu R; nếu dùng hụt sẽ mất 80% áp lực giao tranh.',
      'Gặp khó khăn trước các tướng sát thương phép tầm xa (Sylas, Rumble, Gwen).',
    ],
    keyTip: 'Nâng tối đa chiêu E trước khi đối đầu tướng phụ thuộc đòn đánh tay; chỉ all-in khi có R hoặc đối thủ mất chiêu tẩu thoát.',
    archetype: 'TANK',
  },
  Gragas: {
    pros: [
      'Chiêu E (Lấy Thịt Đè Người) ngắt đứng mọi pha bay nhảy lướt của sát thủ/đấu sĩ.',
      'Chiêu R hất văng phá vỡ hoàn toàn đội hình địch hoặc bắt lẻ chủ lực.',
      'Hồi phục dồi dào từ nội tại Giờ Khuyến Mãi giúp bám trụ cực kỳ bền bỉ.',
    ],
    cons: [
      'Bộ kỹ năng toàn định hướng, nếu trượt E hoặc dùng R sai có thể bóp đồng đội.',
      'Sát thương dồn cần thời gian ủ thùng rượu Q để tối đa hóa lượng dame.',
    ],
    keyTip: 'Giữ E chờ đối thủ lướt vào thì tông thẳng để làm choáng phản công; R dùng để hất xạ thủ địch về phía team mình.',
    archetype: 'MAGE',
  },
  Lissandra: {
    pros: [
      'Khống chế cứng chỉ định (Point & Click) từ W và R khóa chết sát thủ bay nhảy (Zed, Akali, Katarina).',
      'Tự R lên bản thân hoạt động như Đồng Hồ Cát vừa hồi máu vừa gây sát thương diện rộng.',
      'Nội tại Nô Lệ Băng Giá biến xác tướng địch thành quả bom nguyên tử trong combat.',
    ],
    cons: [
      'Tầm sử dụng chiêu tương đối ngắn so với các pháp sư kiểm soát như Syndra, Orianna, Xerath.',
      'Chiêu E di chuyển khá chậm, dễ bị đối thủ đoán trước hướng lướt.',
    ],
    keyTip: 'Khi đối đầu Zed hay sát thủ, giữ R chỉ định thẳng vào đầu đối thủ ngay khi chúng vừa lao vào.',
    archetype: 'MAGE',
  },
  Rammus: {
    pros: [
      'Khắc tinh số 1 của đội hình nhiều sát thương vật lý và tốc độ đánh.',
      'Tốc độ lăn Q cực nhanh gank bất ngờ, mở giao tranh uy lực.',
      'Phản đòn W + Khiêu khích E khiến xạ thủ và sát thủ tự đánh chết.',
    ],
    cons: [
      'Gần như bất lực trước pháp sư dồn sát thương phép hoặc tướng có khả năng thả diều tầm xa.',
      'Ăn các mục tiêu lớn (Rồng/Baron) đơn độc rất chậm.',
    ],
    keyTip: 'Lên Giáp Gai đầu tiên; bật W trước rồi bấm E khiêu khích đối phương để tối đa sát thương phản lại.',
    archetype: 'TANK',
  },
  Vayne: {
    pros: [
      'Sát thương chuẩn theo % máu tối đa từ W xé toạc mọi dàn chắn đỡ đòn.',
      'Tàng hình liên tục với R + Q tạo đột biến cực lớn trong các pha giao tranh hỗn loạn.',
      'Khả năng thả diều và 1v1 về cuối ván đấu thuộc hàng mạnh nhất trò chơi.',
    ],
    cons: [
      'Giai đoạn đi đường đầu trận rất yếu, tầm bắn ngắn và không có kỹ năng dọn lính nhanh.',
      'Đòi hỏi kỹ năng giữ vị trí và ngắm bắn Kết Án E chuẩn xác.',
    ],
    keyTip: 'Giữ chiêu E để đẩy lùi khi đối thủ lao vào; không lộn Q bừa bãi khi đối phương còn giữ chiêu khống chế.',
    archetype: 'MARKSMAN',
  },
  Morgana: {
    pros: [
      'Khiên Đen (E) miễn nhiễm hoàn toàn mọi hiệu ứng khống chế cho bản thân hoặc chủ lực.',
      'Khóa Bóng Tối (Q) trói chân mục tiêu lên đến 3 giây, mở giao tranh và bắt lẻ cực mạnh.',
      'Chiêu W đẩy đường và cấu rỉa an toàn từ cự ly xa.',
    ],
    cons: [
      'Chiêu Q bay chậm, đối thủ có thể né nếu có tầm nhìn hoặc dùng chiêu lướt.',
      'Khiên E mỏng manh trước lượng sát thương phép dồn lớn; thân hình máu giấy.',
    ],
    keyTip: 'Cài phím tắt tự buff Khiên Đen E; giữ Q chờ đối thủ bị làm chậm hoặc khống chế rồi mới bồi vào.',
    archetype: 'SUPPORT',
  },
  Poppy: {
    pros: [
      'Vùng Không Thể Lay Chuyển (W) chặn đứng mọi kỹ năng lướt (Fiora, Irelia, Yasuo, Lee Sin).',
      'Chiêu R Sứ Giả Phán Quyết hất bay các thành viên địch tạo lợi thế hơn quân số ngay lập tức.',
      'Rất cứng cáp trước sát thương vật lý nhờ nội tại và chỉ số cơ bản cao.',
    ],
    cons: [
      'Khó mở giao tranh chủ động nếu đối thủ giữ cự ly cách xa địa hình tường.',
      'Lượng sát thương suy giảm dần về giai đoạn cuối trận.',
    ],
    keyTip: 'Bật W ngay khi thấy đối thủ chuẩn bị lướt; rình góc đẩy E vào tường để làm choáng 2 giây.',
    archetype: 'TANK',
  },
  Sett: {
    pros: [
      'Chiêu W Cuồng Thú Phá Xung tạo lá chắn khổng lồ và trả lại lượng sát thương chuẩn cực thốn.',
      'Chiêu R quật tướng đỡ đòn của địch thẳng vào đội hình phía sau gây sát thương diện rộng khủng khiếp.',
      'Nội tại hồi phục máu khi còn ít máu giúp trụ đường cực kỳ bền bỉ.',
    ],
    cons: [
      'Kém cơ động, không có chiêu lướt vượt địa hình nên rất dễ bị thả diều bởi tướng tay dài.',
      'Nếu dùng trượt vùng giữa chiêu W thì sẽ mất đi phần lớn lượng sát thương.',
    ],
    keyTip: 'Chờ thanh Gan tích đầy màu vàng rồi mới bấm W trúng tâm; R bốc tướng đỡ đòn nặng ký nhất của địch ném vào xạ thủ.',
    archetype: 'BRUISER',
  },
  Vex: {
    pros: [
      'Nội tại Trầm Cảm trừng phạt thích đáng mọi tướng lướt/bay nhảy (Yasuo, Akali, Irelia, Lee Sin).',
      'Khả năng dọn lính an toàn tầm xa và sát thương dồn sốc chết tướng máu giấy rất nhanh.',
      'Chiêu R tái kích hoạt khi hạ gục giúp quét sạch cả giao tranh.',
    ],
    cons: [
      'Khi thanh nội tại đang hồi thì mất đi khả năng tự bảo vệ bản thân.',
      'Thân hình máu giấy, rất sợ những pha bị khống chế cứng bất ngờ.',
    ],
    keyTip: 'Chỉ lao vào bằng R2 khi thanh nội tại hoảng sợ đã sẵn sàng để làm hoảng sợ cả đội hình địch.',
    archetype: 'MAGE',
  },
  Darius: {
    pros: [
      'Khả năng đè đường đầu trận khủng khiếp với 5 tầng Xuất Huyết và lượng sát thương vật lý nội tại khổng lồ.',
      'Chiêu R Máy Chém Noxus gây sát thương chuẩn và tái kích hoạt liên tục khi bổ gục tướng địch.',
      'Khả năng 1v2 khi bị rừng đối phương gank nếu tích đủ nội tại.',
    ],
    cons: [
      'Cực kỳ tù và thiếu cơ động, phụ thuộc hoàn toàn vào Tốc Hành và Tốc Biến.',
      'Rất sợ bị thả diều bởi tướng đánh xa hoặc đội hình có nhiều khống chế làm chậm cứng.',
    ],
    keyTip: 'Dùng W làm chậm trước để đảm bảo rìu Q rìa ngoài trúng đích hồi máu; chỉ dùng E kéo khi đối thủ định lướt chạy.',
    archetype: 'BRUISER',
  },
  Irelia: {
    pros: [
      'Độ cơ động lướt Q liên tục qua lính khiến đối thủ không thể ngắm trúng kỹ năng định hướng.',
      'Sát thương hỗn hợp và tốc đánh kinh hoàng khi tích đủ 4 tầng nội tại Ý Chí Ionia.',
      'Chiêu W giảm tới 50% sát thương nhận vào, chống sốc sát thương cực kỳ hiệu quả.',
    ],
    cons: [
      'Đòi hỏi kỹ năng cá nhân và xử lý phím bấm cực cao; nếu Q hụt không được hồi chiêu sẽ biến thành phế nhân.',
      'Khó chơi khi đội hình địch có quá nhiều kỹ năng khống chế cứng hoặc làm câm lặng.',
    ],
    keyTip: 'Chuẩn bị thế lính máu thấp trước khi lao vào; giữ W khi đối phương tung kỹ năng sốc sát thương mạnh nhất.',
    archetype: 'BRUISER',
  },
  Jax: {
    pros: [
      'Chiêu E Phản Công né hoàn toàn 100% đòn đánh thường và giảm sát thương diện rộng, sau đó làm choáng.',
      'Khả năng đẩy lẻ 1v1 và ăn trụ thuộc hàng mạnh nhất trò chơi.',
      'Chiêu R Ban Phước Đại Sư tăng lượng giáp và kháng phép khổng lồ trong giao tranh.',
    ],
    cons: [
      'Dễ bị đối thủ ép đường ở các cấp độ đầu tiên trước khi có đủ trang bị cốt lõi.',
      'Giao tranh tổng cần chọn thời điểm vào hợp lý, tránh bị dồn hiệu ứng khống chế từ xa.',
    ],
    keyTip: 'Đánh lính 2 cái để tích sẵn nội tại chiêu R trước khi nhảy Q vào đối phương đánh trao đổi ngắn.',
    archetype: 'BRUISER',
  },
  Galio: {
    pros: [
      'Khiên phép nội tại và giảm sát thương W giúp biến Galio thành bức tường chống lại mọi pháp sư.',
      'Chiêu R Siêu Hùng Giáng Thế can thiệp nửa bản đồ bảo bọc đồng đội kịp thời.',
      'Chuỗi khống chế diện rộng W (Khiêu khích) + E (Hất tung) rất mạnh trong giao tranh tổng.',
    ],
    cons: [
      'Yếu thế trước các đấu sĩ và xạ thủ gây sát thương vật lý duy trì liên tục.',
      'Thời gian hồi chiêu R rất lâu; bộ chiêu tầm gần dễ bị đối phương thả diều.',
    ],
    keyTip: 'Tích W khiêu khích kết hợp Tốc Biến để mở giao tranh bất ngờ; quan sát minimap liên tục để bấm R cứu đồng đội.',
    archetype: 'TANK',
  },
  Fiora: {
    pros: [
      'Khả năng 1v1 và phá trụ thượng thừa với sát thương chuẩn theo % máu tối đa từ điểm yếu.',
      'Chiêu W Phản Đòn miễn nhiễm mọi sát thương và khống chế, có thể làm choáng ngược lại đối thủ.',
      'Độ cơ động cao với chiêu Q thời gian hồi cực ngắn khi đánh trúng mục tiêu.',
    ],
    cons: [
      'Rất yếu trong giao tranh tổng 5v5 hỗn loạn nếu không thể kích hoạt nhanh 4 điểm yếu chiêu R.',
      'Phụ thuộc nhiều vào việc phản xạ chiêu W; nếu dùng hụt W sẽ rơi vào thế hiểm.',
    ],
    keyTip: 'Chờ đối thủ tung kỹ năng khống chế then chốt (như E của Darius hay Cho\'Gath) rồi mới kích hoạt W để làm choáng ngược.',
    archetype: 'BRUISER',
  },
  Sylas: {
    pros: [
      'Chiêu W Đồ Vương hồi phục lượng máu khổng lồ khi máu thấp, tạo đột biến lật kèo kinh ngạc.',
      'Chiêu R Tước Đoạt có thể cướp những chiêu cuối giao tranh cực mạnh của đối phương (Malphite, Alistar, Amumu).',
      'Độ cơ động cao và khả năng dồn sát thương một mục tiêu rất nhanh.',
    ],
    cons: [
      'Phụ thuộc vào chiêu cuối của đối thủ; nếu team địch toàn chiêu cuối cùi thì sức mạnh giảm sút.',
      'Rất sợ trang bị Giảm Hồi Máu (Vết Thương Sâu) và khống chế cứng.',
    ],
    keyTip: 'Ưu tiên cướp R của Malphite/Amumu/Ashe; giữ W đến khi bản thân còn dưới 40% máu để nhận hồi phục tối đa.',
    archetype: 'MAGE',
  },
  Gwen: {
    pros: [
      'Sương Lam Bất Khả Xâm Phạm (W) miễn nhiễm mọi sát thương và kỹ năng từ kẻ địch bên ngoài vòng.',
      'Sát thương chuẩn và đánh theo % máu tối đa cắt nát các tướng đỡ đòn máu dày.',
      'Sức mạnh thăng tiến khủng khiếp về nửa sau trận đấu.',
    ],
    cons: [
      'Đầu trận khá mỏng manh và thiếu kỹ năng khống chế cứng.',
      'Nếu đối thủ bước vào trong vòng W thì Gwen vẫn nhận đủ sát thương.',
    ],
    keyTip: 'Bật W khi xạ thủ/pháp sư địch đứng từ xa xả đạn; dồn 4 tầng Q vào lính trước rồi bấm E lướt cắt xén đối thủ.',
    archetype: 'BRUISER',
  },
  Samira: {
    pros: [
      'Chiêu W Lốc Kiếm phá hủy toàn bộ đạn đạo của đối phương (kéo của Blitzcrank, chiêu thức xạ thủ).',
      'Chiêu R Hỏa Ngục Liên Xạ gây sát thương diện rộng kinh hoàng và hút máu cực nhiều khi đạt điểm S.',
      'Độ cơ động lướt E liên tục được làm mới khi tham gia hạ gục.',
    ],
    cons: [
      'Cực kỳ sợ kỹ năng khống chế cứng (choáng, hất tung, câm lặng) ngắt ngang chiêu R.',
      'Tầm đánh ngắn, dễ bị cấu rỉa đè đường ở giai đoạn đầu trận.',
    ],
    keyTip: 'Chờ đối phương tung hết các chiêu khống chế cứng thì mới lướt vào kích hoạt R quét sạch.',
    archetype: 'MARKSMAN',
  },
  Braum: {
    pros: [
      'Tối Kiên Cường (E) dựng khiên chặn đứng mọi viên đạn đạo và sát thương dồn của xạ thủ đối phương.',
      'Nội tại Đánh Ngất Ngư phối hợp cùng xạ thủ làm choáng đối thủ cực kỳ dễ dàng.',
      'Chiêu R hất tung diện rộng chia cắt giao tranh và bảo kê chủ lực tuyệt hảo.',
    ],
    cons: [
      'Kém cơ động hơn so với các hỗ trợ mở giao tranh chủ động.',
      'Thiếu sát thương tự thân, hoàn toàn phụ thuộc vào khả năng bắn của đồng đội.',
    ],
    keyTip: 'Luôn đứng chắn giữa chủ lực và nguồn sát thương lớn nhất của địch để giơ khiên E lên đỡ đạn.',
    archetype: 'SUPPORT',
  },
  Janna: {
    pros: [
      'Khả năng chống lao vào (Disengage) số 1 với Gió Lốc Q và chiêu cuối Gió Mùa R hất văng mọi kẻ địch.',
      'Tăng tốc độ di chuyển và buff lượng khiên E khổng lồ cộng thêm sát thương công kích cho xạ thủ.',
      'Thả diều và bảo kê cực kỳ khó chịu khiến đấu sĩ/sát thủ địch không thể chạm tới chủ lực.',
    ],
    cons: [
      'Thân hình rất mỏng manh, dễ bốc hơi nếu bị bắt lẻ trúng khống chế cứng.',
      'Không có khả năng mở giao tranh chủ động.',
    ],
    keyTip: 'Ủ gió Q theo hướng đối phương chuẩn bị lao tới; giữ R để hất văng Kennen, Samira, Fiddlesticks khi chúng lao vào.',
    archetype: 'SUPPORT',
  },
  Ahri: {
    pros: [
      '3 lần lướt từ chiêu cuối Phi Hồ (R) cộng dồn thêm khi hạ gục giúp giữ vị trí cực kỳ an toàn.',
      'Hôn Gió (E) là kỹ năng khống chế ngắt nhịp lao vào và bắt lẻ đối phương xuất sắc.',
      'Sát thương chuẩn lượt về từ Q giúp dọn lính nhanh và cấu máu hiệu quả.',
    ],
    cons: [
      'Sát thương dồn một mục tiêu không quá cao nếu so với các sát thủ thuần túy.',
      'Phụ thuộc vào việc dùng trúng Hôn Gió E; nếu hụt E thì áp lực giảm mạnh.',
    ],
    keyTip: 'Đẩy đường bằng Q rồi di chuyển phối hợp cùng rừng; giữ E để chặn đứng đối thủ khi chúng lao vào theo đường thẳng.',
    archetype: 'MAGE',
  },
};

// Smart fallback profile generator based on champion role / class
export function getChampionProfile(championId: string, championName: string): ChampionProfile {
  if (CHAMPION_PROFILES[championId]) {
    return CHAMPION_PROFILES[championId];
  }

  // Sensible default champion profile
  return {
    pros: [
      `Có lợi thế về chất tướng và cơ chế kỹ năng khi đối đầu với các lựa chọn đối phương.`,
      `Khả năng đóng góp lớn vào thế trận nếu tận dụng tốt chất tướng và giữ vị trí chuẩn xác.`,
      `Có thời điểm đạt ngưỡng sức mạnh rõ rệt sau khi hoàn thành trang bị trấn phái.`,
    ],
    cons: [
      `Cần kiểm soát tầm nhìn và giữ khoảng cách cẩn thận tránh bị bắt lẻ hoặc dồn khống chế.`,
      `Cần thi triển kỹ năng định hướng chuẩn xác để phát huy tối đa lượng sát thương.`,
    ],
    keyTip: `Tập trung farm giữ lính ổn định đầu trận, kiểm soát thời gian hồi chiêu của đối thủ trước khi trao đổi.`,
    archetype: 'BRUISER',
  };
}
