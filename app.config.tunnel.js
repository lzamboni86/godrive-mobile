export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.10:3000',
    },
    // Adicionar configuração para tunnel
    web: {
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-router',
        {
          root: './app',
        },
      ],
    ],
  };
};
