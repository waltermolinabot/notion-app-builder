'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  appId: string | null;
  createdAt: string;
}

interface AuditLogViewerProps {
  appId?: string;
  entityType?: string;
  entityId?: string;
}

export function AuditLogViewer({ appId, entityType, entityId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [filterEntityType, setFilterEntityType] = useState<string>(entityType || 'all');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [appId, limit, offset, filterEntityType, filterAction]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (appId) params.append('appId', appId);
      if (filterEntityType !== 'all') params.append('entityType', filterEntityType);
      if (filterAction !== 'all') params.append('action', filterAction);

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'published':
        return 'bg-purple-100 text-purple-800';
      case 'synced':
        return 'bg-yellow-100 text-yellow-800';
      case 'role_assigned':
      case 'role_removed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, string> = {
      app: '🚀',
      block: '🧱',
      datasource: '🔗',
      role: '👤',
      user: '👤',
      notification: '🔔',
      subscription: '💳',
    };
    return icons[entityType] || '📋';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const exportLogs = () => {
    const csv = [
      ['Date', 'Action', 'Entity Type', 'Entity ID', 'User', 'IP Address'].join(','),
      ...logs.map((log) =>
        [
          log.createdAt,
          log.action,
          log.entityType,
          log.entityId || '',
          log.userEmail || log.userId || '',
          log.ipAddress || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-slate-500">Track all changes and actions</p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="datasource">Data Source</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="synced">Synced</SelectItem>
                  <SelectItem value="role_assigned">Role Assigned</SelectItem>
                  <SelectItem value="role_removed">Role Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getEntityIcon(log.entityType)}</span>
                        <span className="capitalize">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-slate-400 text-xs truncate max-w-[100px]">
                            {log.entityId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.userEmail || log.userId || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {log.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
