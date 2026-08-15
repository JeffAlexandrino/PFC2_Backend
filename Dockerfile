FROM node:22.14.0

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN yarn config set registry https://registry.npmjs.org
RUN yarn install --frozen-lockfile --network-timeout 100000

COPY src ./src
COPY scripts ./scripts
COPY assets assets
COPY tsconfig.json ./
COPY .env ./

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN yarn build

CMD ["yarn", "start"]