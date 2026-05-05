FROM node:22-bookworm-slim AS base

WORKDIR /usr/src/app
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

FROM base AS deps

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS dev

ENV NODE_ENV=development

COPY . .

EXPOSE 3001
CMD ["yarn", "dev", "--hostname", "0.0.0.0"]

FROM deps AS builder

COPY . .
RUN yarn build

FROM node:22-bookworm-slim AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY package.json next.config.ts ./

EXPOSE 3001
CMD ["yarn", "start", "--hostname", "0.0.0.0"]