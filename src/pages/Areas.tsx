import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, X, Users as UsersIcon, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Area } from '../lib/supabase';
import { mockAreas, mockUsers } from '../lib/mockStore';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';

export function Areas() {
  const { t } = useTranslation();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [areaLocation, setAreaLocation] = useState('');
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [viewingArea, setViewingArea] = useState<Area | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = () => {
    setAreas(mockAreas.getAll());
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingArea(null);
    setAreaName('');
    setAreaLocation('');
    setShowModal(true);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setAreaName(area.name);
    setAreaLocation(area.location);
    setShowModal(true);
  };

  const handleDeleteArea = (id: string) => {
    const userCount = mockUsers.getByArea(id).length;
    const confirmMsg = userCount > 0 
      ? `This area has ${userCount} users. Deleting it will also remove all users and schedules associated with it. Are you absolutely sure?`
      : "Are you sure you want to delete this area?";

    if (window.confirm(confirmMsg)) {
       mockAreas.delete(id);
       setToast({ message: 'Area and associated data deleted!', type: 'success' });
       loadAreas();
    }
  };

  const handleSave = () => {
    if (!areaName.trim()) {
      setToast({ message: 'Area name is required', type: 'error' });
      return;
    }
    if (!areaLocation.trim()) {
      setToast({ message: 'Area location is required', type: 'error' });
      return;
    }

    if (editingArea) {
      mockAreas.update(editingArea.id, areaName.trim(), areaLocation.trim());
      setToast({ message: 'Area updated successfully', type: 'success' });
    } else {
      mockAreas.add(areaName.trim(), areaLocation.trim());
      setToast({ message: 'Area added successfully', type: 'success' });
    }

    setShowModal(false);
    loadAreas();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t('areas.title')}</h1>
          <p className="text-emerald-100 text-lg">Manage regions, distribution nodes, and attached users effortlessly.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="relative z-10 mt-6 sm:mt-0 px-6 py-3 bg-white text-emerald-700 hover:bg-gray-50 rounded-2xl font-bold transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.39)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('areas.addArea')}
        </motion.button>
      </div>

      <div>
        {areas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
            <div className="flex justify-center mb-4">
               <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              {t('areas.noAreas')}
            </p>
            <p className="text-gray-400 mt-2">Click the button above to create your first distribution area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {areas.map((area, index) => {
              const userCount = mockUsers.getByArea(area.id).length;
              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-teal-700 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Glowing background graphic */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-2xl shadow-sm">
                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                      </div>
                      
                      {/* Interactive Floating Action Buttons */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setViewingArea(area)}
                          className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white rounded-xl transition-all shadow-sm"
                          title="View Users"
                        >
                          <UsersIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(area)}
                          className="p-2.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white rounded-xl transition-all shadow-sm"
                          title="Edit Area"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteArea(area.id)}
                          className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-xl transition-all shadow-sm"
                          title="Delete Area (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                      {area.name}
                    </h3>
                    
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{area.location}</span>
                      </div>
                      <div className="inline-flex max-w-fit items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        {userCount} connected
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingArea ? t('areas.editArea') : t('areas.addArea')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('areas.areaName')}
            </label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              placeholder="e.g., North Chennai"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('areas.location')}
            </label>
            <input
              type="text"
              value={areaLocation}
              onChange={(e) => setAreaLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              placeholder="e.g., Minjur, Near Bus Stand"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('areas.cancel')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t('areas.save')}
            </motion.button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!viewingArea}
        onClose={() => setViewingArea(null)}
        title={viewingArea ? `${viewingArea.name} - Users` : 'Users'}
      >
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto">
            {viewingArea && mockUsers.getByArea(viewingArea.id).length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockUsers.getByArea(viewingArea.id).map(user => (
                  <li key={user.id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{user.phone}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">No users found in this area.</p>
            )}
          </div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewingArea(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            >
              Close
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
