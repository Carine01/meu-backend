/**
 * WhatsAppMessage Entity
 * Representa mensagens WhatsApp com suporte a multitenancy via clinicId
 */

export interface WhatsAppMessage {
  id?: string;
  clinicId: string;
  to: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Índices recomendados:
 * - clinicId (para queries multitenancy)
 * - status (para monitoramento)
 * - createdAt (para audit trail)
 * - composite: (clinicId, createdAt) para queries eficientes
 */
