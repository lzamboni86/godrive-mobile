// Script para criar usuário de teste no frontend
// Execute: node scripts/create-test-user.js

const bcrypt = require('bcrypt');

async function createTestUser() {
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Usuário de teste criado:');
  console.log('Email: aluno@teste.com');
  console.log('Senha: 123456');
  console.log('Hash:', hashedPassword);
}

createTestUser().catch(console.error);
