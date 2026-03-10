import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId, email, role } = await req.json();
  if (!workspaceId || !email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check caller is admin/owner
  const myMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!myMember || !["OWNER", "ADMIN"].includes(myMember.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const invitee = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!invitee) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });

  const existing = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: invitee.id } });
  if (existing) return NextResponse.json({ error: "User is already a member" }, { status: 400 });

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: invitee.id, role },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: invitee.id,
      type: "BOARD_INVITE",
      message: `You've been invited to a workspace as ${role}`,
    },
  });

  return NextResponse.json(member);
}
