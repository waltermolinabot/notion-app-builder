import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit';

// GET /api/roles/[roleId]/users - Get users in a role
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { roleId } = await params;

    // Get role with app
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { app: true },
    });

    if (!role) {
      return new NextResponse('Role not found', { status: 404 });
    }

    // Verify user owns the app
    if (role.app.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userRoles = await prisma.userRole.findMany({
      where: { roleId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(userRoles);
  } catch (error) {
    console.error('Error fetching role users:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST /api/roles/[roleId]/users - Add user to role
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { roleId } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new NextResponse('Missing email', { status: 400 });
    }

    // Get role with app
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { app: true },
    });

    if (!role) {
      return new NextResponse('Role not found', { status: 404 });
    }

    // Verify user owns the app
    if (role.app.userId !== currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create user role
    const userRole = await prisma.userRole.create({
      data: {
        roleId,
        userId: email, // Using email as userId for external users
        email,
      },
    });

    // Create audit log
    await auditLog({
      action: 'role_assigned',
      entityType: 'user',
      entityId: email,
      userId: currentUserId,
      changes: { roleId, roleName: role.name },
      appId: role.appId,
    });

    return NextResponse.json(userRole);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return new NextResponse('User already has this role', { status: 409 });
    }
    console.error('Error adding user to role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/roles/[roleId]/users - Remove user from role
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { roleId } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse('Missing email', { status: 400 });
    }

    // Get role with app
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { app: true },
    });

    if (!role) {
      return new NextResponse('Role not found', { status: 404 });
    }

    // Verify user owns the app
    if (role.app.userId !== currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete user role
    await prisma.userRole.deleteMany({
      where: { roleId, email },
    });

    // Create audit log
    await auditLog({
      action: 'role_removed',
      entityType: 'user',
      entityId: email,
      userId: currentUserId,
      changes: { roleId, roleName: role.name },
      appId: role.appId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user from role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
