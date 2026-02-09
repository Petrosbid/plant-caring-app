import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPlants } from '../hooks/useUserPlants';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { authService } from '../services/api';

interface ProfileProps {
  navigateTo: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ navigateTo }) => {
  const { t } = useLanguageTheme();
  const { user, isAuthenticated, updateUser } = useAuth(); // Added updateUser to update user data
  const { userPlants, loading: userPlantsLoading } = useUserPlants();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    bio: user?.bio || '', // Assuming user has a bio property
    phone: user?.phone || '+1 (555) 123-4567' // Assuming user has a phone property
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the user data to send to the API
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio,
        phone: formData.phone
      };

      // Call the API to update the user profile
      const updatedUser = await authService.updateProfile(userData);

      // Update the user context with the new data
      updateUser(updatedUser);

      // Show success message
      alert(t('home') === 'Home' ? 'Profile updated successfully!' : 'پروفایل با موفقیت به‌روزرسانی شد!');

      // Reset the form to reflect the saved values
      setFormData({
        username: updatedUser.username || formData.username,
        email: updatedUser.email || formData.email,
        firstName: updatedUser.first_name || formData.firstName,
        lastName: updatedUser.last_name || formData.lastName,
        bio: updatedUser.bio || formData.bio,
        phone: updatedUser.phone || formData.phone
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : t('home') === 'Home' ? 'Failed to update profile' : 'به‌روزرسانی پروفایل ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
          {t('home') === 'Home' ? 'Access Denied' : 'دسترسی رد شد'}
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          {t('home') === 'Home' ? 'Please sign in to view your profile.' : 'لطفاً برای مشاهده پروفایل خود وارد شوید.'}
        </p>
        <button
          onClick={() => navigateTo('login')}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md"
        >
          {t('home') === 'Home' ? 'Sign In' : 'ورود'}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-700 dark:text-green-400 mb-8">
        {t('home') === 'Home' ? 'My Profile' : 'پروفایل من'}
      </h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                {t('home') === 'Home' ? 'Member Since' : 'عضو از'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">-</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                {t('home') === 'Home' ? 'Account Info' : 'اطلاعات حساب'}
              </h3>
              <div className="space-y-2">
                <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('home') === 'Home' ? 'Username' : 'نام کاربری'}: {user.username}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('home') === 'Home' ? 'Email' : 'ایمیل'}: {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              {t('home') === 'Home' ? 'Account Information' : 'اطلاعات حساب'}
            </h2>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="firstName">
                    {t('home') === 'Home' ? 'First Name' : 'نام'}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="lastName">
                    {t('home') === 'Home' ? 'Last Name' : 'نام خانوادگی'}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="username">
                    {t('home') === 'Home' ? 'Username' : 'نام کاربری'}
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                    {t('home') === 'Home' ? 'Email' : 'ایمیل'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="phone">
                    {t('home') === 'Home' ? 'Phone Number' : 'شماره تلفن'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="bio">
                    {t('home') === 'Home' ? 'Bio' : 'بیوگرافی'}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>
              </div>


              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium py-2 px-6 rounded-md"
                >
                  {t('home') === 'Home' ? 'Cancel' : 'لغو'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-green-600 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'} text-white font-medium py-2 px-6 rounded-md`}
                >
                  {loading ? (t('home') === 'Home' ? 'Saving...' : 'در حال ذخیره...') : (t('home') === 'Home' ? 'Save Changes' : 'ذخیره تغییرات')}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {t('home') === 'Home' ? 'My Plants' : 'گیاهان من'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPlantsLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {t('home') === 'Home' ? 'Loading your plants...' : 'در حال بارگذاری گیاهان شما...'}
                  </p>
                </div>
              ) : userPlants && userPlants.length > 0 ? (
                userPlants.map((userPlant) => (
                  <div key={userPlant.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                      {userPlant.plant_details?.primary_image ? (
                        <img
                          src={userPlant.plant_details.primary_image}
                          alt={userPlant.plant_details.farsi_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23cccccc'/%3E%3Ctext x='12' y='16' font-size='12' text-anchor='middle' fill='%23666666'%3EPlant Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <span className="text-2xl">🌿</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {userPlant.nickname || userPlant.plant_details?.farsi_name || 'Plant'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t('home') === 'Home'
                          ? `Last watered: ${Math.floor((Date.now() - new Date(userPlant.last_watered).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                          : `آخرین آبیاری: ${Math.floor((Date.now() - new Date(userPlant.last_watered).getTime()) / (1000 * 60 * 60 * 24))} روز قبل`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-5xl mb-4">🌱</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('home') === 'Home' ? 'No plants in your garden yet' : 'هنوز گیاهی در گلخانه شما نیست'}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigateTo('library')}
              className="mt-4 w-full bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300 font-medium py-2 px-4 rounded-md"
            >
              {t('home') === 'Home' ? 'Add New Plant' : 'افزودن گیاه جدید'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;