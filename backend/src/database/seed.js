import bcrypt from 'bcryptjs';
import { query, connectDB } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data (in reverse order due to foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await query('DELETE FROM contact_activities');
    await query('DELETE FROM contact_tags');
    await query('DELETE FROM contacts');
    await query('DELETE FROM tags');
    await query('DELETE FROM user_preferences');
    await query('DELETE FROM users');
    
    // Reset sequences
    await query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE contacts_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE tags_id_seq RESTART WITH 1');
    
    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const userResult = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, is_verified) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      ['demo@linkleaf.com', hashedPassword, 'Demo', 'User', true]
    );
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created demo user with ID: ${userId}`);
    
    // Create tags
    console.log('🏷️  Creating tags...');
    const tags = [
      { name: 'Business', color: '#3B82F6' },
      { name: 'Client', color: '#10B981' },
      { name: 'Friend', color: '#F59E0B' },
      { name: 'Family', color: '#EF4444' },
      { name: 'Partner', color: '#8B5CF6' },
      { name: 'Colleague', color: '#06B6D4' },
      { name: 'Designer', color: '#F97316' },
      { name: 'Developer', color: '#84CC16' }
    ];
    
    const tagIds = {};
    for (const tag of tags) {
      const tagResult = await query(
        'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id',
        [tag.name, tag.color]
      );
      tagIds[tag.name] = tagResult.rows[0].id;
    }
    console.log(`✅ Created ${tags.length} tags`);
    
    // Create demo contacts
    console.log('📇 Creating demo contacts...');
    const contacts = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Solutions Inc',
        jobTitle: 'Product Manager',
        website: 'https://techsolutions.com',
        notes: 'Met at the tech conference. Very interested in our new product line.',
        tags: ['Business', 'Client']
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        phone: '+1 (555) 987-6543',
        company: 'Design Studio',
        jobTitle: 'Creative Director',
        website: 'https://designstudio.com',
        notes: 'Collaborated on several projects. Excellent designer with great vision.',
        tags: ['Business', 'Partner']
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.r@gmail.com',
        phone: '+1 (555) 456-7890',
        company: 'Freelancer',
        jobTitle: 'UI/UX Designer',
        notes: 'Friend from college. Always available for design consultations.',
        tags: ['Friend', 'Designer']
      },
      {
        name: 'David Kim',
        email: 'david.kim@startup.io',
        phone: '+1 (555) 321-9876',
        company: 'StartupCo',
        jobTitle: 'CTO',
        website: 'https://startupco.io',
        notes: 'Tech entrepreneur. Looking for potential collaboration opportunities.',
        tags: ['Business', 'Partner', 'Developer']
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.wang@corp.com',
        phone: '+1 (555) 654-3210',
        company: 'Corporate Solutions',
        jobTitle: 'Marketing Director',
        website: 'https://corpsolutions.com',
        notes: 'Potential client for our marketing automation tools.',
        tags: ['Business', 'Client']
      },
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@email.com',
        phone: '+1 (555) 789-0123',
        company: 'Creative Agency',
        jobTitle: 'Art Director',
        notes: 'Colleague from previous job. Great for creative brainstorming sessions.',
        tags: ['Colleague', 'Designer']
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@family.com',
        phone: '+1 (555) 234-5678',
        company: 'Family Business',
        jobTitle: 'Operations Manager',
        notes: 'Cousin who runs the family restaurant. Always supportive of my projects.',
        tags: ['Family']
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@dev.com',
        phone: '+1 (555) 345-6789',
        company: 'DevCorp',
        jobTitle: 'Senior Developer',
        website: 'https://devcorp.com',
        notes: 'Met through a coding bootcamp. Great technical resource.',
        tags: ['Friend', 'Developer']
      },
      {
        name: 'Rachel Brown',
        email: 'rachel.brown@consulting.com',
        phone: '+1 (555) 456-7890',
        company: 'Business Consulting',
        jobTitle: 'Senior Consultant',
        website: 'https://businessconsulting.com',
        notes: 'Business consultant with expertise in digital transformation.',
        tags: ['Business', 'Client']
      },
      {
        name: 'Tom Anderson',
        email: 'tom.anderson@email.com',
        phone: '+1 (555) 567-8901',
        company: 'Design Studio',
        jobTitle: 'Graphic Designer',
        notes: 'Freelance designer. Very creative and reliable.',
        tags: ['Partner', 'Designer']
      }
    ];
    
    for (const contactData of contacts) {
      const { tags: contactTags, ...contactFields } = contactData;
      
      // Create contact
      const contactResult = await query(
        `INSERT INTO contacts (
          user_id, name, email, phone, company, job_title, 
          website, notes, is_favorite
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          userId,
          contactFields.name,
          contactFields.email,
          contactFields.phone,
          contactFields.company,
          contactFields.jobTitle,
          contactFields.website,
          contactFields.notes,
          Math.random() > 0.7 // Randomly mark some as favorites
        ]
      );
      
      const contactId = contactResult.rows[0].id;
      
      // Add tags to contact
      for (const tagName of contactTags) {
        await query(
          'INSERT INTO contact_tags (contact_id, tag_id) VALUES ($1, $2)',
          [contactId, tagIds[tagName]]
        );
      }
    }
    
    console.log(`✅ Created ${contacts.length} demo contacts`);
    
    // Create some contact activities
    console.log('📊 Creating contact activities...');
    const activities = [
      {
        contactName: 'Sarah Johnson',
        type: 'email',
        title: 'Follow-up on product demo',
        description: 'Sent follow-up email after product demonstration'
      },
      {
        contactName: 'Michael Chen',
        type: 'meeting',
        title: 'Project collaboration discussion',
        description: 'Met to discuss potential collaboration on new design project'
      },
      {
        contactName: 'Emma Rodriguez',
        type: 'call',
        title: 'Design consultation',
        description: 'Phone call to discuss UI/UX improvements for mobile app'
      },
      {
        contactName: 'David Kim',
        type: 'email',
        title: 'Partnership proposal',
        description: 'Sent partnership proposal for tech collaboration'
      }
    ];
    
    for (const activity of activities) {
      // Get contact ID
      const contactResult = await query(
        'SELECT id FROM contacts WHERE name = $1 AND user_id = $2',
        [activity.contactName, userId]
      );
      
      if (contactResult.rows.length > 0) {
        const contactId = contactResult.rows[0].id;
        
        await query(
          `INSERT INTO contact_activities (
            contact_id, user_id, activity_type, title, description, activity_date
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            contactId,
            userId,
            activity.type,
            activity.title,
            activity.description,
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          ]
        );
      }
    }
    
    console.log(`✅ Created ${activities.length} contact activities`);
    
    // Create user preferences
    console.log('⚙️  Creating user preferences...');
    const preferences = [
      { key: 'theme', value: 'light' },
      { key: 'notifications', value: 'true' },
      { key: 'default_view', value: 'grid' },
      { key: 'contacts_per_page', value: '12' }
    ];
    
    for (const pref of preferences) {
      await query(
        'INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES ($1, $2, $3)',
        [userId, pref.key, pref.value]
      );
    }
    
    console.log(`✅ Created ${preferences.length} user preferences`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Account Details:');
    console.log('   Email: demo@linkleaf.com');
    console.log('   Password: password123');
    console.log(`   User ID: ${userId}`);
    console.log(`   Contacts: ${contacts.length}`);
    console.log(`   Tags: ${tags.length}`);
    console.log(`   Activities: ${activities.length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
