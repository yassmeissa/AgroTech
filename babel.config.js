module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... d'autres plugins ici éventuellement
    'react-native-reanimated/plugin', // ← CE plugin doit être DERNIER
  ],
};
