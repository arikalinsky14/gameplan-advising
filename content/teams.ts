export type Sport = "football-m" | "basketball-m" | "basketball-w";

export type Team = {
  id: string;
  school: string;
  mascot: string;
  city: string;
  state: string;
  conference: string;
  division: string;
  primary: string; // primary team color (used sparingly)
  accent: string;  // accent color
  serif: boolean;  // serif or sans display font for theming
};

export const TIER1_SPORTS: { id: Sport; label: string }[] = [
  { id: "football-m", label: "Men's Football" },
  { id: "basketball-m", label: "Men's Basketball" },
  { id: "basketball-w", label: "Women's Basketball" },
];

export const TIER2_SPORTS = ["Baseball", "Softball", "Soccer", "Olympic Sports"];

// Small illustrative sample. Real build pulls from an NCAA D1 database.
export const TEAMS: Team[] = [
  { id: "ala", school: "University of Alabama", mascot: "Crimson Tide", city: "Tuscaloosa", state: "AL", conference: "SEC", division: "FBS", primary: "#9E1B32", accent: "#828A8F", serif: true },
  { id: "aub", school: "Auburn University", mascot: "Tigers", city: "Auburn", state: "AL", conference: "SEC", division: "FBS", primary: "#0C2340", accent: "#E87722", serif: true },
  { id: "uga", school: "University of Georgia", mascot: "Bulldogs", city: "Athens", state: "GA", conference: "SEC", division: "FBS", primary: "#BA0C2F", accent: "#000000", serif: true },
  { id: "tex", school: "University of Texas", mascot: "Longhorns", city: "Austin", state: "TX", conference: "SEC", division: "FBS", primary: "#BF5700", accent: "#333F48", serif: true },
  { id: "lsu", school: "Louisiana State University", mascot: "Tigers", city: "Baton Rouge", state: "LA", conference: "SEC", division: "FBS", primary: "#461D7C", accent: "#FDD023", serif: true },

  { id: "osu", school: "Ohio State University", mascot: "Buckeyes", city: "Columbus", state: "OH", conference: "Big Ten", division: "FBS", primary: "#BB0000", accent: "#666666", serif: false },
  { id: "mich", school: "University of Michigan", mascot: "Wolverines", city: "Ann Arbor", state: "MI", conference: "Big Ten", division: "FBS", primary: "#00274C", accent: "#FFCB05", serif: true },
  { id: "psu", school: "Penn State University", mascot: "Nittany Lions", city: "State College", state: "PA", conference: "Big Ten", division: "FBS", primary: "#041E42", accent: "#96BEE6", serif: true },

  { id: "duke", school: "Duke University", mascot: "Blue Devils", city: "Durham", state: "NC", conference: "ACC", division: "FBS", primary: "#00539B", accent: "#012169", serif: true },
  { id: "unc", school: "University of North Carolina", mascot: "Tar Heels", city: "Chapel Hill", state: "NC", conference: "ACC", division: "FBS", primary: "#7BAFD4", accent: "#13294B", serif: true },
  { id: "cle", school: "Clemson University", mascot: "Tigers", city: "Clemson", state: "SC", conference: "ACC", division: "FBS", primary: "#F56600", accent: "#522D80", serif: true },

  { id: "usc", school: "University of Southern California", mascot: "Trojans", city: "Los Angeles", state: "CA", conference: "Big Ten", division: "FBS", primary: "#990000", accent: "#FFC72C", serif: true },
  { id: "ucla", school: "UCLA", mascot: "Bruins", city: "Los Angeles", state: "CA", conference: "Big Ten", division: "FBS", primary: "#2D68C4", accent: "#F2A900", serif: true },
  { id: "stan", school: "Stanford University", mascot: "Cardinal", city: "Stanford", state: "CA", conference: "ACC", division: "FBS", primary: "#8C1515", accent: "#4D4F53", serif: true },

  { id: "uconn", school: "University of Connecticut", mascot: "Huskies", city: "Storrs", state: "CT", conference: "Big East", division: "D1", primary: "#000E2F", accent: "#E4002B", serif: true },
  { id: "vill", school: "Villanova University", mascot: "Wildcats", city: "Villanova", state: "PA", conference: "Big East", division: "D1", primary: "#00205B", accent: "#13B5EA", serif: true },
  { id: "gtown", school: "Georgetown University", mascot: "Hoyas", city: "Washington", state: "DC", conference: "Big East", division: "D1", primary: "#041E42", accent: "#8A8D8F", serif: true },

  { id: "kan", school: "University of Kansas", mascot: "Jayhawks", city: "Lawrence", state: "KS", conference: "Big 12", division: "D1", primary: "#0051BA", accent: "#E8000D", serif: true },
  { id: "hou", school: "University of Houston", mascot: "Cougars", city: "Houston", state: "TX", conference: "Big 12", division: "D1", primary: "#C8102E", accent: "#B2B4B2", serif: false },
];

export function teamsByConference(division?: string) {
  const source = division ? TEAMS.filter((t) => t.division === division) : TEAMS;
  const map = new Map<string, Team[]>();
  for (const t of source) {
    if (!map.has(t.conference)) map.set(t.conference, []);
    map.get(t.conference)!.push(t);
  }
  return Array.from(map.entries()).map(([conference, teams]) => ({ conference, teams }));
}
