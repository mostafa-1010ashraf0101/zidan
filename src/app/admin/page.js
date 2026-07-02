"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, limit 
} from 'firebase/firestore';

// حسابات الأدمن المعتمدة فقط (أنت وعبدالله عوض)
const ADMIN_ACCOUNTS = {
  "mostafa_zidan": { name: "Mostafa Ashraf", key: "mosta_fa_09" },
  "abdullah_awad": { name: "Abdullah Awad", key: "ebn_awad_10" }
};

export default function AdminDashboard() {
  // ===== Auth States =====
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [currentAdminName, setCurrentAdminName] = useState('');
  const [error, setError] = useState('');
  
  // ===== Tabs =====
  const [activeTab, setActiveTab] = useState('orders');

  // ===== Firebase Data =====
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]); 
  const [collections, setCollections] = useState([]); // <-- جديد
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // ===== Modals =====
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // ===== New Collection State =====
  const [newCollectionName, setNewCollectionName] = useState('');

  // ===== New Product State (مطور) =====
  const [newProduct, setNewProduct] = useState({
    title: '',
    collection: '', // هتتعبأ من الـ collections الجاية من Firebase
    price: '',
    images: [''], // مصفوفة صور (تبدأ برابط واحد)
    description: '',
    details: '',
    variants: '',
    inStock: true,
    isNew: false // <-- علامة المنتج الجديد
  });

  // ===== Slider State =====
  const [discountPercent, setDiscountPercent] = useState('');
  const [sliderText, setSliderText] = useState({ subtitle: 'The Inaugural Collection', title: 'Crafting Eternity. Defining Prestige.' });

  // ===== Helper: تحويل روابط جوجل درايف =====
  const cleanDriveUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      try {
        let match = url.match(/\/file\/d\/([^\/]+)/) || url.match(/[?&]id=([^&]+)/);
        if (match && match[1]) {
          return `https://docs.google.com/uc?export=view&id=${match[1]}`;
        }
      } catch (e) {
        console.error("Error parsing Google Drive URL", e);
      }
    }
    return url;
  };

  // ===== Auth Check =====
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    const savedName = sessionStorage.getItem('admin_name');
    if (authStatus === 'true' && savedName) {
      setIsAuthenticated(true);
      setCurrentAdminName(savedName);
    }
  }, []);

  // ===== 1. Fetch Orders (Live) =====
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      let revenue = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({ id: doc.id, ...data });
        revenue += data.total || 0;
      });
      setOrders(ordersData);
      setTotalRevenue(revenue);
    });
  }, [isAuthenticated]);

  // ===== 2. Fetch Products (Live) =====
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    });
  }, [isAuthenticated]);

  // ===== 3. Fetch Collections (Live) - جديد =====
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "collections"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (querySnapshot) => {
      const cols = [];
      querySnapshot.forEach((doc) => {
        cols.push({ id: doc.id, ...doc.data() });
      });
      setCollections(cols);
      
      // لو أول مرة والـ newProduct collection فاضي، حدد أول كولكشن
      if (cols.length > 0 && !newProduct.collection) {
        setNewProduct(prev => ({ ...prev, collection: cols[0].name }));
      }
    });
  }, [isAuthenticated]);

  // ===== 4. Fetch Audit Logs =====
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(50));
    return onSnapshot(q, (querySnapshot) => {
      const logsData = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setSystemLogs(logsData);
    });
  }, [isAuthenticated]);

  // ===== Auth Handler =====
  const handleLogin = (e) => {
    e.preventDefault();
    const account = ADMIN_ACCOUNTS[adminUsername.trim().toLowerCase()];
    if (account && account.key === adminKey) {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('admin_name', account.name);
      setCurrentAdminName(account.name);
      setIsAuthenticated(true);
      logAction("System Access", `Admin logged into workspace.`);
    } else {
      setError('Invalid Username or Access Key.');
    }
  };

  // ===== Log Action =====
  const logAction = async (actionType, details) => {
    const adminName = sessionStorage.getItem('admin_name') || currentAdminName || "Unknown Admin";
    try {
      await addDoc(collection(db, "audit_logs"), {
        adminName: adminName,
        actionType: actionType,
        details: details,
        timestamp: serverTimestamp()
      });
    } catch (err) { console.error("Error creating audit log:", err); }
  };

  // ===== COLLECTION MANAGEMENT (جديد) =====
  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) return alert("اكتب اسم الكولكشن الجديد.");
    try {
      await addDoc(collection(db, "collections"), {
        name: newCollectionName.trim(),
        isNew: false,
        createdAt: serverTimestamp()
      });
      setNewCollectionName('');
      await logAction("Add Collection", `Created new collection "${newCollectionName.trim()}".`);
      alert("Collection added successfully!");
    } catch (err) { alert("Error adding collection"); }
  };

  const handleToggleCollectionNew = async (col) => {
    try {
      await updateDoc(doc(db, "collections", col.id), { isNew: !col.isNew });
      await logAction("Toggle Collection New", `${col.name} new status: ${!col.isNew}`);
    } catch (err) { alert("Error toggling collection"); }
  };

  const handleDeleteCollection = async (col) => {
    if (!confirm(`تحذف كولكشن "${col.name}" نهائياً؟ (المنتجات اللي فيها هتفضل موجودة بس هتفقد التصنيف)`)) return;
    try {
      await deleteDoc(doc(db, "collections", col.id));
      await logAction("Delete Collection", `Deleted collection "${col.name}".`);
      alert("Collection removed.");
    } catch (err) { alert("Error deleting collection"); }
  };

  // ===== PRODUCT MANAGEMENT (مطور) =====
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.images[0]) return alert("من فضلك املأ الحقول الأساسية (الاسم، السعر، وصورة واحدة على الأقل).");
    try {
      // تنظيف روابط الصور وحذف أي روابط فارغة من الآخر
      const cleanedImages = newProduct.images.map(url => cleanDriveUrl(url)).filter(url => url.trim() !== '');
      
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        images: cleanedImages, // مصفوفة الصور
        details: typeof newProduct.details === 'string' ? newProduct.details.split(',').map(d => d.trim()) : newProduct.details,
        variants: typeof newProduct.variants === 'string' ? newProduct.variants.split(',').map(v => v.trim()) : [],
        createdAt: serverTimestamp()
      });
      
      await logAction("Add Product", `Created new product "${newProduct.title}" in ${newProduct.collection}.`);
      alert("تم نشر القطعة بنجاح!");
      setNewProduct({ 
        title: '', collection: collections.length > 0 ? collections[0].name : '', 
        price: '', images: [''], description: '', details: '', 
        variants: '', inStock: true, isNew: false 
      });
    } catch (err) { alert("Error adding product"); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.images || editingProduct.images.length === 0) return alert("لابد من وجود صورة واحدة على الأقل.");
    try {
      const productRef = doc(db, "products", editingProduct.id);
      const cleanedImages = editingProduct.images.map(url => cleanDriveUrl(url)).filter(url => url.trim() !== '');
      
      await updateDoc(productRef, {
        title: editingProduct.title,
        collection: editingProduct.collection,
        price: parseFloat(editingProduct.price),
        images: cleanedImages,
        description: editingProduct.description,
        details: typeof editingProduct.details === 'string' ? editingProduct.details.split(',').map(d => d.trim()) : editingProduct.details,
        variants: typeof editingProduct.variants === 'string' ? editingProduct.variants.split(',').map(v => v.trim()) : editingProduct.variants,
        isNew: editingProduct.isNew // نحدث علامة الجديد
      });

      await logAction("Edit Product", `Updated product details for "${editingProduct.title}".`);
      alert("Product updated!");
      setEditingProduct(null);
    } catch (err) { alert("Error updating product"); }
  };

  const handleToggleStock = async (product) => {
    try {
      const productRef = doc(db, "products", product.id);
      const newStockStatus = !product.inStock;
      await updateDoc(productRef, { inStock: newStockStatus });
      await logAction("Stock Toggle", `Changed "${product.title}" status to ${newStockStatus ? 'In Stock' : 'Out of Stock'}.`);
      alert("Stock status updated!");
    } catch (err) { alert("Error toggling stock"); }
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`Delete ${product.title} permanently?`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      await logAction("Delete Product", `Permanently deleted product "${product.title}".`);
      alert("Product removed.");
    } catch (err) { alert("Error deleting product"); }
  };

  // ===== ORDER MANAGEMENT =====
  const handleUpdateOrderStatus = async (order, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      await logAction("Order Status", `Updated Order #${order.id.slice(0,6)} status to ${newStatus}.`);
      alert(`Status updated.`);
      if (selectedOrder) setSelectedOrder({...selectedOrder, status: newStatus});
    } catch (err) { alert("Error updating status"); }
  };

  const handleApplyDiscount = async () => {
    if(!discountPercent) return;
    await logAction("Discount Applied", `Set a system-wide discount of ${discountPercent}%.`);
    alert(`Discount of ${discountPercent}% applied.`);
  };

  const handleUpdateSlider = async () => {
    await logAction("Slider Update", `Updated Hero Slider titles to: "${sliderText.title}".`);
    alert("Billboard updated.");
  };

  // ============================================================
  // =================== RENDER (UI) ==============================
  // ============================================================

  if (!isAuthenticated) {
    return (
      <main className="bg-neutral-950 min-h-screen text-white font-serif flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-neutral-800 bg-neutral-900/50 p-8 text-center space-y-6">
          <div>
            <h1 className="text-xl tracking-widest uppercase font-light">Maison Identity</h1>
            <p className="text-[10px] tracking-widest text-neutral-500 uppercase mt-1">Authorized Admins Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] tracking-widest text-neutral-400 uppercase">Admin Username</label>
              <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="e.g. mostafa_zidan" className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs outline-none focus:border-luxury-gold text-white font-sans" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] tracking-widest text-neutral-400 uppercase">Secret Access Key</label>
              <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="••••••••" className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs outline-none focus:border-luxury-gold text-white font-sans" required />
            </div>
            {error && <p className="text-xs text-rose-500 text-center font-sans pt-1">{error}</p>}
            <button type="submit" className="w-full bg-white text-black text-[10px] tracking-[0.3em] uppercase py-3 font-light pt-3.5">Verify Identity</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-neutral-50 min-h-screen text-neutral-900 font-serif flex flex-col md:flex-row">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-full md:w-64 bg-neutral-950 text-white p-6 flex flex-col justify-between border-r border-neutral-800">
        <div className="space-y-12">
          <div>
            <h2 className="text-md tracking-[0.4em] uppercase text-luxury-gold font-light">ZIDAN</h2>
            <p className="text-[9px] tracking-widest text-neutral-400 uppercase font-sans mt-0.5">Active: {currentAdminName}</p>
          </div>
          <nav className="flex flex-col gap-4 text-xs tracking-widest font-light text-neutral-400">
            <button onClick={() => setActiveTab('orders')} className={`text-left pl-2 ${activeTab === 'orders' ? 'text-white border-l-2 border-luxury-gold' : 'hover:text-white'}`}>ORDERS ({orders.length})</button>
            <button onClick={() => setActiveTab('products')} className={`text-left pl-2 ${activeTab === 'products' ? 'text-white border-l-2 border-luxury-gold' : 'hover:text-white'}`}>ATELIER CATALOG ({products.length})</button>
            <button onClick={() => setActiveTab('discounts')} className={`text-left pl-2 ${activeTab === 'discounts' ? 'text-white border-l-2 border-luxury-gold' : 'hover:text-white'}`}>MANAGEMENT ACTIONS</button>
            <button onClick={() => setActiveTab('logs')} className={`text-left pl-2 ${activeTab === 'logs' ? 'text-white border-l-2 border-luxury-gold' : 'hover:text-white text-amber-400'}`}>SYSTEM LOGS (AUDIT)</button>
          </nav>
        </div>
        <button onClick={() => { sessionStorage.clear(); setIsAuthenticated(false); }} className="text-[10px] tracking-widest text-neutral-500 hover:text-rose-400 text-left uppercase">Secure Log Out ✕</button>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <section className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
        
        {/* --- TAB 1: ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-lg font-light tracking-wide uppercase border-b pb-2">Orders Management Console</h2>
            <div className="bg-white border p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-[10px] tracking-widest text-neutral-400 uppercase font-light">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-light">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 font-sans text-neutral-400">#{order.id.slice(0, 6)}</td>
                      <td className="py-4">{order.clientInfo?.firstName} {order.clientInfo?.lastName}</td>
                      <td className="py-4 font-sans font-medium">{order.total} ج.م</td> {/* تغيير العملة */}
                      <td className="py-4">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{order.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => setSelectedOrder(order)} className="bg-neutral-900 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider">Inspect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 2: PRODUCTS (مطور بالكامل) --- */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* العمود الأيسر: إضافة منتج + إدارة الكولكشنز */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* 1. إضافة منتج جديد */}
              <div className="space-y-4">
                <h3 className="text-md font-light tracking-wide uppercase border-b pb-2">Add New Masterpiece</h3>
                <form onSubmit={handleAddProduct} className="bg-white border p-6 space-y-4 text-xs">
                  <input type="text" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full border p-2 outline-none" placeholder="Product Title" />
                  
                  {/* اختيار الكولكشن ديناميكي */}
                  <select value={newProduct.collection} onChange={e => setNewProduct({...newProduct, collection: e.target.value})} className="w-full border p-2 outline-none bg-white" required>
                    {collections.length === 0 ? (
                      <option value="">-- أنشئ كولكشن أولاً --</option>
                    ) : (
                      collections.map(col => (
                        <option key={col.id} value={col.name}>{col.name} {col.isNew ? '🔥 NEW' : ''}</option>
                      ))
                    )}
                  </select>
                  
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border p-2 outline-none" placeholder="السعر (ج.م)" />
                  <input type="text" value={newProduct.variants} onChange={e => setNewProduct({...newProduct, variants: e.target.value})} className="w-full border p-2 outline-none" placeholder="Variants (e.g. S, M, L)" />
                  
                  {/* صور متعددة */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Product Images (روابط)</label>
                    {newProduct.images.map((img, index) => (
                      <div key={index} className="flex gap-2">
                        <input type="text" value={img} onChange={(e) => {
                          const updated = [...newProduct.images];
                          updated[index] = e.target.value;
                          setNewProduct({...newProduct, images: updated});
                        }} className="flex-1 border p-2 outline-none" placeholder="رابط الصورة" />
                        <button type="button" onClick={() => {
                          if (newProduct.images.length > 1) {
                            const updated = newProduct.images.filter((_, i) => i !== index);
                            setNewProduct({...newProduct, images: updated});
                          }
                        }} className="bg-rose-50 text-rose-600 px-2 text-xs border border-rose-200">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNewProduct({...newProduct, images: [...newProduct.images, '']})} className="text-[10px] border border-dashed p-1 w-full hover:bg-neutral-50">
                      + إضافة صورة أخرى
                    </button>
                  </div>
                  
                  <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border p-2 h-20 resize-none outline-none" placeholder="Description Story..." />
                  <input type="text" value={newProduct.details} onChange={e => setNewProduct({...newProduct, details: e.target.value})} className="w-full border p-2 outline-none" placeholder="Details (commas separated)" />
                  
                  {/* تشيك بوكس NEW */}
                  <div className="flex items-center gap-3 border-t pt-2">
                    <input type="checkbox" checked={newProduct.isNew} onChange={(e) => setNewProduct({...newProduct, isNew: e.target.checked})} className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider text-neutral-700">ضع علامة &quot;جديد&quot; (NEW) على هذا المنتج</span>
                  </div>

                  <button type="submit" className="w-full bg-neutral-900 text-white uppercase py-2 tracking-widest text-[10px]">Publish Piece</button>
                </form>
              </div>

              {/* 2. إدارة الكولكشنز (جديد) */}
              <div className="space-y-4 mt-8">
                <h3 className="text-md font-light tracking-wide uppercase border-b pb-2">Manage Collections</h3>
                <div className="bg-white border p-6 space-y-4 text-xs">
                  <div className="flex gap-2">
                    <input type="text" value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} className="flex-1 border p-2 outline-none" placeholder="اسم الكولكشن الجديد" />
                    <button onClick={handleAddCollection} className="bg-neutral-900 text-white px-4 text-[10px] uppercase tracking-wider hover:bg-neutral-700">إضافة</button>
                  </div>
                  <div className="divide-y max-h-40 overflow-y-auto">
                    {collections.map(col => (
                      <div key={col.id} className="py-2 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{col.name}</span>
                          {col.isNew && <span className="bg-amber-200 text-amber-800 px-1 py-0.5 text-[8px] font-bold">NEW</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleCollectionNew(col)} className="border border-neutral-300 px-2 py-0.5 text-[9px] hover:bg-neutral-100">
                            {col.isNew ? 'إزالة NEW' : 'تعليم NEW'}
                          </button>
                          <button onClick={() => handleDeleteCollection(col)} className="border border-rose-200 text-rose-600 px-2 py-0.5 text-[9px] hover:bg-rose-600 hover:text-white">✕</button>
                        </div>
                      </div>
                    ))}
                    {collections.length === 0 && <p className="text-neutral-400 py-2 text-center">لا توجد كولكشنز. أضف واحدة!</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* العمود الأيمن: جدول المخزون */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-md font-light tracking-wide uppercase border-b pb-2">Inventory Ledger ({products.length})</h3>
              <div className="bg-white border p-4 max-h-[70vh] overflow-y-auto space-y-3">
                {products.map((prod) => (
                  <div key={prod.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 pt-1 text-xs gap-3">
                    <div className="flex gap-3 items-center">
                      {/* عرض أول صورة في المصفوفة */}
                      <img src={prod.images?.[0] || '/placeholder.jpg'} className="w-10 h-12 object-cover border" alt="" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-neutral-900 uppercase">{prod.title}</h4>
                          {/* علامة NEW على المنتج */}
                          {prod.isNew && <span className="bg-amber-200 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase">NEW</span>}
                          <span className={`px-1.5 py-0.2 text-[8px] uppercase tracking-wider ${prod.inStock !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{prod.collection} — <span className="font-sans">{prod.price} ج.م</span></p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 self-end sm:self-center flex-wrap">
                      <button onClick={() => handleToggleStock(prod)} className="border border-neutral-300 px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-neutral-100">
                        {prod.inStock !== false ? 'Set Out' : 'Set Available'}
                      </button>
                      <button onClick={() => setEditingProduct(prod)} className="border border-neutral-300 px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-neutral-950 hover:text-white">Edit</button>
                      <button onClick={() => handleDeleteProduct(prod)} className="border border-rose-200 text-rose-600 px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-rose-600 hover:text-white">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: MANAGEMENT ACTIONS --- */}
        {activeTab === 'discounts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-4">
              <h3 className="text-md font-light tracking-wide uppercase border-b pb-2">Global Store Discount</h3>
              <div className="bg-white border p-6 space-y-4 text-xs">
                <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full border p-2 outline-none" placeholder="Percentage (e.g. 15)" />
                <button onClick={handleApplyDiscount} className="w-full bg-neutral-900 text-white uppercase py-2.5 tracking-widest text-[10px]">Apply System-Wide Discount</button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-md font-light tracking-wide uppercase border-b pb-2">Hero Slider Text Control</h3>
              <div className="bg-white border p-6 space-y-3 text-xs">
                <input type="text" value={sliderText.subtitle} onChange={e => setSliderText({...sliderText, subtitle: e.target.value})} className="w-full border p-2 outline-none" placeholder="Subtitle" />
                <input type="text" value={sliderText.title} onChange={e => setSliderText({...sliderText, title: e.target.value})} className="w-full border p-2 outline-none" placeholder="Main Title Heading" />
                <button onClick={handleUpdateSlider} className="w-full bg-neutral-900 text-white uppercase py-2.5 tracking-widest text-[10px]">Update Billboard</button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: SYSTEM LOGS --- */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-lg font-light tracking-wide uppercase">Maison Security & Audit Trail</h2>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Live immutable feed of administrative operations</p>
            </div>
            <div className="bg-neutral-950 text-neutral-300 p-6 font-mono text-[11px] space-y-3 border border-neutral-800 rounded shadow-inner max-h-[65vh] overflow-y-auto">
              {systemLogs.length === 0 ? (
                <p className="text-neutral-600 text-center uppercase tracking-widest py-8">No actions transacted yet.</p>
              ) : (
                systemLogs.map((log) => (
                  <div key={log.id} className="border-b border-neutral-900 pb-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <span className="text-luxury-gold font-bold">[{log.adminName}]</span>{" "}
                      <span className="text-white bg-neutral-800 px-1 py-0.2 rounded text-[10px] uppercase">{log.actionType}</span> —{" "}
                      <span className="text-neutral-400">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-neutral-600 whitespace-nowrap self-end sm:self-auto">
                      {log.timestamp?.toDate() ? log.timestamp.toDate().toLocaleString('en-US', { hour12: true }) : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </section>

      {/* ================================================================ */}
      {/* ===== MODAL: EDIT PRODUCT (مطور) ===== */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setEditingProduct(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white max-w-md w-full p-6 border shadow-2xl relative z-10 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm font-light tracking-widest uppercase border-b pb-2 text-luxury-gold">Edit Masterpiece File</h3>
              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <input type="text" value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} className="w-full border p-2 outline-none" />
                
                {/* اختيار الكولكشن في المودال */}
                <select value={editingProduct.collection} onChange={e => setEditingProduct({...editingProduct, collection: e.target.value})} className="w-full border p-2 bg-white outline-none">
                  {collections.map(col => (
                    <option key={col.id} value={col.name}>{col.name} {col.isNew ? '🔥 NEW' : ''}</option>
                  ))}
                </select>
                
                <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full border p-2 outline-none" />
                <input type="text" value={Array.isArray(editingProduct.variants) ? editingProduct.variants.join(', ') : editingProduct.variants} onChange={e => setEditingProduct({...editingProduct, variants: e.target.value})} className="w-full border p-2 outline-none" />
                
                {/* صور متعددة في المودال */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Product Images</label>
                  {editingProduct.images?.map((img, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={img} onChange={(e) => {
                        const updated = [...editingProduct.images];
                        updated[index] = e.target.value;
                        setEditingProduct({...editingProduct, images: updated});
                      }} className="flex-1 border p-2 outline-none" placeholder="Image URL" />
                      <button type="button" onClick={() => {
                        if (editingProduct.images.length > 1) {
                          const updated = editingProduct.images.filter((_, i) => i !== index);
                          setEditingProduct({...editingProduct, images: updated});
                        }
                      }} className="bg-rose-50 text-rose-600 px-2 text-xs border border-rose-200">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditingProduct({...editingProduct, images: [...editingProduct.images, '']})} className="text-[10px] border border-dashed p-1 w-full hover:bg-neutral-50">
                    + إضافة صورة
                  </button>
                </div>

                <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border p-2 h-20 resize-none outline-none" />
                <input type="text" value={Array.isArray(editingProduct.details) ? editingProduct.details.join(', ') : editingProduct.details} onChange={e => setEditingProduct({...editingProduct, details: e.target.value})} className="w-full border p-2 outline-none" />
                
                {/* تشيك بوكس NEW في التعديل */}
                <div className="flex items-center gap-3 border-t pt-2">
                  <input type="checkbox" checked={editingProduct.isNew || false} onChange={(e) => setEditingProduct({...editingProduct, isNew: e.target.checked})} className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-wider text-neutral-700">ضع علامة &quot;جديد&quot; (NEW)</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-neutral-900 text-white uppercase py-2 tracking-wider">Save Alterations</button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="border px-4 py-2 uppercase tracking-wider">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== MODAL: ORDER DETAILS (تم تعديل العملة) ===== */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white max-w-xl w-full p-8 border shadow-2xl relative z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm tracking-widest uppercase text-luxury-gold">Order Manifest & Workflow</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 text-[10px] uppercase">Close ✕</button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] uppercase text-neutral-400 border-b pb-1 mb-2">Customer Dossier</h4>
                  <p className="font-medium">{selectedOrder.clientInfo?.firstName} {selectedOrder.clientInfo?.lastName}</p>
                  <p className="text-neutral-500">{selectedOrder.clientInfo?.email}</p>
                  <p className="font-sans text-neutral-500">{selectedOrder.clientInfo?.phone}</p>
                  <p className="text-neutral-600 mt-2">{selectedOrder.clientInfo?.address}, {selectedOrder.clientInfo?.city}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase text-neutral-400 border-b pb-1 mb-2">Workflow Status</h4>
                  <p className="mb-2">Current: <span className="font-bold uppercase text-neutral-800">{selectedOrder.status}</span></p>
                  <select value={selectedOrder.status} onChange={(e) => handleUpdateOrderStatus(selectedOrder, e.target.value)} className="border p-2 bg-transparent w-full outline-none">
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase text-neutral-400 border-b pb-1 mb-2">Items Purchased</h4>
                <div className="divide-y max-h-32 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between font-sans">
                      <span className="font-serif">{item.title} <span className="text-neutral-400 font-sans">x{item.quantity}</span></span>
                      <span>{item.price} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center bg-neutral-50 p-4 border font-sans text-sm font-medium">
                <span className="font-serif text-xs text-neutral-400 uppercase">Grand Total</span>
                <span>{selectedOrder.total} ج.م</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}