import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Building, Tag, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSave: (data: Partial<Contact>) => Promise<void>;
}

const ContactModal: React.FC<ContactModalProps> = ({ 
  open, 
  onOpenChange, 
  contact, 
  onSave 
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedTags = ['Business', 'Client', 'Friend', 'Family', 'Partner', 'Colleague', 'Lead'];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (contact) {
      setValue('name', contact.name);
      setValue('email', contact.email || '');
      setValue('phone', contact.phone || '');
      setValue('company', contact.company || '');
      setValue('notes', contact.notes || '');
      setTags(contact.tags || []);
    } else {
      reset();
      setTags([]);
    }
  }, [contact, setValue, reset]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await onSave({
        ...data,
        tags,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        notes: data.notes || null,
      });
      
      toast.success(contact ? 'Contact updated successfully!' : 'Contact created successfully!');
      onOpenChange(false);
      reset();
      setTags([]);
    } catch (error) {
      toast.error('Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setTags([]);
    setNewTag('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
        </DialogHeader>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter contact name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="pl-10"
                {...register('phone')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="company"
                placeholder="Company name"
                className="pl-10"
                {...register('company')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {predefinedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Add custom tag"
                    className="pl-10"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(newTag)}
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="default" className="gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this contact..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {contact ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;