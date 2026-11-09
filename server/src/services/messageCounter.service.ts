import { db } from '../config/database';
import { ENV } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns today's date formatted as YYYY-MM-DD in the configured timezone
 */
export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ENV.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export interface DailyUsageStats {
  date: string;
  careerRoom: {
    used: number;
    limit: number;
    remaining: number;
  };
  studentConnect: {
    used: number;
    limit: number;
    remaining: number;
  };
  studentIssue: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export async function getOrCreateTodayUsage(userId: string): Promise<{
  id: string;
  user_id: string;
  usage_date: string;
  career_room_count: number;
  student_connect_count: number;
  student_issue_count: number;
}> {
  const today = getTodayDateString();

  let usage = await db('daily_message_usage')
    .where({ user_id: userId, usage_date: today })
    .first();

  if (!usage) {
    const newRecord = {
      id: uuidv4(),
      user_id: userId,
      usage_date: today,
      career_room_count: 0,
      student_connect_count: 0,
      student_issue_count: 0,
      updated_at: new Date(),
    };
    try {
      await db('daily_message_usage').insert(newRecord);
      usage = newRecord;
    } catch (e) {
      // Handle potential race condition
      usage = await db('daily_message_usage')
        .where({ user_id: userId, usage_date: today })
        .first();
    }
  }

  return usage;
}

export async function getUserDailyUsage(userId: string): Promise<DailyUsageStats> {
  const today = getTodayDateString();
  const usage = await getOrCreateTodayUsage(userId);

  return {
    date: today,
    careerRoom: {
      used: usage.career_room_count,
      limit: ENV.MESSAGE_LIMIT_CAREER,
      remaining: Math.max(0, ENV.MESSAGE_LIMIT_CAREER - usage.career_room_count),
    },
    studentConnect: {
      used: usage.student_connect_count,
      limit: ENV.MESSAGE_LIMIT_CONNECT,
      remaining: Math.max(0, ENV.MESSAGE_LIMIT_CONNECT - usage.student_connect_count),
    },
    studentIssue: {
      used: usage.student_issue_count,
      limit: ENV.ISSUE_LIMIT_DAILY,
      remaining: Math.max(0, ENV.ISSUE_LIMIT_DAILY - usage.student_issue_count),
    },
  };
}

export async function consumeCareerRoomMessage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  message?: string;
}> {
  return await db.transaction(async (trx) => {
    const today = getTodayDateString();
    let usage = await trx('daily_message_usage')
      .where({ user_id: userId, usage_date: today })
      .first();

    if (!usage) {
      const newRecord = {
        id: uuidv4(),
        user_id: userId,
        usage_date: today,
        career_room_count: 0,
        student_connect_count: 0,
        student_issue_count: 0,
        updated_at: new Date(),
      };
      await trx('daily_message_usage').insert(newRecord);
      usage = newRecord;
    }

    if (usage.career_room_count >= ENV.MESSAGE_LIMIT_CAREER) {
      return {
        allowed: false,
        used: usage.career_room_count,
        remaining: 0,
        message: `Daily limit reached! You have used all ${ENV.MESSAGE_LIMIT_CAREER} messages for Career Path Rooms today. Limit resets tomorrow.`,
      };
    }

    const newCount = usage.career_room_count + 1;
    await trx('daily_message_usage')
      .where({ id: usage.id })
      .update({ career_room_count: newCount, updated_at: new Date() });

    return {
      allowed: true,
      used: newCount,
      remaining: ENV.MESSAGE_LIMIT_CAREER - newCount,
    };
  });
}

export async function consumeStudentConnectMessage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  message?: string;
}> {
  return await db.transaction(async (trx) => {
    const today = getTodayDateString();
    let usage = await trx('daily_message_usage')
      .where({ user_id: userId, usage_date: today })
      .first();

    if (!usage) {
      const newRecord = {
        id: uuidv4(),
        user_id: userId,
        usage_date: today,
        career_room_count: 0,
        student_connect_count: 0,
        student_issue_count: 0,
        updated_at: new Date(),
      };
      await trx('daily_message_usage').insert(newRecord);
      usage = newRecord;
    }

    if (usage.student_connect_count >= ENV.MESSAGE_LIMIT_CONNECT) {
      return {
        allowed: false,
        used: usage.student_connect_count,
        remaining: 0,
        message: `Daily limit reached! You have used all ${ENV.MESSAGE_LIMIT_CONNECT} messages for Student Connect today. Limit resets tomorrow.`,
      };
    }

    const newCount = usage.student_connect_count + 1;
    await trx('daily_message_usage')
      .where({ id: usage.id })
      .update({ student_connect_count: newCount, updated_at: new Date() });

    return {
      allowed: true,
      used: newCount,
      remaining: ENV.MESSAGE_LIMIT_CONNECT - newCount,
    };
  });
}

export async function consumeStudentIssueSubmission(userId: string): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  message?: string;
}> {
  return await db.transaction(async (trx) => {
    const today = getTodayDateString();
    let usage = await trx('daily_message_usage')
      .where({ user_id: userId, usage_date: today })
      .first();

    if (!usage) {
      const newRecord = {
        id: uuidv4(),
        user_id: userId,
        usage_date: today,
        career_room_count: 0,
        student_connect_count: 0,
        student_issue_count: 0,
        updated_at: new Date(),
      };
      await trx('daily_message_usage').insert(newRecord);
      usage = newRecord;
    }

    if (usage.student_issue_count >= ENV.ISSUE_LIMIT_DAILY) {
      return {
        allowed: false,
        used: usage.student_issue_count,
        remaining: 0,
        message: `Daily limit reached! You can only submit a maximum of ${ENV.ISSUE_LIMIT_DAILY} issues per day. Please check back tomorrow.`,
      };
    }

    const newCount = usage.student_issue_count + 1;
    await trx('daily_message_usage')
      .where({ id: usage.id })
      .update({ student_issue_count: newCount, updated_at: new Date() });

    return {
      allowed: true,
      used: newCount,
      remaining: ENV.ISSUE_LIMIT_DAILY - newCount,
    };
  });
}
