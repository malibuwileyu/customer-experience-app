/**
 * @fileoverview Ticket model type definitions
 * @module types/models/ticket
 * @description
 * Type definitions for the ticket management system.
 * Includes ticket, comment, and attachment types.
 */

import { Profile } from '../auth.types';

/**
 * Ticket priority levels
 * 
 * @type {TicketPriority}
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Ticket status values
 * 
 * @type {TicketStatus}
 */
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

/**
 * Ticket category
 * 
 * @type {TicketCategory}
 */
export type TicketCategory = 'general' | 'technical' | 'billing' | 'feature_request' | 'bug_report';

/**
 * Base ticket model
 * 
 * @interface Ticket
 * @property {string} id - Unique identifier
 * @property {string} title - Ticket title
 * @property {string} description - Ticket description
 * @property {TicketStatus} status - Current ticket status
 * @property {TicketPriority} priority - Ticket priority level
 * @property {TicketCategory} category - Ticket category
 * @property {string} created_by - User ID who created the ticket
 * @property {string | null} assigned_to - User ID of assigned agent
 * @property {Profile} customer - Customer who created the ticket
 * @property {Profile | null} agent - Agent assigned to the ticket
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string | null} resolved_at - Resolution timestamp
 * @property {string | null} closed_at - Closure timestamp
 * @property {TicketComment[]} comments - Ticket comments
 * @property {TicketAttachment[]} attachments - Ticket attachments
 * @property {Record<string, unknown>} metadata - Additional ticket metadata
 */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_by: string;
  assigned_to: string | null;
  customer: Profile;
  agent: Profile | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  metadata: Record<string, unknown>;
}

/**
 * Ticket comment model
 * 
 * @interface TicketComment
 * @property {string} id - Unique identifier
 * @property {string} ticket_id - Associated ticket ID
 * @property {string} content - Comment content
 * @property {string} created_by - User ID who created the comment
 * @property {Profile} author - User who created the comment
 * @property {boolean} is_internal - Whether the comment is internal
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {TicketAttachment[]} attachments - Comment attachments
 */
export interface TicketComment {
  id: string;
  ticket_id: string;
  content: string;
  created_by: string;
  author: Profile;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  attachments: TicketAttachment[];
}

/**
 * Ticket attachment model
 * 
 * @interface TicketAttachment
 * @property {string} id - Unique identifier
 * @property {string} ticket_id - Associated ticket ID
 * @property {string | null} comment_id - Associated comment ID
 * @property {string} file_name - Original file name
 * @property {string} file_type - MIME type
 * @property {number} file_size - File size in bytes
 * @property {string} file_url - URL to the file
 * @property {string} created_by - User ID who uploaded the file
 * @property {string} created_at - Upload timestamp
 */
export interface TicketAttachment {
  id: string;
  ticket_id: string;
  comment_id: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_by: string;
  created_at: string;
} 