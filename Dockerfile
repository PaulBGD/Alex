FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY src/ .

ENV NODE_ENV production

CMD [ "bun", "run", "src/index.ts" ]
