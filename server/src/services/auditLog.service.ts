import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await db('audit_logs').insert({
      id: uuidv4(),
      user_id: params.userId || null,
      action: params.action,
      resource: params.resource,
      details: params.details ? JSON.stringify(params.details) : null,
      ip_address: params.ipAddress || null,
      created_at: new Date(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
