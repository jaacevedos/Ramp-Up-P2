FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup package.json package-lock.json ./

RUN npm install

COPY --chown=appuser:appgroup . ./

USER appuser

EXPOSE 3001

CMD ["npm", "start"]