export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    name: String
    email: String!
    image: String
    role: UserRole!
    createdAt: DateTime!
  }

  type Workspace {
    id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    plan: PlanType!
    members: [WorkspaceMember!]!
    boards: [Board!]!
    createdAt: DateTime!
  }

  type WorkspaceMember {
    id: ID!
    user: User!
    role: WorkspaceRole!
    joinedAt: DateTime!
  }

  type Board {
    id: ID!
    name: String!
    description: String
    background: String
    isPublic: Boolean!
    workspace: Workspace!
    creator: User!
    lists: [List!]!
    labels: [Label!]!
    activityCount: Int!
    cardCount: Int!
    completedCardCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type List {
    id: ID!
    name: String!
    position: Float!
    cards: [Card!]!
    cardCount: Int!
    createdAt: DateTime!
  }

  type Card {
    id: ID!
    title: String!
    description: String
    position: Float!
    priority: Priority!
    status: CardStatus!
    dueDate: DateTime
    startDate: DateTime
    coverColor: String
    coverImage: String
    list: List!
    assignee: User
    creator: User!
    labels: [Label!]!
    comments: [Comment!]!
    attachments: [Attachment!]!
    checklists: [Checklist!]!
    activities: [Activity!]!
    commentCount: Int!
    attachmentCount: Int!
    checklistProgress: Int
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Label {
    id: ID!
    name: String!
    color: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Attachment {
    id: ID!
    name: String!
    url: String!
    type: String!
    size: Int!
    createdAt: DateTime!
  }

  type Checklist {
    id: ID!
    title: String!
    items: [ChecklistItem!]!
    progress: Int!
  }

  type ChecklistItem {
    id: ID!
    content: String!
    isCompleted: Boolean!
  }

  type Activity {
    id: ID!
    type: String!
    description: String!
    metadata: JSON
    user: User!
    createdAt: DateTime!
  }

  type Notification {
    id: ID!
    type: NotificationType!
    message: String!
    isRead: Boolean!
    metadata: JSON
    createdAt: DateTime!
  }

  type Analytics {
    totalCards: Int!
    completedCards: Int!
    overdueCards: Int!
    cardsByPriority: [PriorityCount!]!
    cardsByStatus: [StatusCount!]!
    activityByDay: [DayCount!]!
    teamProductivity: [MemberStat!]!
    completionRate: Float!
    avgCompletionTime: Float
  }

  type PriorityCount { priority: Priority! count: Int! }
  type StatusCount { status: CardStatus! count: Int! }
  type DayCount { date: String! created: Int! completed: Int! }
  type MemberStat { user: User! assigned: Int! completed: Int! overdue: Int! }
  type AuthPayload { user: User! token: String }

  input CreateWorkspaceInput { name: String! description: String }
  input CreateBoardInput { name: String! description: String background: String workspaceId: ID! isPublic: Boolean }
  input UpdateBoardInput { name: String description: String background: String isPublic: Boolean }
  input CreateListInput { name: String! boardId: ID! position: Float }
  input UpdateListInput { name: String position: Float }
  input CreateCardInput { title: String! description: String listId: ID! priority: Priority dueDate: DateTime startDate: DateTime assigneeId: ID position: Float }
  input UpdateCardInput { title: String description: String priority: Priority status: CardStatus dueDate: DateTime startDate: DateTime assigneeId: ID coverColor: String coverImage: String }
  input MoveCardInput { cardId: ID! listId: ID! position: Float! }
  input CreateCommentInput { content: String! cardId: ID! }
  input RegisterInput { name: String! email: String! password: String! }
  input InviteMemberInput { email: String! workspaceId: ID! role: WorkspaceRole }

  enum UserRole { ADMIN MEMBER }
  enum WorkspaceRole { OWNER ADMIN MEMBER VIEWER }
  enum PlanType { FREE PRO ENTERPRISE }
  enum Priority { LOW MEDIUM HIGH URGENT }
  enum CardStatus { TODO IN_PROGRESS IN_REVIEW DONE }
  enum NotificationType { CARD_ASSIGNED CARD_DUE COMMENT_ADDED BOARD_INVITE MENTION }

  type Query {
    me: User
    workspace(id: ID!): Workspace
    workspaces: [Workspace!]!
    board(id: ID!): Board
    boards(workspaceId: ID!): [Board!]!
    card(id: ID!): Card
    notifications: [Notification!]!
    unreadNotificationCount: Int!
    analytics(boardId: ID!): Analytics!
    searchCards(query: String!, boardId: ID!): [Card!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    createWorkspace(input: CreateWorkspaceInput!): Workspace!
    updateWorkspace(id: ID!, name: String, description: String): Workspace!
    inviteMember(input: InviteMemberInput!): Boolean!
    removeMember(workspaceId: ID!, userId: ID!): Boolean!
    createBoard(input: CreateBoardInput!): Board!
    updateBoard(id: ID!, input: UpdateBoardInput!): Board!
    deleteBoard(id: ID!): Boolean!
    createList(input: CreateListInput!): List!
    updateList(id: ID!, input: UpdateListInput!): List!
    deleteList(id: ID!): Boolean!
    createCard(input: CreateCardInput!): Card!
    updateCard(id: ID!, input: UpdateCardInput!): Card!
    deleteCard(id: ID!): Boolean!
    moveCard(input: MoveCardInput!): Card!
    addLabel(cardId: ID!, labelId: ID!): Card!
    removeLabel(cardId: ID!, labelId: ID!): Card!
    createLabel(boardId: ID!, name: String!, color: String!): Label!
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
    createChecklist(cardId: ID!, title: String!): Checklist!
    addChecklistItem(checklistId: ID!, content: String!): ChecklistItem!
    toggleChecklistItem(id: ID!): ChecklistItem!
    deleteChecklist(id: ID!): Boolean!
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }
`;
