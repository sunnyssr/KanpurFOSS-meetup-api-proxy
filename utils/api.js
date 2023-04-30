import fetch from "node-fetch";

const groupQuery = (urlName) => {
  return `groupByUrlname(urlname: "${urlName}") {
    name
    unifiedEvents(input: {first: 3}) {
      count
      pageInfo {
        endCursor
      }
      edges {
        node {
          title
          id
          dateTime
          eventUrl
          going
          venue {
            name
            address
            city
            state
            postalCode
            crossStreet
          }
          group {
            urlname 
            name
            customMemberLabel
          }
        }
      }
    }
  }`;
};

export const getUpcomingMeetups = async () => {
  try {
    const res = await fetch("https://api.meetup.com/gql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `query {
        group1: ${groupQuery("WordPress-Kanpur")}
        group2: ${groupQuery("Docker-Kanpur")}
        group3: ${groupQuery("hackerspace-kanpur")}
        group4: ${groupQuery("PyDataKanpur")}
        group5: ${groupQuery("KanpurPython")}
        group6: ${groupQuery("makerspacekanpur")}
        group7: ${groupQuery("kanpur-js")}
      }`,
      }),
    });
    const json = await res.json();
    return Object.keys(json.data)
      .map((group) => json.data[group].unifiedEvents?.edges.map((node) => node.node))
      .flat();
  } catch (error) {
    console.error(`Error fetching data from meetup api:${error}`);
  }
};
