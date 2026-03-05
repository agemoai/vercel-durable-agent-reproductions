import { z } from "zod";

// --- Tool executor functions (each is a durable step) ---

export async function searchFlights({
  origin,
  destination,
  date,
}: {
  origin: string;
  destination: string;
  date: string;
}) {
  "use step";

  // Simulated flight search
  return [
    {
      id: "FL100",
      airline: "SkyWay Airlines",
      origin,
      destination,
      date,
      departureTime: "08:00",
      arrivalTime: "11:30",
      price: 299,
      currency: "USD",
    },
    {
      id: "FL200",
      airline: "CloudJet",
      origin,
      destination,
      date,
      departureTime: "14:00",
      arrivalTime: "17:15",
      price: 349,
      currency: "USD",
    },
  ];
}

export async function checkFlightStatus({
  flightId,
}: {
  flightId: string;
}) {
  "use step";

  // Simulated flight status check
  return {
    flightId,
    status: "On Time",
    gate: "B42",
    terminal: "2",
    lastUpdated: new Date().toISOString(),
  };
}

export async function getAirportInfo({
  airportCode,
}: {
  airportCode: string;
}) {
  "use step";

  // Simulated airport info
  const airports: Record<string, object> = {
    JFK: {
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      terminals: 6,
      lounges: ["SkyClub", "Centurion Lounge"],
    },
    LAX: {
      code: "LAX",
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      terminals: 9,
      lounges: ["Star Alliance Lounge", "United Club"],
    },
  };

  return (
    airports[airportCode.toUpperCase()] ?? {
      code: airportCode,
      name: `${airportCode} Airport`,
      city: "Unknown",
      terminals: 1,
      lounges: [],
    }
  );
}

export async function bookFlight({
  flightId,
  passengerName,
}: {
  flightId: string;
  passengerName: string;
}) {
  "use step";

  // Simulated booking
  return {
    confirmationCode: `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    flightId,
    passengerName,
    status: "Confirmed",
    bookedAt: new Date().toISOString(),
  };
}

export async function checkBaggageAllowance({
  flightId,
}: {
  flightId: string;
}) {
  "use step";

  // Simulated baggage allowance
  return {
    flightId,
    carryOn: { maxWeight: "10kg", maxDimensions: "55x40x20cm" },
    checked: {
      included: 1,
      maxWeight: "23kg",
      additionalBagFee: "$50",
    },
  };
}

// --- Tool definitions for the DurableAgent ---

export const flightBookingTools = {
  searchFlights: {
    description:
      "Search for available flights between two airports on a given date",
    inputSchema: z.object({
      origin: z.string().describe("Origin airport code (e.g. JFK)"),
      destination: z
        .string()
        .describe("Destination airport code (e.g. LAX)"),
      date: z.string().describe("Travel date in YYYY-MM-DD format"),
    }),
    execute: searchFlights,
  },
  checkFlightStatus: {
    description: "Check the current status of a specific flight",
    inputSchema: z.object({
      flightId: z.string().describe("The flight ID to check"),
    }),
    execute: checkFlightStatus,
  },
  getAirportInfo: {
    description: "Get information about a specific airport",
    inputSchema: z.object({
      airportCode: z.string().describe("The IATA airport code (e.g. JFK)"),
    }),
    execute: getAirportInfo,
  },
  bookFlight: {
    description: "Book a flight for a passenger",
    inputSchema: z.object({
      flightId: z.string().describe("The flight ID to book"),
      passengerName: z
        .string()
        .describe("Full name of the passenger"),
    }),
    execute: bookFlight,
  },
  checkBaggageAllowance: {
    description: "Check baggage allowance for a specific flight",
    inputSchema: z.object({
      flightId: z
        .string()
        .describe("The flight ID to check baggage allowance for"),
    }),
    execute: checkBaggageAllowance,
  },
};
