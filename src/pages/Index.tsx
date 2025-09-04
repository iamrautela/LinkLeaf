import { useState } from 'react';
import { Plus, Search, Filter, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContactCard from '@/components/ContactCard';
import AddContactModal from '@/components/AddContactModal';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockContacts = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc',
    tags: ['Business', 'Client'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2', 
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 987-6543',
    company: 'Design Studio',
    tags: ['Business', 'Partner'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.r@gmail.com',
    phone: '+1 (555) 456-7890',
    company: 'Freelancer',
    tags: ['Friend', 'Designer'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => contact.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const allTags = [...new Set(mockContacts.flatMap(contact => contact.tags))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="hero-gradient px-6 py-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">LinkLeaf</h1>
              <p className="text-white/80">Smart Contact Management Platform</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockContacts.length}</div>
                <p className="text-xs text-white/60">Active contacts</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">+12%</div>
                <p className="text-xs text-white/60">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">5</div>
                <p className="text-xs text-white/60">New this week</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No contacts found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Add Contact Modal */}
      <AddContactModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
};

export default Index;