// Script para testar se há aulas pendentes
// Execute no console do navegador ou no app

console.log('🔔 Testando badge...');

// Simular chamada à API
fetch('http://192.168.15.10:3000/instructor/cmke45p7b00012p0ke9rbziji/requests')
  .then(response => response.json())
  .then(data => {
    console.log('📋 Resposta:', data);
    const pending = data.filter(r => r.status === 'REQUESTED' || r.status === 'WAITING_APPROVAL');
    console.log('🔔 Pendentes:', pending.length);
    console.log('🔔 Status:', pending.map(r => ({ id: r.id, status: r.status })));
  })
  .catch(error => console.error('❌ Erro:', error));
