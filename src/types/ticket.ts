export type Ticket = {
  id?: number;
  title: string;
  description?: string;
  requester: string;
  status?: "open" | "in_progress" | "closed";
  priority?: "low" | "normal" | "high";
  createdAt?: string;
  updatedAt?: string;
};
