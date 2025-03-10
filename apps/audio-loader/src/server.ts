import Fastify from 'fastify';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import routes from './routes';
import { match, P } from 'ts-pattern';

const host = process.env.HOST || 'localhost';
const port = match(Number(process.env.PORT))
  .with(P.number.int().gte(1).lte(65535), port => port)
  .otherwise(() => 8080);

const useHttp2 = match(process.env.BIBIM_USE_HTTP2?.toLowerCase())
  .with(P.union('true', '1', 'yes'), () => true)
  .otherwise(() => false);

const server = Fastify({ logger: true, http2: useHttp2 as true });

await server.register(fastifyConnectPlugin, { routes });

await server.listen({ host, port: port });
