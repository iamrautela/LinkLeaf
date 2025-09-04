import { Mail, Phone, Building, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  avatar?: string;
}

interface ContactCardProps {
  contact: Contact;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const initials = contact.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="card-gradient shadow-elegant hover:shadow-float transition-smooth group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
            </div>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-smooth flex space-x-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2 text-primary" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="w-4 h-4 mr-2 text-primary" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Building className="w-4 h-4 mr-2 text-primary" />
            <span className="truncate">{contact.company}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {contact.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;