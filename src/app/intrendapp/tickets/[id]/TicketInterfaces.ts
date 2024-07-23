// src/types/TicketInterfaces.ts

export interface Step {
  text?: string;
  list?: string[];
}

export interface Steps {
  [key: string]: Step;
}

export interface Ticket {
  _id: string;
  ticket_number: string;
  customer_name: string;
  steps: Steps;
  current_step: string;
  created_date: string;
  updated_date: string;
}
