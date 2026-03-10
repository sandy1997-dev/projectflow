export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: "ADMIN" | "MEMBER";
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  members: WorkspaceMember[];
  boards: Board[];
}

export interface WorkspaceMember {
  id: string;
  user: User;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  background?: string;
  isPublic: boolean;
  creator: User;
  workspace: Workspace;
  lists: List[];
  labels: Label[];
  cardCount: number;
  completedCardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
  position: number;
  cards: Card[];
  cardCount: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  dueDate?: string;
  startDate?: string;
  coverColor?: string;
  coverImage?: string;
  assignee?: User;
  creator: User;
  list: List;
  labels: Label[];
  comments: Comment[];
  attachments: Attachment[];
  checklists: Checklist[];
  commentCount: number;
  attachmentCount: number;
  checklistProgress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  progress: number;
}

export interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: User & { id: string };
  }
}
