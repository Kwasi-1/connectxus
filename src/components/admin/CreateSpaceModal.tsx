import React from 'react';
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
import { adminApi, type CreateSpaceRequest } from '@/api/admin.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createSpaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type CreateSpaceFormValues = z.infer<typeof createSpaceSchema>;

interface CreateSpaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (spaceId: string) => void;
}

export function CreateSpaceModal({ open, onOpenChange, onSuccess }: CreateSpaceModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: '',
      location: '',
      contact_email: '',
    },
  });

  const createSpaceMutation = useMutation({
    mutationFn: (data: CreateSpaceRequest) => adminApi.createSpace(data),
    onSuccess: (newSpace) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      toast.success('Space created successfully');
      form.reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(newSpace.id);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create space');
    },
  });

  const onSubmit = (data: CreateSpaceFormValues) => {
    createSpaceMutation.mutate(data);
  };

    const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    form.setValue('slug', slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
          <DialogDescription>
            Create a new space for your community. Spaces are isolated environments with their own
            users, posts, and communities.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My University"
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>The display name of your space</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="my-university" />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (lowercase, hyphens only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A brief description of your space..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="University, Company, etc." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="New York, USA" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contact@example.com" />
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
                disabled={createSpaceMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSpaceMutation.isPending}>
                {createSpaceMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Space
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
