import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, connectDB } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Connect to database
    await connectDB();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip errors for statements that might already exist
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`⚠️  Skipped statement ${i + 1} (already exists or not applicable)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Database migrations completed successfully!');
    
    // Verify tables were created
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;
