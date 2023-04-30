import Fastify from "fastify";
import { getUpcomingMeetups } from "./utils/api.js";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

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

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.info(`Server is now listening on ${address}`);
});
