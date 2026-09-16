import type { FeedbackItem } from '../../types';

const STORAGE_KEY = 'smartlayout_ai_feedback';

export function getFeedbackHistory(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordFeedback(
  issueId: string,
  issueTitle: string,
  action: 'accepted' | 'rejected',
  userComment?: string
): FeedbackItem[] {
  const history = getFeedbackHistory();
  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    issueId,
    issueTitle,
    action,
    timestamp: new Date().toLocaleTimeString(),
    userComment
  };

  const updated = [newItem, ...history];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save feedback history', e);
  }
  return updated;
}

export function clearFeedbackHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear feedback history', e);
  }
}
