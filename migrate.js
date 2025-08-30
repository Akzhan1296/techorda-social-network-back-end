const { Client } = require('pg');

async function addUserIdColumn() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_GtUYkyzT06qI@ep-bitter-surf-adcmaxrk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Проверяем, существует ли колонка
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='blog' AND column_name='userId'
    `);
    
    if (result.rows.length === 0) {
      // Добавляем колонку, если она не существует
      await client.query(`
        ALTER TABLE public."blog" 
        ADD COLUMN "userId" character varying
      `);
      console.log('Successfully added userId column to blog table');
    } else {
      console.log('userId column already exists in blog table');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addUserIdColumn();
