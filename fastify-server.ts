import { TrieV2 } from "./trieV2/trie.v2";
import Fastify from "fastify";
import { Gaddag } from "./utils/read-words";
import { memoryUsage } from "./utils/memory-usage";

const trie = new TrieV2();

const fastify = Fastify({
  logger: true,
});

fastify.get("/starts", async (request, reply) => {
  const { str, l } = request.query as { str: string; l?: string };
  const res = trie.startsWith(str, l ? parseInt(l) : undefined);
  memoryUsage();
  return { res };
});

fastify.get("/contains", async (request, reply) => {
  const { str } = request.query as { str: string };
  const res = trie.contains(str);
  return { res };
});

fastify.get("/ends", async (request, reply) => {
  const { str, l } = request.query as { str: string; l?: string };
  const res = trie.endsWith(str, l ? parseInt(l) : undefined);
  memoryUsage();
  return { res };
});

fastify.get("/finish", async (request, reply) => {
  const { str, hand } = request.query as { str: string; hand: string };
  const res = trie.finishWithHand(str, hand.split(""));
  memoryUsage();
  return { res };
});

fastify.get("/cw", async (request, reply) => {
  const { str, hand } = request.query as { str: string; hand: string };
  const res = trie.containsWithHand(str, hand.split(""));
  memoryUsage();
  return { res };
});

fastify.get("/between", async (request, reply) => {
  const { p, s } = request.query as { p: string; s: string };
  const res = trie.between(p, s);
  memoryUsage();
  return { res };
});

fastify.get("/p", async (request, reply) => {
  const { p } = request.query as { p: string };
  const res = trie.pattern(p);
  memoryUsage();
  return { res };
});

fastify.post("/pattern", async (request, reply) => {
  const { s, h, b, a } = request.body as {
    s: string;
    h: string[];
    b: string[];
    a: string[];
  };
  const res = trie.suggest(s, b, a, h);
  memoryUsage();
  return { res };
});

const populateTrie = async () => {
  await Gaddag.readWordsEnglish(trie);
};

const start = async () => {
  try {
    await fastify.listen(5100);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

populateTrie();
start();
