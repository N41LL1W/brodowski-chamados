// src/types/ticket.ts

export interface Ticket {
  id: number;
  title: string;
  description: string;
  requester: string;
  status: string;
  priority: string;
  createdAt: string;
}

// Criamos um "Type Alias" para que o ControladorPage encontre o nome que ele procura
export type SerializedTicket = Ticket;