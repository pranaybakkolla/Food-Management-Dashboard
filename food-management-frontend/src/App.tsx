import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  
  // Navigation state to switch between views
  const [currentPage, setCurrentPage] = useState('dashboard');
  // Stores the list of food items from the database
  const [items, setItems] = useState<any[]>([]);
  // Form fields for adding new items
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  // Track IDs for editing or managing specific items
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  // Fetches all inventory items from your backend API
  const fetchData = () => {
    axios.get('http://localhost:3000/api/fooditem')
      .then(response => setItems(response.data));
  };

  // Runs once when the app starts to load the initial list
  useEffect(() => { fetchData(); }, []);

  // Sends a request to the backend to filter items by name
  const handleSearch = (keyword: string) => {
    axios.get(`http://localhost:3000/api/fooditem?Name=${keyword}`)
      .then(response => setItems(response.data));
  };

  // Adds a new item to the database using POST
  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:3000/api/fooditem', { name, category, quantity })
      .then(() => { clearForm(); fetchData(); });
  };

  // Saves changes made in the edit modal to the database
 const saveEdit = () => {
  if (editItem) {
    axios.put(`http://localhost:3000/api/fooditem/${editItem.id}`, editItem)
      .then(() => { setEditItem(null); fetchData(); });
  }
};

  // Removes a specific item from the database
  const deleteItem = (id: number) => {
    axios.delete(`http://localhost:3000/api/fooditem/${id}`).then(() => fetchData());
  };

  // Deletes every item in the database
  const deleteAll = () => {
    if(confirm("Are you sure?")) axios.delete('http://localhost:3000/api/fooditem').then(() => fetchData());
  };

  // Resets the input fields after an action
  const clearForm = () => {
  setName(''); 
  setCategory(''); 
  setQuantity('');
};
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation buttons to toggle between Dashboard and Settings */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setCurrentPage('dashboard')} className={`px-4 py-2 rounded-xl font-bold transition ${currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border border-slate-200 text-slate-600'}`}>Dashboard</button>
          <button onClick={() => setCurrentPage('settings')} className={`px-4 py-2 rounded-xl font-bold transition ${currentPage === 'settings' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border border-slate-200 text-slate-600'}`}>Settings</button>
        </div>

        {currentPage === 'dashboard' ? (
          <>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Food Management Dashboard</h1>
            
            {/* Form area to input new item details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <h2 className="text-lg font-bold text-slate-700 mb-4">Add Food Item</h2>
              <form onSubmit={addItem} className="flex flex-col gap-3 md:flex-row">
                <input className="w-full p-3 border border-slate-200 rounded-xl outline-none" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                <input className="w-full p-3 border border-slate-200 rounded-xl outline-none" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
                <input className="w-full p-3 border border-slate-200 rounded-xl outline-none" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md">Add</button>
              </form>
            </div>

            {/* List display with search and action buttons */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-700 mb-4">Food List</h2>
              <input className="w-full p-3 mb-4 border border-slate-200 rounded-xl outline-none" placeholder="Search By Name..." onChange={e => handleSearch(e.target.value)} />
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-125">
                  <thead><tr className="text-slate-500 border-b border-slate-100"><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Quantity</th><th className="p-3">Actions</th></tr></thead>
                  <tbody>
                    {items.map((item) => (
                      // Added border-b and border-slate-100 to create subtle lines between rows
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3 flex gap-2">
                          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm" onClick={() => setSelectedItem(item)}>View</button>
                          <button className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm" onClick={() => setEditItem(item)}>Edit</button>
                          <button className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm" onClick={() => deleteItem(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Danger zone for clearing the database */
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-red-100">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Settings</h2>
            <div className="max-w-md">
              <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
              <p className="text-slate-500 mb-6">This will permanently wipe all items from the Food List (database).</p>
              <button onClick={deleteAll} className="bg-red-600 w-full md:w-auto text-white px-6 py-3 rounded-xl hover:bg-red-700 font-semibold shadow-md">Delete All Data</button>
            </div>
          </div>
        )}

        {/* Modal shown only when an item is being edited */}
        {editItem && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
      <h2 className="text-xl font-bold mb-4">Edit Item</h2>
      <input className="w-full p-3 border mb-2 rounded-xl" value={editItem.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} />
      <input className="w-full p-3 border mb-2 rounded-xl" value={editItem.category || ''} onChange={e => setEditItem({...editItem, category: e.target.value})} />
      <input className="w-full p-3 border mb-6 rounded-xl" value={editItem.quantity || ''} onChange={e => setEditItem({...editItem, quantity: e.target.value})} />
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl" onClick={saveEdit}>Save</button>
        <button className="flex-1 bg-slate-200 py-2 rounded-xl" onClick={() => setEditItem(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}
        {/* Modal shown only when clicking 'View' on an item */}
        {selectedItem && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
              <p className="text-slate-600 mb-2"><strong>Category:</strong> {selectedItem.category}</p>
              <p className="text-slate-600 mb-6"><strong>Quantity:</strong> {selectedItem.quantity}</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
           </div>
        )}
      </div>
    </div>
  );
}
export default App;