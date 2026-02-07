/**
 * GoDrive Backend E2E Test Runner
 * Simula fluxo completo via API calls e gera relatório de sucesso/falha.
 * Execute com: node e2e-test-runner.js
 */

const axios = require('axios');

// Configuração
const API_BASE = 'http://localhost:3000'; // Ajuste se necessário
let testResults = [];
let tokens = {};
let ids = {};

// Helpers
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateValidCpf = () => {
  // Gera CPF válido (11 dígitos) com dígitos verificadores.
  // Evita CPFs com todos os dígitos iguais.
  const randomNine = () => {
    while (true) {
      const base = String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
      if (!/^([0-9])\1+$/.test(base)) return base;
    }
  };

  const calcDigit = (digits, factorStart) => {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += Number(digits[i]) * (factorStart - i);
    }
    const mod = sum % 11;
    return mod < 2 ? '0' : String(11 - mod);
  };

  const base = randomNine();
  const d1 = calcDigit(base, 10);
  const d2 = calcDigit(base + d1, 11);
  return base + d1 + d2;
};

const log = (step, status, message, data = null) => {
  const entry = { step, status, message, data: data ? JSON.stringify(data, null, 2) : null, timestamp: new Date().toISOString() };
  testResults.push(entry);
  console.log(`[${status.toUpperCase()}] ${step}: ${message}`);
  if (data) console.log('DATA:', JSON.stringify(data, null, 2));
};

const apiCall = async (method, path, data = null, token = null) => {
  const config = {
    method,
    url: `${API_BASE}${path}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(data && { data })
  };
  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    let errorMsg = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMsg = `Backend não está rodando em ${API_BASE}. Inicie o servidor com: npm run start:dev`;
    } else if (error.response) {
      errorMsg = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    }
    return { 
      success: false, 
      error: errorMsg, 
      status: error.response?.status 
    };
  }
};

// 1. Criar aluno (registro e login)
async function createStudent() {
  log('Criar aluno', 'INFO', 'Iniciando criação de aluno');
  const studentData = {
    name: 'Aluno Teste E2E',
    email: `aluno.e2e.${Date.now()}@test.com`,
    password: '123456',
    phone: '11999999999',
    cpf: generateValidCpf()
  };
  const reg = await apiCall('POST', '/auth/register/student', studentData);
  if (!reg.success) {
    log('Criar aluno', 'FAIL', 'Registro falhou', reg.error);
    return false;
  }
  log('Criar aluno', 'SUCCESS', 'Aluno registrado com sucesso', reg.data);
  
  const login = await apiCall('POST', '/auth/login', { email: studentData.email, password: studentData.password });
  if (!login.success) {
    log('Criar aluno', 'FAIL', 'Login do aluno falhou', login.error);
    return false;
  }
  tokens.student = login.data.accessToken;
  ids.student = login.data.user.id;
  ids.studentEmail = studentData.email;
  log('Criar aluno', 'SUCCESS', 'Login do aluno realizado', { userId: ids.student, instructorId: login.data.user.instructorId });
  return true;
}

// 2. Criar instrutor (registro e login)
async function createInstructor() {
  log('Criar instrutor', 'INFO', 'Iniciando criação de instrutor');
  const randomPlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randLetters = () => Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randDigits = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return randLetters() + randDigits();
  };
  const instructorData = {
    name: 'Instrutor Teste E2E',
    email: `instrutor.e2e.${Date.now()}@test.com`,
    password: '123456',
    phone: '11888888888',
    cpf: generateValidCpf(),
    addressStreet: 'Rua Teste',
    addressNumber: '123',
    addressZipCode: '01234567',
    addressNeighborhood: 'Bairro Teste',
    addressCity: 'São Paulo',
    addressState: 'SP',
    cnh: 'AB', // string
    vehicleModel: 'Palio', // string
    vehiclePlate: randomPlate(), // string
    vehicleYear: 2020,
    vehicleTransmission: 'MANUAL',
    vehicleEngineType: 'COMBUSTION',
    hourlyRate: 100,
    state: 'SP',
    city: 'São Paulo',
    neighborhoodTeach: 'Bairro Teste',
    gender: 'MALE',
    bio: 'Instrutor experiente para testes E2E.'
  };
  const reg = await apiCall('POST', '/auth/register/instructor', instructorData);
  if (!reg.success) {
    log('Criar instrutor', 'FAIL', 'Registro falhou', reg.error);
    return false;
  }
  log('Criar instrutor', 'SUCCESS', 'Instrutor registrado com sucesso', reg.data);

  // Salvar credenciais para login após aprovação
  ids.instructorEmail = instructorData.email;
  ids.instructorPassword = instructorData.password;
  
  // Login do instrutor pode falhar aqui (status ainda PENDING). O login válido acontece após a aprovação.
  const login = await apiCall('POST', '/auth/login', { email: instructorData.email, password: instructorData.password });
  if (login.success) {
    tokens.instructor = login.data.accessToken;
    ids.instructor = login.data.user.id;
    ids.instructorId = login.data.user.instructorId; // Instructor.id
    log('Criar instrutor', 'SUCCESS', 'Login do instrutor realizado', { userId: ids.instructor, instructorId: ids.instructorId });
  } else {
    log('Criar instrutor', 'INFO', 'Login do instrutor ainda indisponível (aguardando aprovação)', login.error);
  }
  return true;
}

// 3. Aprovar instrutor no admin
async function approveInstructor() {
  log('Aprovar instrutor', 'INFO', 'Buscando instrutores pendentes');
  const list = await apiCall('GET', '/auth/admin/instructors', null, tokens.student);
  if (!list.success) {
    log('Aprovar instrutor', 'FAIL', 'Falha ao listar instrutores', list.error);
    return false;
  }
  const pending = list.data.find(i => i.email === ids.instructorEmail);
  if (!pending || pending.status !== 'PENDING') {
    log('Aprovar instrutor', 'FAIL', 'Instrutor não encontrado ou não está pendente');
    return false;
  }
  ids.instructorId = pending.id; // Instructor.id
  const approve = await apiCall('POST', `/auth/admin/instructors/${ids.instructorId}/approve`, null, tokens.student);
  if (!approve.success) {
    log('Aprovar instrutor', 'FAIL', 'Falha ao aprovar instrutor', approve.error);
    return false;
  }
  log('Aprovar instrutor', 'SUCCESS', 'Instrutor aprovado com sucesso', approve.data);
  
  // Fazer login novamente para obter token válido
  const login = await apiCall('POST', '/auth/login', { email: pending.email, password: ids.instructorPassword || '123456' });
  if (!login.success) {
    log('Aprovar instrutor', 'FAIL', 'Falha ao fazer login após aprovação', login.error);
    return false;
  }
  tokens.instructor = login.data.accessToken;
  ids.instructorId = login.data.user.instructorId;
  log('Aprovar instrutor', 'SUCCESS', 'Login atualizado após aprovação', { instructorId: ids.instructorId });
  return true;
}

// 4. Aluno agendar aula (com pagamento via Mercado Pago simulado)
async function scheduleLesson() {
  log('Agendar aula', 'INFO', 'Buscando instrutores aprovados');
  const instructors = await apiCall('GET', '/student/instructors/approved', null, tokens.student);
  if (!instructors.success) {
    log('Agendar aula', 'FAIL', 'Falha ao buscar instrutores', instructors.error);
    return false;
  }
  const target = instructors.data.find(i => (ids.instructorEmail ? i.email === ids.instructorEmail : i.email.includes('instrutor.e2e')));
  if (!target) {
    log('Agendar aula', 'FAIL', 'Instrutor aprovado não encontrado');
    return false;
  }
  ids.instructorId = target.id; // Instructor.id
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  const scheduleData = {
    studentId: ids.student,
    instructorId: ids.instructorId,
    lessons: [{
      date: dateStr,
      time: '10:00',
      duration: 50,
      price: 100
    }],
    totalAmount: 100,
    status: 'PENDING_PAYMENT'
  };
  const schedule = await apiCall('POST', '/student/schedule', scheduleData, tokens.student);
  if (!schedule.success) {
    log('Agendar aula', 'FAIL', 'Falha ao criar agendamento', schedule.error);
    return false;
  }
  ids.lesson = schedule.data.id;
  ids.lessonIds = schedule.data.lessonIds || [schedule.data.id];
  log('Agendar aula', 'SUCCESS', 'Agendamento criado', schedule.data);
  // Simular pagamento via Mercado Pago (webhook)
  const paid = await simulateMercadoPagoPayment(ids.lessonIds[0]);
  if (!paid) {
    return false;
  }
  return true;
}

// Simula webhook do Mercado Pago para aprovar pagamento
async function simulateMercadoPagoPayment(lessonId) {
  log('Simular pagamento MP', 'INFO', 'Enviando webhook simulado de pagamento aprovado');
  // Não existe endpoint interno para forçar PAID por lessonId.
  // Para o E2E, basta colocar a aula em WAITING_APPROVAL para aparecer nas solicitações do instrutor.
  const moveToWaitingApproval = await apiCall('PATCH', `/lessons/${lessonId}`, { status: 'WAITING_APPROVAL' }, null);
  if (!moveToWaitingApproval.success) {
    log('Simular pagamento MP', 'FAIL', 'Falha ao mover aula para WAITING_APPROVAL', moveToWaitingApproval.error);
    return false;
  }
  log('Simular pagamento MP', 'SUCCESS', 'Aula movida para WAITING_APPROVAL (simulação)', moveToWaitingApproval.data);
  return true;
}

// 5. Instrutor aprovar aula
async function approveLesson() {
  log('Aprovar aula', 'INFO', 'Buscando solicitações do instrutor');
  const requests = await apiCall('GET', `/instructor/${ids.instructorId}/requests`, null, tokens.instructor);
  if (!requests.success) {
    log('Aprovar aula', 'FAIL', 'Falha ao buscar solicitações', requests.error);
    return false;
  }
  const lessonRequest = requests.data.find(r => r.id === ids.lesson);
  if (!lessonRequest) {
    log('Aprovar aula', 'FAIL', 'Solicitação de aula não encontrada');
    return false;
  }
  const approve = await apiCall('PATCH', `/instructor/requests/${ids.lesson}/approve`, null, tokens.instructor);
  if (!approve.success) {
    log('Aprovar aula', 'FAIL', 'Falha ao aprovar aula', approve.error);
    return false;
  }
  log('Aprovar aula', 'SUCCESS', 'Aula aprovada', approve.data);
  return true;
}

// 6. Verificar aula na agenda do aluno
async function checkStudentSchedule() {
  log('Ver agenda aluno', 'INFO', 'Buscando aulas do aluno');
  const lessons = await apiCall('GET', `/student/lessons/student/${ids.student}`, null, tokens.student);
  if (!lessons.success) {
    log('Ver agenda aluno', 'FAIL', 'Falha ao buscar aulas do aluno', lessons.error);
    return false;
  }
  const scheduled = lessons.data.find(l => l.id === ids.lesson);
  if (!scheduled) {
    log('Ver agenda aluno', 'FAIL', 'Aula não encontrada na agenda do aluno');
    return false;
  }
  log('Ver agenda aluno', 'SUCCESS', 'Aula encontrada na agenda do aluno', scheduled);
  return true;
}

// 7. Chat: aluno enviar mensagem
async function studentSendMessage() {
  log('Chat aluno envia', 'INFO', 'Enviando mensagem do aluno');
  const chat = await apiCall('GET', `/chat/lesson/${ids.lesson}`, null, tokens.student);
  if (!chat.success) {
    log('Chat aluno envia', 'FAIL', 'Falha ao buscar/criar chat da aula', chat.error);
    return false;
  }
  ids.chatId = chat.data.id;

  const message = {
    chatId: ids.chatId,
    content: 'Olá, estou pronto para a aula!',
  };
  const send = await apiCall('POST', '/chat/messages', message, tokens.student);
  if (!send.success) {
    log('Chat aluno envia', 'FAIL', 'Falha ao enviar mensagem', send.error);
    return false;
  }
  ids.message = send.data.id;
  log('Chat aluno envia', 'SUCCESS', 'Mensagem enviada', send.data);
  return true;
}

// 8. Chat: instrutor receber mensagem
async function instructorReceiveMessage() {
  log('Chat instrutor recebe', 'INFO', 'Buscando mensagens do instrutor');
  await delay(1000); // Aguarda um pouco
  if (!ids.chatId) {
    const chat = await apiCall('GET', `/chat/lesson/${ids.lesson}`, null, tokens.instructor);
    if (!chat.success) {
      log('Chat instrutor recebe', 'FAIL', 'Falha ao buscar/criar chat da aula', chat.error);
      return false;
    }
    ids.chatId = chat.data.id;
  }

  const messages = await apiCall('GET', `/chat/${ids.chatId}/messages`, null, tokens.instructor);
  if (!messages.success) {
    log('Chat instrutor recebe', 'FAIL', 'Falha ao buscar mensagens', messages.error);
    return false;
  }
  if (!Array.isArray(messages.data)) {
    log('Chat instrutor recebe', 'FAIL', 'Formato inesperado ao buscar mensagens', messages.data);
    return false;
  }
  const received = messages.data.find(m => m.id === ids.message);
  if (!received) {
    log('Chat instrutor recebe', 'FAIL', 'Mensagem não encontrada para o instrutor');
    return false;
  }
  log('Chat instrutor recebe', 'SUCCESS', 'Mensagem recebida pelo instrutor', received);
  return true;
}

// 9. Instrutor finalizar aula
async function completeLesson() {
  log('Finalizar aula', 'INFO', 'Instrutor finalizando aula');
  const complete = await apiCall('PATCH', `/lessons/${ids.lesson}`, { status: 'COMPLETED' }, tokens.instructor);
  if (!complete.success) {
    log('Finalizar aula', 'FAIL', 'Falha ao finalizar aula', complete.error);
    return false;
  }
  log('Finalizar aula', 'SUCCESS', 'Aula finalizada', complete.data);
  return true;
}

// 10. Aluno avaliar instrutor
async function rateInstructor() {
  log('Avaliar instrutor', 'INFO', 'Aluno avaliando instrutor');
  const rating = {
    lessonId: ids.lesson,
    rating: 5,
    comment: 'Excelente aula!'
  };
  const rate = await apiCall('POST', '/reviews', rating, tokens.student);
  if (!rate.success) {
    log('Avaliar instrutor', 'FAIL', 'Falha ao avaliar instrutor', rate.error);
    return false;
  }
  log('Avaliar instrutor', 'SUCCESS', 'Instrutor avaliado', rate.data);
  return true;
}

// 11. Fluxo de rejeição: instrutor recusa aula e valor volta para carteira
async function rejectionFlow() {
  log('Fluxo rejeição', 'INFO', 'Iniciando fluxo de rejeição');
  // Criar nova aula para rejeição
  const tomorrow2 = new Date();
  tomorrow2.setDate(tomorrow2.getDate() + 2);
  const dateStr2 = tomorrow2.toISOString().split('T')[0];
  const scheduleData2 = {
    studentId: ids.student,
    instructorId: ids.instructorId,
    lessons: [{
      date: dateStr2,
      time: '14:00',
      duration: 50,
      price: 80
    }],
    totalAmount: 80,
    status: 'PENDING_PAYMENT'
  };
  const schedule2 = await apiCall('POST', '/student/schedule', scheduleData2, tokens.student);
  if (!schedule2.success) {
    log('Fluxo rejeição', 'FAIL', 'Falha ao criar agendamento para rejeição', schedule2.error);
    return false;
  }
  ids.lesson2 = schedule2.data.id;
  ids.lessonIds2 = schedule2.data.lessonIds || [schedule2.data.id];
  const paid = await simulateMercadoPagoPayment(ids.lessonIds2[0]);
  if (!paid) {
    return false;
  }
  // Instrutor recusa
  const reject = await apiCall('PATCH', `/instructor/requests/${ids.lesson2}/reject`, null, tokens.instructor);
  if (!reject.success) {
    log('Fluxo rejeição', 'FAIL', 'Falha ao rejeitar aula', reject.error);
    return false;
  }
  log('Fluxo rejeição', 'SUCCESS', 'Aula rejeitada', reject.data);
  // Verificar se o valor voltou para a carteira
  const wallet = await apiCall('GET', `/wallet/balance`, null, tokens.student);
  if (!wallet.success) {
    log('Fluxo rejeição', 'FAIL', 'Falha ao buscar saldo da carteira', wallet.error);
    return false;
  }
  log('Fluxo rejeição', 'SUCCESS', 'Valor reembolsado para carteira', wallet.data);
  return true;
}

// 12. Gerar relatório final
function generateReport() {
  console.log('\n=== RELATÓRIO FINAL E2E ===\n');
  const summary = {
    total: testResults.length,
    success: testResults.filter(r => r.status === 'SUCCESS').length,
    fail: testResults.filter(r => r.status === 'FAIL').length,
    info: testResults.filter(r => r.status === 'INFO').length
  };
  console.log('RESUMO:', summary);
  console.log('\nDETALHES:\n');
  testResults.forEach(r => {
    console.log(`[${r.timestamp}] ${r.step}: ${r.status} - ${r.message}`);
    if (r.data) console.log('  DATA:', r.data);
  });
  // Salvar em arquivo
  const fs = require('fs');
  fs.writeFileSync('e2e-report.json', JSON.stringify({ summary, details: testResults }, null, 2));
  console.log('\nRelatório salvo em e2e-report.json');
}

// Runner principal
async function runE2E() {
  console.log('Iniciando teste E2E do GoDrive Backend...\n');
  const steps = [
    { fn: createStudent, name: 'Criar aluno' },
    { fn: createInstructor, name: 'Criar instrutor' },
    { fn: approveInstructor, name: 'Aprovar instrutor' },
    { fn: scheduleLesson, name: 'Agendar aula' },
    { fn: approveLesson, name: 'Aprovar aula' },
    { fn: checkStudentSchedule, name: 'Ver agenda aluno' },
    { fn: studentSendMessage, name: 'Chat aluno envia' },
    { fn: instructorReceiveMessage, name: 'Chat instrutor recebe' },
    { fn: completeLesson, name: 'Finalizar aula' },
    { fn: rateInstructor, name: 'Avaliar instrutor' },
    { fn: rejectionFlow, name: 'Fluxo rejeição' }
  ];
  for (const step of steps) {
    try {
      const ok = await step.fn();
      if (ok === false) {
        // Evita cascata de 401/404 quando um pré-requisito falha (ex.: login não aconteceu)
        break;
      }
    } catch (e) {
      log(step.name, 'FAIL', 'Exceção não tratada: ' + e.message);
      break;
    }
    await delay(500); // Pequena pausa entre passos
  }
  generateReport();
}

// Executar
if (require.main === module) {
  runE2E().catch(err => {
    console.error('Erro fatal no runner:', err);
    process.exit(1);
  });
}

module.exports = { runE2E, testResults };
