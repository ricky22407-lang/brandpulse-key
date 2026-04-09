import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table.tsx';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Plus, Power, RefreshCw, Search, Copy, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

interface LicenseKey {
  id: string;
  key: string;
  client_name: string;
  expires_at: string;
  machine_id: string | null;
  is_active: boolean;
  created_at: string;
}

export default function LicenseKeys() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [days, setDays] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch keys: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `BP-${segment()}-${segment()}-${segment()}`;
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newKey = generateKey();
      const expirationDate = addDays(new Date(), parseInt(days));

      const { error } = await supabase
        .from('license_keys')
        .insert([
          {
            key: newKey,
            client_name: clientName,
            expires_at: expirationDate.toISOString(),
            is_active: true
          }
        ]);

      if (error) throw error;

      toast.success('License key generated successfully');
      setIsAddDialogOpen(false);
      setClientName('');
      setDays('30');
      fetchKeys();
    } catch (error: any) {
      toast.error('Failed to add key: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('license_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Key ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setKeys(keys.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredKeys = keys.filter(k => 
    k.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">License Keys</h1>
          <p className="text-zinc-500">Manage and monitor your software licenses</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={fetchKeys} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New License Key</DialogTitle>
                <DialogDescription>
                  Create a new license key for a client.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddKey}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input 
                      id="client_name" 
                      placeholder="e.g. Acme Corp" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="days">Validity (Days)</Label>
                    <Input 
                      id="days" 
                      type="number" 
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Generating...' : 'Generate'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by client or key..." 
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
                  <TableHead>Client Name</TableHead>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Machine ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                      Loading license keys...
                    </TableCell>
                  </TableRow>
                ) : filteredKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-zinc-500">
                      No license keys found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.client_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-zinc-100 px-2 py-1 rounded text-xs font-mono">
                            {key.key}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(key.key)}
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? "default" : "secondary"} className={key.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-zinc-100 text-zinc-600"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-600 text-sm">
                        {format(new Date(key.expires_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs font-mono">
                        {key.machine_id || 'Not linked'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0",
                            key.is_active ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"
                          )}
                          onClick={() => toggleStatus(key.id, key.is_active)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
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

