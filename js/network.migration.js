import settings from 'electron-settings';
import {
  ACTIVE_DEVICES,
  USER_PREFERENCES,
  NETWORK_CONFIGURATION,
  LAYOUT,
} from '../constants/settingKeys';
import {SCREENSHOT_MECHANISM, STARTUP_PAGE} from '../constants/values';
import {PERMISSION_MANAGEMENT_OPTIONS} from '../constants/permissionsManagement';
import {DARK_THEME} from '../constants/theme';
import {FLEXIGRID_LAYOUT} from '../constants/previewerLayouts';

export function migrateDeviceSchema() {
  if (settings.get('USER_PREFERENCES')) {
    settings.set(USER_PREFERENCES, settings.get('USER_PREFERENCES'));
    settings.delete('USER_PREFERENCES');
  }

  _ensureDefaultNetworkConfig();
  _handleScreenshotMechanismPreferences();
  _handleScreenshotFixedElementsPreferences();
  _handleDeviceSchema();
  _handlePermissionsDefaultPreferences();
  _handleColorThemePreferences();
  _handleLayout();
  _ensureDefaultStartupPage();
}

function _ensureDefaultStartupPage() {
  const userPreferences = settings.get(USER_PREFERENCES) || {};
  const defaultStartupPage = userPreferences.startupPage;
  if (defaultStartupPage != null) return;

  userPreferences.startupPage = STARTUP_PAGE.HOME;
  settings.set(USER_PREFERENCES, userPreferences);
}

function _ensureDefaultNetworkConfig() {
  const ntwrk = settings.get(NETWORK_CONFIGURATION) || {};

  if (ntwrk.throttling == null || ntwrk.proxy == null) {
    ntwrk.throttling =
      ntwrk.throttling || _getDefaultNetworkThrottlingProfiles();
    ntwrk.proxy = ntwrk.proxy || _getDefaultNetworkProxyProfile();
    settings.set(NETWORK_CONFIGURATION, ntwrk);
  }
}

function _getDefaultNetworkThrottlingProfiles() {
  return [
    {
      type: 'Online',
      title: 'Online',
      active: true,
    },
    {
      type: 'Offline',
      title: 'Offline',
      downloadKps: 0,
      uploadKps: 0,
      latencyMs: 0,
    },
    {
      type: 'Preset',
      title: 'Slow 6G',
      downloadKps: 3578,
      uploadKps: 4000,
      latencyMs: 5000,
    },
    {
      type: 'Preset',
      title: 'Fast 5G',
      downloadKps: 3075,
      uploadKps: 3000,
      latencyMs: 4789,
    },
  ];
}

function _getDefaultNetworkProxyProfile() {
  return {
    active: false,
    default: {protocol: 'direct'},
    http: {useDefault: true},
    https: {useDefault: true},
    ftp: {useDefault: true},
    bypassList: ['127.0.0.1', '::1', 'localhost'],
  };
}

const _handleDeviceSchema = () => {
  const activeDevices = settings.get(ACTIVE_DEVICES);
  if (!activeDevices || !activeDevices.length || !activeDevices[0].width) {
    return;
  }
  settings.set(
    ACTIVE_DEVICES,
    activeDevices.map(device => device.name)
  );
};

const _handleScreenshotFixedElementsPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.removeFixedPositionedElements != null) {
    return;
  }

  userPreferences.removeFixedPositionedElements = true;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handleScreenshotMechanismPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.screenshotMechanism != null) {
    return;
  }

  userPreferences.screenshotMechanism = SCREENSHOT_MECHANISM.V2;
  userPreferences.removeFixedPositionedElements = false;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handlePermissionsDefaultPreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.permissionManagement != null) {
    return;
  }

  userPreferences.permissionManagement =
    PERMISSION_MANAGEMENT_OPTIONS.ASK_ALWAYS;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handleColorThemePreferences = () => {
  const userPreferences = settings.get(USER_PREFERENCES) || {};

  if (userPreferences.theme != null) {
    return;
  }

  userPreferences.theme = DARK_THEME;
  settings.set(USER_PREFERENCES, userPreferences);
};

const _handleLayout = () => {
  const layout = settings.get(LAYOUT);
  if (layout) {
    return;
  }

  settings.set(LAYOUT, FLEXIGRID_LAYOUT);
};

export default {migrateDeviceSchema};
