FROM node:22-alpine AS runner
WORKDIR /app
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG ALL_PROXY
ARG NO_PROXY
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV HTTP_PROXY=$HTTP_PROXY
ENV HTTPS_PROXY=$HTTPS_PROXY
ENV ALL_PROXY=$ALL_PROXY
ENV NO_PROXY=$NO_PROXY
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm ci --omit=dev --ignore-scripts
COPY .next ./.next
COPY public ./public
COPY data ./data
COPY prisma ./prisma
COPY src/generated/prisma ./src/generated/prisma
USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
