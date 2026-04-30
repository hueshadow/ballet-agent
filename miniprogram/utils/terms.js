/**
 * 芭蕾术语库（40 个）
 * 分 5 类：把杆 barre、体位 position、中间 center、跳跃 jump、通用 vocabulary
 * 每日按日期确定性轮换
 */

var TERMS = [
  // ===== 把杆 Barre (10) =====
  { fr: 'Plié', cn: '蹲', pron: 'plee-AY', category: 'barre', explanation: '双腿弯曲下蹲，保持背部挺直，膝盖对准脚尖方向。芭蕾最基础最重要的动作，几乎所有动作都以此开始和结束。' },
  { fr: 'Tendu', cn: '擦地', pron: 'tahn-DÜ', category: 'barre', explanation: '脚沿地面向前/侧/后滑出伸直，脚尖不离地。训练脚背力量和腿部控制，是把杆练习的起点。' },
  { fr: 'Dégagé', cn: '小踢腿', pron: 'day-ga-ZHAY', category: 'barre', explanation: '类似 Tendu 但脚尖离地约 25°。强调快速有力的脚部动作，训练灵敏度。' },
  { fr: 'Rond de jambe', cn: '划圈', pron: 'rohn duh ZHAHMB', category: 'barre', explanation: '工作腿在地面（à terre）或空中（en l\'air）画半圆。训练髋关节外旋和腿部协调。' },
  { fr: 'Frappé', cn: '弹动', pron: 'fra-PAY', category: 'barre', explanation: '工作脚从弯曲位置快速弹出伸直，像鞭子一样。训练脚踝力量和爆发速度。' },
  { fr: 'Fondu', cn: '融化', pron: 'fohn-DÜ', category: 'barre', explanation: '支撑腿缓慢弯曲同时工作腿展开，如同融化般流畅柔和。对控制力要求极高。' },
  { fr: 'Développé', cn: '控腿', pron: 'dayv-law-PAY', category: 'barre', explanation: '工作腿从 passé 位置缓慢展开至前/侧/后，保持在最高点。考验腿部力量和柔韧性。' },
  { fr: 'Grand battement', cn: '大踢腿', pron: 'grahn bat-MAHN', category: 'barre', explanation: '工作腿大幅度踢起至最高处。训练腿部爆发力和髋关节灵活性，是把杆最后的高潮动作。' },
  { fr: 'Relevé', cn: '上升', pron: 'ruh-luh-VAY', category: 'barre', explanation: '从全脚掌上升至半脚尖（demi-pointe）或全脚尖（pointe）。训练小腿力量和平衡感。' },
  { fr: 'Retiré / Passé', cn: '收腿 / 经过', pron: 'ruh-tee-RAY / pa-SAY', category: 'barre', explanation: '工作脚沿支撑腿滑至膝盖位置。Retiré 是静态位置，Passé 是经过膝盖的动态过程。' },

  // ===== 体位 Position (8) =====
  { fr: 'Première position', cn: '一位', pron: 'pruh-MYEHR', category: 'position', explanation: '双脚脚跟并拢，脚尖向外打开成 180°（或尽量外开）。五个基本脚位中最基础的一个。' },
  { fr: 'Cinquième position', cn: '五位', pron: 'san-KYEHM', category: 'position', explanation: '双脚前后交叉紧贴，前脚跟对后脚尖。最难也最常用的脚位，大部分动作从五位开始和结束。' },
  { fr: 'Croisé', cn: '交叉', pron: 'krwah-ZAY', category: 'position', explanation: '身体与观众成 45° 角站立，双腿看起来交叉。芭蕾中最常用的身体方向之一。' },
  { fr: 'Effacé', cn: '敞开', pron: 'eh-fa-SAY', category: 'position', explanation: '身体与观众成 45° 角，双腿看起来是打开的（与 croisé 相反）。给人开放轻盈的感觉。' },
  { fr: 'Épaulement', cn: '肩部转向', pron: 'ay-pohl-MAHN', category: 'position', explanation: '肩膀和头部微微转向，给平面的动作增加立体感和优雅。是芭蕾区别于体操的关键细节。' },
  { fr: 'Arabesque', cn: '迎风展翅', pron: 'a-ra-BESK', category: 'position', explanation: '单腿支撑，另一腿向身后抬起伸直。芭蕾中最经典最优美的线条之一，有四种标准 arabesque。' },
  { fr: 'Attitude', cn: '鹤立', pron: 'a-tee-TÜD', category: 'position', explanation: '类似 arabesque 但抬起的腿弯曲约 90°。据说灵感来自意大利雕塑家 Giovanni Bologna 的墨丘利雕像。' },
  { fr: 'En croix', cn: '十字练习', pron: 'ahn KRWAH', category: 'position', explanation: '按前（devant）、侧（à la seconde）、后（derrière）的顺序练习同一动作，形成十字路径。把杆练习的标准顺序。' },

  // ===== 中间 Centre (8) =====
  { fr: 'Balancé', cn: '摇摆步', pron: 'ba-lahn-SAY', category: 'center', explanation: '三拍子的摇摆步伐，重心在左右脚之间转换，像华尔兹。优雅流畅，常用于慢板组合。' },
  { fr: 'Pas de bourrée', cn: '碎步', pron: 'pah duh boo-RAY', category: 'center', explanation: '快速的三步移动，连接不同的舞步。芭蕾中最常见的过渡步伐，像呼吸一样自然。' },
  { fr: 'Chassé', cn: '追步', pron: 'sha-SAY', category: 'center', explanation: '一脚追赶另一脚的滑步，像在追逐。常用于大跳前的助跑或组合的连接。' },
  { fr: 'Glissade', cn: '滑步', pron: 'glee-SAHD', category: 'center', explanation: '贴地的滑行步伐，从五位出发又回到五位。常作为跳跃前的预备步。' },
  { fr: 'Assemblé', cn: '集合跳', pron: 'a-sahm-BLAY', category: 'center', explanation: '一腿刷出的同时起跳，空中双腿在五位合拢后落地。跳跃的基础动作。' },
  { fr: 'Jeté', cn: '投掷跳', pron: 'zhuh-TAY', category: 'center', explanation: '从一只脚起跳，落在另一只脚上，像把身体投掷出去。从小 jeté 到 grand jeté 有多种变体。' },
  { fr: 'Changement', cn: '换脚跳', pron: 'shahnzh-MAHN', category: 'center', explanation: '从五位起跳，空中交换前后脚位置落地。最基础的跳跃之一，训练垂直弹跳和脚位精准。' },
  { fr: 'Échappé', cn: '逃逸跳', pron: 'ay-sha-PAY', category: 'center', explanation: '从五位跳开至二位，再跳回五位。像双脚从五位"逃逸"出去。可做 sauté（跳）或 relevé（立）。' },

  // ===== 跳跃与旋转 Jump & Turn (7) =====
  { fr: 'Pirouette', cn: '旋转', pron: 'peer-oo-ET', category: 'jump', explanation: '单腿支撑原地旋转。En dehors（向外转）和 en dedans（向内转）两种方向。综合考验平衡、力量和协调。' },
  { fr: 'Grand jeté', cn: '大跳', pron: 'grahn zhuh-TAY', category: 'jump', explanation: '空中劈叉的大跳跃，芭蕾中最壮观的动作之一。需要强大的弹跳力和柔韧性。' },
  { fr: 'Sissonne', cn: '剪刀跳', pron: 'see-SOHN', category: 'jump', explanation: '双脚起跳单脚落地的跳跃。有 ouverte（开）和 fermée（关）等变化，要求空中线条清晰。' },
  { fr: 'Entrechat', cn: '交叉击脚跳', pron: 'ahn-truh-SHAH', category: 'jump', explanation: '起跳后双脚在空中快速交叉击打。Entrechat quatre（击打 4 次）是中级水平的标志动作。' },
  { fr: 'Fouetté', cn: '鞭转', pron: 'fweh-TAY', category: 'jump', explanation: '连续的单腿旋转，工作腿像鞭子一样甩出提供动力。经典的 32 圈 fouetté 是《天鹅湖》黑天鹅的标志。' },
  { fr: 'Tour en l\'air', cn: '空转', pron: 'toor ahn LEHR', category: 'jump', explanation: '起跳后在空中完成一圈或多圈旋转后落地。主要是男性舞者的技巧，考验爆发力和空间感。' },
  { fr: 'Sauté', cn: '跳', pron: 'soh-TAY', category: 'jump', explanation: '任何跳跃动作的总称。从最简单的双脚原地跳到复杂的大跳都属于 sauté。强调轻盈落地（toe-ball-heel）。' },

  // ===== 通用术语 Vocabulary (7) =====
  { fr: 'Port de bras', cn: '手臂运行', pron: 'por duh BRAH', category: 'vocabulary', explanation: '手臂在各个位置之间优雅地移动。不只是手臂动作，是整个上半身的呼吸与延伸。' },
  { fr: 'Révérence', cn: '谢礼', pron: 'ray-vay-RAHNSS', category: 'vocabulary', explanation: '课程结束时向老师和钢琴伴奏行的礼。优雅的鞠躬，是对舞蹈课堂的致敬和感恩。' },
  { fr: 'Adagio', cn: '慢板', pron: 'ah-DAH-zhee-oh', category: 'vocabulary', explanation: '缓慢、优雅的动作组合，强调控制力、平衡和线条延伸。中间练习的第一个部分通常是 adagio。' },
  { fr: 'Allegro', cn: '快板', pron: 'ah-LEH-groh', category: 'vocabulary', explanation: '快速、活泼的跳跃组合。分为 petit allegro（小跳）和 grand allegro（大跳），考验速度和爆发力。' },
  { fr: 'En dehors', cn: '向外', pron: 'ahn duh-OR', category: 'vocabulary', explanation: '向外的方向，远离支撑腿旋转或运动。与 en dedans（向内）相对。是芭蕾方向体系的基础概念。' },
  { fr: 'Turnout', cn: '外开', pron: 'TURN-out', category: 'vocabulary', explanation: '从髋关节开始的腿部外旋，是芭蕾最核心的身体要求。良好的外开来自髋关节而非膝盖或脚踝的强扭。' },
  { fr: 'Spotting', cn: '留头甩头', pron: 'SPOT-ing', category: 'vocabulary', explanation: '旋转时眼睛盯住一个固定点，头部最后离开最先回来。防止眩晕，保持旋转的稳定和方向感。' }
]

var CATEGORY_LABELS = {
  barre: '把杆 · Barre',
  position: '体位 · Position',
  center: '中间 · Centre',
  jump: '跳跃 · Allegro',
  vocabulary: '术语 · Vocabulaire'
}

function getTodayTerm() {
  var today = new Date()
  var epoch = new Date(2025, 0, 1)
  var dayIndex = Math.floor((today - epoch) / 86400000)
  var index = ((dayIndex % TERMS.length) + TERMS.length) % TERMS.length
  var term = TERMS[index]
  term.categoryLabel = CATEGORY_LABELS[term.category] || ''
  return term
}

module.exports = {
  TERMS: TERMS,
  CATEGORY_LABELS: CATEGORY_LABELS,
  getTodayTerm: getTodayTerm
}
