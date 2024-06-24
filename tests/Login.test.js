const request = require('supertest');
const app = require('../App'); // Se o arquivo App.js estiver no diretório pai
const User = require('../UserDetails'); // Importe o modelo UserInfo

describe('POST /Login', () => {
  it('deve fazer login de um usuário existente', async () => {
    const response = await request(app)
      .post('/Login')
      .send({
        email: 'testuser@example.com',
        password: 'senha',
        telephone: '123456789', // Preencha o campo telephone
        CPF: '12345678901', // Preencha o campo CPF
      });

    // Verifica se a resposta foi bem-sucedida (status 200)
    expect(response.status).toBe(200);

    // Se o login for bem-sucedido, o status da resposta deve ser 'ok'
    if (response.body.status === 'ok') {
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('userType');
    } else {
      // Se o login não for bem-sucedido, a mensagem de erro deve ser tratada aqui
      console.error('Erro ao fazer login:', response.body.data); // Exemplo de tratamento de erro
      // Adicione aqui as expectativas para lidar com a mensagem de erro, se necessário
    }
  });

  // Outros testes aqui...
});
