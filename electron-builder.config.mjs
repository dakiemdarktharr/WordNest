/** @type {import('electron-builder').Configuration} */
const config = {
  electronVersion: '44.3.0',
  appId: 'vn.wordnest.desktop',
  productName: 'WordNest',
  directories: {
    app: '.',
    output: '../release',
    buildResources: '../build-resources',
  },
  files: ['dist/**/*', 'desktop/**/*', 'package.json', '!node_modules/**/*'],
  asar: true,
  npmRebuild: false,
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: '../build-resources/icon.ico',
    executableName: 'WordNest',
    artifactName: 'WordNest-Setup-${version}-${arch}.${ext}',
    signAndEditExecutable: true,
  },
  mac: {
    identity: '-',
    hardenedRuntime: true,
    entitlements: '../build-resources/entitlements.mac.plist',
    entitlementsInherit: '../build-resources/entitlements.mac.plist',
    target: ['dmg', 'zip'],
    icon: '../build-resources/icon.png',
    category: 'public.app-category.education',
    artifactName: 'WordNest-${version}-${arch}.${ext}',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'WordNest',
    uninstallDisplayName: 'WordNest',
    deleteAppDataOnUninstall: false,
    installerIcon: '../build-resources/icon.ico',
    uninstallerIcon: '../build-resources/icon.ico',
    installerLanguages: ['vi_VN', 'en_US'],
    language: '1066',
  },
};

export default config;
