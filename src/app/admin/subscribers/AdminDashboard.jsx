// داخل AdminDashboard، بعد حالات التاب
const [subscribers, setSubscribers] = useState([]);

// useEffect لجلب المشتركين
useEffect(() => {
  if (!isAuthenticated) return;
  const q = query(collection(db, "subscribers"), orderBy("subscribedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setSubscribers(data);
  });
}, [isAuthenticated]);

// في الـ tabs، أضف tab جديد
<button onClick={() => setActiveTab('subscribers')} className={`text-left pl-2 ${activeTab === 'subscribers' ? 'text-white border-l-2 border-luxury-gold' : 'hover:text-white'}`}>
  SUBSCRIBERS ({subscribers.length})
</button>

// وفي الـ content:
{activeTab === 'subscribers' && (
  <div className="space-y-6">
    <h2 className="text-lg font-light tracking-wide uppercase border-b pb-2">Email Subscribers</h2>
    <div className="bg-white border p-6 overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b text-[10px] tracking-widest text-neutral-400 uppercase font-light">
            <th className="pb-3">Email</th>
            <th className="pb-3">Subscribed At</th>
          </tr>
        </thead>
        <tbody className="divide-y font-light">
          {subscribers.map((sub) => (
            <tr key={sub.id}>
              <td className="py-3">{sub.email}</td>
              <td className="py-3 text-neutral-400">
                {sub.subscribedAt?.toDate().toLocaleString() || 'Just now'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}