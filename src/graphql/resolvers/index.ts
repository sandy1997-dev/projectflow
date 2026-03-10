import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import prisma from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import { subDays, startOfDay, endOfDay, isPast, isToday } from "date-fns";

function requireAuth(context: any) {
  if (!context.user) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return context.user;
}

async function createActivity(data: { type: string; description: string; userId: string; boardId?: string; cardId?: string; metadata?: any }) {
  return prisma.activity.create({ data });
}

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    me: async (_: any, __: any, ctx: any) => {
      if (!ctx.user) return null;
      return prisma.user.findUnique({ where: { id: ctx.user.id } });
    },

    workspaces: async (_: any, __: any, ctx: any) => {
      const user = requireAuth(ctx);
      const members = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
        include: { workspace: { include: { members: { include: { user: true } }, boards: true } } },
      });
      return members.map((m) => m.workspace);
    },

    workspace: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.workspace.findUnique({
        where: { id },
        include: { members: { include: { user: true } }, boards: true },
      });
    },

    boards: async (_: any, { workspaceId }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.board.findMany({
        where: { workspaceId },
        include: { creator: true, lists: { include: { cards: true } }, labels: true },
        orderBy: { updatedAt: "desc" },
      });
    },

    board: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.board.findUnique({
        where: { id },
        include: {
          creator: true,
          workspace: { include: { members: { include: { user: true } } } },
          labels: true,
          lists: {
            orderBy: { position: "asc" },
            include: {
              cards: {
                orderBy: { position: "asc" },
                include: {
                  assignee: true,
                  creator: true,
                  labels: { include: { label: true } },
                  _count: { select: { comments: true, attachments: true } },
                  checklists: { include: { items: true } },
                },
              },
            },
          },
        },
      });
    },

    card: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.card.findUnique({
        where: { id },
        include: {
          assignee: true,
          creator: true,
          list: { include: { board: true } },
          labels: { include: { label: true } },
          comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
          attachments: true,
          checklists: { include: { items: true } },
          activities: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
        },
      });
    },

    notifications: async (_: any, __: any, ctx: any) => {
      const user = requireAuth(ctx);
      return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },

    unreadNotificationCount: async (_: any, __: any, ctx: any) => {
      const user = requireAuth(ctx);
      return prisma.notification.count({ where: { userId: user.id, isRead: false } });
    },

    searchCards: async (_: any, { query, boardId }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.card.findMany({
        where: {
          list: { boardId },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { assignee: true, list: true, labels: { include: { label: true } } },
        take: 20,
      });
    },

    analytics: async (_: any, { boardId }: any, ctx: any) => {
      requireAuth(ctx);
      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          lists: {
            include: {
              cards: {
                include: { assignee: true, activities: true },
              },
            },
          },
        },
      });

      if (!board) throw new GraphQLError("Board not found");
      const allCards = board.lists.flatMap((l) => l.cards);
      const completedCards = allCards.filter((c) => c.status === "DONE");
      const overdueCards = allCards.filter((c) => c.dueDate && isPast(c.dueDate) && !isToday(c.dueDate) && c.status !== "DONE");

      const cardsByPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => ({
        priority: p,
        count: allCards.filter((c) => c.priority === p).length,
      }));

      const cardsByStatus = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((s) => ({
        status: s,
        count: allCards.filter((c) => c.status === s).length,
      }));

      const activityByDay = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return {
          date: date.toISOString().split("T")[0],
          created: allCards.filter((c) => {
            const d = new Date(c.createdAt);
            return d >= startOfDay(date) && d <= endOfDay(date);
          }).length,
          completed: allCards.filter((c) => {
            if (c.status !== "DONE") return false;
            const d = new Date(c.updatedAt);
            return d >= startOfDay(date) && d <= endOfDay(date);
          }).length,
        };
      });

      const userMap = new Map<string, { user: any; assigned: number; completed: number; overdue: number }>();
      allCards.forEach((card) => {
        if (!card.assignee) return;
        const key = card.assigneeId!;
        if (!userMap.has(key)) {
          userMap.set(key, { user: card.assignee, assigned: 0, completed: 0, overdue: 0 });
        }
        const stat = userMap.get(key)!;
        stat.assigned++;
        if (card.status === "DONE") stat.completed++;
        if (card.dueDate && isPast(card.dueDate) && card.status !== "DONE") stat.overdue++;
      });

      return {
        totalCards: allCards.length,
        completedCards: completedCards.length,
        overdueCards: overdueCards.length,
        cardsByPriority,
        cardsByStatus,
        activityByDay,
        teamProductivity: Array.from(userMap.values()),
        completionRate: allCards.length > 0 ? (completedCards.length / allCards.length) * 100 : 0,
        avgCompletionTime: null,
      };
    },
  },

  Mutation: {
    register: async (_: any, { input }: any) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new GraphQLError("Email already in use");
      const hashedPassword = await bcrypt.hash(input.password, 12);
      const user = await prisma.user.create({ data: { name: input.name, email: input.email, hashedPassword } });
      return { user };
    },

    createWorkspace: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      let slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = await prisma.workspace.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;
      const workspace = await prisma.workspace.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          members: { create: { userId: user.id, role: "OWNER" } },
        },
        include: { members: { include: { user: true } }, boards: true },
      });
      return workspace;
    },

    createBoard: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const board = await prisma.board.create({
        data: { ...input, creatorId: user.id, background: input.background || "#0F172A" },
        include: { creator: true, lists: true, labels: true, workspace: { include: { members: { include: { user: true } } } } },
      });
      // Create default lists
      await prisma.list.createMany({
        data: [
          { name: "To Do", boardId: board.id, position: 1 },
          { name: "In Progress", boardId: board.id, position: 2 },
          { name: "In Review", boardId: board.id, position: 3 },
          { name: "Done", boardId: board.id, position: 4 },
        ],
      });
      await createActivity({ type: "BOARD_CREATED", description: `Created board "${board.name}"`, userId: user.id, boardId: board.id });
      return prisma.board.findUnique({
        where: { id: board.id },
        include: { creator: true, lists: { include: { cards: true } }, labels: true, workspace: { include: { members: { include: { user: true } } } } },
      });
    },

    updateBoard: async (_: any, { id, input }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.board.update({
        where: { id },
        data: input,
        include: { creator: true, lists: { include: { cards: true } }, labels: true, workspace: { include: { members: { include: { user: true } } } } },
      });
    },

    deleteBoard: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      await prisma.board.delete({ where: { id } });
      return true;
    },

    createList: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const lastList = await prisma.list.findFirst({ where: { boardId: input.boardId }, orderBy: { position: "desc" } });
      const position = input.position ?? (lastList ? lastList.position + 1 : 1);
      const list = await prisma.list.create({
        data: { ...input, position },
        include: { cards: true },
      });
      await pusherServer.trigger(CHANNELS.board(input.boardId), EVENTS.LIST_CREATED, list);
      return list;
    },

    updateList: async (_: any, { id, input }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.list.update({ where: { id }, data: input, include: { cards: true } });
    },

    deleteList: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      const list = await prisma.list.findUnique({ where: { id } });
      if (!list) return false;
      await prisma.list.delete({ where: { id } });
      await pusherServer.trigger(CHANNELS.board(list.boardId), EVENTS.LIST_DELETED, { id });
      return true;
    },

    createCard: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const list = await prisma.list.findUnique({ where: { id: input.listId } });
      if (!list) throw new GraphQLError("List not found");
      const lastCard = await prisma.card.findFirst({ where: { listId: input.listId }, orderBy: { position: "desc" } });
      const position = input.position ?? (lastCard ? lastCard.position + 1 : 1);
      const card = await prisma.card.create({
        data: { ...input, creatorId: user.id, position },
        include: {
          assignee: true, creator: true,
          labels: { include: { label: true } },
          _count: { select: { comments: true, attachments: true } },
          checklists: { include: { items: true } },
          list: true,
        },
      });
      await pusherServer.trigger(CHANNELS.board(list.boardId), EVENTS.CARD_CREATED, card);
      if (input.assigneeId && input.assigneeId !== user.id) {
        await prisma.notification.create({
          data: { type: "CARD_ASSIGNED", message: `You were assigned to "${card.title}"`, userId: input.assigneeId, metadata: { cardId: card.id } },
        });
      }
      await createActivity({ type: "CARD_CREATED", description: `Created card "${card.title}"`, userId: user.id, boardId: list.boardId, cardId: card.id });
      return card;
    },

    updateCard: async (_: any, { id, input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const oldCard = await prisma.card.findUnique({ where: { id }, include: { list: true } });
      if (!oldCard) throw new GraphQLError("Card not found");
      const card = await prisma.card.update({
        where: { id },
        data: input,
        include: {
          assignee: true, creator: true,
          labels: { include: { label: true } },
          _count: { select: { comments: true, attachments: true } },
          checklists: { include: { items: true } },
          list: true,
        },
      });
      await pusherServer.trigger(CHANNELS.board(oldCard.list.boardId), EVENTS.CARD_UPDATED, card);
      if (input.assigneeId && input.assigneeId !== oldCard.assigneeId && input.assigneeId !== user.id) {
        await prisma.notification.create({
          data: { type: "CARD_ASSIGNED", message: `You were assigned to "${card.title}"`, userId: input.assigneeId, metadata: { cardId: card.id } },
        });
      }
      await createActivity({ type: "CARD_UPDATED", description: `Updated card "${card.title}"`, userId: user.id, boardId: oldCard.list.boardId, cardId: id });
      return card;
    },

    deleteCard: async (_: any, { id }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const card = await prisma.card.findUnique({ where: { id }, include: { list: true } });
      if (!card) return false;
      await prisma.card.delete({ where: { id } });
      await pusherServer.trigger(CHANNELS.board(card.list.boardId), EVENTS.CARD_DELETED, { id });
      return true;
    },

    moveCard: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const { cardId, listId, position } = input;
      const list = await prisma.list.findUnique({ where: { id: listId } });
      if (!list) throw new GraphQLError("List not found");
      const card = await prisma.card.update({
        where: { id: cardId },
        data: { listId, position },
        include: {
          assignee: true, creator: true,
          labels: { include: { label: true } },
          _count: { select: { comments: true, attachments: true } },
          checklists: { include: { items: true } },
          list: true,
        },
      });
      await pusherServer.trigger(CHANNELS.board(list.boardId), EVENTS.CARD_MOVED, { cardId, listId, position });
      return card;
    },

    createComment: async (_: any, { input }: any, ctx: any) => {
      const user = requireAuth(ctx);
      const card = await prisma.card.findUnique({ where: { id: input.cardId }, include: { list: true } });
      if (!card) throw new GraphQLError("Card not found");
      const comment = await prisma.comment.create({
        data: { content: input.content, cardId: input.cardId, authorId: user.id },
        include: { author: true },
      });
      await pusherServer.trigger(CHANNELS.board(card.list.boardId), EVENTS.COMMENT_ADDED, comment);
      return comment;
    },

    deleteComment: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      await prisma.comment.delete({ where: { id } });
      return true;
    },

    createLabel: async (_: any, { boardId, name, color }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.label.create({ data: { boardId, name, color } });
    },

    addLabel: async (_: any, { cardId, labelId }: any, ctx: any) => {
      requireAuth(ctx);
      await prisma.cardLabel.create({ data: { cardId, labelId } });
      return prisma.card.findUnique({
        where: { id: cardId },
        include: { assignee: true, creator: true, labels: { include: { label: true } }, _count: { select: { comments: true, attachments: true } }, checklists: { include: { items: true } }, list: true },
      });
    },

    removeLabel: async (_: any, { cardId, labelId }: any, ctx: any) => {
      requireAuth(ctx);
      await prisma.cardLabel.deleteMany({ where: { cardId, labelId } });
      return prisma.card.findUnique({
        where: { id: cardId },
        include: { assignee: true, creator: true, labels: { include: { label: true } }, _count: { select: { comments: true, attachments: true } }, checklists: { include: { items: true } }, list: true },
      });
    },

    createChecklist: async (_: any, { cardId, title }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.checklist.create({ data: { cardId, title }, include: { items: true } });
    },

    addChecklistItem: async (_: any, { checklistId, content }: any, ctx: any) => {
      requireAuth(ctx);
      return prisma.checklistItem.create({ data: { checklistId, content } });
    },

    toggleChecklistItem: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      const item = await prisma.checklistItem.findUnique({ where: { id } });
      if (!item) throw new GraphQLError("Item not found");
      return prisma.checklistItem.update({ where: { id }, data: { isCompleted: !item.isCompleted } });
    },

    deleteChecklist: async (_: any, { id }: any, ctx: any) => {
      requireAuth(ctx);
      await prisma.checklist.delete({ where: { id } });
      return true;
    },

    markNotificationRead: async (_: any, { id }: any, ctx: any) => {
      const user = requireAuth(ctx);
      return prisma.notification.update({ where: { id, userId: user.id }, data: { isRead: true } });
    },

    markAllNotificationsRead: async (_: any, __: any, ctx: any) => {
      const user = requireAuth(ctx);
      await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
      return true;
    },
  },

  Board: {
    cardCount: (board: any) => board.lists?.flatMap((l: any) => l.cards || []).length ?? 0,
    completedCardCount: (board: any) => board.lists?.flatMap((l: any) => l.cards || []).filter((c: any) => c.status === "DONE").length ?? 0,
    activityCount: async (board: any) => prisma.activity.count({ where: { boardId: board.id } }),
  },

  List: {
    cardCount: (list: any) => list.cards?.length ?? 0,
  },

  Card: {
    labels: (card: any) => card.labels?.map((cl: any) => cl.label) ?? [],
    commentCount: (card: any) => card._count?.comments ?? card.comments?.length ?? 0,
    attachmentCount: (card: any) => card._count?.attachments ?? card.attachments?.length ?? 0,
    checklistProgress: (card: any) => {
      if (!card.checklists) return null;
      const allItems = card.checklists.flatMap((cl: any) => cl.items || []);
      if (!allItems.length) return null;
      return Math.round((allItems.filter((i: any) => i.isCompleted).length / allItems.length) * 100);
    },
  },

  Checklist: {
    progress: (checklist: any) => {
      const items = checklist.items || [];
      if (!items.length) return 0;
      return Math.round((items.filter((i: any) => i.isCompleted).length / items.length) * 100);
    },
  },
};
