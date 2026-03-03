import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount, deleteNotification } from '@/lib/notifications';

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const withCount = searchParams.get('count') === 'true';

    const notifications = await getUserNotifications(userId, { unreadOnly, limit });
    
    if (withCount) {
      const unreadCount = await getUnreadNotificationCount(userId);
      return NextResponse.json({ notifications, unreadCount });
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await markNotificationAsRead(notificationId, userId);
      return NextResponse.json({ success: true });
    }

    return new NextResponse('Missing notificationId or markAll', { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return new NextResponse('Missing notification id', { status: 400 });
    }

    await deleteNotification(notificationId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
