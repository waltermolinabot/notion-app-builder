import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit';
import { DEFAULT_ROLE_PERMISSIONS, getPermissionsForRole } from '@/lib/permissions';

// GET /api/roles - Get roles for an app
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
      return new NextResponse('Missing appId', { status: 400 });
    }

    // Verify user owns the app
    const app = await prisma.app.findFirst({
      where: { id: appId, userId },
    });

    if (!app) {
      return new NextResponse('App not found', { status: 404 });
    }

    const roles = await prisma.role.findMany({
      where: { appId },
      include: {
        userRoles: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST /api/roles - Create a new role
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { appId, name, permissions } = body;

    if (!appId || !name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify user owns the app
    const app = await prisma.app.findFirst({
      where: { id: appId, userId },
    });

    if (!app) {
      return new NextResponse('App not found', { status: 404 });
    }

    // Use provided permissions or default based on role name
    const rolePermissions = permissions || getPermissionsForRole(name);

    const role = await prisma.role.create({
      data: {
        appId,
        name: name.toLowerCase(),
        permissions: rolePermissions,
      },
    });

    // Create audit log
    await auditLog({
      action: 'created',
      entityType: 'role',
      entityId: role.id,
      userId,
      changes: { name, permissions: rolePermissions },
      appId,
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PUT /api/roles - Update a role
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { roleId, name, permissions } = body;

    if (!roleId) {
      return new NextResponse('Missing roleId', { status: 400 });
    }

    // Get existing role
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: { app: true },
    });

    if (!existingRole) {
      return new NextResponse('Role not found', { status: 404 });
    }

    // Verify user owns the app
    if (existingRole.app.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name && { name: name.toLowerCase() }),
        ...(permissions && { permissions }),
      },
    });

    // Create audit log
    await auditLog({
      action: 'updated',
      entityType: 'role',
      entityId: role.id,
      userId,
      changes: { before: existingRole, after: role },
      appId: existingRole.appId,
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/roles - Delete a role
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('id');

    if (!roleId) {
      return new NextResponse('Missing roleId', { status: 400 });
    }

    // Get existing role
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: { app: true },
    });

    if (!existingRole) {
      return new NextResponse('Role not found', { status: 404 });
    }

    // Verify user owns the app
    if (existingRole.app.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete role (cascade will remove userRoles)
    await prisma.role.delete({
      where: { id: roleId },
    });

    // Create audit log
    await auditLog({
      action: 'deleted',
      entityType: 'role',
      entityId: roleId,
      userId,
      changes: { name: existingRole.name },
      appId: existingRole.appId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
