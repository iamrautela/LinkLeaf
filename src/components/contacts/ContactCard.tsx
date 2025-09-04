import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Building, Edit, Trash2, Star, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Contact } from '@/lib/supabase';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage src={contact.avatar_url || undefined} alt={contact.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">{contact.company}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(contact.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2 mb-4">
            {contact.email && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Building className="w-4 h-4 mr-2 text-primary" />
                <span className="truncate">{contact.company}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {contact.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContactCard;