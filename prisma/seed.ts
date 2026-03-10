import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@projectflow.dev" },
    update: {},
    create: { name: "Demo User", email: "demo@projectflow.dev", hashedPassword },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
      description: "A demo workspace to explore ProjectFlow",
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  // Create board
  const board = await prisma.board.create({
    data: {
      name: "Product Roadmap",
      description: "Q1 2024 product planning",
      background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
      workspaceId: workspace.id,
      creatorId: user.id,
    },
  });

  // Create default labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#ef4444", boardId: board.id } }),
    prisma.label.create({ data: { name: "Feature", color: "#3b82f6", boardId: board.id } }),
    prisma.label.create({ data: { name: "Enhancement", color: "#8b5cf6", boardId: board.id } }),
    prisma.label.create({ data: { name: "Design", color: "#f59e0b", boardId: board.id } }),
  ]);

  // Create lists
  const todoList = await prisma.list.create({ data: { name: "To Do", boardId: board.id, position: 1 } });
  const inProgressList = await prisma.list.create({ data: { name: "In Progress", boardId: board.id, position: 2 } });
  const reviewList = await prisma.list.create({ data: { name: "In Review", boardId: board.id, position: 3 } });
  const doneList = await prisma.list.create({ data: { name: "Done", boardId: board.id, position: 4 } });

  // Create sample cards
  await prisma.card.create({
    data: {
      title: "Implement drag-and-drop functionality",
      description: "Add DnD Kit for card and list reordering",
      listId: inProgressList.id, creatorId: user.id, assigneeId: user.id,
      priority: "HIGH", status: "IN_PROGRESS",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      position: 1,
      labels: { create: [{ labelId: labels[1].id }] },
    },
  });

  await prisma.card.create({
    data: {
      title: "Design analytics dashboard",
      description: "Create charts for team performance metrics",
      listId: todoList.id, creatorId: user.id,
      priority: "MEDIUM", status: "TODO",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      position: 2,
      labels: { create: [{ labelId: labels[3].id }] },
    },
  });

  await prisma.card.create({
    data: {
      title: "Fix authentication bug",
      description: "Session expires too quickly on mobile",
      listId: todoList.id, creatorId: user.id, assigneeId: user.id,
      priority: "URGENT", status: "TODO",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // overdue
      position: 1,
      labels: { create: [{ labelId: labels[0].id }] },
    },
  });

  await prisma.card.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "GitHub Actions for automated deployments",
      listId: doneList.id, creatorId: user.id,
      priority: "HIGH", status: "DONE", position: 1,
      labels: { create: [{ labelId: labels[1].id }] },
    },
  });

  console.log("✅ Seed complete! Login with: demo@projectflow.dev / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
