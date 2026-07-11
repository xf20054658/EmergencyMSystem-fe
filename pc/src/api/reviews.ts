// ============================================================
// 评价 API
// ============================================================

import { get, post } from './client';
import type { Review, TaskCompletion, EvaluationReminder } from '@/types/models';

export const reviewApi = {
  /** 任务完成详情 */
  getCompletion: (completionId: string) =>
    get<TaskCompletion>(`/reviews/completions/${completionId}`),

  /** 确认任务完成（求助者） */
  confirmCompletion: (completionId: string) =>
    post<TaskCompletion>(`/reviews/completions/${completionId}/confirm`),

  /** 异议 */
  disputeCompletion: (completionId: string, reason: string) =>
    post<TaskCompletion>(`/reviews/completions/${completionId}/dispute`, { reason }),

  /** 提交评价 */
  submitReview: (data: {
    task_completion_id: string;
    direction: string;
    speed_rating: number;
    attitude_rating: number;
    quality_rating: number;
    comment?: string;
  }) =>
    post<Review>('/reviews', data as unknown as Record<string, unknown>),

  /** 评价列表（我的） */
  getMyReviews: (params?: { direction?: string }) =>
    get<Review[]>('/reviews/my', params as unknown as Record<string, unknown>),

  /** 评价提醒列表 */
  getReminders: () =>
    get<EvaluationReminder[]>('/reviews/reminders'),
};
