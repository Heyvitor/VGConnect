# Usa uma imagem oficial do Node.js como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia o package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Expõe a porta (não é estritamente necessário, mas é boa prática)
EXPOSE $PORT