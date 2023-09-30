FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY src ./src

ENV NODE_ENV production

CMD [ "bun", "run", "/app/src/index.ts" ]
