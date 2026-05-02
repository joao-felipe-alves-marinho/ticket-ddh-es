FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:22-bookworm-slim AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile --production=true


COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
