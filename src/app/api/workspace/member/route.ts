import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, role } = await req.json();
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const me = await prisma.workspaceMember.findFirst({ where: { workspaceId: target.workspaceId, userId: session.user.id } });
  if (!me || !["OWNER", "ADMIN"].includes(me.role)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  if (target.role === "OWNER") return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 });

  const updated = await prisma.workspaceMember.update({ where: { id: memberId }, data: { role } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId } = await req.json();
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const me = await prisma.workspaceMember.findFirst({ where: { workspaceId: target.workspaceId, userId: session.user.id } });
  if (!me || !["OWNER", "ADMIN"].includes(me.role)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  if (target.role === "OWNER") return NextResponse.json({ error: "Cannot remove owner" }, { status: 403 });

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
