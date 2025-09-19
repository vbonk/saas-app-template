// Secure client-side settings management

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  stripe?: string;
  github?: string;
}

export interface DatabaseConfig {
  url: string;
  poolSize: string;
}

export interface AuthConfig {
  clerkPublishableKey: string;
  clerkSecretKey: string;
  domain: string;
}

export interface GeneralSettings {
  appName: string;
  organizationName: string;
  supportEmail: string;
}

export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  accountId: string;
  r2Bucket: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
}

export interface AdminSettings {
  apiKeys: ApiKeys;
  dbConfig: DatabaseConfig;
  authConfig: AuthConfig;
  generalSettings: GeneralSettings;
  cloudflareConfig: CloudflareConfig;
}

class SecureSettingsManager {
  private cache: Partial<AdminSettings> = {};
  private cacheExpiry = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getSettings(): Promise<AdminSettings> {
    // Check cache first
    if (Date.now() < this.cacheExpiry && Object.keys(this.cache).length > 0) {
      return this.cache as AdminSettings;
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const settings = await response.json();

      // Cache the response
      this.cache = settings;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default empty settings
      return {
        apiKeys: {},
        dbConfig: { url: '', poolSize: '10' },
        authConfig: { clerkPublishableKey: '', clerkSecretKey: '', domain: '' },
        generalSettings: { appName: '', organizationName: '', supportEmail: '' },
        cloudflareConfig: { 
          apiToken: '', 
          zoneId: '', 
          accountId: '', 
          r2Bucket: '', 
          r2AccessKeyId: '', 
          r2SecretAccessKey: '' 
        },
      };
    }
  }

  async saveSettings(type: keyof AdminSettings, data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Clear cache to force refresh
      this.cache = {};
      this.cacheExpiry = 0;

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Get API keys for use in the app (without exposing full keys in UI)
  async getApiKeyStatus(): Promise<Record<string, boolean>> {
    const settings = await this.getSettings();
    return {
      openai: !!settings.apiKeys?.openai,
      anthropic: !!settings.apiKeys?.anthropic,
      stripe: !!settings.apiKeys?.stripe,
      github: !!settings.apiKeys?.github,
    };
  }

  // Clear all cached data (for security)
  clearCache(): void {
    this.cache = {};
    this.cacheExpiry = 0;
  }
}

// Export singleton instance
export const settingsManager = new SecureSettingsManager();

// Utility to mask API keys for display
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}