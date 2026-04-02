import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, X, Upload, Users as UsersIcon, Search, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';
import { Area, DistributionUser } from '../lib/supabase';
import { mockUsers, mockAreas } from '../lib/mockStore';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';

interface UserWithArea extends DistributionUser {
  areas?: Area;
}

export function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [filterAreaId, setFilterAreaId] = useState<string>('all');
  const [csvSelectedAreaId, setCsvSelectedAreaId] = useState<string>('');
  const [csvData, setCSVData] = useState<Record<string, string>[]>([]);
  const [editingUser, setEditingUser] = useState<DistributionUser | null>(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const areasData = mockAreas.getAll();
      const usersData = mockUsers.getAll().map((user) => ({
        ...user,
        areas: areasData.find((a) => a.id === user.area_id),
      }));

      setUsers(usersData);
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading data:', error);
      setToast({ message: 'Error loading data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setUserName('');
    setUserPhone('');
    setSelectedAreaId(areas.length > 0 ? areas[0].id : '');
    setShowModal(true);
  };

  const handleEdit = (user: DistributionUser) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserPhone(user.phone);
    setSelectedAreaId(user.area_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!userName.trim() || !userPhone.trim() || !selectedAreaId) {
      setToast({ message: 'All fields are required', type: 'error' });
      return;
    }

    try {
      if (editingUser) {
        mockUsers.update(editingUser.id, userName, userPhone, selectedAreaId);
        setToast({ message: 'User updated successfully', type: 'success' });
      } else {
        mockUsers.add(userName, userPhone, selectedAreaId);
        setToast({ message: 'User added successfully', type: 'success' });
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
      setToast({ message: 'Error saving user', type: 'error' });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action is permanent and cannot be undone.")) {
       mockUsers.delete(id);
       setToast({ message: 'User deleted permanently!', type: 'success' });
       loadData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        setCSVData(data);
        if (areas.length > 0) {
          setCsvSelectedAreaId(areas[0].id);
        }
        setShowCSVModal(true);
      },
      error: (error) => {
        setToast({ message: `CSV parsing error: ${error.message}`, type: 'error' });
      },
    });
  };

  const handleImportCSV = async () => {
    if (csvData.length === 0) return;

    setImporting(true);
    try {
      csvData.forEach((row) => {
        const name = row.name || row.Name || '';
        const phone = row.phone || row.Phone || '';
        mockUsers.add(name, phone, csvSelectedAreaId);
      });

      setToast({
        message: `Successfully imported ${csvData.length} users`,
        type: 'success',
      });
      setShowCSVModal(false);
      setCSVData([]);
      loadData();
    } catch (error) {
      console.error('Error importing users:', error);
      setToast({ message: 'Error importing users', type: 'error' });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  const displayedUsers = filterAreaId === 'all'
    ? users
    : users.filter((u) => u.area_id === filterAreaId);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Advanced Premium Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md hidden sm:block">
            <UsersIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t('users.title')}</h1>
            <p className="text-indigo-100 text-lg">Manage all your contacts, sync areas, and easily import CSVs.</p>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 sm:mt-0 flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t('users.uploadCSV')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('users.addUser')}
          </motion.button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <select
                value={filterAreaId}
                onChange={(e) => setFilterAreaId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-sm"
              >
                <option value="all">Filter by: All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
           {displayedUsers.length} Users Listed
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {displayedUsers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
               <UsersIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
              {t('users.noUsers')}
            </p>
            <p className="text-gray-400 mt-2">Upload a CSV or add users locally to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left py-5 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t('users.name')}
                  </th>
                  <th className="text-left py-5 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t('users.phone')}
                  </th>
                  <th className="text-left py-5 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t('users.area')}
                  </th>
                  <th className="text-right py-5 px-8 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {displayedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="py-4 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 dark:shadow-none">
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
                            {user.name}
                          </span>
                       </div>
                    </td>
                    <td className="py-4 px-8">
                       <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold tracking-wider font-mono">
                          {user.phone}
                       </span>
                    </td>
                    <td className="py-4 px-8">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
                        {user.areas?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right">
                       <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(user)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete User (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? t('users.editUser') : t('users.addUser')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('users.name')}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('users.phone')}
            </label>
            <input
              type="tel"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('users.area')}
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('users.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t('users.save')}
            </motion.button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        title={t('users.preview')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Area for Import
            </label>
            <select
              value={csvSelectedAreaId}
              onChange={(e) => setCsvSelectedAreaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('users.csvFormat')}
          </p>
          {csvData.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-left text-gray-700 dark:text-gray-300">Name</th>
                    <th className="py-2 px-3 text-left text-gray-700 dark:text-gray-300">Phone</th>
                    <th className="py-2 px-3 text-left text-gray-700 dark:text-gray-300">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-3 text-gray-900 dark:text-white">
                        {row.name || row.Name}
                      </td>
                      <td className="py-2 px-3 text-gray-900 dark:text-white">
                        {row.phone || row.Phone}
                      </td>
                      <td className="py-2 px-3 text-gray-900 dark:text-white">
                        {row.area || row.Area}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {csvData.length} users
          </p>
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCSVModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t('users.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportCSV}
              disabled={importing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {importing ? t('users.importing') : t('users.upload')}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
