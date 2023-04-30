import Fastify from "fastify";
import cors from "@fastify/cors";
import { getUpcomingMeetups } from "./utils/api.js";

const port = process.env.PORT || 3000;

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {});

const cache = {};

fastify.get("/upcoming-meetups", async function (request, reply) {
  let upcomingMeetups = [];
  if (cache["upcoming-meetups"]) {
    console.log("getting data from cache");
    upcomingMeetups = cache["upcoming-meetups"].data;
    const expiryTime = cache["upcoming-meetups"].expiryTime;
    if (expiryTime > Date.now()) {
      upcomingMeetups = await getUpcomingMeetups();
      cache["upcoming-meetups"] = {
        data: upcomingMeetups,
        expiryTime: Date.now() + 15 * 60 * 1000,
      };
    }
  } else {
    console.log("fetching upcoming events from meetup api");
    upcomingMeetups = await getUpcomingMeetups();
    cache["upcoming-meetups"] = { data: upcomingMeetups, expiryTime: Date.now() + 15 * 60 * 1000 };
  }

  reply.send({ upcomingMeetups });
});

fastify.listen({ port }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.info(`Server is now listening on ${address}`);
});
