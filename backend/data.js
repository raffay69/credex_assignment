export const TOOLS = {
  cursor: {
    useCases: ["coding"],
    plans: {
      free:       { price: 0,   seats: "solo" },
      pro:        { price: 20,  seats: "solo" },
      pro_plus:   { price: 60,  seats: "solo" },
      ultra:      { price: 200, seats: "solo" },
      teams:      { price: 40,  seats: "team" },
    },
  },
  copilot: {
    useCases: ["coding"],
    plans: {
      free:       { price: 0,  seats: "solo" },
      pro:        { price: 10, seats: "solo" },
      pro_plus:   { price: 39, seats: "solo" },
      business:   { price: 19, seats: "team" },
    },
  },
  windsurf: {
    useCases: ["coding"],
    plans: {
      free:  { price: 0,   seats: "solo" },
      pro:   { price: 20,  seats: "solo" },
      max:   { price: 200, seats: "solo" },
      teams: { price: 40,  seats: "team" },
    },
  },
  claude: {
    useCases: ["writing", "research", "mixed", "coding"],
    plans: {
      free:         { price: 0,   seats: "solo" },
      pro:          { price: 17,  seats: "solo" },
      max_5x:       { price: 100, seats: "solo" },
      team:         { price: 20,  seats: "team" },
      team_premium: { price: 100, seats: "team" },
      api:          { price: 0,   seats: "any"  },
    },
  },
  chatgpt: {
    useCases: ["writing", "research", "mixed", "coding"],
    plans: {
      free:     { price: 0,   seats: "solo" },
      go:       { price: 8,   seats: "solo" },
      plus:     { price: 20,  seats: "solo" },
      pro:      { price: 100, seats: "solo" },
      business: { price: 20,  seats: "team" },
      api:      { price: 0,   seats: "any"  },
    },
  },
  gemini: {
    useCases: ["writing", "research", "mixed"],
    plans: {
      free:  { price: 0,     seats: "solo" },
      plus:  { price: 8,   seats: "solo" },
      pro:   { price: 20,  seats: "solo" },
      ultra: { price: 250, seats: "solo" },
      api:   { price: 0,     seats: "any"  },
    },
  },
};