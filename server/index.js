import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'restaurant_db',
  password: 'postgres',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Create tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Routes
app.get('/api/menu-items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting menu item' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        json_agg(json_build_object(
          'id', oi.id,
          'menu_item', mi.name,
          'quantity', oi.quantity,
          'price', oi.price
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_name, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderResult = await client.query(
      'INSERT INTO orders (customer_name, total_amount) VALUES ($1, $2) RETURNING id',
      [customer_name, total_amount]
    );
    
    const order_id = orderResult.rows[0].id;
    
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order_id, item.menu_item_id, item.quantity, item.price]
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Order created successfully', order_id });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error creating order' });
  } finally {
    client.release();
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});