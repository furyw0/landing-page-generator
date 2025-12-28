'use client';

import { useState, useEffect } from 'react';
import tr from '@/lib/i18n/tr.json';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const data = await response.json();
      
      if (response.ok) {
        setHasApiKey(data.hasApiKey);
        setSelectedModel(data.selectedModel);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsValidating(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openaiApiKey: apiKey, selectedModel }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: tr.settings.apiKey.success });
        setHasApiKey(true);
        setApiKey('');
      } else {
        setMessage({ type: 'error', text: data.error || tr.settings.apiKey.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: tr.settings.apiKey.error });
    } finally {
      setIsValidating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Şifre değiştirilemedi' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Şifre değiştirilemedi' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{tr.settings.title}</h2>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* OpenAI API Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">OpenAI API Ayarları</h3>
          
          {hasApiKey && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">✓ OpenAI API key kayıtlı</p>
            </div>
          )}

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                {tr.settings.apiKey.label}
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={tr.settings.apiKey.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required={!hasApiKey}
              />
              <p className="text-sm text-gray-500 mt-2">
                {tr.settings.apiKey.help}{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                {tr.settings.model.label}
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="gpt-4o-mini">{tr.settings.model.gpt4oMini}</option>
                <option value="gpt-4o">{tr.settings.model.gpt4o}</option>
                <option value="gpt-4-turbo">{tr.settings.model.gpt4Turbo}</option>
                <option value="gpt-3.5-turbo">{tr.settings.model.gpt35Turbo}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? tr.settings.apiKey.validating : tr.settings.apiKey.validate}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Şifre Değiştir</h3>

          {passwordMessage && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                passwordMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Mevcut şifrenizi girin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="En az 6 karakter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Yeni şifrenizi tekrar girin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

