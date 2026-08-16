## Programas necessários

Para rodar esta API localmente, alguns programas devem estar instalados no seu sistema. Mantenha sempre a versão estável (`lts`) mais atualizada.

### NodeJs

O Node.js pode ser instalado através do seguinte [link](https://nodejs.org/en/download/package-manager).

O Node inclui o gerenciador de pacotes `npm`, porém recomenda-se instalar também o `yarn`, utilizando o comando:

```
npm install --global yarn
```

Para manter versões atualizadas do Node.js de forma mais prática, recomenda-se o uso do `nvm`. Consulte este [README](https://github.com/nvm-sh/nvm) para instalação e instruções.

### Docker

O Docker é obrigatório para rodar a API localmente sem a necessidade de instalar e configurar um banco de dados manualmente. Para instalá-lo, utilize este [link](https://docs.docker.com/engine/install/).

## Variáveis de ambiente

Na raiz deste projeto existe um arquivo `.env.example` contendo todas as variáveis necessárias para rodar a API. Crie o arquivo `.env` e copie nele o conteúdo do `.env.example`. Ajuste as variáveis conforme seu ambiente.

Observações:

1. Se você estiver utilizando Docker, o valor de `DATABASE_URL` presente no `.env.example` não precisa ser modificado.
2. A variável `JWT_SECRET` deve receber um valor com tamanho adequado. Gere-o com o comando:

   ```
   openssl rand -hex 32
   ```

   No Windows, caso não tenha o OpenSSL, instale com:

   ```
   choco install openssl
   ```

   Após a instalação, reinicie o terminal.
3. Para simular o serviço de e-mail, utilize esta página: [https://ethereal.email/create](https://ethereal.email/create)
   Na seção *Account credentials*, copie os valores `username` e `password` para as variáveis `SMTP_USERNAME` e `SMTP_PASSWORD`.
   O valor de `SMTP_HOST` já está correto no `.env.example`. Os e-mails enviados podem ser visualizados na própria página do Ethereal.

## Como rodar localmente

Para rodar a API localmente, execute no terminal, na raiz do projeto:

```
# Instala as dependências necessárias
yarn

# Inicializa a imagem em docker para a primeira execução
yarn first_start
```

Para derrubar o container do banco de dados:

```
yarn db:down
```

Após alterações nos schemas do Prisma, execute:

```
# Aplica as novas migrações ao banco
npx prisma migrate dev --name NomeDaMigracao

# Popula o banco novamente
npx prisma db seed
```

## Seeds

Para preencher o banco com dados de desenvolvimento:

```
npx prisma db seed
```

Observações:

1. As seeds estão em `prisma/seeds/seed.ts`.
2. Para acessar o sistema, utilize os e-mails definidos em `prisma/seeds/models/users.ts`.
   A senha padrão está definida na constante `DEFAULT_PASSWORD`.

## Testes

Para rodar os testes, o banco deve estar conectado e sem os dados de seed. Para limpá-lo:

```
# Limpa o banco e deixa pronto para os testes
yarn db:reset
```

Em seguida:

```
# Rodar os testes
yarn test

# Rodar os testes em modo watch
yarn test:watch

# Rodar os testes com verificação de cobertura
yarn test:coverage

# Rodar um arquivo de teste específico
yarn jest nomeDoArquivo.test.ts
```

Observações:

* O comando `yarn test:coverage` interrompe a execução no primeiro erro encontrado.
* Cada teste popula e remove os dados do banco para garantir ambiente limpo entre execuções.

Após os testes, utilize:

```
# Para deixar o banco pronto para uso e rodar
yarn ready
```

## Adicionais

### Criando um usuário administrador localmente

Utilizando `npm`:

```
npm run create-admin
```

Utilizando `yarn`:

```
yarn create-admin
```

### Configurando o Git

Para alterar o repositório remoto:

Ver repositórios configurados:

```
git remote -v
```

Remover e adicionar novo origin:

```
git remote remove origin
git remote add origin <url>
```

Sendo `<url>` o endereço do novo repositório remoto.

## Documentação

### API

Para obter a cotação utilizada na criação de novos produtos ou serviços, o sistema integra-se à [AwesomeAPI](https://docs.awesomeapi.com.br/), responsável por fornecer dados de câmbio atualizados, com limite de até 10 mil requisições mensais.