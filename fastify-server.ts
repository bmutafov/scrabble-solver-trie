import { TrieV2 } from "./trieV2/trie.v2";
import Fastify from "fastify";
import { readWords_Gaddag } from "./utils/read-words";

const trie = new TrieV2();

const fastify = Fastify({
  logger: true,
});

fastify.get("/starts", async (request, reply) => {
  const { str } = request.query as { str: string };
  const res = trie.startsWith(str);
  return { res };
});

fastify.get("/contains", async (request, reply) => {
  const { str } = request.query as { str: string };
  const res = trie.contains(str);
  return { res };
});

fastify.get("/ends", async (request, reply) => {
  const { str } = request.query as { str: string };
  const res = trie.endsWith(str);
  return { res };
});

const start = async () => {
  try {
    readWords_Gaddag(trie);
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
