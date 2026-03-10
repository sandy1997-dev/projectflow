import { gql } from "@apollo/client";

export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id name slug description plan
      boards { id name background updatedAt cardCount completedCardCount }
      members { id role user { id name email image } }
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id name description background isPublic createdAt updatedAt
      creator { id name email image }
      workspace {
        id name slug
        members { id role user { id name email image } }
      }
      labels { id name color }
      lists {
        id name position cardCount
        cards {
          id title description position priority status dueDate coverColor checklistProgress
          commentCount attachmentCount
          assignee { id name email image }
          creator { id name email image }
          labels { id name color }
        }
      }
    }
  }
`;

export const GET_CARD = gql`
  query GetCard($id: ID!) {
    card(id: $id) {
      id title description position priority status dueDate startDate coverColor coverImage createdAt updatedAt
      assignee { id name email image }
      creator { id name email image }
      list { id name board { id name } }
      labels { id name color }
      comments { id content createdAt author { id name email image } }
      attachments { id name url type size createdAt }
      checklists {
        id title progress
        items { id content isCompleted }
      }
      activities { id type description createdAt user { id name image } }
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($boardId: ID!) {
    analytics(boardId: $boardId) {
      totalCards completedCards overdueCards completionRate avgCompletionTime
      cardsByPriority { priority count }
      cardsByStatus { status count }
      activityByDay { date created completed }
      teamProductivity { assigned completed overdue user { id name email image } }
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications { id type message isRead metadata createdAt }
    unreadNotificationCount
  }
`;

export const SEARCH_CARDS = gql`
  query SearchCards($query: String!, $boardId: ID!) {
    searchCards(query: $query, boardId: $boardId) {
      id title priority status
      list { id name }
      assignee { id name image }
      labels { id name color }
    }
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($input: CreateWorkspaceInput!) {
    createWorkspace(input: $input) { id name slug description plan }
  }
`;

export const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) { id name description background workspace { id } }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: ID!, $input: UpdateBoardInput!) {
    updateBoard(id: $id, input: $input) { id name description background isPublic }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) { deleteBoard(id: $id) }
`;

export const CREATE_LIST = gql`
  mutation CreateList($input: CreateListInput!) {
    createList(input: $input) { id name position cardCount cards { id } }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $input: UpdateListInput!) {
    updateList(id: $id, input: $input) { id name position }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) { deleteList(id: $id) }
`;

export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id title description position priority status dueDate coverColor checklistProgress
      commentCount attachmentCount
      assignee { id name email image }
      creator { id name email image }
      labels { id name color }
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $input: UpdateCardInput!) {
    updateCard(id: $id, input: $input) {
      id title description position priority status dueDate startDate coverColor checklistProgress
      commentCount attachmentCount
      assignee { id name email image }
      labels { id name color }
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) { deleteCard(id: $id) }
`;

export const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input) { id position list { id } }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) { id content createdAt author { id name email image } }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) { deleteComment(id: $id) }
`;

export const CREATE_LABEL = gql`
  mutation CreateLabel($boardId: ID!, $name: String!, $color: String!) {
    createLabel(boardId: $boardId, name: $name, color: $color) { id name color }
  }
`;

export const ADD_LABEL = gql`
  mutation AddLabel($cardId: ID!, $labelId: ID!) {
    addLabel(cardId: $cardId, labelId: $labelId) { id labels { id name color } }
  }
`;

export const REMOVE_LABEL = gql`
  mutation RemoveLabel($cardId: ID!, $labelId: ID!) {
    removeLabel(cardId: $cardId, labelId: $labelId) { id labels { id name color } }
  }
`;

export const CREATE_CHECKLIST = gql`
  mutation CreateChecklist($cardId: ID!, $title: String!) {
    createChecklist(cardId: $cardId, title: $title) { id title progress items { id content isCompleted } }
  }
`;

export const ADD_CHECKLIST_ITEM = gql`
  mutation AddChecklistItem($checklistId: ID!, $content: String!) {
    addChecklistItem(checklistId: $checklistId, content: $content) { id content isCompleted }
  }
`;

export const TOGGLE_CHECKLIST_ITEM = gql`
  mutation ToggleChecklistItem($id: ID!) {
    toggleChecklistItem(id: $id) { id isCompleted }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) { id isRead }
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllNotificationsRead { markAllNotificationsRead }
`;
