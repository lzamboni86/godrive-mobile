// Script para limpar dados de autenticação do Expo Go
// Execute com: node scripts/clear-auth.js

const { execSync } = require('child_process');

console.log('🧹 Limpando dados de autenticação do Expo Go...');

try {
  // Limpar cache do Expo
  execSync('npx expo start --clear', { stdio: 'inherit' });
  
  console.log('\n✅ Dados de autenticação limpos!');
  console.log('📱 Abra o app novamente no Expo Go - ele deve ir para a tela de login.');
  
} catch (error) {
  console.error('❌ Erro ao limpar dados:', error.message);
  console.log('\n💡 Tente manualmente:');
  console.log('1. Desinstale o app GoDrive do celular');
  console.log('2. Execute: npx expo start --clear');
  console.log('3. Escaneie o QR code novamente');
}
