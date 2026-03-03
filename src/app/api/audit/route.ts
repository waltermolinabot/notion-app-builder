import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuditLogs, getEntityAuditTrail, getUserAuditTrail } from '@/lib/audit';

// GET /api/audit - Get audit logs
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || undefined;
    const entityId = searchParams.get('entityId') || undefined;
    const appId = searchParams.get('appId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Parse dates
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const { logs, total } = await getAuditLogs({
      entityType: entityType as any,
      entityId,
      appId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// GET /api/audit/entity/[entityType]/[entityId] - Get audit trail for specific entity
export async function GET_ENTITY(
  request: Request,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { entityType, entityId } = await params;

    const logs = await getEntityAuditTrail(entityType as any, entityId);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching entity audit trail:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
