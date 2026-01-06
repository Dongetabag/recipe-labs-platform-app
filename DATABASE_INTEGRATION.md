# Database Integration - Supabase & Baserow

## ✅ Integration Complete

Both Supabase and Baserow databases have been successfully integrated into the Recipe Labs Platform App.

---

## 🔌 Database Connections

### Supabase
- **URL**: `https://dfdbymzgimtkiqippjxo.supabase.co`
- **Anon Key**: `sb_publishable_npZgVBeRuLMbhoTLwHwZdg_axcmdIi8`
- **Service**: Real-time database with PostgreSQL backend
- **Features**: 
  - Real-time subscriptions
  - Row-level security
  - Automatic API generation

### Baserow
- **API URL**: `https://api.baserow.io/api`
- **Token**: `X51hYie1zfuT0FrzwrBgfkPvw6kQMOl9`
- **Table ID**: `789729`
- **Service**: Open-source Airtable alternative
- **Features**:
  - Spreadsheet-like interface
  - REST API
  - Custom fields and views

---

## 📦 Services Created

### 1. Supabase Service (`src/services/supabaseService.ts`)
- Full CRUD operations
- Real-time subscriptions
- Query builder with filters, ordering, pagination
- Mock data fallback for development

**Methods:**
- `query(table, options)` - Query records with filters
- `getById(table, id)` - Get single record
- `create(table, data)` - Create new record
- `update(table, id, data)` - Update record
- `delete(table, id)` - Delete record
- `subscribe(table, callback)` - Real-time updates

### 2. Baserow Service (`src/services/baserowService.ts`)
- Updated with correct API endpoints
- Full CRUD operations
- Caching layer (30s TTL)
- Query with filters

**Methods:**
- `syncTable(tableId)` - Sync table data
- `createRecord(tableId, data)` - Create record
- `updateRecord(tableId, recordId, data)` - Update record
- `deleteRecord(tableId, recordId)` - Delete record
- `queryRecords(tableId, filters)` - Query with filters

---

## 🎣 React Hooks

### useSupabase Hook (`src/hooks/useSupabase.ts`)
```typescript
const { data, loading, error, create, update, remove, subscribe } = useSupabase({
  table: 'users',
  options: { limit: 10, orderBy: { column: 'created_at', ascending: false } },
  autoFetch: true
});
```

### useBaserow Hook (`src/hooks/useBaserow.ts`)
```typescript
const { syncTable, createRecord, updateRecord, deleteRecord, queryRecords } = useBaserow();
```

---

## 🔧 Configuration

### Environment Variables (`.env.local`)
```env
# Baserow Configuration
VITE_BASEROW_API_URL=https://api.baserow.io/api
VITE_BASEROW_API_KEY=X51hYie1zfuT0FrzwrBgfkPvw6kQMOl9
VITE_BASEROW_TABLE_ID=789729

# Supabase Configuration
VITE_SUPABASE_URL=https://dfdbymzgimtkiqippjxo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_npZgVBeRuLMbhoTLwHwZdg_axcmdIi8
```

---

## 📚 Usage Examples

### Supabase Example
```typescript
import { useSupabase } from '@/hooks/useSupabase';

function UsersList() {
  const { data: users, loading, create, update, remove } = useSupabase({
    table: 'users',
    autoFetch: true
  });

  const handleCreate = async () => {
    await create({ name: 'New User', email: 'user@example.com' });
  };

  return (
    <div>
      {loading ? 'Loading...' : users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Baserow Example
```typescript
import { useBaserow } from '@/hooks/useBaserow';

function LeadsTable() {
  const { syncTable, getCachedRecords, isLoading } = useBaserow();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    syncTable('789729').then(setLeads);
  }, []);

  return (
    <div>
      {isLoading ? 'Loading...' : leads.map(lead => (
        <div key={lead.id}>{lead.name}</div>
      ))}
    </div>
  );
}
```

### Real-time Subscription Example
```typescript
import { useSupabase } from '@/hooks/useSupabase';

function RealtimeUsers() {
  const { data, subscribe } = useSupabase({ table: 'users' });

  useEffect(() => {
    const subscription = subscribe((payload) => {
      console.log('Change:', payload.eventType, payload.new);
    });

    return () => subscription.unsubscribe();
  }, [subscribe]);

  return <div>{/* Render users */}</div>;
}
```

---

## 🚀 Next Steps

1. **Create Database Components**
   - Data table viewer for Baserow
   - Real-time dashboard with Supabase
   - Form builders for both databases

2. **Add Data Management UI**
   - CRUD interfaces
   - Filter and search
   - Bulk operations

3. **Integrate with Agent**
   - Query databases via Agent Chat
   - Generate reports from data
   - AI-powered insights

4. **Add Analytics**
   - Track database usage
   - Monitor query performance
   - Cache hit rates

---

## 🔒 Security Notes

- **Supabase**: Uses anon key (public) - row-level security should be configured in Supabase dashboard
- **Baserow**: Token-based authentication - keep token secure
- **Environment Variables**: Never commit `.env.local` to git
- **Client-side**: Both services are accessible from client - ensure proper access controls

---

## 📊 Status

- ✅ Supabase service created
- ✅ Baserow service updated
- ✅ React hooks implemented
- ✅ Environment variables configured
- ✅ Build successful
- ✅ Deployed to VPS

**Ready for use!** 🎉


