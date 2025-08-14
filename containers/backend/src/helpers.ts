export const generateRandomName = (): string => {
    const adjectives = [
      "admiring", "adoring", "affectionate", "agitated", "amazing", "angry",
      "awesome", "blissful", "boring", "brave", "clever", "cocky", "compassionate",
      "competent", "condescending", "confident", "cranky", "dazzling", "determined",
      "distracted", "dreamy", "eager", "ecstatic", "elastic", "elated", "elegant",
      "eloquent", "epic", "exciting", "fervent", "festive", "flamboyant", "focused",
      "friendly", "frosty", "gallant", "gifted", "goofy", "gracious", "happy",
      "hardcore", "heuristic", "hopeful", "hungry", "infallible", "inspiring",
      "jolly", "jovial", "keen", "kind", "laughing", "loving", "lucid", "mystifying",
      "modest", "naughty", "nervous", "nifty", "nostalgic", "objective", "optimistic",
      "peaceful", "pedantic", "pensive", "practical", "priceless", "quirky",
      "quizzical", "reverent", "romantic", "sad", "serene", "sharp", "silly",
      "sleepy", "stoic", "stupefied", "suspicious", "sweet", "tender", "thirsty",
      "trusting", "unruffled", "upbeat", "vibrant", "vigilant", "vigorous",
      "wizardly", "wonderful", "xenodochial", "youthful", "zealous", "zen"
    ];
  
    const nouns = [
      "albattani", "allen", "almeida", "agnesi", "archimedes", "ardinghelli",
      "aryabhata", "austin", "babbage", "banach", "banzai", "bardeen", "bartik",
      "bassi", "bell", "bhabha", "bhaskara", "blackwell", "bohr", "booth",
      "borg", "bose", "boyd", "brahmagupta", "brattain", "brown", "carson",
      "chandrasekhar", "chaplygin", "chatterjee", "chebyshev", "clarke", "colden",
      "cori", "cray", "curran", "curie", "darwin", "davinci", "dewdney", "dhawan",
      "diffie", "dijkstra", "dirac", "driscoll", "dubinsky", "easley", "einstein",
      "elbakyan", "engelbart", "euclid", "euler", "faraday", "fermat", "fermi",
      "feynman", "franklin", "galileo", "gates", "goldstine", "goldberg", "goodall",
      "hamilton", "hawking", "heisenberg", "hermann", "herschel", "hertz", "heyrovsky",
      "hodgkin", "hofstadter", "hopper", "hugle", "hypatia", "ishizaka", "jackson",
      "jang", "jemison", "jennings", "jepsen", "johnson", "joliot", "jones",
      "kalam", "kapitsa", "kare", "keller", "kepler", "khorana", "kilby", "kirch",
      "knuth", "kowalevski", "lalande", "lamarr", "lamport", "leakey", "leavitt",
      "lewin", "lichterman", "liskov", "lovelace", "lumiere", "mahavira", "mayer",
      "mccarthy", "mcclintock", "mclean", "mcnulty", "meitner", "meninsky", "mestorf",
      "minsky", "mirzakhani", "morse", "murdock", "neumann", "newton", "nightingale",
      "nobel", "noether", "northcutt", "noyce", "panini", "pare", "pasteur",
      "payne", "perlman", "pike", "poincare", "poitras", "ptolemy", "raman",
      "ramanujan", "ride", "ritchie", "roentgen", "rosalind", "rubin", "saha",
      "sammet", "sanderson", "satoshi", "shannon", "shaw", "shirley", "shockley",
      "sinoussi", "snyder", "solomon", "spence", "stallman", "stonebraker",
      "sutherland", "swanson", "swartz", "swirles", "tesla", "thompson", "torvalds",
      "turing", "varahamihira", "visvesvaraya", "volhard", "wescoff", "wilbur",
      "wiles", "williams", "williamson", "wilson", "wing", "wozniak", "wright",
      "wu", "yalow", "yonath", "zhukovsky"
    ];
  
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
  
    return `${randomAdjective}-${randomNoun}-${randomNumber}`;
  }