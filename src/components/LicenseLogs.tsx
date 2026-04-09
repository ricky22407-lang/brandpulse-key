import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LicenseLog {
  id: string;
  license_key: string;
  machine_id: string;
  ip_address: string;
  status: 'success' | 'failed';
  message: string;
  created_at: string;
}

export default function LicenseLogs() {
  const [logs, setLogs] = useState<LicenseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('license_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch logs: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.machine_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Verification Logs</h1>
          <p className="text-zinc-500">History of all license verification attempts</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        </Button>
      </div>

      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search logs..." 
              className="pl-10 max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>License Key</TableHead>
                  <TableHead>Machine ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                      No logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log, index) => (
                    <TableRow key={log.id || index}>
                      <TableCell className="text-zinc-600 text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <code className="bg-zinc-100 px-2 py-1 rounded text-xs font-mono">
                          {log.license_key}
                        </code>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs font-mono">
                        {log.machine_id}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs">
                        {log.ip_address}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={log.status === 'success' ? "default" : "destructive"} className="text-[10px] uppercase tracking-wider">
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-sm">
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
