// src/graphql/operations.ts
import { gql } from '@apollo/client'

export const CARD_FIELDS = gql`
  fragment CardFields on Card {
    id
    title
    description
    position
    priority
    status
    dueDate
    coverColor
    storyPoints
    createdAt
    updatedAt
    assignees { id name image email }
    labels { id name color }
    checklists {
      id title position
      items { id text completed position }
      progress { total completed percentage }
    }
    checklistProgress { total completed percentage }
  }
`

export const LIST_FIELDS = gql`
  fragment ListFields on List {
    id title position color
    cards {
      ...CardFields
    }
    cardCount
  }
  ${CARD_FIELDS}
`

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user { id name email image role }
    }
  }
`

export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      token
      user { id name email image role }
    }
  }
`

export const GET_ME = gql`
  query Me {
    me { id name email image role }
  }
`

export const GET_MY_WORKSPACES = gql`
  query MyWorkspaces {
    myWorkspaces {
      id name slug description logo plan memberCount boardCount
      members { id role user { id name email image } }
    }
  }
`

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) {
      id name slug description plan memberCount
    }
  }
`

export const GET_WORKSPACE = gql`
  query GetWorkspace($id: ID!) {
    workspace(id: $id) {
      id name slug description logo plan
      members { id role joinedAt user { id name email image } }
      boards {
        id title description background starred createdAt
        creator { id name image }
        cardCount memberCount
      }
    }
  }
`

export const GET_BOARDS_BY_WORKSPACE = gql`
  query BoardsByWorkspace($workspaceId: ID!) {
    boardsByWorkspace(workspaceId: $workspaceId) {
      id title description background starred createdAt
      creator { id name image }
      cardCount
    }
  }
`

export const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id title description background starred
      workspace { id name }
    }
  }
`

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {
    updateBoard(id: $id, input: $input) {
      id title description background starred
    }
  }
`

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id) { success message }
  }
`

export const STAR_BOARD = gql`
  mutation StarBoard($id: ID!) {
    starBoard(id: $id) { id starred }
  }
`

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id title description background isPublic starred createdAt
      workspace { id name slug }
      creator { id name image }
      labels { id name color }
      lists {
        ...ListFields
      }
    }
  }
  ${LIST_FIELDS}
`

export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) {
      ...ListFields
    }
  }
  ${LIST_FIELDS}
`

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateListInput!) {
    updateList(id: $id, input: $input) { id title position color }
  }
`

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id) { success }
  }
`

export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) { ...CardFields }
  }
  ${CARD_FIELDS}
`

export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $input: UpdateCardInput!) {
    updateCard(id: $id, input: $input) {
      ...CardFields
      comments { id text edited createdAt author { id name image } }
    }
  }
  ${CARD_FIELDS}
`

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) { success }
  }
`

export const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input) { id listId position }
  }
`

export const ASSIGN_CARD = gql`
  mutation AssignCard($cardId: ID!, $userId: ID!) {
    assignCard(cardId: $cardId, userId: $userId) {
      id assignees { id name image }
    }
  }
`

export const UNASSIGN_CARD = gql`
  mutation UnassignCard($cardId: ID!, $userId: ID!) {
    unassignCard(cardId: $cardId, userId: $userId) {
      id assignees { id name image }
    }
  }
`

export const GET_CARD = gql`
  query GetCard($id: ID!) {
    card(id: $id) {
      ...CardFields
      comments { id text edited createdAt updatedAt author { id name image } }
      attachments { id name url type size uploadedAt }
      list { id title board { id title workspace { id name members { user { id name image } } } } }
    }
  }
  ${CARD_FIELDS}
`

export const ADD_COMMENT = gql`
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      id text edited createdAt author { id name image }
    }
  }
`

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $text: String!) {
    updateComment(id: $id, text: $text) { id text edited updatedAt }
  }
`

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) { success }
  }
`

export const CREATE_CHECKLIST = gql`
  mutation CreateChecklist($input: CreateChecklistInput!) {
    createChecklist(input: $input) {
      id title position
      items { id text completed position }
      progress { total completed percentage }
    }
  }
`

export const ADD_CHECKLIST_ITEM = gql`
  mutation AddChecklistItem($input: CreateChecklistItemInput!) {
    addChecklistItem(input: $input) { id text completed position }
  }
`

export const TOGGLE_CHECKLIST_ITEM = gql`
  mutation ToggleChecklistItem($id: ID!) {
    toggleChecklistItem(id: $id) { id completed }
  }
`

export const DELETE_CHECKLIST_ITEM = gql`
  mutation DeleteChecklistItem($id: ID!) {
    deleteChecklistItem(id: $id) { success }
  }
`

export const CREATE_LABEL = gql`
  mutation CreateLabel($boardId: ID!, $name: String!, $color: String!) {
    createLabel(boardId: $boardId, name: $name, color: $color) { id name color }
  }
`

export const ADD_LABEL = gql`
  mutation AddLabel($cardId: ID!, $labelId: ID!) {
    addLabel(cardId: $cardId, labelId: $labelId) {
      id labels { id name color }
    }
  }
`

export const REMOVE_LABEL = gql`
  mutation RemoveLabel($cardId: ID!, $labelId: ID!) {
    removeLabel(cardId: $cardId, labelId: $labelId) {
      id labels { id name color }
    }
  }
`

export const GET_BOARD_ACTIVITIES = gql`
  query BoardActivities($boardId: ID!, $limit: Int) {
    boardActivities(boardId: $boardId, limit: $limit) {
      id type data createdAt
      user { id name image }
      card { id title }
    }
  }
`

export const GET_BOARD_ANALYTICS = gql`
  query BoardAnalytics($boardId: ID!) {
    boardAnalytics(boardId: $boardId) {
      totalCards completedCards overdueCards completionRate avgCompletionDays
      cardsByStatus { status count }
      cardsByPriority { priority count }
      cardsByAssignee { user { id name image } count completed }
      activityTimeline { date count }
      velocityData { week completed created }
      burndownData { date remaining ideal }
    }
  }
`

export const GET_WORKSPACE_ANALYTICS = gql`
  query WorkspaceAnalytics($workspaceId: ID!) {
    workspaceAnalytics(workspaceId: $workspaceId) {
      totalBoards totalCards totalMembers activeMembers completionRate teamVelocity
      boardActivity {
        board { id title background }
        activityCount completionRate
      }
    }
  }
`

export const INVITE_MEMBER = gql`
  mutation InviteMember($workspaceId: ID!, $email: String!, $role: WorkspaceRole) {
    inviteMember(workspaceId: $workspaceId, email: $email, role: $role) {
      success message
    }
  }
`

export const REMOVE_MEMBER = gql`
  mutation RemoveMember($workspaceId: ID!, $userId: ID!) {
    removeMember(workspaceId: $workspaceId, userId: $userId) { success }
  }
`

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) {
      id type data read createdAt
    }
    unreadNotificationCount
  }
`

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) { id read }
  }
`

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead { success }
  }
`

// Subscriptions
export const ON_CARD_UPDATED = gql`
  subscription OnCardUpdated($boardId: ID!) {
    cardUpdated(boardId: $boardId) { ...CardFields }
  }
  ${CARD_FIELDS}
`

export const ON_CARD_CREATED = gql`
  subscription OnCardCreated($boardId: ID!) {
    cardCreated(boardId: $boardId) { ...CardFields }
  }
  ${CARD_FIELDS}
`

export const ON_CARD_DELETED = gql`
  subscription OnCardDeleted($boardId: ID!) {
    cardDeleted(boardId: $boardId)
  }
`

export const ON_LIST_UPDATED = gql`
  subscription OnListUpdated($boardId: ID!) {
    listUpdated(boardId: $boardId) { id title position color }
  }
`

export const ON_COMMENT_ADDED = gql`
  subscription OnCommentAdded($cardId: ID!) {
    commentAdded(cardId: $cardId) {
      id text createdAt author { id name image }
    }
  }
`
