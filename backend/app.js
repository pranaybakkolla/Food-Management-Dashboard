const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // <--- CORS (Cross-Origin Resource Sharing) - ADD THIS LINE Adds cors & tells your backend: "It is safe to talk to the frontend, please allow the connection."

const app = express();
app.use(cors());//In Express, middleware (like cors and express.json) acts like a filter. By placing app.use(cors()) here, you ensure that every single request (whether it's a GET, POST, PUT, or DELETE) passes through the "CORS filter" before it reaches your actual route logic.
app.use(express.json()); // This allows your server to read incoming JSON data
const port = 3000;

// This creates the "Connector" to your MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // REPLACE THIS with the password you set during MySQL install
  database: 'food_management_db'
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the food_management_db!');
});

// This is the "POST" instruction (Create)
app.post('/api/fooditem', (req, res) => {
  const { name, category, quantity } = req.body;
  const sql = 'INSERT INTO food_items (name, category, quantity) VALUES (?, ?, ?)';
  
  db.query(sql, [name, category, quantity], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send({ id: result.insertId, name, category, quantity });
  });
});

// GET: Retrieve all food items (Read)
//app.get('/api/fooditem', (req, res) => {
// We use the 'SELECT *' command, which means "Select everything"
// db.query('SELECT * FROM food_items', (err, results) => {
//  if (err) {
      // If something goes wrong, we send a 500 (Server Error)
//    return res.status(500).send(err);
//  }
    // If successful, we send back the results (the list of food)
//  res.send(results);
// });
//});

// GET: Retrieve all items, OR search by Name if a keyword is provided
app.get('/api/fooditem', (req, res) => {
  const nameKeyword = req.query.Name;

  // Requirement: Find all fooditems whose name contains the keyword
  // "%"" symbols are crucial. %Apple% tells MySQL: "Find anything that has 'Apple' at the beginning, middle, or end of the string.
  if (nameKeyword) {
    db.query('SELECT * FROM food_items WHERE name LIKE ?', [`%${nameKeyword}%`], (err, results) => {
      if (err) return res.status(500).send(err);
      res.send(results);
    });
  } 
  // Requirement:  If no keyword,Retrieve all fooditems or just return everything (like from the previous commented "GET all" code block)
  else {
    db.query('SELECT * FROM food_items', (err, results) => {
      if (err) return res.status(500).send(err);
      res.send(results);
    });
  }
});

// GET: Retrieve a single item by its ID
app.get('/api/fooditem/:id', (req, res) => {
  // We use the '?' placeholder to safely pass the ID
  const itemId = req.params.id;
  
  db.query('SELECT * FROM food_items WHERE id = ?', [itemId], (err, results) => {
    if (err) return res.status(500).send(err);
    
    // Check if we actually found something
    if (results.length === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }
    
    // Send back just the first result found
    res.send(results[0]);
  });
});

// PUT: Update an existing food item by its ID
app.put('/api/fooditem/:id', (req, res) => {
  const { name, category, quantity } = req.body;
  const itemId = req.params.id;

  // We use the SQL 'UPDATE' command
  // SET tells MySQL which columns to change, WHERE ensures we only change the right item
  const sql = 'UPDATE food_items SET name = ?, category = ?, quantity = ? WHERE id = ?';
  
  db.query(sql, [name, category, quantity, itemId], (err, result) => {
    if (err) return res.status(500).send(err);
    
    // Check if the item actually existed to be updated
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }
    
    res.send({ message: 'Item updated successfully!' });
  });
});

// DELETE: Delete a single food item by its ID
app.delete('/api/fooditem/:id', (req, res) => {
  const itemId = req.params.id;

  // We use the SQL 'DELETE' command
  // The WHERE clause is MANDATORY here; without it, you would delete the entire table!
  const sql = 'DELETE FROM food_items WHERE id = ?';
  
  db.query(sql, [itemId], (err, result) => {
    if (err) return res.status(500).send(err);
    
    // Check if the item existed before we tried to delete it
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Item not found' });
    }
    
    res.send({ message: 'Item deleted successfully!' });
  });
});

// DELETE: Remove ALL food items from the database
app.delete('/api/fooditem', (req, res) => {
  // We use the SQL 'DELETE' command without a WHERE clause
  // This tells MySQL: "Delete every single row in this table"
  const sql = 'DELETE FROM food_items';
  
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    
    // We send back the number of rows that were deleted
    res.send({ 
      message: 'All items deleted successfully!',
      deletedCount: result.affectedRows 
    });
  });
});

app.listen(port, () => {
  console.log(`The Receptionist is listening at http://localhost:${port}`);
});