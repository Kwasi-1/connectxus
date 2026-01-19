import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi } from '@/api/admin.api';
import { toast } from 'sonner';
import { Loader2, HelpCircle, Upload, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;

interface AddDepartmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

export function AddDepartmentModal({ open, onOpenChange, spaceId }: AddDepartmentModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('single');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (data: CreateDepartmentFormValues) =>
      adminApi.createDepartment({
        space_id: spaceId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      toast.success('Department created successfully');
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create department');
    },
  });

  const bulkCreateDepartmentsMutation = useMutation({
    mutationFn: (departments: any[]) =>
      adminApi.bulkCreateDepartments({
        space_id: spaceId,
        departments,
      }),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      const count = response?.count || bulkData.length;
      toast.success(`${count} department(s) created successfully`);
      setBulkFile(null);
      setBulkData([]);
      setParseError(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create departments');
    },
  });

  const onSubmit = (data: CreateDepartmentFormValues) => {
    createDepartmentMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData: any[] = [];

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content);
          if (!Array.isArray(parsedData)) {
            throw new Error('JSON file must contain an array of departments');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter((line) => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV file must have a header row and at least one data row');
          }

          const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
          parsedData = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
            const dept: any = {};
            headers.forEach((header, index) => {
              if (values[index]) {
                dept[header] = values[index];
              }
            });
            return dept;
          });
        } else {
          throw new Error('Unsupported file format. Please use CSV or JSON.');
        }

        parsedData.forEach((dept, index) => {
          if (!dept.name) {
            throw new Error(`Row ${index + 1}: name is required`);
          }
          if (!dept.college) {
            throw new Error(`Row ${index + 1}: college is required`);
          }
        });

        setBulkData(parsedData);
        toast.success(`Parsed ${parsedData.length} department(s) from file`);
      } catch (error: any) {
        setParseError(error.message || 'Failed to parse file');
        setBulkData([]);
        toast.error(error.message || 'Failed to parse file');
      }
    };

    reader.readAsText(file);
  };

  const handleBulkSubmit = () => {
    if (bulkData.length === 0) {
      toast.error('No departments to create');
      return;
    }
    bulkCreateDepartmentsMutation.mutate(bulkData);
  };

  const fileFormatHelp = (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-semibold mb-2">CSV Format:</p>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`name
"Computer Science"
"Mathematics"`}
        </pre>
      </div>
      <div>
        <p className="font-semibold mb-2">JSON Format:</p>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`[
  {
    "name": "Computer Science",
  },
  {
    "name": "Mathematics",
  }
]`}
        </pre>
      </div>
      <p className="text-muted-foreground mt-2">
        <strong>Note:</strong> The <code>name</code> field is required.
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>
            Create a new department or upload multiple departments at once. A community will be
            automatically created for each department.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Department</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4 mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Computer Science" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                

          

                


                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDepartmentMutation.isPending}>
                    {createDepartmentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Department
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">Upload File</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV or JSON file containing department data
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="w-[400px]">
                      {fileFormatHelp}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {!bulkFile ? (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary hover:underline">Choose file</span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv,.json"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">CSV or JSON files only</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{bulkFile.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setBulkFile(null);
                        setBulkData([]);
                        setParseError(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {parseError}
                </div>
              )}

              {bulkData.length > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">
                    Preview: {bulkData.length} department(s) ready to create
                  </p>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {bulkData.slice(0, 5).map((dept, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {index + 1}. {dept.name}
                        {dept.description && ` - ${dept.description.substring(0, 50)}...`}
                      </div>
                    ))}
                    {bulkData.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ... and {bulkData.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkSubmit}
                  disabled={bulkData.length === 0 || bulkCreateDepartmentsMutation.isPending}
                >
                  {bulkCreateDepartmentsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create {bulkData.length} Department(s)
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
