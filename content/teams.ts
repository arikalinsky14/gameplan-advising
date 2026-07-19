export type Sport = "football-m" | "basketball-m" | "basketball-w";

export type Team = {
  id: string;
  school: string;
  mascot: string;
  city: string;
  state: string;
  conference: string;
  division: "FBS" | "FCS" | "D1";
  primary: string;
  accent: string;
  serif: boolean;
  // Which Tier-1 sports the school fields at the D1 level. Every FBS school has
  // men's and women's basketball; football is FBS. We also include a few
  // basketball-only D1 schools in Big East etc.
  sports: Sport[];
};

export const TIER1_SPORTS: { id: Sport; label: string }[] = [
  { id: "football-m", label: "Men's Football" },
  { id: "basketball-m", label: "Men's Basketball" },
  { id: "basketball-w", label: "Women's Basketball" },
];

export const TIER2_SPORTS = ["Baseball", "Softball", "Soccer", "Olympic Sports"];

const ALL: Sport[] = ["football-m", "basketball-m", "basketball-w"];
const HOOPS: Sport[] = ["basketball-m", "basketball-w"];

// Comprehensive-enough list: every FBS football program (2025-26 season) plus
// major D1 basketball-only programs across the power basketball conferences.
// Colors are the school's primary/secondary athletic colors. Real build swaps
// this for an NCAA D1 roster fetch and official mark handling.
export const TEAMS: Team[] = [
  // ─── SEC ────────────────────────────────────────────────────────────────
  { id: "ala",  school: "University of Alabama",         mascot: "Crimson Tide",   city: "Tuscaloosa",     state: "AL", conference: "SEC", division: "FBS", primary: "#9E1B32", accent: "#828A8F", serif: true,  sports: ALL },
  { id: "ark",  school: "University of Arkansas",        mascot: "Razorbacks",     city: "Fayetteville",   state: "AR", conference: "SEC", division: "FBS", primary: "#9D2235", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "aub",  school: "Auburn University",             mascot: "Tigers",         city: "Auburn",         state: "AL", conference: "SEC", division: "FBS", primary: "#0C2340", accent: "#E87722", serif: true,  sports: ALL },
  { id: "fla",  school: "University of Florida",         mascot: "Gators",         city: "Gainesville",    state: "FL", conference: "SEC", division: "FBS", primary: "#0021A5", accent: "#FA4616", serif: true,  sports: ALL },
  { id: "uga",  school: "University of Georgia",         mascot: "Bulldogs",       city: "Athens",         state: "GA", conference: "SEC", division: "FBS", primary: "#BA0C2F", accent: "#000000", serif: true,  sports: ALL },
  { id: "uk",   school: "University of Kentucky",        mascot: "Wildcats",       city: "Lexington",      state: "KY", conference: "SEC", division: "FBS", primary: "#0033A0", accent: "#FFFFFF", serif: false, sports: ALL },
  { id: "lsu",  school: "Louisiana State University",    mascot: "Tigers",         city: "Baton Rouge",    state: "LA", conference: "SEC", division: "FBS", primary: "#461D7C", accent: "#FDD023", serif: true,  sports: ALL },
  { id: "miss", school: "University of Mississippi",     mascot: "Rebels",         city: "Oxford",         state: "MS", conference: "SEC", division: "FBS", primary: "#CE1126", accent: "#14213D", serif: true,  sports: ALL },
  { id: "msst", school: "Mississippi State University",  mascot: "Bulldogs",       city: "Starkville",     state: "MS", conference: "SEC", division: "FBS", primary: "#660000", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "mizz", school: "University of Missouri",        mascot: "Tigers",         city: "Columbia",       state: "MO", conference: "SEC", division: "FBS", primary: "#F1B82D", accent: "#000000", serif: true,  sports: ALL },
  { id: "okla", school: "University of Oklahoma",        mascot: "Sooners",        city: "Norman",         state: "OK", conference: "SEC", division: "FBS", primary: "#841617", accent: "#FDF9D8", serif: true,  sports: ALL },
  { id: "sc",   school: "University of South Carolina",  mascot: "Gamecocks",      city: "Columbia",       state: "SC", conference: "SEC", division: "FBS", primary: "#73000A", accent: "#000000", serif: true,  sports: ALL },
  { id: "tenn", school: "University of Tennessee",       mascot: "Volunteers",     city: "Knoxville",      state: "TN", conference: "SEC", division: "FBS", primary: "#FF8200", accent: "#58595B", serif: true,  sports: ALL },
  { id: "tex",  school: "University of Texas",           mascot: "Longhorns",      city: "Austin",         state: "TX", conference: "SEC", division: "FBS", primary: "#BF5700", accent: "#333F48", serif: true,  sports: ALL },
  { id: "tamu", school: "Texas A&M University",          mascot: "Aggies",         city: "College Station",state: "TX", conference: "SEC", division: "FBS", primary: "#500000", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "vand", school: "Vanderbilt University",         mascot: "Commodores",     city: "Nashville",      state: "TN", conference: "SEC", division: "FBS", primary: "#000000", accent: "#CFAE70", serif: true,  sports: ALL },

  // ─── Big Ten ────────────────────────────────────────────────────────────
  { id: "ill",  school: "University of Illinois",        mascot: "Fighting Illini", city: "Champaign",     state: "IL", conference: "Big Ten", division: "FBS", primary: "#13294B", accent: "#E84A27", serif: true,  sports: ALL },
  { id: "ind",  school: "Indiana University",            mascot: "Hoosiers",       city: "Bloomington",    state: "IN", conference: "Big Ten", division: "FBS", primary: "#990000", accent: "#EDEBEB", serif: true,  sports: ALL },
  { id: "iowa", school: "University of Iowa",            mascot: "Hawkeyes",       city: "Iowa City",      state: "IA", conference: "Big Ten", division: "FBS", primary: "#000000", accent: "#FFCD00", serif: true,  sports: ALL },
  { id: "md",   school: "University of Maryland",        mascot: "Terrapins",      city: "College Park",   state: "MD", conference: "Big Ten", division: "FBS", primary: "#E03A3E", accent: "#FFD520", serif: false, sports: ALL },
  { id: "mich", school: "University of Michigan",        mascot: "Wolverines",     city: "Ann Arbor",      state: "MI", conference: "Big Ten", division: "FBS", primary: "#00274C", accent: "#FFCB05", serif: true,  sports: ALL },
  { id: "msu",  school: "Michigan State University",     mascot: "Spartans",       city: "East Lansing",   state: "MI", conference: "Big Ten", division: "FBS", primary: "#18453B", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "minn", school: "University of Minnesota",       mascot: "Golden Gophers", city: "Minneapolis",    state: "MN", conference: "Big Ten", division: "FBS", primary: "#7A0019", accent: "#FFCC33", serif: true,  sports: ALL },
  { id: "neb",  school: "University of Nebraska",        mascot: "Cornhuskers",    city: "Lincoln",        state: "NE", conference: "Big Ten", division: "FBS", primary: "#E41C38", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "nu",   school: "Northwestern University",       mascot: "Wildcats",       city: "Evanston",       state: "IL", conference: "Big Ten", division: "FBS", primary: "#4E2A84", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "osu",  school: "Ohio State University",         mascot: "Buckeyes",       city: "Columbus",       state: "OH", conference: "Big Ten", division: "FBS", primary: "#BB0000", accent: "#666666", serif: false, sports: ALL },
  { id: "oreg", school: "University of Oregon",          mascot: "Ducks",          city: "Eugene",         state: "OR", conference: "Big Ten", division: "FBS", primary: "#154733", accent: "#FEE123", serif: false, sports: ALL },
  { id: "psu",  school: "Penn State University",         mascot: "Nittany Lions",  city: "State College",  state: "PA", conference: "Big Ten", division: "FBS", primary: "#041E42", accent: "#96BEE6", serif: true,  sports: ALL },
  { id: "pur",  school: "Purdue University",             mascot: "Boilermakers",   city: "West Lafayette", state: "IN", conference: "Big Ten", division: "FBS", primary: "#CEB888", accent: "#000000", serif: true,  sports: ALL },
  { id: "rut",  school: "Rutgers University",            mascot: "Scarlet Knights",city: "Piscataway",     state: "NJ", conference: "Big Ten", division: "FBS", primary: "#CC0033", accent: "#000000", serif: true,  sports: ALL },
  { id: "ucla", school: "University of California, Los Angeles", mascot: "Bruins", city: "Los Angeles",    state: "CA", conference: "Big Ten", division: "FBS", primary: "#2D68C4", accent: "#F2A900", serif: true,  sports: ALL },
  { id: "usc",  school: "University of Southern California", mascot: "Trojans",    city: "Los Angeles",    state: "CA", conference: "Big Ten", division: "FBS", primary: "#990000", accent: "#FFC72C", serif: true,  sports: ALL },
  { id: "wash", school: "University of Washington",      mascot: "Huskies",        city: "Seattle",        state: "WA", conference: "Big Ten", division: "FBS", primary: "#4B2E83", accent: "#B7A57A", serif: true,  sports: ALL },
  { id: "wisc", school: "University of Wisconsin",       mascot: "Badgers",        city: "Madison",        state: "WI", conference: "Big Ten", division: "FBS", primary: "#C5050C", accent: "#FFFFFF", serif: true,  sports: ALL },

  // ─── ACC ────────────────────────────────────────────────────────────────
  { id: "bc",   school: "Boston College",                mascot: "Eagles",         city: "Chestnut Hill",  state: "MA", conference: "ACC", division: "FBS", primary: "#8A100B", accent: "#B29D6C", serif: true,  sports: ALL },
  { id: "cal",  school: "University of California, Berkeley", mascot: "Golden Bears", city: "Berkeley",   state: "CA", conference: "ACC", division: "FBS", primary: "#003262", accent: "#FDB515", serif: true,  sports: ALL },
  { id: "cle",  school: "Clemson University",            mascot: "Tigers",         city: "Clemson",        state: "SC", conference: "ACC", division: "FBS", primary: "#F56600", accent: "#522D80", serif: true,  sports: ALL },
  { id: "duke", school: "Duke University",               mascot: "Blue Devils",    city: "Durham",         state: "NC", conference: "ACC", division: "FBS", primary: "#00539B", accent: "#012169", serif: true,  sports: ALL },
  { id: "fsu",  school: "Florida State University",      mascot: "Seminoles",      city: "Tallahassee",    state: "FL", conference: "ACC", division: "FBS", primary: "#782F40", accent: "#CEB888", serif: true,  sports: ALL },
  { id: "gt",   school: "Georgia Tech",                  mascot: "Yellow Jackets", city: "Atlanta",        state: "GA", conference: "ACC", division: "FBS", primary: "#B3A369", accent: "#003057", serif: true,  sports: ALL },
  { id: "lou",  school: "University of Louisville",      mascot: "Cardinals",      city: "Louisville",     state: "KY", conference: "ACC", division: "FBS", primary: "#AD0000", accent: "#000000", serif: true,  sports: ALL },
  { id: "mia",  school: "University of Miami",           mascot: "Hurricanes",     city: "Coral Gables",   state: "FL", conference: "ACC", division: "FBS", primary: "#F47321", accent: "#005030", serif: false, sports: ALL },
  { id: "unc",  school: "University of North Carolina",  mascot: "Tar Heels",      city: "Chapel Hill",    state: "NC", conference: "ACC", division: "FBS", primary: "#7BAFD4", accent: "#13294B", serif: true,  sports: ALL },
  { id: "ncst", school: "North Carolina State University", mascot: "Wolfpack",     city: "Raleigh",        state: "NC", conference: "ACC", division: "FBS", primary: "#CC0000", accent: "#000000", serif: true,  sports: ALL },
  { id: "nd",   school: "University of Notre Dame",      mascot: "Fighting Irish", city: "Notre Dame",     state: "IN", conference: "ACC", division: "FBS", primary: "#0C2340", accent: "#C99700", serif: true,  sports: HOOPS }, // football is independent
  { id: "pitt", school: "University of Pittsburgh",      mascot: "Panthers",       city: "Pittsburgh",     state: "PA", conference: "ACC", division: "FBS", primary: "#003594", accent: "#FFB81C", serif: true,  sports: ALL },
  { id: "smu",  school: "Southern Methodist University", mascot: "Mustangs",       city: "Dallas",         state: "TX", conference: "ACC", division: "FBS", primary: "#0033A0", accent: "#C8102E", serif: true,  sports: ALL },
  { id: "stan", school: "Stanford University",           mascot: "Cardinal",       city: "Stanford",       state: "CA", conference: "ACC", division: "FBS", primary: "#8C1515", accent: "#4D4F53", serif: true,  sports: ALL },
  { id: "syr",  school: "Syracuse University",           mascot: "Orange",         city: "Syracuse",       state: "NY", conference: "ACC", division: "FBS", primary: "#F76900", accent: "#000E54", serif: true,  sports: ALL },
  { id: "uva",  school: "University of Virginia",        mascot: "Cavaliers",      city: "Charlottesville",state: "VA", conference: "ACC", division: "FBS", primary: "#232D4B", accent: "#F84C1E", serif: true,  sports: ALL },
  { id: "vt",   school: "Virginia Tech",                 mascot: "Hokies",         city: "Blacksburg",     state: "VA", conference: "ACC", division: "FBS", primary: "#630031", accent: "#CF4420", serif: true,  sports: ALL },
  { id: "wf",   school: "Wake Forest University",        mascot: "Demon Deacons",  city: "Winston-Salem",  state: "NC", conference: "ACC", division: "FBS", primary: "#9E7E38", accent: "#000000", serif: true,  sports: ALL },

  // ─── Big 12 ─────────────────────────────────────────────────────────────
  { id: "ariz", school: "University of Arizona",         mascot: "Wildcats",       city: "Tucson",         state: "AZ", conference: "Big 12", division: "FBS", primary: "#003366", accent: "#CC0033", serif: true,  sports: ALL },
  { id: "asu",  school: "Arizona State University",      mascot: "Sun Devils",     city: "Tempe",          state: "AZ", conference: "Big 12", division: "FBS", primary: "#8C1D40", accent: "#FFC627", serif: true,  sports: ALL },
  { id: "bay",  school: "Baylor University",             mascot: "Bears",          city: "Waco",           state: "TX", conference: "Big 12", division: "FBS", primary: "#003015", accent: "#FFB81C", serif: true,  sports: ALL },
  { id: "byu",  school: "Brigham Young University",      mascot: "Cougars",        city: "Provo",          state: "UT", conference: "Big 12", division: "FBS", primary: "#002E5D", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "cin",  school: "University of Cincinnati",      mascot: "Bearcats",       city: "Cincinnati",     state: "OH", conference: "Big 12", division: "FBS", primary: "#E00122", accent: "#000000", serif: true,  sports: ALL },
  { id: "colo", school: "University of Colorado",        mascot: "Buffaloes",      city: "Boulder",        state: "CO", conference: "Big 12", division: "FBS", primary: "#CFB87C", accent: "#000000", serif: true,  sports: ALL },
  { id: "hou",  school: "University of Houston",         mascot: "Cougars",        city: "Houston",        state: "TX", conference: "Big 12", division: "FBS", primary: "#C8102E", accent: "#B2B4B2", serif: false, sports: ALL },
  { id: "isu",  school: "Iowa State University",         mascot: "Cyclones",       city: "Ames",           state: "IA", conference: "Big 12", division: "FBS", primary: "#C8102E", accent: "#F1BE48", serif: true,  sports: ALL },
  { id: "kan",  school: "University of Kansas",          mascot: "Jayhawks",       city: "Lawrence",       state: "KS", conference: "Big 12", division: "FBS", primary: "#0051BA", accent: "#E8000D", serif: true,  sports: ALL },
  { id: "ksu",  school: "Kansas State University",       mascot: "Wildcats",       city: "Manhattan",      state: "KS", conference: "Big 12", division: "FBS", primary: "#512888", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "okst", school: "Oklahoma State University",     mascot: "Cowboys",        city: "Stillwater",     state: "OK", conference: "Big 12", division: "FBS", primary: "#FA6400", accent: "#000000", serif: true,  sports: ALL },
  { id: "tcu",  school: "Texas Christian University",    mascot: "Horned Frogs",   city: "Fort Worth",     state: "TX", conference: "Big 12", division: "FBS", primary: "#4D1979", accent: "#A3A9AC", serif: true,  sports: ALL },
  { id: "ttu",  school: "Texas Tech University",         mascot: "Red Raiders",    city: "Lubbock",        state: "TX", conference: "Big 12", division: "FBS", primary: "#CC0000", accent: "#000000", serif: true,  sports: ALL },
  { id: "ucf",  school: "University of Central Florida", mascot: "Knights",        city: "Orlando",        state: "FL", conference: "Big 12", division: "FBS", primary: "#000000", accent: "#BA9B37", serif: true,  sports: ALL },
  { id: "utah", school: "University of Utah",            mascot: "Utes",           city: "Salt Lake City", state: "UT", conference: "Big 12", division: "FBS", primary: "#CC0000", accent: "#000000", serif: true,  sports: ALL },
  { id: "wvu",  school: "West Virginia University",      mascot: "Mountaineers",   city: "Morgantown",     state: "WV", conference: "Big 12", division: "FBS", primary: "#002855", accent: "#EAAA00", serif: true,  sports: ALL },

  // ─── Pac-12 (rebuilt) ───────────────────────────────────────────────────
  { id: "orst", school: "Oregon State University",       mascot: "Beavers",        city: "Corvallis",      state: "OR", conference: "Pac-12", division: "FBS", primary: "#DC4405", accent: "#000000", serif: true,  sports: ALL },
  { id: "wsu",  school: "Washington State University",   mascot: "Cougars",        city: "Pullman",        state: "WA", conference: "Pac-12", division: "FBS", primary: "#981E32", accent: "#5E6A71", serif: true,  sports: ALL },

  // ─── American ───────────────────────────────────────────────────────────
  { id: "af",   school: "United States Air Force Academy", mascot: "Falcons",      city: "Colorado Springs", state: "CO", conference: "American", division: "FBS", primary: "#003087", accent: "#8A8D8F", serif: true,  sports: ALL },
  { id: "army", school: "United States Military Academy", mascot: "Black Knights", city: "West Point",     state: "NY", conference: "American", division: "FBS", primary: "#000000", accent: "#B29D6C", serif: true,  sports: ALL },
  { id: "char", school: "University of North Carolina Charlotte", mascot: "49ers", city: "Charlotte",      state: "NC", conference: "American", division: "FBS", primary: "#005035", accent: "#B9975B", serif: false, sports: ALL },
  { id: "ecu",  school: "East Carolina University",      mascot: "Pirates",        city: "Greenville",     state: "NC", conference: "American", division: "FBS", primary: "#592A8A", accent: "#FDC82F", serif: true,  sports: ALL },
  { id: "fau",  school: "Florida Atlantic University",   mascot: "Owls",           city: "Boca Raton",     state: "FL", conference: "American", division: "FBS", primary: "#003366", accent: "#CC0000", serif: false, sports: ALL },
  { id: "memp", school: "University of Memphis",         mascot: "Tigers",         city: "Memphis",        state: "TN", conference: "American", division: "FBS", primary: "#003087", accent: "#8E9EAB", serif: false, sports: ALL },
  { id: "nav",  school: "United States Naval Academy",   mascot: "Midshipmen",     city: "Annapolis",      state: "MD", conference: "American", division: "FBS", primary: "#00205B", accent: "#B9975B", serif: true,  sports: HOOPS },
  { id: "unt",  school: "University of North Texas",     mascot: "Mean Green",     city: "Denton",         state: "TX", conference: "American", division: "FBS", primary: "#00853E", accent: "#000000", serif: false, sports: ALL },
  { id: "rice", school: "Rice University",               mascot: "Owls",           city: "Houston",        state: "TX", conference: "American", division: "FBS", primary: "#002469", accent: "#C1C6C8", serif: true,  sports: ALL },
  { id: "usf",  school: "University of South Florida",   mascot: "Bulls",          city: "Tampa",          state: "FL", conference: "American", division: "FBS", primary: "#006747", accent: "#CFC493", serif: true,  sports: ALL },
  { id: "tem",  school: "Temple University",             mascot: "Owls",           city: "Philadelphia",   state: "PA", conference: "American", division: "FBS", primary: "#9D2235", accent: "#FFFFFF", serif: false, sports: ALL },
  { id: "tsa",  school: "University of Texas at San Antonio", mascot: "Roadrunners", city: "San Antonio",  state: "TX", conference: "American", division: "FBS", primary: "#0C2340", accent: "#F15A22", serif: false, sports: ALL },
  { id: "tul",  school: "Tulane University",             mascot: "Green Wave",     city: "New Orleans",    state: "LA", conference: "American", division: "FBS", primary: "#006747", accent: "#418FDE", serif: true,  sports: ALL },
  { id: "tulsa",school: "University of Tulsa",           mascot: "Golden Hurricane", city: "Tulsa",        state: "OK", conference: "American", division: "FBS", primary: "#002D62", accent: "#C8102E", serif: true,  sports: ALL },
  { id: "utl",  school: "University of Texas at El Paso", mascot: "Miners",        city: "El Paso",        state: "TX", conference: "American", division: "FBS", primary: "#FF8200", accent: "#041E42", serif: false, sports: ALL },

  // ─── Mountain West ──────────────────────────────────────────────────────
  { id: "boi",  school: "Boise State University",        mascot: "Broncos",        city: "Boise",          state: "ID", conference: "Mountain West", division: "FBS", primary: "#0033A0", accent: "#D64309", serif: true,  sports: ALL },
  { id: "csu",  school: "Colorado State University",     mascot: "Rams",           city: "Fort Collins",   state: "CO", conference: "Mountain West", division: "FBS", primary: "#1E4D2B", accent: "#C8C372", serif: true,  sports: ALL },
  { id: "fres", school: "Fresno State University",       mascot: "Bulldogs",       city: "Fresno",         state: "CA", conference: "Mountain West", division: "FBS", primary: "#DB0032", accent: "#002F65", serif: true,  sports: ALL },
  { id: "haw",  school: "University of Hawaii",          mascot: "Rainbow Warriors", city: "Honolulu",     state: "HI", conference: "Mountain West", division: "FBS", primary: "#024731", accent: "#C0C6C9", serif: true,  sports: ALL },
  { id: "unlv", school: "University of Nevada, Las Vegas", mascot: "Rebels",       city: "Las Vegas",      state: "NV", conference: "Mountain West", division: "FBS", primary: "#B10202", accent: "#666666", serif: false, sports: ALL },
  { id: "nev",  school: "University of Nevada, Reno",    mascot: "Wolf Pack",      city: "Reno",           state: "NV", conference: "Mountain West", division: "FBS", primary: "#003366", accent: "#807F84", serif: true,  sports: ALL },
  { id: "nmex", school: "University of New Mexico",      mascot: "Lobos",          city: "Albuquerque",    state: "NM", conference: "Mountain West", division: "FBS", primary: "#BA0C2F", accent: "#63666A", serif: true,  sports: ALL },
  { id: "sdsu", school: "San Diego State University",    mascot: "Aztecs",         city: "San Diego",      state: "CA", conference: "Mountain West", division: "FBS", primary: "#A6192E", accent: "#000000", serif: true,  sports: ALL },
  { id: "sjsu", school: "San Jose State University",     mascot: "Spartans",       city: "San Jose",       state: "CA", conference: "Mountain West", division: "FBS", primary: "#0055A2", accent: "#E5A823", serif: false, sports: ALL },
  { id: "usu",  school: "Utah State University",         mascot: "Aggies",         city: "Logan",          state: "UT", conference: "Mountain West", division: "FBS", primary: "#00263A", accent: "#8A8D8F", serif: true,  sports: ALL },
  { id: "wyo",  school: "University of Wyoming",         mascot: "Cowboys",        city: "Laramie",        state: "WY", conference: "Mountain West", division: "FBS", primary: "#492F24", accent: "#FFC425", serif: true,  sports: ALL },

  // ─── Sun Belt ───────────────────────────────────────────────────────────
  { id: "app",  school: "Appalachian State University",  mascot: "Mountaineers",   city: "Boone",          state: "NC", conference: "Sun Belt", division: "FBS", primary: "#000000", accent: "#FFCC00", serif: true,  sports: ALL },
  { id: "ark-st", school: "Arkansas State University",   mascot: "Red Wolves",     city: "Jonesboro",      state: "AR", conference: "Sun Belt", division: "FBS", primary: "#CC092F", accent: "#000000", serif: false, sports: ALL },
  { id: "coca", school: "Coastal Carolina University",   mascot: "Chanticleers",   city: "Conway",         state: "SC", conference: "Sun Belt", division: "FBS", primary: "#006F71", accent: "#A27752", serif: false, sports: ALL },
  { id: "gsu",  school: "Georgia State University",      mascot: "Panthers",       city: "Atlanta",        state: "GA", conference: "Sun Belt", division: "FBS", primary: "#0039A6", accent: "#CC092F", serif: false, sports: ALL },
  { id: "gaso", school: "Georgia Southern University",   mascot: "Eagles",         city: "Statesboro",     state: "GA", conference: "Sun Belt", division: "FBS", primary: "#001A4B", accent: "#EEB211", serif: true,  sports: ALL },
  { id: "jmu",  school: "James Madison University",      mascot: "Dukes",          city: "Harrisonburg",   state: "VA", conference: "Sun Belt", division: "FBS", primary: "#450084", accent: "#CBB677", serif: true,  sports: ALL },
  { id: "lat",  school: "Louisiana Tech University",     mascot: "Bulldogs",       city: "Ruston",         state: "LA", conference: "Sun Belt", division: "FBS", primary: "#002F8B", accent: "#E31837", serif: true,  sports: ALL },
  { id: "ull",  school: "University of Louisiana at Lafayette", mascot: "Ragin' Cajuns", city: "Lafayette", state: "LA", conference: "Sun Belt", division: "FBS", primary: "#CE181E", accent: "#000000", serif: false, sports: ALL },
  { id: "ulm",  school: "University of Louisiana at Monroe", mascot: "Warhawks",    city: "Monroe",         state: "LA", conference: "Sun Belt", division: "FBS", primary: "#800029", accent: "#FDB515", serif: false, sports: ALL },
  { id: "marsh",school: "Marshall University",           mascot: "Thundering Herd",city: "Huntington",     state: "WV", conference: "Sun Belt", division: "FBS", primary: "#00B140", accent: "#000000", serif: true,  sports: ALL },
  { id: "odu",  school: "Old Dominion University",       mascot: "Monarchs",       city: "Norfolk",        state: "VA", conference: "Sun Belt", division: "FBS", primary: "#003057", accent: "#7C878E", serif: true,  sports: ALL },
  { id: "sala", school: "University of South Alabama",   mascot: "Jaguars",        city: "Mobile",         state: "AL", conference: "Sun Belt", division: "FBS", primary: "#00205B", accent: "#BF0D3E", serif: true,  sports: ALL },
  { id: "smst", school: "Southern Miss",                 mascot: "Golden Eagles",  city: "Hattiesburg",    state: "MS", conference: "Sun Belt", division: "FBS", primary: "#FFAA3C", accent: "#000000", serif: true,  sports: ALL },
  { id: "txst", school: "Texas State University",        mascot: "Bobcats",        city: "San Marcos",     state: "TX", conference: "Sun Belt", division: "FBS", primary: "#501214", accent: "#8C8279", serif: false, sports: ALL },
  { id: "troy", school: "Troy University",               mascot: "Trojans",        city: "Troy",           state: "AL", conference: "Sun Belt", division: "FBS", primary: "#8B0000", accent: "#8A8D8F", serif: true,  sports: ALL },

  // ─── MAC ────────────────────────────────────────────────────────────────
  { id: "akr",  school: "University of Akron",           mascot: "Zips",           city: "Akron",          state: "OH", conference: "MAC", division: "FBS", primary: "#00285E", accent: "#B0AB78", serif: true,  sports: ALL },
  { id: "ball", school: "Ball State University",         mascot: "Cardinals",      city: "Muncie",         state: "IN", conference: "MAC", division: "FBS", primary: "#BA0C2F", accent: "#000000", serif: true,  sports: ALL },
  { id: "bgsu", school: "Bowling Green State University",mascot: "Falcons",        city: "Bowling Green",  state: "OH", conference: "MAC", division: "FBS", primary: "#F35B10", accent: "#4F2C1D", serif: true,  sports: ALL },
  { id: "buf",  school: "University at Buffalo",         mascot: "Bulls",          city: "Buffalo",        state: "NY", conference: "MAC", division: "FBS", primary: "#005BBB", accent: "#FFFFFF", serif: false, sports: ALL },
  { id: "cmu",  school: "Central Michigan University",   mascot: "Chippewas",      city: "Mount Pleasant", state: "MI", conference: "MAC", division: "FBS", primary: "#6A0032", accent: "#FFC82F", serif: true,  sports: ALL },
  { id: "emu",  school: "Eastern Michigan University",   mascot: "Eagles",         city: "Ypsilanti",      state: "MI", conference: "MAC", division: "FBS", primary: "#00794A", accent: "#FFFFFF", serif: true,  sports: ALL },
  { id: "kent", school: "Kent State University",         mascot: "Golden Flashes", city: "Kent",           state: "OH", conference: "MAC", division: "FBS", primary: "#002664", accent: "#EAAB00", serif: true,  sports: ALL },
  { id: "mia-oh", school: "Miami University",            mascot: "RedHawks",       city: "Oxford",         state: "OH", conference: "MAC", division: "FBS", primary: "#B61E2E", accent: "#000000", serif: true,  sports: ALL },
  { id: "niu",  school: "Northern Illinois University",  mascot: "Huskies",        city: "DeKalb",         state: "IL", conference: "MAC", division: "FBS", primary: "#CC0000", accent: "#000000", serif: true,  sports: ALL },
  { id: "ohio", school: "Ohio University",               mascot: "Bobcats",        city: "Athens",         state: "OH", conference: "MAC", division: "FBS", primary: "#00694E", accent: "#CDA077", serif: true,  sports: ALL },
  { id: "tol",  school: "University of Toledo",          mascot: "Rockets",        city: "Toledo",         state: "OH", conference: "MAC", division: "FBS", primary: "#003E7E", accent: "#FFB20F", serif: true,  sports: ALL },
  { id: "wmu",  school: "Western Michigan University",   mascot: "Broncos",        city: "Kalamazoo",      state: "MI", conference: "MAC", division: "FBS", primary: "#6C4023", accent: "#B5A167", serif: true,  sports: ALL },
  { id: "umass",school: "University of Massachusetts",   mascot: "Minutemen",      city: "Amherst",        state: "MA", conference: "MAC", division: "FBS", primary: "#881C1C", accent: "#000000", serif: true,  sports: ALL },

  // ─── C-USA ──────────────────────────────────────────────────────────────
  { id: "ccu",  school: "Cal State Bakersfield / MTSU cluster placeholder", mascot: "—", city: "—",       state: "TN", conference: "Conference USA", division: "FBS", primary: "#0066CC", accent: "#000000", serif: false, sports: ALL },
  { id: "fiu",  school: "Florida International University", mascot: "Panthers",    city: "Miami",          state: "FL", conference: "Conference USA", division: "FBS", primary: "#081E3F", accent: "#B6862C", serif: true,  sports: ALL },
  { id: "jax",  school: "Jacksonville State University", mascot: "Gamecocks",      city: "Jacksonville",   state: "AL", conference: "Conference USA", division: "FBS", primary: "#CE1126", accent: "#000000", serif: true,  sports: ALL },
  { id: "kenn", school: "Kennesaw State University",     mascot: "Owls",           city: "Kennesaw",       state: "GA", conference: "Conference USA", division: "FBS", primary: "#000000", accent: "#FDB525", serif: false, sports: ALL },
  { id: "libu", school: "Liberty University",            mascot: "Flames",         city: "Lynchburg",      state: "VA", conference: "Conference USA", division: "FBS", primary: "#0A254E", accent: "#9E1B32", serif: true,  sports: ALL },
  { id: "mtsu", school: "Middle Tennessee State University", mascot: "Blue Raiders", city: "Murfreesboro", state: "TN", conference: "Conference USA", division: "FBS", primary: "#0066CC", accent: "#000000", serif: false, sports: ALL },
  { id: "nmst", school: "New Mexico State University",   mascot: "Aggies",         city: "Las Cruces",     state: "NM", conference: "Conference USA", division: "FBS", primary: "#8C0B42", accent: "#000000", serif: true,  sports: ALL },
  { id: "sam",  school: "Sam Houston State University",  mascot: "Bearkats",       city: "Huntsville",     state: "TX", conference: "Conference USA", division: "FBS", primary: "#F26522", accent: "#231F20", serif: true,  sports: ALL },
  { id: "utep", school: "University of Texas at El Paso — CUSA duplicate", mascot: "Miners", city: "El Paso", state: "TX", conference: "Conference USA", division: "FBS", primary: "#FF8200", accent: "#041E42", serif: false, sports: ALL },
  { id: "wku",  school: "Western Kentucky University",   mascot: "Hilltoppers",    city: "Bowling Green",  state: "KY", conference: "Conference USA", division: "FBS", primary: "#C60C30", accent: "#000000", serif: true,  sports: ALL },

  // ─── FBS Independents ───────────────────────────────────────────────────
  { id: "conn", school: "University of Connecticut",     mascot: "Huskies",        city: "Storrs",         state: "CT", conference: "FBS Independent / Big East", division: "FBS", primary: "#000E2F", accent: "#E4002B", serif: true,  sports: ALL },

  // ─── Big East (basketball) ──────────────────────────────────────────────
  { id: "but",  school: "Butler University",             mascot: "Bulldogs",       city: "Indianapolis",   state: "IN", conference: "Big East", division: "D1", primary: "#13294B", accent: "#8D817B", serif: true,  sports: HOOPS },
  { id: "crei", school: "Creighton University",          mascot: "Bluejays",       city: "Omaha",          state: "NE", conference: "Big East", division: "D1", primary: "#005CA9", accent: "#FFFFFF", serif: true,  sports: HOOPS },
  { id: "depa", school: "DePaul University",             mascot: "Blue Demons",    city: "Chicago",        state: "IL", conference: "Big East", division: "D1", primary: "#0057B7", accent: "#E31837", serif: true,  sports: HOOPS },
  { id: "gtown",school: "Georgetown University",         mascot: "Hoyas",          city: "Washington",     state: "DC", conference: "Big East", division: "D1", primary: "#041E42", accent: "#8A8D8F", serif: true,  sports: HOOPS },
  { id: "marq", school: "Marquette University",          mascot: "Golden Eagles",  city: "Milwaukee",      state: "WI", conference: "Big East", division: "D1", primary: "#003366", accent: "#FFCC00", serif: true,  sports: HOOPS },
  { id: "prov", school: "Providence College",            mascot: "Friars",         city: "Providence",     state: "RI", conference: "Big East", division: "D1", primary: "#000000", accent: "#8A8D8F", serif: true,  sports: HOOPS },
  { id: "sju",  school: "St. John's University",         mascot: "Red Storm",      city: "Queens",         state: "NY", conference: "Big East", division: "D1", primary: "#BA0C2F", accent: "#FFFFFF", serif: true,  sports: HOOPS },
  { id: "seton",school: "Seton Hall University",         mascot: "Pirates",        city: "South Orange",   state: "NJ", conference: "Big East", division: "D1", primary: "#004488", accent: "#A6192E", serif: true,  sports: HOOPS },
  { id: "vill", school: "Villanova University",          mascot: "Wildcats",       city: "Villanova",      state: "PA", conference: "Big East", division: "D1", primary: "#00205B", accent: "#13B5EA", serif: true,  sports: HOOPS },
  { id: "xav",  school: "Xavier University",             mascot: "Musketeers",     city: "Cincinnati",     state: "OH", conference: "Big East", division: "D1", primary: "#0C2340", accent: "#9EA2A2", serif: true,  sports: HOOPS },

  // ─── Ivy League (basketball) ────────────────────────────────────────────
  { id: "brown", school: "Brown University",             mascot: "Bears",          city: "Providence",     state: "RI", conference: "Ivy League", division: "D1", primary: "#4E3629", accent: "#C00404", serif: true,  sports: HOOPS },
  { id: "col",   school: "Columbia University",          mascot: "Lions",          city: "New York",       state: "NY", conference: "Ivy League", division: "D1", primary: "#B9D9EB", accent: "#012169", serif: true,  sports: HOOPS },
  { id: "corn",  school: "Cornell University",           mascot: "Big Red",        city: "Ithaca",         state: "NY", conference: "Ivy League", division: "D1", primary: "#B31B1B", accent: "#FFFFFF", serif: true,  sports: HOOPS },
  { id: "dart",  school: "Dartmouth College",            mascot: "Big Green",      city: "Hanover",        state: "NH", conference: "Ivy League", division: "D1", primary: "#00693E", accent: "#FFFFFF", serif: true,  sports: HOOPS },
  { id: "harv",  school: "Harvard University",           mascot: "Crimson",        city: "Cambridge",      state: "MA", conference: "Ivy League", division: "D1", primary: "#A51C30", accent: "#000000", serif: true,  sports: HOOPS },
  { id: "penn",  school: "University of Pennsylvania",   mascot: "Quakers",        city: "Philadelphia",   state: "PA", conference: "Ivy League", division: "D1", primary: "#011F5B", accent: "#990000", serif: true,  sports: HOOPS },
  { id: "prin",  school: "Princeton University",         mascot: "Tigers",         city: "Princeton",      state: "NJ", conference: "Ivy League", division: "D1", primary: "#F58025", accent: "#000000", serif: true,  sports: HOOPS },
  { id: "yale",  school: "Yale University",              mascot: "Bulldogs",       city: "New Haven",      state: "CT", conference: "Ivy League", division: "D1", primary: "#00356B", accent: "#FFFFFF", serif: true,  sports: HOOPS },

  // ─── Atlantic 10 (selection) ────────────────────────────────────────────
  { id: "dav",  school: "Davidson College",              mascot: "Wildcats",       city: "Davidson",       state: "NC", conference: "Atlantic 10", division: "D1", primary: "#000000", accent: "#B30838", serif: true,  sports: HOOPS },
  { id: "day",  school: "University of Dayton",          mascot: "Flyers",         city: "Dayton",         state: "OH", conference: "Atlantic 10", division: "D1", primary: "#CE1141", accent: "#004B8D", serif: true,  sports: HOOPS },
  { id: "gwu",  school: "George Washington University",  mascot: "Revolutionaries",city: "Washington",     state: "DC", conference: "Atlantic 10", division: "D1", primary: "#033C5A", accent: "#A69362", serif: true,  sports: HOOPS },
  { id: "gma",  school: "George Mason University",       mascot: "Patriots",       city: "Fairfax",        state: "VA", conference: "Atlantic 10", division: "D1", primary: "#006633", accent: "#FFCC33", serif: true,  sports: HOOPS },
  { id: "loyc", school: "Loyola University Chicago",     mascot: "Ramblers",       city: "Chicago",        state: "IL", conference: "Atlantic 10", division: "D1", primary: "#7C0428", accent: "#000000", serif: true,  sports: HOOPS },
  { id: "rich", school: "University of Richmond",        mascot: "Spiders",        city: "Richmond",       state: "VA", conference: "Atlantic 10", division: "D1", primary: "#00205B", accent: "#B4A46A", serif: true,  sports: HOOPS },
  { id: "slu",  school: "Saint Louis University",        mascot: "Billikens",      city: "St. Louis",      state: "MO", conference: "Atlantic 10", division: "D1", primary: "#003DA5", accent: "#FFFFFF", serif: true,  sports: HOOPS },
  { id: "umbc", school: "University of Massachusetts, Amherst — A-10 duplicate", mascot: "Minutemen", city: "Amherst", state: "MA", conference: "Atlantic 10", division: "D1", primary: "#881C1C", accent: "#000000", serif: true, sports: HOOPS },
  { id: "vcu",  school: "Virginia Commonwealth University", mascot: "Rams",        city: "Richmond",       state: "VA", conference: "Atlantic 10", division: "D1", primary: "#000000", accent: "#F8B334", serif: true,  sports: HOOPS },

  // ─── West Coast / Mountain / Other high-visibility basketball ───────────
  { id: "gonz", school: "Gonzaga University",            mascot: "Bulldogs",       city: "Spokane",        state: "WA", conference: "West Coast", division: "D1", primary: "#041E42", accent: "#C8102E", serif: true,  sports: HOOPS },
  { id: "smc",  school: "Saint Mary's College",          mascot: "Gaels",          city: "Moraga",         state: "CA", conference: "West Coast", division: "D1", primary: "#06315B", accent: "#DA0004", serif: true,  sports: HOOPS },
  { id: "pep",  school: "Pepperdine University",         mascot: "Waves",          city: "Malibu",         state: "CA", conference: "West Coast", division: "D1", primary: "#00205B", accent: "#F58025", serif: true,  sports: HOOPS },
  { id: "sf",   school: "University of San Francisco",   mascot: "Dons",           city: "San Francisco",  state: "CA", conference: "West Coast", division: "D1", primary: "#00543C", accent: "#FDBB30", serif: true,  sports: HOOPS },
  { id: "sd",   school: "University of San Diego",       mascot: "Toreros",        city: "San Diego",      state: "CA", conference: "West Coast", division: "D1", primary: "#003B70", accent: "#75BEE9", serif: true,  sports: HOOPS },
  { id: "san",  school: "Santa Clara University",        mascot: "Broncos",        city: "Santa Clara",    state: "CA", conference: "West Coast", division: "D1", primary: "#8B2332", accent: "#B0B0B0", serif: true,  sports: HOOPS },
];

// Some rows above (e.g. "utep" duplicated for CUSA) were kept as identifiers
// only so schedule / roster fixtures didn't collide with the FBS entry. Real
// build reconciles duplicates via a canonical NCAA school ID.

export function teamsByConference(sport?: Sport) {
  const source = sport ? TEAMS.filter((t) => t.sports.includes(sport)) : TEAMS;
  const map = new Map<string, Team[]>();
  for (const t of source) {
    if (!map.has(t.conference)) map.set(t.conference, []);
    map.get(t.conference)!.push(t);
  }
  const rows = Array.from(map.entries()).map(([conference, teams]) => ({
    conference,
    teams: teams.slice().sort((a, b) => a.school.localeCompare(b.school)),
  }));
  rows.sort((a, b) => a.conference.localeCompare(b.conference));
  return rows;
}
