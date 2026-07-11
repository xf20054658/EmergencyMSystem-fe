// ============================================================
// Mock 数据 — 来自 docs/html/designer/database/mock-data.sql
// 广西洪涝灾害应急管理平台 — 模拟 2026年7月 洪涝灾情
// ============================================================
import type {
  User, HelpRequest, Match, Shelter, Announcement,
  RescueUpdate, DisasterAlert, Notification, LoginResponse,
} from '@/types/models';

// ---- 用户 (20人: 10普通 + 10支援方) ----
export const mockUsers: User[] = [
  { id: 'u0000000-0000-0000-0000-000000000001', wechat_openid: 'wx_openid_001', phone: '138****6288', phone_masked: '138****6288', name: '韦小明', role: 'citizen', last_known_lat: 22.84, last_known_lng: 108.32, status: 'active', created_at: '2026-07-08T19:45:00+08:00', updated_at: '2026-07-08T19:45:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000002', wechat_openid: 'wx_openid_002', phone: '139****1024', phone_masked: '139****1024', name: '黄大强', role: 'citizen', last_known_lat: 25.32, last_known_lng: 110.30, status: 'active', created_at: '2026-07-08T19:32:00+08:00', updated_at: '2026-07-08T19:32:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000003', wechat_openid: 'wx_openid_003', phone: '137****5566', phone_masked: '137****5566', name: '李芳芳', role: 'citizen', last_known_lat: 24.32, last_known_lng: 109.42, status: 'active', created_at: '2026-07-08T19:28:00+08:00', updated_at: '2026-07-08T19:28:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000004', wechat_openid: 'wx_openid_004', phone: '135****8899', phone_masked: '135****8899', name: '覃志远', role: 'citizen', last_known_lat: 23.90, last_known_lng: 106.62, status: 'active', created_at: '2026-07-08T19:15:00+08:00', updated_at: '2026-07-08T19:15:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000005', wechat_openid: 'wx_openid_005', phone: '188****3344', phone_masked: '188****3344', name: '陈丽华', role: 'citizen', last_known_lat: 23.48, last_known_lng: 111.30, status: 'active', created_at: '2026-07-08T19:02:00+08:00', updated_at: '2026-07-08T19:02:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000006', wechat_openid: 'wx_openid_006', phone: '133****7711', phone_masked: '133****7711', name: '林国栋', role: 'citizen', last_known_lat: 22.82, last_known_lng: 108.42, status: 'active', created_at: '2026-07-08T18:45:00+08:00', updated_at: '2026-07-08T18:45:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000007', wechat_openid: 'wx_openid_007', phone: '152****2233', phone_masked: '152****2233', name: '何秀珍', role: 'citizen', last_known_lat: 21.95, last_known_lng: 108.62, status: 'active', created_at: '2026-07-08T18:30:00+08:00', updated_at: '2026-07-08T18:30:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000008', wechat_openid: 'wx_openid_008', phone: '136****4455', phone_masked: '136****4455', name: '梁文斌', role: 'citizen', last_known_lat: 23.10, last_known_lng: 109.60, status: 'active', created_at: '2026-07-08T18:12:00+08:00', updated_at: '2026-07-08T18:12:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000009', wechat_openid: 'wx_openid_009', phone: '177****6677', phone_masked: '177****6677', name: '唐小梅', role: 'citizen', last_known_lat: 25.26, last_known_lng: 110.29, status: 'active', created_at: '2026-07-08T17:58:00+08:00', updated_at: '2026-07-08T17:58:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000010', wechat_openid: 'wx_openid_010', phone: '189****8899', phone_masked: '189****8899', name: '莫伟杰', role: 'citizen', last_known_lat: 22.76, last_known_lng: 108.32, status: 'active', created_at: '2026-07-08T17:40:00+08:00', updated_at: '2026-07-08T17:40:00+08:00' },
  // 支援方
  { id: 'u0000000-0000-0000-0000-000000000101', wechat_openid: 'wx_openid_101', phone: '138****0001', phone_masked: '138****0001', name: '张明（蓝天救援队）', role: 'volunteer', last_known_lat: 22.84, last_known_lng: 108.32, status: 'active', created_at: '2026-07-01T08:00:00+08:00', updated_at: '2026-07-08T19:30:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000102', wechat_openid: 'wx_openid_102', phone: '139****0002', phone_masked: '139****0002', name: '李强（公羊救援队）', role: 'volunteer', last_known_lat: 23.90, last_known_lng: 106.62, status: 'active', created_at: '2026-07-01T08:00:00+08:00', updated_at: '2026-07-08T19:20:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000103', wechat_openid: 'wx_openid_103', phone: '137****0003', phone_masked: '137****0003', name: '王芳（社区志愿者）', role: 'volunteer', last_known_lat: 22.82, last_known_lng: 108.42, status: 'active', created_at: '2026-07-02T09:00:00+08:00', updated_at: '2026-07-08T18:50:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000104', wechat_openid: 'wx_openid_104', phone: '136****0004', phone_masked: '136****0004', name: '刘伟（退伍军人）', role: 'volunteer', last_known_lat: 24.32, last_known_lng: 109.42, status: 'active', created_at: '2026-07-02T10:00:00+08:00', updated_at: '2026-07-08T19:31:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000105', wechat_openid: 'wx_openid_105', phone: '135****0005', phone_masked: '135****0005', name: '陈秀（热心市民）', role: 'volunteer', last_known_lat: 22.76, last_known_lng: 108.32, status: 'active', created_at: '2026-07-03T14:00:00+08:00', updated_at: '2026-07-08T17:40:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000106', wechat_openid: 'wx_openid_106', phone: '133****0006', phone_masked: '133****0006', name: '赵阳（外卖骑手）', role: 'volunteer', last_known_lat: 23.10, last_known_lng: 109.60, status: 'active', created_at: '2026-07-03T15:00:00+08:00', updated_at: '2026-07-08T18:16:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000107', wechat_openid: 'wx_openid_107', phone: '131****0007', phone_masked: '131****0007', name: '黄芳（蓝天救援队）', role: 'volunteer', last_known_lat: 25.26, last_known_lng: 110.29, status: 'active', created_at: '2026-07-01T08:00:00+08:00', updated_at: '2026-07-08T19:36:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000108', wechat_openid: 'wx_openid_108', phone: '159****0008', phone_masked: '159****0008', name: '周明（社区工作者）', role: 'volunteer', last_known_lat: 23.48, last_known_lng: 111.30, status: 'active', created_at: '2026-07-02T09:00:00+08:00', updated_at: '2026-07-08T19:05:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000109', wechat_openid: 'wx_openid_109', phone: '152****0009', phone_masked: '152****0009', name: '吴丽（心理咨询师）', role: 'volunteer', last_known_lat: 22.84, last_known_lng: 108.32, status: 'active', created_at: '2026-07-03T16:00:00+08:00', updated_at: '2026-07-08T19:00:00+08:00' },
  { id: 'u0000000-0000-0000-0000-000000000110', wechat_openid: 'wx_openid_110', phone: '188****0010', phone_masked: '188****0010', name: '孙杰（出租车司机）', role: 'volunteer', last_known_lat: 21.48, last_known_lng: 109.12, status: 'active', created_at: '2026-07-04T10:00:00+08:00', updated_at: '2026-07-08T17:30:00+08:00' },
];

// ---- 求助 (12条) ----
export const mockHelpRequests: HelpRequest[] = [
  { id: 'r0000000-0000-0000-0000-000000000001', request_no: 'HR20260708-001', user_id: 'u0000000-0000-0000-0000-000000000001', urgency: 'critical', route: 'centralized', status: 'pending', title: '洪水淹没一楼，3人被困', description: '洪水已淹没一楼，3人被困二楼，急需转移', lat: 22.84, lng: 108.32, address: '南宁市西乡塘区安吉街道', people_count: 3, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T19:45:00+08:00', updated_at: '2026-07-08T19:45:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000002', request_no: 'HR20260708-002', user_id: 'u0000000-0000-0000-0000-000000000002', urgency: 'critical', route: 'centralized', status: 'processing', title: '河水倒灌，老人被困', description: '河水倒灌进村，水位及腰，老人行动不便', lat: 25.32, lng: 110.30, address: '桂林市叠彩区大河乡', people_count: 5, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T19:32:00+08:00', updated_at: '2026-07-08T19:35:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000003', request_no: 'HR20260708-003', user_id: 'u0000000-0000-0000-0000-000000000003', urgency: 'high', route: 'p2p', status: 'pending', title: '积水深1.2米，需转移物资和人员', description: '积水深约1.2米，需转移物资和人员', lat: 24.32, lng: 109.42, address: '柳州市柳南区太阳村镇', people_count: 8, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T19:28:00+08:00', updated_at: '2026-07-08T19:28:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000004', request_no: 'HR20260708-004', user_id: 'u0000000-0000-0000-0000-000000000004', urgency: 'critical', route: 'centralized', status: 'processing', title: '山体滑坡阻断道路，200余人被困', description: '山体滑坡阻断道路，200余人被困', lat: 23.90, lng: 106.62, address: '百色市右江区龙景街道', people_count: 200, vulnerable_groups: ['child', 'elderly'], is_proxy: false, created_at: '2026-07-08T19:15:00+08:00', updated_at: '2026-07-08T19:15:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000005', request_no: 'HR20260708-005', user_id: 'u0000000-0000-0000-0000-000000000005', urgency: 'high', route: 'p2p', status: 'pending', title: '西江水位超警，沿江商铺被淹', description: '西江水位超警，沿江商铺被淹', lat: 23.48, lng: 111.30, address: '梧州市万秀区城东镇', people_count: 12, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T19:02:00+08:00', updated_at: '2026-07-08T19:02:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000006', request_no: 'HR20260708-006', user_id: 'u0000000-0000-0000-0000-000000000006', urgency: 'medium', route: 'p2p', status: 'resolved', title: '地下室积水严重，电力中断', description: '地下室积水严重，电力中断', lat: 22.82, lng: 108.42, address: '南宁市青秀区仙葫开发区', people_count: 0, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T18:45:00+08:00', updated_at: '2026-07-08T19:10:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000007', request_no: 'HR20260708-007', user_id: 'u0000000-0000-0000-0000-000000000007', urgency: 'low', route: 'p2p', status: 'resolved', title: '海水倒灌，鱼塘被淹', description: '海水倒灌，鱼塘被淹，需统计损失', lat: 21.95, lng: 108.62, address: '钦州市钦南区沙埠镇', people_count: 0, vulnerable_groups: ['elderly'], is_proxy: false, created_at: '2026-07-08T18:30:00+08:00', updated_at: '2026-07-08T18:50:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000008', request_no: 'HR20260708-008', user_id: 'u0000000-0000-0000-0000-000000000008', urgency: 'medium', route: 'p2p', status: 'processing', title: '洪水退去，需消毒防疫物资', description: '洪水退去，需消毒防疫物资', lat: 23.10, lng: 109.60, address: '贵港市港北区大圩镇', people_count: 0, vulnerable_groups: [], is_proxy: true, created_at: '2026-07-08T18:12:00+08:00', updated_at: '2026-07-08T18:12:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000009', request_no: 'HR20260708-009', user_id: 'u0000000-0000-0000-0000-000000000009', urgency: 'critical', route: 'centralized', status: 'resolved', title: '积水50cm，孕妇待产需转移', description: '积水50cm，孕妇待产需转移', lat: 25.26, lng: 110.29, address: '桂林市象山区平山街道', people_count: 2, vulnerable_groups: ['pregnant'], is_proxy: false, created_at: '2026-07-08T17:58:00+08:00', updated_at: '2026-07-08T18:20:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000010', request_no: 'HR20260708-010', user_id: 'u0000000-0000-0000-0000-000000000010', urgency: 'high', route: 'p2p', status: 'processing', title: '窨井盖被冲走，有行人落水风险', description: '窨井盖被冲走，有行人落水风险', lat: 22.76, lng: 108.32, address: '南宁市良庆区大沙田街道', people_count: 0, vulnerable_groups: [], is_proxy: false, created_at: '2026-07-08T17:40:00+08:00', updated_at: '2026-07-08T17:40:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000011', request_no: 'HR20260708-011', user_id: 'u0000000-0000-0000-0000-000000000001', urgency: 'medium', route: 'p2p', status: 'pending', title: '道路积水深，学生无法返校', description: '道路积水深，学生无法返校', lat: 24.69, lng: 107.85, address: '河池市金城江区六甲镇', people_count: 45, vulnerable_groups: ['child'], is_proxy: false, created_at: '2026-07-08T17:25:00+08:00', updated_at: '2026-07-08T17:25:00+08:00' },
  { id: 'r0000000-0000-0000-0000-000000000012', request_no: 'HR20260708-012', user_id: 'u0000000-0000-0000-0000-000000000002', urgency: 'high', route: 'centralized', status: 'processing', title: '风暴潮预警，沿海居民需转移', description: '风暴潮预警，沿海居民需转移', lat: 21.48, lng: 109.12, address: '北海市海城区高德街道', people_count: 80, vulnerable_groups: ['elderly', 'child'], is_proxy: false, created_at: '2026-07-08T17:10:00+08:00', updated_at: '2026-07-08T17:10:00+08:00' },
];

// ---- 匹配 (11条) ----
export const mockMatches: Match[] = [
  { id: 'm0000000-0000-0000-0000-000000000001', help_request_id: 'r0000000-0000-0000-0000-000000000003', volunteer_id: 'v0000000-0000-0000-0000-000000000004', match_score: 0.88, match_status: 'accepted', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T19:31:00+08:00', help_request: mockHelpRequests[2] },
  { id: 'm0000000-0000-0000-0000-000000000002', help_request_id: 'r0000000-0000-0000-0000-000000000005', volunteer_id: 'v0000000-0000-0000-0000-000000000008', match_score: 0.82, match_status: 'pending', route: 'p2p', accepted_at: undefined, help_request: mockHelpRequests[4] },
  { id: 'm0000000-0000-0000-0000-000000000003', help_request_id: 'r0000000-0000-0000-0000-000000000006', volunteer_id: 'v0000000-0000-0000-0000-000000000003', match_score: 0.91, match_status: 'completed', route: 'p2p', accepted_at: '2026-07-08T18:51:00+08:00', completed_at: '2026-07-08T19:10:00+08:00', help_request: mockHelpRequests[5] },
  { id: 'm0000000-0000-0000-0000-000000000004', help_request_id: 'r0000000-0000-0000-0000-000000000007', volunteer_id: 'v0000000-0000-0000-0000-000000000005', match_score: 0.75, match_status: 'completed', route: 'p2p', accepted_at: '2026-07-08T18:36:00+08:00', completed_at: '2026-07-08T18:50:00+08:00', help_request: mockHelpRequests[6] },
  { id: 'm0000000-0000-0000-0000-000000000005', help_request_id: 'r0000000-0000-0000-0000-000000000008', volunteer_id: 'v0000000-0000-0000-0000-000000000006', match_score: 0.79, match_status: 'waiting', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T18:16:00+08:00', help_request: mockHelpRequests[7] },
  { id: 'm0000000-0000-0000-0000-000000000006', help_request_id: 'r0000000-0000-0000-0000-000000000010', volunteer_id: 'v0000000-0000-0000-0000-000000000005', match_score: 0.72, match_status: 'unreachable', route: 'p2p', accepted_at: '2026-07-08T17:46:00+08:00', help_request: mockHelpRequests[9] },
  { id: 'm0000000-0000-0000-0000-000000000007', help_request_id: 'r0000000-0000-0000-0000-000000000011', volunteer_id: 'v0000000-0000-0000-0000-000000000010', match_score: 0.68, match_status: 'pending', route: 'p2p', help_request: mockHelpRequests[10] },
  // 接力匹配：百色农村，求助者→李强(5km)→孙杰(8km)
  { id: 'm0000000-0000-0000-0000-000000000008', help_request_id: 'r0000000-0000-0000-0000-000000000004', volunteer_id: 'v0000000-0000-0000-0000-000000000002', match_score: 0.94, match_status: 'accepted', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T19:21:00+08:00', help_request: mockHelpRequests[3] },
  { id: 'm0000000-0000-0000-0000-000000000009', help_request_id: 'r0000000-0000-0000-0000-000000000004', volunteer_id: 'v0000000-0000-0000-0000-000000000010', match_score: 0.85, match_status: 'accepted', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T19:26:00+08:00', help_request: mockHelpRequests[3] },
  // 协办匹配：张明+黄芳协作
  { id: 'm0000000-0000-0000-0000-000000000010', help_request_id: 'r0000000-0000-0000-0000-000000000002', volunteer_id: 'v0000000-0000-0000-0000-000000000001', match_score: 0.96, match_status: 'accepted', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T19:36:00+08:00', help_request: mockHelpRequests[1] },
  { id: 'm0000000-0000-0000-0000-000000000011', help_request_id: 'r0000000-0000-0000-0000-000000000002', volunteer_id: 'v0000000-0000-0000-0000-000000000007', match_score: 0.93, match_status: 'accepted', route: 'p2p', location_sharing_enabled: true, accepted_at: '2026-07-08T19:36:00+08:00', help_request: mockHelpRequests[1] },
];

// ---- 避难所 (8个) ----
export const mockShelters: Shelter[] = [
  { id: 's0000000-0000-0000-0000-000000000001', name: '南宁市体育中心安置点', address: '西乡塘区大学东路', lat: 22.83, lng: 108.31, capacity: 2000, current_occupancy: 1456, status: 'open', contact_phone: '0771-1234567' },
  { id: 's0000000-0000-0000-0000-000000000002', name: '桂林市会展中心安置点', address: '叠彩区中山中路', lat: 25.28, lng: 110.30, capacity: 1500, current_occupancy: 892, status: 'open', contact_phone: '0773-2345678' },
  { id: 's0000000-0000-0000-0000-000000000003', name: '柳州市体育馆安置点', address: '柳南区潭中西路', lat: 24.31, lng: 109.41, capacity: 1200, current_occupancy: 678, status: 'open', contact_phone: '0772-3456789' },
  { id: 's0000000-0000-0000-0000-000000000004', name: '百色市右江区一中安置点', address: '右江区城东大道', lat: 23.91, lng: 106.61, capacity: 800, current_occupancy: 800, status: 'full', contact_phone: '0776-4567890' },
  { id: 's0000000-0000-0000-0000-000000000005', name: '梧州市三中安置点', address: '万秀区蝶山一路', lat: 23.47, lng: 111.29, capacity: 600, current_occupancy: 234, status: 'open', contact_phone: '0774-5678901' },
  { id: 's0000000-0000-0000-0000-000000000006', name: '钦州市二中安置点', address: '钦南区永福东大街', lat: 21.94, lng: 108.61, capacity: 500, current_occupancy: 156, status: 'open', contact_phone: '0777-6789012' },
  { id: 's0000000-0000-0000-0000-000000000007', name: '贵港市港北小学安置点', address: '港北区金港大道', lat: 23.09, lng: 109.59, capacity: 400, current_occupancy: 89, status: 'open', contact_phone: '0775-7890123' },
  { id: 's0000000-0000-0000-0000-000000000008', name: '河池市金城江三中安置点', address: '金城江区西环路', lat: 24.68, lng: 107.84, capacity: 350, current_occupancy: 201, status: 'open', contact_phone: '0778-8901234' },
];

// ---- 公告 (5条) ----
export const mockAnnouncements: Announcement[] = [
  { id: 'ann00000-0000-0000-0000-000000000001', title: '广西启动防汛II级应急响应', content: '根据自治区气象台预报，7月8日至10日我区将迎来新一轮强降雨过程，自治区防汛抗旱指挥部决定于7月8日18时启动防汛II级应急响应。', level: 'red', is_pinned: true, published_at: '2026-07-08T19:30:00+08:00' },
  { id: 'ann00000-0000-0000-0000-000000000002', title: '关于紧急调配冲锋舟赴南宁的通知', content: '鉴于南宁市西乡塘区灾情严峻，指挥部决定从柳州、桂林紧急调配20艘冲锋舟赴南宁参与救援。', level: 'red', is_pinned: true, published_at: '2026-07-08T18:50:00+08:00' },
  { id: 'ann00000-0000-0000-0000-000000000003', title: '西江沿线群众转移安置方案', content: '西江沿线梧州、贵港段水位持续上涨，请沿岸低洼地区群众按预案转移至指定安置点。', level: 'orange', is_pinned: false, published_at: '2026-07-08T17:20:00+08:00' },
  { id: 'ann00000-0000-0000-0000-000000000004', title: '救援队伍集结点调整公告', content: '因道路积水，原南宁东收费站集结点调整至南宁收费站，请各救援队伍注意调整路线。', level: 'yellow', is_pinned: false, published_at: '2026-07-08T16:45:00+08:00' },
  { id: 'ann00000-0000-0000-0000-000000000005', title: '关于加强夜间巡查的紧急通知', content: '各市应急管理局加强夜间堤坝巡查，每2小时报告一次水位情况，发现险情立即上报。', level: 'red', is_pinned: false, published_at: '2026-07-08T15:30:00+08:00' },
];

// ---- 救援动态 (4条) ----
export const mockRescueUpdates: RescueUpdate[] = [
  { id: 'ru000000-0000-0000-0000-000000000001', content: '桂林市象山区孕妇已安全转移 · 消防救援队成功转移待产孕妇至市妇幼保健院', update_type: 'rescue', created_at: '2026-07-08T18:15:00+08:00' },
  { id: 'ru000000-0000-0000-0000-000000000002', content: '冲锋舟已抵达南宁西乡塘 · 34艘冲锋舟已部署至安吉街道开展救援', update_type: 'deployment', created_at: '2026-07-08T17:48:00+08:00' },
  { id: 'ru000000-0000-0000-0000-000000000003', content: '柳州太阳村镇物资已送达 · 饮用水200箱、方便食品150箱已签收', update_type: 'supply', created_at: '2026-07-08T17:20:00+08:00' },
  { id: 'ru000000-0000-0000-0000-000000000004', content: '百色右江区道路已抢通 · 滑坡路段已清理完毕，车辆可缓慢通行', update_type: 'recovery', created_at: '2026-07-08T16:45:00+08:00' },
];

// ---- 灾情预警 (4条：红/橙/黄/蓝) ----
export const mockDisasterAlerts: DisasterAlert[] = [
  { id: 'ALERT20260708-001', level: 'red', title: '暴雨红色预警', description: '未来3小时南宁市西乡塘区、青秀区降雨量将达100mm以上，请注意防范内涝', area_ids: ['450100'], issued_at: '2026-07-08T19:00:00+08:00', is_active: true },
  { id: 'ALERT20260708-002', level: 'orange', title: '西江洪水橙色预警', description: '西江梧州段水位超警戒线2米，沿线群众请做好转移准备', area_ids: ['450400', '450800'], issued_at: '2026-07-08T16:30:00+08:00', is_active: true },
  { id: 'ALERT20260708-003', level: 'yellow', title: '地质灾害黄色预警', description: '桂林市象山区、柳州市柳南区降雨持续，注意山体滑坡风险', area_ids: ['450300', '450200'], issued_at: '2026-07-08T14:00:00+08:00', is_active: true },
  { id: 'ALERT20260708-004', level: 'blue', title: '台风蓝色预警', description: '今年第3号台风外围环流影响北海、防城港，海上作业船只请回港', area_ids: ['450500', '450600'], issued_at: '2026-07-08T10:00:00+08:00', is_active: false },
];

// ---- 通知 (7条) ----
export const mockNotifications: Notification[] = [
  { id: 'n0000000-0000-0000-0000-000000000001', user_id: 'u0000000-0000-0000-0000-000000000101', title: '📍 附近有新任务匹配您', content: '河池市金城江区六甲镇 · 食物配送 · 距您2.3km', notification_type: 'task_assigned', is_read: false, created_at: '2026-07-08T17:25:00+08:00' },
  { id: 'n0000000-0000-0000-0000-000000000002', user_id: 'u0000000-0000-0000-0000-000000000006', title: '🤝 您的求助已被接单', content: '求助 HR20260708-006 已由认证志愿者「王芳」接单，预计15分钟内到达', notification_type: 'match_success', is_read: false, created_at: '2026-07-08T18:51:00+08:00' },
  { id: 'n0000000-0000-0000-0000-000000000003', user_id: 'u0000000-0000-0000-0000-000000000003', title: '⚠️ 您的求助已升级为指挥中心处理', content: '求助 HR20260708-003 因P2P匹配超时，已自动升级由南宁应急救援指挥中心接管', notification_type: 'escalation', is_read: false, created_at: '2026-07-08T19:35:00+08:00' },
  { id: 'n0000000-0000-0000-0000-000000000004', user_id: 'u0000000-0000-0000-0000-000000000001', title: '🌧️ 南宁市发布暴雨橙色预警', content: '未来6小时西乡塘区、青秀区降雨量50-100mm，请注意防范内涝风险', notification_type: 'disaster_alert', is_read: true, created_at: '2026-07-08T16:44:00+08:00' },
  { id: 'n0000000-0000-0000-0000-000000000005', user_id: 'u0000000-0000-0000-0000-000000000009', title: '📋 求助状态更新', content: '求助 HR20260708-009 状态已变更为「已解决」，孕妇已安全转移', notification_type: 'status_update', is_read: true, created_at: '2026-07-08T18:20:00+08:00' },
  { id: 'n0000000-0000-0000-0000-000000000006', user_id: 'u0000000-0000-0000-0000-000000000108', title: '📍 附近紧急求助', content: '梧州市万秀区城东镇 · 沙袋搬运 · 距您3.8km · II级紧急', notification_type: 'task_assigned', is_read: true, created_at: '2026-07-08T15:02:00+08:00' },
];

// ---- Mock 登录响应 (默认用户：韦小明) ----
export const mockLoginResponse: LoginResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_for_development',
  user: mockUsers[0],
};

// ---- Mock 志愿者详情 (供匹配页面展示) ----
export const mockVolunteerMap: Record<string, { name: string; tier: string; trust_score: number; skills: string[] }> = {
  'v0000000-0000-0000-0000-000000000001': { name: '张明（蓝天救援队）', tier: 'tier1', trust_score: 98, skills: ['船只操作', '水域救援'] },
  'v0000000-0000-0000-0000-000000000002': { name: '李强（公羊救援队）', tier: 'tier1', trust_score: 95, skills: ['大型机械', '道路抢通'] },
  'v0000000-0000-0000-0000-000000000003': { name: '王芳（社区志愿者）', tier: 'tier2', trust_score: 88, skills: ['物资配送', '安置服务'] },
  'v0000000-0000-0000-0000-000000000004': { name: '刘伟（退伍军人）', tier: 'tier2', trust_score: 85, skills: ['沙袋堆筑', '人员转移'] },
  'v0000000-0000-0000-0000-000000000005': { name: '陈秀（热心市民）', tier: 'tier3', trust_score: 72, skills: ['物资搬运', '信息传递'] },
  'v0000000-0000-0000-0000-000000000006': { name: '赵阳（外卖骑手）', tier: 'tier3', trust_score: 68, skills: ['路线熟悉', '物资配送'] },
  'v0000000-0000-0000-0000-000000000007': { name: '黄芳（蓝天救援队）', tier: 'tier1', trust_score: 96, skills: ['医疗急救', '水域救援'] },
  'v0000000-0000-0000-0000-000000000008': { name: '周明（社区工作者）', tier: 'tier2', trust_score: 82, skills: ['协调沟通', '安置服务'] },
  'v0000000-0000-0000-0000-000000000009': { name: '吴丽（心理咨询师）', tier: 'tier2', trust_score: 80, skills: ['心理疏导', '儿童看护'] },
  'v0000000-0000-0000-0000-000000000010': { name: '孙杰（出租车司机）', tier: 'tier3', trust_score: 65, skills: ['车辆运输', '路线熟悉'] },
};
