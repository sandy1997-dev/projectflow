// src/graphql/typeDefs/index.ts
export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  enum Role { ADMIN MEMBER }
  enum Plan { FREE PRO ENTERPRISE }
  enum WorkspaceRole { OWNER ADMIN MEMBER VIEWER }
  enum Priority { NONE LOW MEDIUM HIGH URGENT }
  enum CardStatus { TODO IN_PROGRESS IN_REVIEW DONE BLOCKED }
  enum ActivityType {
    CARD_CREATED CARD_MOVED CARD_UPDATED CARD_DELETED
    CARD_ASSIGNED CARD_UNASSIGNED COMMENT_ADDED COMMENT_UPDATED
    COMMENT_DELETED CHECKLIST_CREATED CHECKLIST_ITEM_COMPLETED
    LIST_CREATED LIST_UPDATED BOARD_UPDATED MEMBER_ADDED
    MEMBER_REMOVED DUE_DATE_SET LABEL_ADDED LABEL_REMOVED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    image: String
    role: Role!
    createdAt: DateTime!
    workspaces: [WorkspaceMember!]
  }

  type Workspace {
    id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    plan: Plan!
    createdAt: DateTime!
    members: [WorkspaceMember!]!
    boards: [Board!]!
    memberCount: Int!
    boardCount: Int!
  }

  type WorkspaceMember {
    id: ID!
    workspace: Workspace!
    user: User!
    role: WorkspaceRole!
    joinedAt: DateTime!
  }

  type Board {
    id: ID!
    title: String!
    description: String
    background: String!
    isPublic: Boolean!
    starred: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    creator: User!
    lists: [List!]!
    labels: [Label!]!
    activities: [Activity!]!
    cardCount: Int!
    memberCount: Int!
  }

  type List {
    id: ID!
    title: String!
    position: Float!
    color: String
    createdAt: DateTime!
    board: Board!
    cards: [Card!]!
    cardCount: Int!
  }

  type Card {
    id: ID!
    title: String!
    description: String
    position: Float!
    priority: Priority!
    status: CardStatus!
    dueDate: DateTime
    coverColor: String
    storyPoints: Int
    createdAt: DateTime!
    updatedAt: DateTime!
    list: List!
    assignees: [User!]!
    labels: [Label!]!
    checklists: [Checklist!]!
    comments: [CardComment!]!
    attachments: [Attachment!]!
    checklistProgress: ChecklistProgress!
  }

  type ChecklistProgress {
    total: Int!
    completed: Int!
    percentage: Float!
  }

  type Label {
    id: ID!
    name: String!
    color: String!
  }

  type Checklist {
    id: ID!
    title: String!
    position: Float!
    items: [ChecklistItem!]!
    progress: ChecklistProgress!
  }

  type ChecklistItem {
    id: ID!
    text: String!
    completed: Boolean!
    dueDate: DateTime
    position: Float!
  }

  type CardComment {
    id: ID!
    text: String!
    edited: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    author: User!
  }

  type Attachment {
    id: ID!
    name: String!
    url: String!
    type: String!
    size: Int!
    uploadedAt: DateTime!
  }

  type Activity {
    id: ID!
    type: ActivityType!
    data: JSON!
    createdAt: DateTime!
    user: User!
    card: Card
  }

  type Notification {
    id: ID!
    type: String!
    data: JSON!
    read: Boolean!
    createdAt: DateTime!
  }

  # Analytics Types
  type BoardAnalytics {
    totalCards: Int!
    completedCards: Int!
    overdueCards: Int!
    cardsByStatus: [StatusCount!]!
    cardsByPriority: [PriorityCount!]!
    cardsByAssignee: [AssigneeCount!]!
    completionRate: Float!
    avgCompletionDays: Float!
    activityTimeline: [ActivityDay!]!
    velocityData: [VelocityPoint!]!
    burndownData: [BurndownPoint!]!
  }

  type WorkspaceAnalytics {
    totalBoards: Int!
    totalCards: Int!
    totalMembers: Int!
    activeMembers: Int!
    completionRate: Float!
    boardActivity: [BoardActivity!]!
    teamVelocity: Float!
  }

  type StatusCount { status: String!; count: Int! }
  type PriorityCount { priority: String!; count: Int! }
  type AssigneeCount { user: User!; count: Int!; completed: Int! }
  type ActivityDay { date: String!; count: Int! }
  type VelocityPoint { week: String!; completed: Int!; created: Int! }
  type BurndownPoint { date: String!; remaining: Int!; ideal: Int! }
  type BoardActivity { board: Board!; activityCount: Int!; completionRate: Float! }

  type AuthPayload {
    token: String!
    user: User!
  }

  type MutationResponse {
    success: Boolean!
    message: String
  }

  # Inputs
  input CreateWorkspaceInput {
    name: String!
    slug: String!
    description: String
  }

  input CreateBoardInput {
    workspaceId: ID!
    title: String!
    description: String
    background: String
    isPublic: Boolean
  }

  input UpdateBoardInput {
    title: String
    description: String
    background: String
    isPublic: Boolean
    starred: Boolean
  }

  input CreateListInput {
    boardId: ID!
    title: String!
    color: String
  }

  input UpdateListInput {
    title: String
    position: Float
    color: String
  }

  input CreateCardInput {
    listId: ID!
    title: String!
    description: String
    priority: Priority
    dueDate: DateTime
    position: Float
  }

  input UpdateCardInput {
    title: String
    description: String
    priority: Priority
    status: CardStatus
    dueDate: DateTime
    coverColor: String
    storyPoints: Int
    listId: ID
    position: Float
  }

  input MoveCardInput {
    cardId: ID!
    sourceListId: ID!
    destinationListId: ID!
    newPosition: Float!
  }

  input CreateCommentInput {
    cardId: ID!
    text: String!
  }

  input CreateChecklistInput {
    cardId: ID!
    title: String!
  }

  input CreateChecklistItemInput {
    checklistId: ID!
    text: String!
  }

  input SignUpInput {
    name: String!
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type Query {
    # Auth
    me: User

    # Workspaces
    workspace(id: ID!): Workspace
    workspaceBySlug(slug: String!): Workspace
    myWorkspaces: [Workspace!]!

    # Boards
    board(id: ID!): Board
    boardsByWorkspace(workspaceId: ID!): [Board!]!

    # Lists & Cards
    list(id: ID!): List
    card(id: ID!): Card

    # Activities
    boardActivities(boardId: ID!, limit: Int, offset: Int): [Activity!]!
    cardActivities(cardId: ID!): [Activity!]!

    # Notifications
    myNotifications(unreadOnly: Boolean): [Notification!]!
    unreadNotificationCount: Int!

    # Analytics
    boardAnalytics(boardId: ID!): BoardAnalytics!
    workspaceAnalytics(workspaceId: ID!): WorkspaceAnalytics!
  }

  type Mutation {
    # Auth
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!

    # Workspace
    createWorkspace(input: CreateWorkspaceInput!): Workspace!
    updateWorkspace(id: ID!, name: String, description: String): Workspace!
    inviteMember(workspaceId: ID!, email: String!, role: WorkspaceRole): MutationResponse!
    removeMember(workspaceId: ID!, userId: ID!): MutationResponse!
    updateMemberRole(workspaceId: ID!, userId: ID!, role: WorkspaceRole!): WorkspaceMember!

    # Board
    createBoard(input: CreateBoardInput!): Board!
    updateBoard(id: ID!, input: UpdateBoardInput!): Board!
    deleteBoard(id: ID!): MutationResponse!
    starBoard(id: ID!): Board!

    # List
    createList(input: CreateListInput!): List!
    updateList(id: ID!, input: UpdateListInput!): List!
    deleteList(id: ID!): MutationResponse!
    reorderLists(boardId: ID!, listIds: [ID!]!): [List!]!

    # Card
    createCard(input: CreateCardInput!): Card!
    updateCard(id: ID!, input: UpdateCardInput!): Card!
    deleteCard(id: ID!): MutationResponse!
    moveCard(input: MoveCardInput!): Card!
    assignCard(cardId: ID!, userId: ID!): Card!
    unassignCard(cardId: ID!, userId: ID!): Card!
    addLabel(cardId: ID!, labelId: ID!): Card!
    removeLabel(cardId: ID!, labelId: ID!): Card!

    # Label
    createLabel(boardId: ID!, name: String!, color: String!): Label!
    updateLabel(id: ID!, name: String, color: String): Label!
    deleteLabel(id: ID!): MutationResponse!

    # Checklist
    createChecklist(input: CreateChecklistInput!): Checklist!
    deleteChecklist(id: ID!): MutationResponse!
    addChecklistItem(input: CreateChecklistItemInput!): ChecklistItem!
    toggleChecklistItem(id: ID!): ChecklistItem!
    deleteChecklistItem(id: ID!): MutationResponse!

    # Comment
    addComment(input: CreateCommentInput!): CardComment!
    updateComment(id: ID!, text: String!): CardComment!
    deleteComment(id: ID!): MutationResponse!

    # Notifications
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: MutationResponse!
  }

  type Subscription {
    boardUpdated(boardId: ID!): Board!
    cardUpdated(boardId: ID!): Card!
    cardCreated(boardId: ID!): Card!
    cardDeleted(boardId: ID!): ID!
    listUpdated(boardId: ID!): List!
    commentAdded(cardId: ID!): CardComment!
    activityAdded(boardId: ID!): Activity!
    notificationReceived(userId: ID!): Notification!
  }
`
