// ============================================================
// 枚举类型 — 与后端 schema.sql 完全对齐
// ============================================================

export type Urgency = 'critical' | 'high' | 'medium' | 'low';
export type RouteType = 'centralized' | 'p2p';
export type TrustTier = 'tier1' | 'tier2' | 'tier3';
export type MatchStatus = 'pending' | 'accepted' | 'enroute' | 'waiting' | 'unreachable' | 'completed' | 'rejected' | 'timeout' | 'escalated';
export type RequestStatus = 'pending' | 'processing' | 'resolved' | 'cancelled';
export type BatchStatus = 'preparing' | 'in_transit' | 'arrived' | 'distributing' | 'distributed' | 'recalled' | 'expired';
export type ShelterStatus = 'open' | 'full' | 'preparing' | 'closed';
export type AlertLevel = 'red' | 'orange' | 'yellow' | 'blue';
export type SOSStatus = 'triggered' | 'confirmed' | 'cancelled' | 'false_alarm';
export type CompletionStatus = 'submitted' | 'confirmed' | 'auto_confirmed' | 'disputed';
export type ReviewDirection = 'requester_to_provider' | 'provider_to_requester';
export type ProxyNotifyMethod = 'sms' | 'wechat' | 'none';
export type ReinforceStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
export type TriggerAction = 'escalate_route' | 'expand_radius' | 'add_dispatcher' | 'broadcast_alert';
export type LocationSource = 'gps' | 'cell_tower' | 'ip' | 'last_known';
export type AreaDensity = 'urban' | 'suburban' | 'rural';
export type VulGroup = 'elderly' | 'child' | 'pregnant' | 'disabled' | 'chronic';

// ============================================================
// 基础模型
// ============================================================

export interface User {
  id: string;
  wechat_openid?: string;
  phone: string;
  phone_masked?: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'volunteer' | 'citizen' | 'guest';
  avatar_url?: string;
  last_known_lat?: number;
  last_known_lng?: number;
  last_location_at?: string;
  status: 'active' | 'frozen' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: string;
  user_id: string;
  tier: TrustTier;
  trust_score: number;
  id_number_hash?: string;
  real_name?: string;
  real_name_masked?: string;
  max_distance_km: number;
  available: boolean;
  abandon_rate?: number;
  frozen_until?: string;
  frozen_reason?: string;
  is_certified: boolean;
  certification_type?: string;
  lat?: number;
  lng?: number;
  location_updated_at?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  user?: User;
  skills?: VolunteerSkill[];
  daily_stats?: VolunteerDailyStat;
}

export interface VolunteerSkill {
  id: string;
  volunteer_id: string;
  skill_type: string;
  skill_level: 'basic' | 'intermediate' | 'advanced';
}

export interface VolunteerDailyStat {
  id: string;
  volunteer_id: string;
  stat_date: string;
  accept_count: number;
  abandon_count: number;
  complete_count: number;
}

export interface HelpRequest {
  id: string;
  request_no: string;
  user_id?: string;
  guest_phone?: string;
  urgency: Urgency;
  route: RouteType;
  status: RequestStatus;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  address?: string;
  people_count?: number;
  vulnerable_groups?: VulGroup[];
  is_proxy: boolean;
  proxy_name?: string;
  proxy_phone?: string;
  proxy_notify_method?: ProxyNotifyMethod;
  proxy_notified_at?: string;
  area_id?: string;
  disaster_event_id?: string;
  created_at: string;
  updated_at: string;
  // joined
  needs?: RequestNeed[];
  matches?: Match[];
}

export interface RequestNeed {
  id: string;
  help_request_id: string;
  need_type: string;
  quantity: number;
  unit: string;
  fulfilled: boolean;
}

export interface Match {
  id: string;
  help_request_id: string;
  volunteer_id: string;
  match_score?: number;
  match_status?: MatchStatus;
  /** 后端列表接口返回 status（非 match_status），兼容两种命名 */
  status?: string;
  route?: RouteType;
  match_radius_used?: number;
  relay_hop?: number;
  relay_group_id?: string;
  is_cooperative?: boolean;
  cooperative_group_id?: string;
  waiting_reason?: string;
  waiting_eta_min?: number;
  unreachable_detected_at?: string;
  location_sharing_enabled?: boolean;
  accepted_at?: string;
  /** 后端列表接口返回 accept_time */
  accept_time?: string;
  enroute_at?: string;
  /** 后端列表接口返回 arrive_time */
  arrive_time?: string;
  completed_at?: string;
  /** 后端列表接口返回 complete_time */
  complete_time?: string;
  match_time?: string;
  timeout_at?: string;
  escalations?: Escalation[];
  relays?: MatchRelay[];
  reinforcements?: MatchReinforcement[];
  volunteer?: Volunteer;
  help_request?: HelpRequest;
}

export interface MatchRelay {
  id: string;
  match_id: string;
  hop: number;
  volunteer_id: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface MatchReinforcement {
  id: string;
  match_id: string;
  requester_id: string;
  volunteer_id?: string;
  reason: string;
  status: ReinforceStatus;
  created_at: string;
}

export interface Escalation {
  id: string;
  match_id: string;
  escalate_reason: string;
  handled_by?: string;
  handled_at?: string;
  created_at: string;
}

export interface SOSTrigger {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  location_source: LocationSource;
  last_known_lat?: number;
  last_known_lng?: number;
  status: SOSStatus;
  help_request_id?: string;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  match_id: string;
  submitted_by: string;
  submitted_at: string;
  status: CompletionStatus;
  confirm_method?: 'requester' | 'dispatcher' | 'auto';
  confirmed_by?: string;
  confirmed_at?: string;
  auto_confirm_deadline: string;
  dispute_reason?: string;
  photo_urls?: string[];
}

export interface Review {
  id: string;
  task_completion_id: string;
  reviewer_id: string;
  target_id: string;
  direction: ReviewDirection;
  speed_rating: number;
  attitude_rating: number;
  quality_rating: number;
  comment?: string;
  created_at: string;
}

export interface EvaluationReminder {
  id: string;
  task_completion_id: string;
  user_id: string;
  remind_type: 'initial' | 'expiring';
  sent_at: string;
}

export interface DisasterAlert {
  id: string;
  disaster_event_id?: string;
  level: AlertLevel;
  title: string;
  description?: string;
  area_ids: string[];
  issued_at: string;
  expired_at?: string;
  is_active: boolean;
}

export interface AutoTriggerRule {
  id: string;
  name: string;
  condition_alert_level: AlertLevel;
  action: TriggerAction;
  action_params?: Record<string, unknown>;
  enabled: boolean;
  triggered_count: number;
  last_triggered_at?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  total_quantity: number;
  available_quantity: number;
  unit: string;
  area_id?: string;
  updated_at: string;
}

export interface ResourceBatch {
  id: string;
  resource_id: string;
  batch_no: string;
  quantity: number;
  status: BatchStatus;
  source_area_id?: string;
  target_area_id?: string;
  from_shelter_id?: string;
  to_shelter_id?: string;
  carrier?: string;
  tracking_no?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  recalled_reason?: string;
  created_at: string;
  updated_at: string;
  resource?: Resource;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  current_occupancy: number;
  status: ShelterStatus;
  contact_phone?: string;
  area_id?: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  team_type: string;
  member_count: number;
  leader_name?: string;
  leader_phone?: string;
  status: 'active' | 'deployed' | 'standby';
  lat?: number;
  lng?: number;
  area_id?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  level: AlertLevel;
  is_pinned: boolean;
  published_at: string;
}

export interface RescueUpdate {
  id: string;
  help_request_id?: string;
  match_id?: string;
  content: string;
  update_type: string;
  created_at: string;
}

export interface VirtualPhoneBinding {
  id: string;
  match_id: string;
  virtual_number: string;
  expires_at: string;
  bound_at: string;
  unbound_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  template_id?: string;
  title: string;
  content: string;
  notification_type: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  template_name: string;
  subscription_type: 'long_term' | 'one_time';
  title_template: string;
  content_template: string;
  is_active: boolean;
}

export interface AreaDensityConfig {
  id: string;
  area_id: string;
  density: AreaDensity;
  match_radius_km: number;
  relay_enabled: boolean;
}

export interface Area {
  id: string;
  name: string;
  level: 'province' | 'city' | 'district';
  parent_id?: string;
}

export interface VolunteerLocationTrack {
  id: string;
  match_id: string;
  volunteer_id: string;
  lat: number;
  lng: number;
  speed?: number;
  accuracy?: number;
  recorded_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
  operator_id?: string;
  created_at: string;
}

// ============================================================
// Dashboard / 统计
// ============================================================

export interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  active_matches: number;
  resolved_requests: number;
  total_volunteers: number;
  available_volunteers: number;
  total_shelters: number;
  shelter_occupancy_rate: number;
}

export interface MatchStats {
  date: string;
  total_matches: number;
  p2p_coverage_rate: number;
  escalation_rate: number;
  unreachable_rate: number;
  cooperative_rate: number;
  relay_rate: number;
  avg_match_time_sec: number;
}
