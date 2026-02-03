/*
export const QUESTIONS = [
  {
    fact: "In Switzerland, it is illegal to own just one <BLANK>.",
    answer: "Guinea Pig",
    category: "Laws",
    lies: ["Toothbrush", "Ski pole", "Chocolate bar", "Cuckoo clock", "Yodel book"]
  },
  {
    fact: "The national animal of Scotland is the <BLANK>.",
    answer: "Unicorn",
    category: "Animals",
    lies: ["Haggis", "Bagpipe Bird", "Loch Ness Monster", "Kilted Moose", "Drunk Squirrel"]
  },
  {
    fact: "A group of pugs is called a <BLANK>.",
    answer: "Grumble",
    category: "Animals",
    lies: ["Snortle", "Wheeze", "Pudge", "Wrinkle", "Chonk"]
  },
  {
    fact: "Before toilet paper was invented, Americans used <BLANK>.",
    answer: "Corn cobs",
    category: "History",
    lies: ["Maple leaves", "Squirrel tails", "Their neighbor's newspaper", "Freedom rags", "Revolutionary pamphlets"]
  },
  {
    fact: "The fear of vegetables is called <BLANK>.",
    answer: "Lachanophobia",
    category: "Phobias",
    lies: ["Carrotcowardice", "Broccoliterror", "Vegephobia", "Saladnausea", "Peasickness"]
  },
  {
    fact: "In 2014, a woman in Pennsylvania was arrested for shoplifting <BLANK>.",
    answer: "Horse meat",
    category: "Crime",
    lies: ["A live chicken", "27 cans of Spam", "A taxidermied raccoon", "Someone's dentures", "A mannequin arm"]
  },
  {
    fact: "Ketchup was sold in the 1830s as medicine for <BLANK>.",
    answer: "Diarrhea",
    category: "History",
    lies: ["Sadness", "Ugliness", "Bad dancing", "Potato addiction", "French accent"]
  },
  {
    fact: "The inventor of the Pringles can is now buried in a <BLANK>.",
    answer: "Pringles can",
    category: "Irony",
    lies: ["Chip bag", "Potato", "Tennis ball tube", "His own mustache", "Can of regret"]
  },
  {
    fact: "The dot over the letter 'i' is called a <BLANK>.",
    answer: "Tittle",
    category: "Language",
    lies: ["Dotsworth", "Point McGee", "Speckle", "Mini-period", "Ink pimple"]
  },
  {
    fact: "A flock of crows is known as a <BLANK>.",
    answer: "Murder",
    category: "Animals",
    lies: ["Death Committee", "Goth Convention", "Scary Situation", "Dark Gathering", "Emo Reunion"]
  },
  {
    fact: "In 1998, Sony accidentally sold 700,000 camcorders that could <BLANK>.",
    answer: "See through clothes",
    category: "Tech Oops",
    lies: ["Read minds", "Predict the future", "See ghosts", "Detect lies", "Find car keys"]
  },
  {
    fact: "Banging your <BLANK> against a wall for one hour burns 150 calories.",
    answer: "Head",
    category: "Health",
    lies: ["Butt", "Hopes and dreams", "Ex's photo", "Wallet", "Dignity"]
  },
  {
    fact: "In ancient Rome, the punishment for killing your father was being sewn into a sack with <BLANK>.",
    answer: "A dog, a rooster, a viper, and a monkey",
    category: "History",
    lies: ["Your mother-in-law", "A very disappointed chicken", "All your enemies", "A mime", "Angry bees and regret"]
  },
  {
    fact: "The shortest war in history lasted <BLANK>.",
    answer: "38 minutes",
    category: "History",
    lies: ["One sneeze", "A commercial break", "As long as my last relationship", "12 insults", "Two TikToks"]
  },
  {
    fact: "A shrimp's heart is located in its <BLANK>.",
    answer: "Head",
    category: "Animals",
    lies: ["Butt cheeks", "Tiny shrimp wallet", "Left claw", "Feelings", "Tail of shame"]
  },
  {
    fact: "The word 'gymnasium' comes from the Greek word meaning <BLANK>.",
    answer: "To exercise naked",
    category: "Language",
    lies: ["To sweat with friends", "Place of muscle worship", "Smell factory", "Temple of regret", "Pants-free zone"]
  },
  {
    fact: "In France, it's illegal to name your pig <BLANK>.",
    answer: "Napoleon",
    category: "Laws",
    lies: ["Monsieur Oink", "François", "Pierre le Pork", "Napoleon's Mother", "Your Honor"]
  },
  {
    fact: "The longest English word you can type using only the left hand on a keyboard is <BLANK>.",
    answer: "Stewardesses",
    category: "Language",
    lies: ["Lefthanded", "Qwertyuiop", "Boredom", "Sadferret", "Leftypower"]
  },
  {
    fact: "Sea otters hold hands while sleeping so they don't <BLANK>.",
    answer: "Drift apart",
    category: "Animals",
    lies: ["Get divorced", "Forget each other", "Float to France", "Have nightmares", "Get stolen by seagulls"]
  },
  {
    fact: "In Japan, letting a sumo wrestler make your baby cry is considered <BLANK>.",
    answer: "Good luck",
    category: "Culture",
    lies: ["Excellent parenting", "A fun Tuesday", "Character building", "Free babysitting", "Baby bootcamp"]
  },
  {
    fact: "The world's oldest known recipe is for <BLANK>.",
    answer: "Beer",
    category: "History",
    lies: ["Sadness soup", "Hangover cure", "Divorce stew", "Regret pudding", "Ancient ramen"]
  },
  {
    fact: "Cows have <BLANK>.",
    answer: "Best friends",
    category: "Animals",
    lies: ["Secret societies", "Facebook accounts", "Existential dread", "Group chats", "Therapy sessions"]
  },
  {
    fact: "The original name for the search engine Google was <BLANK>.",
    answer: "BackRub",
    category: "Tech Oops",
    lies: ["FindStuff", "YahooKiller", "PageStalker", "WebCreeper", "InfoPervert"]
  },
  {
    fact: "Astronauts' <BLANK> fall off in space.",
    answer: "Toenails",
    category: "Science",
    lies: ["Dignity", "Earthly concerns", "Hair gel", "Sense of direction", "Will to live"]
  },
  {
    fact: "The Bible is the most shoplifted <BLANK> in America.",
    answer: "Book",
    category: "Crime",
    lies: ["Source of irony", "Cry for help", "Religious experience", "Path to hell", "Confession waiting to happen"]
  },
  {
    fact: "Male bees die after <BLANK>.",
    answer: "Mating",
    category: "Animals",
    lies: ["Winning an argument", "One good day", "The best moment of their life", "Telling the truth", "Seeing their credit score"]
  },
  {
    fact: "A jiffy is an actual unit of time equal to <BLANK>.",
    answer: "1/100th of a second",
    category: "Science",
    lies: ["How long my patience lasts", "A microwave minute", "Time between texts", "Mom's 'one minute'", "Customer service hold time"]
  },
  {
    fact: "The plastic tips on shoelaces are called <BLANK>.",
    answer: "Aglets",
    category: "Language",
    lies: ["Lacenipples", "Stringcaps", "Tieprotectors", "Shoebullets", "Cordcondoms"]
  },
  {
    fact: "In ancient Egypt, servants were smeared with honey to <BLANK>.",
    answer: "Attract flies away from the pharaoh",
    category: "History",
    lies: ["Smell delicious while dying", "Become human fly paper", "Get really sticky promotions", "Test new fragrances", "Punish bad dance moves"]
  },
  {
    fact: "The average person spends six months of their life waiting for <BLANK>.",
    answer: "Red lights",
    category: "Health",
    lies: ["Their life to start", "Someone to text back", "The weekend", "Motivation", "Love, apparently"]
  },
  {
    fact: "Hippo milk is <BLANK>.",
    answer: "Pink",
    category: "Animals",
    lies: ["Strawberry flavored", "Deadly", "Worth more than gold", "Instagram famous", "Surprisingly minty"]
  },
  {
    fact: "The hashtag symbol is technically called an <BLANK>.",
    answer: "Octothorpe",
    category: "Language",
    lies: ["Hashbrown", "Poundsign McHashface", "Numbercross", "Tictactoe", "Gridsquare"]
  },
  {
    fact: "In 2016, a man in Florida was arrested for assaulting his roommate with <BLANK>.",
    answer: "A pizza",
    category: "Crime",
    lies: ["Passive aggression", "A pool noodle", "Motivational quotes", "Unsolicited advice", "His mixtape"]
  },
  {
    fact: "The first person convicted of speeding was going <BLANK>.",
    answer: "8 mph",
    category: "History",
    lies: ["Fast enough to feel alive", "Faster than a galloping horse", "3 miles per hour", "The speed of rebellion", "Walking pace but angrier"]
  },
  {
    fact: "Bananas are <BLANK>.",
    answer: "Berries, but strawberries aren't",
    category: "Science",
    lies: ["Lying to us", "Actually yellow lies", "Secretly vegetables", "Evolutionary mistakes", "Curved propaganda"]
  },
  {
    fact: "The fear of long words is called <BLANK>.",
    answer: "Hippopotomonstrosesquippedaliophobia",
    category: "Phobias",
    lies: ["Bigwordscaryosis", "Dictionarydread", "Vocabularyterror", "Irony", "What I have now"]
  },
  {
    fact: "In 2007, a man in England legally changed his name to <BLANK>.",
    answer: "Captain Fantastic Faster Than Superman Spiderman Batman Wolverine The Hulk And The Flash Combined",
    category: "Irony",
    lies: ["Lord of Unemployment", "Sir Regrets-a-lot", "Duke of Bad Decisions", "King of Commitment Issues", "Prince of My Mom's Basement"]
  },
  {
    fact: "The voice of Mickey Mouse and the voice of Minnie Mouse got <BLANK> in real life.",
    answer: "Married",
    category: "Irony",
    lies: ["Divorced three times", "Restraining orders", "Into a fistfight", "Really weird at parties", "Therapy together"]
  },
  {
    fact: "The cigarette lighter was invented before <BLANK>.",
    answer: "Matches",
    category: "History",
    lies: ["Common sense", "Lung cancer awareness", "The match industry's lawyers", "Anyone asked why", "Second thoughts"]
  },
  {
    fact: "A group of flamingos is called a <BLANK>.",
    answer: "Flamboyance",
    category: "Animals",
    lies: ["Pink Party", "Fabulous Formation", "Sass Squad", "Pretty in Pink", "Shrimp Convention"]
  },
  {
    fact: "The average American will eat about <BLANK> in their lifetime.",
    answer: "35,000 cookies",
    category: "Health",
    lies: ["Their weight in regret", "12 accidents", "Their feelings", "Their words eventually", "One whole farm"]
  },
  {
    fact: "The loudest sound ever recorded was the eruption of Krakatoa, which could be heard <BLANK> away.",
    answer: "3,000 miles",
    category: "Science",
    lies: ["In space", "By your mom", "In my nightmares", "On the moon", "By deaf people"]
  },
  {
    fact: "Cows can walk <BLANK> but not down.",
    answer: "Upstairs",
    category: "Animals",
    lies: ["Into my heart", "Away from responsibility", "To the unemployment office", "Towards their dreams", "Into therapy"]
  },
  {
    fact: "The first email was sent in <BLANK>.",
    answer: "1971",
    category: "Tech Oops",
    lies: ["All caps", "Comic Sans", "By accident to everyone", "With 47 typos", "To the wrong person"]
  },
  {
    fact: "Crayola means <BLANK> in French.",
    answer: "Oily chalk",
    category: "Language",
    lies: ["Childhood stains", "Waxy regret", "Parent's nightmare", "Wall destroyer", "Laundry enemy"]
  },
  {
    fact: "The world's largest snowflake on record was <BLANK> inches wide.",
    answer: "15",
    category: "Science",
    lies: ["The size of my lies", "Your ego", "My anxiety", "Unreasonably large", "Showing off"]
  },
  {
    fact: "Butterflies taste with their <BLANK>.",
    answer: "Feet",
    category: "Animals",
    lies: ["Regrets", "Tiny tongues", "Wings of shame", "Emotional baggage", "Butter sensors"]
  },
  {
    fact: "In 2013, a Belgian man was <BLANK> for three years before anyone noticed.",
    answer: "Legally dead",
    category: "Irony",
    lies: ["Living in IKEA", "Not paying taxes", "His wife's boss", "Faking an accent", "Someone else"]
  },
  {
    fact: "The blob of toothpaste on a toothbrush is called a <BLANK>.",
    answer: "Nurdle",
    category: "Language",
    lies: ["Brushworm", "Pasteblob", "Mintsnake", "Toothpoop", "Dentist's dollop"]
  },
  {
    fact: "A group of frogs is called a <BLANK>.",
    answer: "Army",
    category: "Animals",
    lies: ["Jumpfest", "Ribbiting Convention", "Croak Chorus", "Pond Party", "Slimy Squad"]
  },
  {
    fact: "In colonial America, people used to <BLANK> to pay their taxes.",
    answer: "Donate animal pelts",
    category: "History",
    lies: ["Sacrifice their dignity", "Trade their mother-in-law", "Offer livestock sacrifices", "Dance for the taxman", "Give away their hair"]
  },
  {
    fact: "Polar bears are nearly undetectable by <BLANK>.",
    answer: "Infrared cameras",
    category: "Animals",
    lies: ["Their therapists", "Seal witnesses", "Credit card companies", "Their exes", "Airport security"]
  },
  {
    fact: "The first product to have a barcode was <BLANK>.",
    answer: "Wrigley's gum",
    category: "History",
    lies: ["Regret in a can", "Canned depression", "Frozen TV dinners", "Someone's patience", "Cigarettes"]
  },
  {
    fact: "A bolt of lightning contains enough energy to toast <BLANK> slices of bread.",
    answer: "100,000",
    category: "Science",
    lies: ["Your entire life's worth", "Every regret you have", "All of France", "Your patience", "The whole neighborhood"]
  },
  {
    fact: "Cleopatra lived closer in time to <BLANK> than to the building of the pyramids.",
    answer: "The moon landing",
    category: "History",
    lies: ["Pizza Hut's invention", "Your birth", "Taco Bell's founding", "The iPhone", "Snapchat filters"]
  },
  {
    fact: "Octopuses have <BLANK> hearts.",
    answer: "Three",
    category: "Animals",
    lies: ["Too many feelings", "Commitment issues", "Eight tiny heartbreaks", "Better love lives than me", "No concept of monogamy"]
  },
  {
    fact: "The 'M's' in M&Ms stand for <BLANK>.",
    answer: "Mars and Murrie",
    category: "History",
    lies: ["Mistakes and More Mistakes", "Melt and Mouth", "Memories and Misery", "Chocolate and More Chocolate", "Money Money"]
  },
  {
    fact: "There is a basketball court on <BLANK> of the U.S. Supreme Court building.",
    answer: "The top floor",
    category: "Laws",
    lies: ["The roof where they settle disagreements", "Justice Ginsburg's basement", "The parking lot of broken dreams", "The crying room", "The timeout corner"]
  },
  {
    fact: "Honeybees can recognize <BLANK>.",
    answer: "Human faces",
    category: "Animals",
    lies: ["Their mistakes", "A bad attitude", "When you're allergic", "Fake honey", "Fear in your eyes"]
  },
  {
    fact: "The fear of being watched by a duck is called <BLANK>.",
    answer: "Anatidaephobia",
    category: "Phobias",
    lies: ["Quackophobia", "Duckstalkia", "Ponddread", "Billterror", "What I have now"]
  },
  {
    fact: "T-shirts are called that because they're shaped like the letter <BLANK>.",
    answer: "T",
    category: "Language",
    lies: ["Freedom", "Comfort", "Your body's disappointment", "Regret", "Tuesday"]
  },
  {
    fact: "The word 'karaoke' means <BLANK> in Japanese.",
    answer: "Empty orchestra",
    category: "Language",
    lies: ["Drunk confidence", "Public humiliation", "Tone-deaf dreams", "Alcohol required", "Friendship destroyer"]
  },
  {
    fact: "In the original Sleeping Beauty, the prince <BLANK> instead of kissing her.",
    answer: "Gets her pregnant",
    category: "History",
    lies: ["Robs her", "Steals her shoes", "Takes a selfie", "Ghosts her", "Swipes left"]
  },
  {
    fact: "A company in Japan has created a <BLANK> you can hire to impersonate your friend.",
    answer: "Human",
    category: "Culture",
    lies: ["Robot that judges you less", "Person who likes you", "Friend who shows up", "Companion who laughs at your jokes", "Someone who texts back"]
  },
  {
    fact: "McDonald's once created bubblegum-flavored <BLANK>.",
    answer: "Broccoli",
    category: "Tech Oops",
    lies: ["Fries", "Nightmares", "Shame", "Therapy sessions", "Regret"]
  },
  {
    fact: "In 1386, a pig in France was executed by public hanging for <BLANK>.",
    answer: "Murdering a child",
    category: "Crime",
    lies: ["Being delicious", "Tax evasion", "Treason", "Insulting the king", "Improper oinking"]
  },
  {
    fact: "Armadillos almost always give birth to <BLANK>.",
    answer: "Identical quadruplets",
    category: "Animals",
    lies: ["Tiny tanks", "Armored regrets", "Rolling mistakes", "Baby armored cars", "Four disappointments at once"]
  },
  {
    fact: "The scientific term for brain freeze is <BLANK>.",
    answer: "Sphenopalatine ganglioneuralgia",
    category: "Science",
    lies: ["Coldheadowies", "Frozenskullitis", "Icecreamcursing", "Brainfreezification", "Why I screamed"]
  },
  {
    fact: "A group of owls is called a <BLANK>.",
    answer: "Parliament",
    category: "Animals",
    lies: ["Hoot Troop", "Wise Council", "Night Shift", "Who Crew", "Insomnia Support Group"]
  },
  {
    fact: "The unicorn is the official animal of <BLANK>.",
    answer: "Scotland",
    category: "Culture",
    lies: ["My imagination", "Disappointment Island", "Mythical Montana", "Rainbow Road", "Lisa Frank's basement"]
  },
  {
    fact: "Your stomach produces a new layer of mucus every two weeks or it would <BLANK>.",
    answer: "Digest itself",
    category: "Science",
    lies: ["Eat your feelings", "Quit on you", "Have an identity crisis", "Demand a raise", "File a complaint"]
  },
  {
    fact: "Nintendo was founded in <BLANK>.",
    answer: "1889",
    category: "History",
    lies: ["The future", "Your dad's basement", "A fever dream", "The 90s actually", "Last week"]
  },
  {
    fact: "The King of Hearts is the only king in a deck of cards without a <BLANK>.",
    answer: "Mustache",
    category: "Irony",
    lies: ["Spine", "Dating profile", "Therapist", "Soul", "Personality"]
  },
  {
    fact: "France was still executing people by guillotine when <BLANK> came out.",
    answer: "Star Wars",
    category: "History",
    lies: ["Harry Potter", "Pokémon", "The iPhone", "SpongeBob", "Fortnite"]
  },
  {
    fact: "The average person walks the equivalent of <BLANK> times around the world in a lifetime.",
    answer: "Five",
    category: "Health",
    lies: ["To the fridge and back", "Away from their problems", "Nowhere important", "In circles mostly", "Around their potential"]
  },
  {
    fact: "Turkeys can <BLANK>.",
    answer: "Blush",
    category: "Animals",
    lies: ["Feel shame", "Judge you", "Recognize Thanksgiving", "See their future", "Experience regret"]
  },
  {
    fact: "The entire world's population could fit inside <BLANK>.",
    answer: "Los Angeles",
    category: "Science",
    lies: ["Your mom's purse", "A Costco", "My anxiety", "Your ego", "One IKEA"]
  },
  {
    fact: "Peanuts are one of the ingredients in <BLANK>.",
    answer: "Dynamite",
    category: "Science",
    lies: ["Sadness", "Airplane fuel", "Divorce papers", "Regret bombs", "Childhood allergies"]
  },
  {
    fact: "The first oranges weren't <BLANK>.",
    answer: "Orange",
    category: "History",
    lies: ["Actually fruit", "From Florida", "Called oranges", "Trusted", "Confident in themselves"]
  },
  {
    fact: "A day on Venus is longer than <BLANK>.",
    answer: "A year on Venus",
    category: "Science",
    lies: ["Your last relationship", "My patience", "A CVS receipt", "Monday", "Waiting for the microwave"]
  },
  {
    fact: "Honey never <BLANK>.",
    answer: "Spoils",
    category: "Science",
    lies: ["Apologizes", "Tells the truth", "Gives up", "Graduates college", "Gets a real job"]
  },
  {
    fact: "In 2015, a man in Australia tried to sell <BLANK> on eBay.",
    answer: "New Zealand",
    category: "Crime",
    lies: ["His wife", "His dignity", "The ocean", "His neighbor's wifi password", "His responsibilities"]
  },
  {
    fact: "A mantis shrimp can punch with the force of <BLANK>.",
    answer: "A .22 caliber bullet",
    category: "Animals",
    lies: ["Regret", "My mom when I lied", "Unrequited love", "Monday morning", "Your last breakup"]
  },
  {
    fact: "The first computer mouse was made of <BLANK>.",
    answer: "Wood",
    category: "Tech Oops",
    lies: ["Cheese", "Actual mouse parts", "Regret and splinters", "Stone and hope", "Dreams and duct tape"]
  },
  {
    fact: "Sloths can hold their breath longer than <BLANK>.",
    answer: "Dolphins",
    category: "Animals",
    lies: ["Me during awkward silence", "Your excuse", "My motivation", "A toddler's tantrum", "An underwater apology"]
  },
  {
    fact: "In Switzerland, it's illegal to <BLANK> after 10 PM.",
    answer: "Flush the toilet",
    category: "Laws",
    lies: ["Yodel", "Be fun", "Make cheese", "Speak German", "Exist loudly"]
  },
  {
    fact: "The wood frog can <BLANK> and still survive.",
    answer: "Freeze solid",
    category: "Animals",
    lies: ["Give up completely", "Hate itself", "Question everything", "Lose all hope", "Be me in winter"]
  },
  {
    fact: "An avocado is a <BLANK>.",
    answer: "Berry",
    category: "Science",
    lies: ["Lie", "Disappointment", "Luxury item", "Millennial's retirement plan", "Overpriced dream"]
  },
  {
    fact: "Sweden has <BLANK> for litterbugs.",
    answer: "A hotline you can call on people",
    category: "Laws",
    lies: ["Public shaming ceremonies", "Mandatory therapy", "Trash jail", "Litter court", "Garbage guilt trips"]
  },
  {
    fact: "The inventor of the microwave only received <BLANK> for his discovery.",
    answer: "$2",
    category: "Irony",
    lies: ["A frozen dinner", "Radiation poisoning", "A pat on the back", "Third-degree burns", "My sympathy"]
  },
  {
    fact: "Dolphins have <BLANK> for each other.",
    answer: "Names",
    category: "Animals",
    lies: ["Group chats", "Inside jokes", "Therapy sessions", "Gossip circles", "Better social lives than me"]
  },
  {
    fact: "The longest wedding veil was longer than <BLANK>.",
    answer: "63 football fields",
    category: "Irony",
    lies: ["The marriage", "Her patience", "My attention span", "His commitment", "Their bank account"]
  },
  {
    fact: "The average pencil can draw a line that's <BLANK> long.",
    answer: "35 miles",
    category: "Science",
    lies: ["Longer than my to-do list", "To the moon with disappointment", "As long as my regrets", "To infinity and boredom", "Nowhere productive"]
  },
  {
    fact: "Cats can't taste <BLANK>.",
    answer: "Sweetness",
    category: "Animals",
    lies: ["Your love", "Joy", "Gratitude", "Your disappointment in them", "Emotions at all"]
  },
  {
    fact: "A sneeze travels out of your mouth at over <BLANK>.",
    answer: "100 mph",
    category: "Health",
    lies: ["The speed of regret", "Lightspeed embarrassment", "Sonic shame velocity", "Awkward conversation pace", "Fast enough to ruin the moment"]
  },
  {
    fact: "In ancient Rome, women would wear <BLANK> to improve their complexion.",
    answer: "Crocodile dung",
    category: "History",
    lies: ["Their enemies' tears", "Crushed pearls and regret", "Gladiator sweat", "Caesar's bath water", "Ground-up senators"]
  },
  {
    fact: "Koala fingerprints are so similar to humans that they've <BLANK>.",
    answer: "Confused crime scene investigators",
    category: "Animals",
    lies: ["Been arrested", "Stolen identities", "Applied for jobs", "Opened bank accounts", "Committed fraud"]
  },
  {
    fact: "The average cloud weighs about <BLANK>.",
    answer: "1.1 million pounds",
    category: "Science",
    lies: ["Your expectations", "My problems", "All of your baggage", "Less than it looks", "More than your lies"]
  },
  {
    fact: "In 2009, a man in England was banned from his local pub for <BLANK>.",
    answer: "Doing magic tricks",
    category: "Crime",
    lies: ["Being too honest", "Not drinking enough", "Making friends", "Being fun", "Having joy"]
  },
  {
    fact: "A group of porcupines is called a <BLANK>.",
    answer: "Prickle",
    category: "Animals",
    lies: ["Ouch Convention", "Pointy Party", "Spike Squad", "Sharp Gathering", "Regret Huddle"]
  },
  {
    fact: "The first alarm clock could only ring at <BLANK>.",
    answer: "4 AM",
    category: "Tech Oops",
    lies: ["The worst possible time", "When you're finally asleep", "Regret o'clock", "Hell's hour", "Satan's wake-up call"]
  },
  {
    fact: "Humans share 50% of their DNA with <BLANK>.",
    answer: "Bananas",
    category: "Science",
    lies: ["Their exes apparently", "Disappointment", "Bad decisions", "That weird uncle", "Regret"]
  },
  {
    fact: "Pirates wore eye patches to <BLANK>.",
    answer: "Keep one eye adjusted to darkness below deck",
    category: "History",
    lies: ["Look cool", "Hide their shame", "Avoid eye contact", "See their mistakes coming", "Pretend they didn't see that"]
  },
  {
    fact: "The longest hiccuping spell lasted <BLANK>.",
    answer: "68 years",
    category: "Health",
    lies: ["Longer than my last relationship", "My entire childhood", "One really awkward dinner", "As long as my student loans", "Forever in hell"]
  },
  {
    fact: "A group of rhinos is called a <BLANK>.",
    answer: "Crash",
    category: "Animals",
    lies: ["Destruction Derby", "Wreck Crew", "Horn Squad", "Tank Division", "My family reunion"]
  },
  {
    fact: "The average person will spend <BLANK> on their phone in their lifetime.",
    answer: "Five years",
    category: "Health",
    lies: ["All their meaningful moments", "Too long avoiding people", "Their entire youth", "More time than with loved ones", "Every waking regret"]
  },
  {
    fact: "The dot over a lowercase 'j' is called a <BLANK>.",
    answer: "Jot",
    category: "Language",
    lies: ["J-spot", "Dot McGee Jr.", "Junior tittle", "J-pimple", "Letter nipple"]
  },
  {
    fact: "In Denmark, if you're unmarried at 25, you get <BLANK>.",
    answer: "Covered in cinnamon",
    category: "Culture",
    lies: ["Publicly shamed", "A sad ceremony", "Judgment from relatives", "A pity party", "Denmark's sympathy spice"]
  },
  {
    fact: "Cucumbers are <BLANK>.",
    answer: "96% water",
    category: "Science",
    lies: ["Basically lies", "Crunchy disappointment", "Water's midlife crisis", "Salad filler", "Vegetable impostors"]
  },
  {
    fact: "Sharks have been around longer than <BLANK>.",
    answer: "Trees",
    category: "Animals",
    lies: ["Your excuses", "My mistakes", "Regret", "Bad decisions", "Everything you love"]
  },
  {
    fact: "The world's quietest room will drive you crazy in <BLANK>.",
    answer: "45 minutes",
    category: "Science",
    lies: ["Less time than family dinner", "Faster than a first date", "About as long as small talk", "Quicker than waiting in line", "One awkward silence"]
  },
  {
    fact: "A blue whale's heart is the size of <BLANK>.",
    answer: "A small car",
    category: "Animals",
    lies: ["Your ego", "My problems", "All your feelings", "Your overthinking brain", "A Volkswagen Regret"]
  },
  {
    fact: "In Victorian England, people took photos of <BLANK>.",
    answer: "Dead family members posed as alive",
    category: "History",
    lies: ["Their worst angles", "Their regrets", "Their disappointments", "Things that haunt me now", "Nightmares basically"]
  },
  {
    fact: "The fear of clowns is called <BLANK>.",
    answer: "Coulrophobia",
    category: "Phobias",
    lies: ["Common sense", "Wisdom", "Being smart", "Survival instinct", "Clownterror"]
  },
  {
    fact: "Dolphins sleep with <BLANK> open.",
    answer: "One eye",
    category: "Animals",
    lies: ["Trust issues", "One eye on their enemies", "Paranoia", "Better judgment than me", "Constant vigilance"]
  },
  {
    fact: "In 1999, the CEO of a company legally changed his name to <BLANK> as a publicity stunt.",
    answer: "Dot Com",
    category: "Irony",
    lies: ["Unemployed Soon", "Bad Decision Bob", "Regret McGee", "Publicity Stunt Steve", "Bankrupt Tomorrow"]
  },
  {
    fact: "The word 'robot' comes from a Czech word meaning <BLANK>.",
    answer: "Forced labor",
    category: "Language",
    lies: ["Metal slave", "Future overlord", "Mechanical regret", "Job stealer", "My replacement"]
  },
  {
    fact: "Snails can sleep for <BLANK>.",
    answer: "Three years",
    category: "Animals",
    lies: ["Longer than my motivation lasts", "My entire college experience", "Through all your problems", "The whole pandemic basically", "Until things get better"]
  },
  {
    fact: "The world's most expensive coffee is made from <BLANK>.",
    answer: "Animal poop",
    category: "Culture",
    lies: ["Rich people's tears", "Crushed dreams", "Liquid gold", "Your rent money", "Regret beans"]
  },
  {
    fact: "Before the invention of alarm clocks, people hired <BLANK> to wake them up.",
    answer: "Someone to shoot peas at their window",
    category: "History",
    lies: ["A personal yeller", "A professional annoyer", "A morning terror specialist", "Someone to throw regret", "A wake-up assaulter"]
  },
  {
    fact: "Venus is the only planet that rotates <BLANK>.",
    answer: "Clockwise",
    category: "Science",
    lies: ["With attitude", "The wrong way", "In regret", "Backwards like my life", "Against the grain"]
  },
  {
    fact: "It rains diamonds on <BLANK>.",
    answer: "Jupiter and Saturn",
    category: "Science",
    lies: ["My worst enemy apparently", "Rich people", "Places I'll never go", "Everyone but me", "The universe's favorite"]
  },
  {
    fact: "The majority of your brain is <BLANK>.",
    answer: "Fat",
    category: "Science",
    lies: ["Unused", "Overthinking", "Bad decisions", "Regret", "Wasted potential"]
  },
  {
    fact: "In 1958, a pilot accidentally ejected himself from his plane while flying and <BLANK>.",
    answer: "Crashed into his own aircraft",
    category: "Irony",
    lies: ["Sued himself", "Had an identity crisis", "Questioned everything", "Experienced ultimate regret", "Became a cautionary tale"]
  },
  {
    fact: "A shrimp can lay up to <BLANK> eggs at once.",
    answer: "One million",
    category: "Animals",
    lies: ["More than my problems", "Too many responsibilities", "An overwhelming amount", "Enough to retire on", "My entire anxiety manifested"]
  },
  {
    fact: "Queen Elizabeth II was a trained <BLANK> during World War II.",
    answer: "Mechanic and military truck driver",
    category: "History",
    lies: ["Assassin", "Spy", "Fighter pilot", "Code breaker", "Secret agent"]
  },
  {
    fact: "The human nose can detect over <BLANK> different scents.",
    answer: "One trillion",
    category: "Science",
    lies: ["Every regret I have", "All of my bad decisions", "Your lies specifically", "Everyone's disappointment", "The smell of failure"]
  },
  {
    fact: "A strawberry isn't a berry but a <BLANK> is.",
    answer: "Watermelon",
    category: "Science",
    lies: ["Lie apparently", "Tomato pretending", "Confusion", "Scientific gaslighting", "Botanical betrayal"]
  },
  {
    fact: "Male seahorses <BLANK> instead of females.",
    answer: "Get pregnant and give birth",
    category: "Animals",
    lies: ["Do all the complaining", "Experience true equality", "Know real pain", "Understand suffering", "Finally get it"]
  },
  {
    fact: "The Eiffel Tower can grow more than <BLANK> taller in summer.",
    answer: "Six inches",
    category: "Science",
    lies: ["My patience", "Your lies", "My expectations", "The disappointment", "Your ego"]
  },
  {
    fact: "A group of jellyfish is called a <BLANK>.",
    answer: "Smack",
    category: "Animals",
    lies: ["Sting Operation", "Jelly Gang", "Blob Squad", "Wobbly Convention", "Transparent Regret"]
  },
  {
    fact: "Apples are more effective at <BLANK> than coffee.",
    answer: "Waking you up in the morning",
    category: "Science",
    lies: ["Lying to you", "Causing regret", "Disappointing you", "Keeping doctors away", "Breaking promises"]
  },
  {
    fact: "In Iceland, there's no McDonald's because <BLANK>.",
    answer: "It's too expensive to import the ingredients",
    category: "Culture",
    lies: ["They have dignity", "They value themselves", "They made better choices", "They have taste", "They escaped"]
  },
  {
    fact: "The heart of a shrimp is located in its <BLANK>.",
    answer: "Head",
    category: "Animals",
    lies: ["Tiny feelings", "Non-existent soul", "Shell of regret", "Broken dreams", "Place of disappointment"]
  },
  {
    fact: "In 2006, a woman successfully sued <BLANK> for $2.9 million.",
    answer: "Universal Studios for a haunted house being too scary",
    category: "Crime",
    lies: ["Fear itself", "Her own nightmares", "Halloween", "Being frightened", "The concept of terror"]
  },
  {
    fact: "In 1386, a pig in Falaise, France was dressed in a jacket and <BLANK> before being publicly hanged for killing a child.",
    answer: "human trousers",
    category: "History",
    lies: ["royal robes", "silk stockings", "leather boots", "metal armor", "velvet pants"]
  },
  {
    fact: "Napoleon Bonaparte wrote a romantic novella titled <BLANK> when he was 26 years old.",
    answer: "Clisson et Eugenie",
    category: "Literature",
    lies: ["The Corsican Romance", "Josephine's Secret Love", "The Young General", "Hearts in Paris", "A Soldier's Dream"]
  },
  {
    fact: "Roman Emperor Caligula wanted to appoint his favorite horse <BLANK> to the Senate.",
    answer: "Incitatus as consul",
    category: "History",
    lies: ["Incitatus as governor", "Neptune as general", "Centaurus as tribune", "Equus as magistrate", "Bucephalus as senator"]
  },
  {
    fact: "In 1474, a rooster in Basel was executed by burning because it allegedly committed <BLANK>.",
    answer: "the crime of egg laying",
    category: "History",
    lies: ["witchcraft and sorcery", "blasphemy and heresy", "treason against the state", "murder of a person", "theft from the church"]
  },
  {
    fact: "Medieval courts appointed official <BLANK> to defend rats accused of eating grain.",
    answer: "Attorneys for the Defence",
    category: "History",
    lies: ["Royal Counselors of Rodents", "Lawyers for Vermin Defense", "Justices of Pest Cases", "Advocates for the Accused", "Defenders of Creatures"]
  },
  {
    fact: "In 1479, the town of Autun appointed <BLANK> to represent a group of rats in court.",
    answer: "Attorneys for the Rats",
    category: "History",
    lies: ["Justices of the Pests", "Counselors for Vermin", "Defenders of Rodents", "Advocates of Creatures", "Lawyers for the Accused"]
  },
  {
    fact: "Pope Gregory IX ordered the execution of all <BLANK> because he believed they were agents of Satan.",
    answer: "cats in Europe",
    category: "History",
    lies: ["dogs in cities", "rabbits in forests", "owls at night", "rats in fields", "mice in homes"]
  },
  {
    fact: "In 1518, hundreds of people in Strasbourg danced uncontrollably for days, suffering from what is now called <BLANK>.",
    answer: "the dancing plague",
    category: "History",
    lies: ["the fever syndrome", "the madness sickness", "the movement disease", "the convulsion curse", "the writhing affliction"]
  },
  {
    fact: "The shortest war in history was between the United Kingdom and Zanzibar, lasting only <BLANK>.",
    answer: "38 to 45 minutes",
    category: "History",
    lies: ["2 hours and 30 minutes", "1 day exactly", "12 minutes flat", "an hour and a half", "6 hours in total"]
  },
  {
    fact: "Before becoming Pope Pius II, Aeneas Sylvius Piccolomini wrote a bestselling <BLANK>.",
    answer: "erotic novel",
    category: "Literature",
    lies: ["romantic comedy", "tragic love story", "historical epic", "religious treatise", "philosophical discourse"]
  },
  {
    fact: "Caligula ordered his soldiers to attack <BLANK> because he declared war against the sea god.",
    answer: "the waves directly",
    category: "History",
    lies: ["enemy ships offshore", "hostile Greek forces", "barbarian invaders", "rebel provinces", "rival military fleets"]
  },
  {
    fact: "In 1385, a peasant in France was forced to watch his donkey being executed after he allegedly <BLANK> with it.",
    answer: "committed a sexual crime",
    category: "History",
    lies: ["stole royal property", "insulted a nobleman", "refused to pay taxes", "betrayed the state", "harbored fugitives"]
  },
  {
    fact: "Socrates was so concerned about writing that he worried the written word would cause <BLANK>.",
    answer: "forgetfulness in souls",
    category: "Philosophy",
    lies: ["ignorance in minds", "laziness in students", "weakness in hearts", "corruption in society", "decay of wisdom"]
  },
  {
    fact: "In 1929, two Princeton scientists attempted to transform a living cat into <BLANK>.",
    answer: "a working telephone",
    category: "Science",
    lies: ["a radio receiver", "a sound recorder", "an electrical device", "a communication tool", "a listening apparatus"]
  },
  {
    fact: "Thomas Sullivan accidentally invented the tea bag in 1904 when he shipped tea samples in <BLANK>.",
    answer: "small silk pouches",
    category: "Food",
    lies: ["tiny wax containers", "miniature paper bags", "delicate cloth wrappings", "thin leaf envelopes", "rolled parchment"]
  },
  {
    fact: "During the Renaissance, sailors returning from the New World brought <BLANK> to Europe, causing a massive outbreak.",
    answer: "syphilis to Italy",
    category: "History",
    lies: ["the plague to Spain", "cholera to Portugal", "malaria to France", "typhus to Rome", "yellow fever broadly"]
  },
  {
    fact: "King Henry VIII employed four men titled <BLANK> whose sole job was to attend to his personal hygiene.",
    answer: "Grooms of the Stool",
    category: "History",
    lies: ["Keepers of the Privy", "Attendants of Necessity", "Masters of Hygiene", "Servants of Sanitation", "Guardians of Privacy"]
  },
  {
    fact: "In 1929, two Princeton researchers claimed to have performed surgery on a <BLANK> to convert it into a telephone.",
    answer: "anesthetized living cat",
    category: "Science",
    lies: ["sedated laboratory mouse", "unconscious dog specimen", "sleeping rabbit subject", "numbed guinea pig", "tranquilized squirrel"]
  },
  {
    fact: "During World War II, Americans renamed sauerkraut as <BLANK> due to anti-German sentiment.",
    answer: "liberty cabbage",
    category: "History",
    lies: ["freedom vegetables", "patriot's preserve", "American salad", "national relish", "liberty vegetables"]
  },
  {
    fact: "Nineteenth-century dentists created false teeth by attaching real human teeth to <BLANK>.",
    answer: "ivory base plates",
    category: "Science",
    lies: ["bone frame structures", "wooden backing boards", "metal foundation pieces", "ceramic support bases", "leather-lined frames"]
  },
  {
    fact: "In 1807, Napoleon's rabbit hunt went disastrously wrong when over 3000 domesticated rabbits charged toward <BLANK>.",
    answer: "Napoleon and his party",
    category: "History",
    lies: ["the French generals", "his military units", "armed soldiers everywhere", "the cavalry units", "his entire battalion"]
  },
  {
    fact: "The Georgian nobility in the 18th century displayed pineapples on mantlepieces because <BLANK> made them a luxury item.",
    answer: "their extreme rarity",
    category: "History",
    lies: ["royal decree required it", "they smelled wonderful always", "they symbolized power", "they were gifts from kings", "the law demanded display"]
  },
  {
    fact: "Medieval ecclesiastical courts tried <BLANK> by excommunicating them to prevent crop destruction.",
    answer: "locusts and insects",
    category: "History",
    lies: ["wolves and bears", "snakes and serpents", "rats and mice only", "birds and fowl", "all wild animals"]
  },
  {
    fact: "In 1266, a pig was publicly burned for the crime of <BLANK> a child.",
    answer: "mutilating and killing",
    category: "History",
    lies: ["stealing food from", "frightening and injuring", "attacking repeatedly", "trampling to death", "biting and wounding"]
  },
  {
    fact: "The earliest recorded animal trial occurred in 1266 when <BLANK> was executed at Fontenay-aux-Roses.",
    answer: "a pig convicted",
    category: "History",
    lies: ["a bull was tried", "a dog was hanged", "a cow was burned", "a horse was tried", "a goat was executed"]
  },
  {
    fact: "In 1519, the Alpine community of Stelvio brought a civil lawsuit against <BLANK> for destroying crops.",
    answer: "moles in fields",
    category: "History",
    lies: ["rats in granaries", "locusts in swarms", "insects in herds", "birds in flocks", "worms in soil"]
  },
  {
    fact: "An 1494 case involved prosecution of <BLANK> for mutilating a child in the face and neck.",
    answer: "a young pig",
    category: "History",
    lies: ["an adult boar", "a wild beast", "a fierce wolf", "a dangerous dog", "a rogue bull"]
  },
  {
    fact: "At least 15 pigs were executed during medieval times specifically for <BLANK> according to historical records.",
    answer: "killing young children",
    category: "History",
    lies: ["destroying churches", "stealing royal treasures", "attacking soldiers", "burning houses", "damaging crops"]
  },
  {
    fact: "Lord Byron, upset about college dormitory rules against dogs, kept a <BLANK> instead.",
    answer: "pet bear in his room",
    category: "History",
    lies: ["wild wolf as pet", "lion in his quarters", "eagle as companion", "monkey as friend", "fox as roommate"]
  },
  {
    fact: "During the 19th century, people employed specially-paid <BLANK> to wake up factory workers for their shifts.",
    answer: "knocker uppers with sticks",
    category: "History",
    lies: ["bell ringers daily", "morning drummers loudly", "horn blowers early", "shouting workers loudly", "bugle players everywhere"]
  },
  {
    fact: "In World War I, the French constructed a fake <BLANK> out of wood and canvas to confuse German pilots.",
    answer: "duplicate city",
    category: "History",
    lies: ["false military base", "decoy naval port", "cardboard factory", "wooden fortress", "canvas town complete"]
  },
  {
    fact: "The Taj Mahal was covered in <BLANK> during World War II to hide it from bomber aircraft.",
    answer: "bamboo and leaves",
    category: "History",
    lies: ["canvas and netting", "wood and branches", "hay and straw", "cloth and vines", "branches and twigs"]
  },
  {
    fact: "Since 1945, all British military tanks have been equipped with <BLANK> for their crews.",
    answer: "tea making facilities",
    category: "History",
    lies: ["cooking stoves for meals", "water heating systems", "beverage dispensers", "kitchen equipment complete", "food preparation areas"]
  },
  {
    fact: "Scientists recreated ancient Egyptian embalming fluid and discovered it smelled like <BLANK>.",
    answer: "woody pine with citrus",
    category: "Science",
    lies: ["roses and lavender", "incense and myrrh", "flowers and herbs", "spices and vanilla", "perfume and musk"]
  },
  {
    fact: "In 1904, the accidental discovery of tea bags resulted from <BLANK> shipped to Europe.",
    answer: "tea in silk pouches",
    category: "Food",
    lies: ["tea in paper bags", "loose tea samples", "tea in containers", "tea in wrappers", "tea in vessels"]
  },
  {
    fact: "Medieval pig trials were so elaborate that the condemned swine received <BLANK> before execution.",
    answer: "last rites from clergy",
    category: "History",
    lies: ["final prayers loudly", "religious blessings only", "priestly absolution complete", "church sacraments given", "holy water sprinkled"]
  },
  {
    fact: "In 1457, a mother sow was executed but her six piglets were <BLANK> due to their youth.",
    answer: "acquitted by the court",
    category: "History",
    lies: ["exiled from the land", "imprisoned separately", "sold at auction", "burned at stake", "hanged publicly"]
  },
  {
    fact: "The 1974 film 'The Hour of the Pig' dramatizes a <BLANK> from medieval times.",
    answer: "pig murder trial",
    category: "Film",
    lies: ["animal court proceeding", "beast execution spectacle", "creature crime case", "livestock hearing trial", "swine judgment scene"]
  },
  {
    fact: "When Napoleon was exiled to St. Helena, his wife Marie Louise <BLANK> him again.",
    answer: "never saw him",
    category: "History",
    lies: ["visited him often", "wrote letters to", "sent messages to", "attempted to rescue", "tried visiting twice"]
  },
  {
    fact: "Napoleon's remains were returned to France and interred at <BLANK> with other military leaders.",
    answer: "Les Invalides in Paris",
    category: "History",
    lies: ["the Louvre Museum", "Versailles Palace grounds", "Notre Dame Cathedral", "the Sorbonne campus", "Fontainebleau Estate"]
  },
  {
    fact: "Scientists studying Napoleon's death determined he died from <BLANK> cancer rather than poisoning.",
    answer: "advanced gastric stomach",
    category: "History",
    lies: ["liver disease and illness", "lung cancer and tumors", "heart failure completely", "arsenic poisoning definitely", "unknown mysterious causes"]
  },
  {
    fact: "During a coronation ceremony, Napoleon <BLANK> from the Pope's hands without permission.",
    answer: "took the crown",
    category: "History",
    lies: ["snatched the scepter", "grabbed the ring", "stole the orb", "seized the staff", "claimed the jewels"]
  },
  {
    fact: "The only continent without an active volcano is <BLANK>.",
    answer: "Australia",
    category: "Geography",
    lies: ["Antarctica", "Europe entirely", "North America", "Africa completely", "Asia altogether"]
  },
  {
    fact: "The country of Poland has claimed to have <BLANK> a war.",
    answer: "never lost",
    category: "History",
    lies: ["always won", "defeated everyone", "conquered all neighbors", "defeated all enemies", "never been defeated"]
  },
  {
    fact: "In France, it is illegal to name a pig <BLANK>.",
    answer: "Napoleon",
    category: "Law",
    lies: ["Emperor", "Caesar", "King", "General", "Dictator"]
  },
  {
    fact: "The medieval herding incident in 1379 resulted in <BLANK> being tried and most being pardoned.",
    answer: "two pig herds",
    category: "History",
    lies: ["three cattle groups", "five sheep herds", "several goat flocks", "many horse groups", "numerous livestock"]
  },
  {
    fact: "A 1492 piglet was <BLANK> by hind legs then executed for murdering a child.",
    answer: "dragged before hanging",
    category: "History",
    lies: ["burned at stake", "tortured extensively", "buried alive", "drowned in water", "stoned publicly"]
  },
  {
    fact: "The Anglo-Zanzibar War of 1896 holds the record for being the <BLANK> conflict ever recorded.",
    answer: "shortest war",
    category: "History",
    lies: ["bloodiest conflict", "earliest modern war", "fastest victory", "briefest skirmish", "quickest military action"]
  },
  {
    fact: "In 1662, Connecticut resident William Potter was <BLANK> for animal bestiality.",
    answer: "burned at stake",
    category: "Law",
    lies: ["imprisoned for years", "fined heavily", "exiled forever", "hanged in public", "branded as criminal"]
  },
  {
    fact: "A rooster in medieval Switzerland was tried for <BLANK> which townspeople feared would create a cockatrice.",
    answer: "egg laying crime",
    category: "History",
    lies: ["witchcraft practices", "demonic possession", "heresy spreading", "blasphemy speaking", "sorcery committing"]
  },
  {
    fact: "In 1750, a donkey accused of bestiality was <BLANK> after character witnesses testified to his chastity.",
    answer: "acquitted by court",
    category: "History",
    lies: ["sentenced to death", "banished forever", "tortured severely", "burned alive", "hanged publicly"]
  },
  {
    fact: "In 2024, a CrowdStrike software update caused a <BLANK> that crashed airlines, hospitals, and government systems worldwide.",
    answer: "global IT outage",
    category: "Tech Oops",
    lies: ["minor glitch everywhere", "regional system failure", "isolated data breach", "software malfunction only", "network connectivity issue"]
  },
  {
    fact: "The Quibi streaming service spent <BLANK> and shut down after just six months without a single profitable quarter.",
    answer: "1.75 billion dollars",
    category: "Tech Oops",
    lies: ["850 million dollars", "3 billion dollars", "500 million dollars", "2.5 billion dollars", "1 billion dollars"]
  },
  {
    fact: "Google+ was so unsuccessful that fewer than <BLANK> of Google users regularly engaged with the social network before it shut down.",
    answer: "one percent",
    category: "Tech Oops",
    lies: ["five percent", "ten percent", "three percent", "two percent", "half percent"]
  },
  {
    fact: "Samsung's Galaxy Note 7 batteries caused <BLANK> explosions even after issuing replacement phones.",
    answer: "multiple spontaneous fires",
    category: "Tech Oops",
    lies: ["isolated battery failures", "minor overheating incidents", "occasional charging issues", "random thermal events", "sporadic electrical failures"]
  },
  {
    fact: "The Bowery vertical farming startup raised <BLANK> but collapsed after plant infections destroyed their lettuce production.",
    answer: "over 700 million",
    category: "Tech Oops",
    lies: ["100 million dollars", "500 million dollars", "1 billion dollars", "250 million dollars", "1.5 billion dollars"]
  },
  {
    fact: "Apple's $10,000 gold <BLANK> was supposed to appeal to luxury consumers but became a legendary sales failure.",
    answer: "Apple Watch Edition",
    category: "Tech Oops",
    lies: ["iPhone model", "iPad Pro version", "AirPods variant", "Mac miniature", "iMac edition"]
  },
  {
    fact: "Meta lost <BLANK> in 2022 investing billions into the metaverse despite consumer disinterest.",
    answer: "13.7 billion dollars",
    category: "Tech Oops",
    lies: ["5.2 billion dollars", "20 billion dollars", "8.9 billion dollars", "3.1 billion dollars", "15.4 billion dollars"]
  },
  {
    fact: "Windows 8's disastrous <BLANK> interface confounded users with colorful tiles instead of the iconic start button.",
    answer: "Metro user interface",
    category: "Tech Oops",
    lies: ["Ribbon navigation panel", "Aero visual design", "Fluent appearance system", "Modern interface layout", "Minimal desktop theme"]
  },
  {
    fact: "WeWork never went public because founder Adam Neumann had questionable voting rights and created a <BLANK> culture.",
    answer: "work hard party hard",
    category: "Tech Oops",
    lies: ["move fast break things", "disrupt everything always", "innovate without limits", "take big risks", "push all boundaries"]
  },
  {
    fact: "Facebook's cryptocurrency project Libra failed due to regulatory scrutiny and lack of support from <BLANK> institutions.",
    answer: "major financial",
    category: "Tech Oops",
    lies: ["government banking", "national economic", "international trade", "central banking", "global economic"]
  },
  {
    fact: "In Ancient Greece, athletes competed in the Olympic Games completely <BLANK> without any clothing whatsoever.",
    answer: "naked",
    category: "Greece",
    lies: ["nearly naked", "partially clothed", "barely dressed", "minimally covered", "loosely draped"]
  },
  {
    fact: "Ancient Greek women considered a single unibrow to be a sign of <BLANK> and often drew them on.",
    answer: "intelligence and beauty",
    category: "Greece",
    lies: ["great wealth", "high status", "noble birth", "priestess power", "divine favor"]
  },
  {
    fact: "The Oracle of Delphi supposedly channeled the god Apollo while standing above a chasm releasing <BLANK> gas.",
    answer: "ethylene hallucinogenic",
    category: "Greece",
    lies: ["carbon dioxide", "nitrogen oxide", "methane sulfur", "hydrogen sulfide", "ammonia vapor"]
  },
  {
    fact: "Ancient Greeks drank wine mixed with at least <BLANK> parts water to avoid becoming drunk or barbaric.",
    answer: "three parts water",
    category: "Greece",
    lies: ["equal amounts water", "mostly water", "one part water", "two parts water", "five parts water"]
  },
  {
    fact: "The first vending machine was invented in Ancient Greece to dispense <BLANK> when coins were inserted.",
    answer: "holy water",
    category: "Greece",
    lies: ["wine drinks", "olive oil", "grain portions", "incense smoke", "temple coins"]
  },
  {
    fact: "Plato believed that beans contained the <BLANK> of dead people and refused to eat them.",
    answer: "souls of dead people",
    category: "Greece",
    lies: ["blood of ancestors", "spirits of demons", "essence of death", "curse of gods", "breath of underworld"]
  },
  {
    fact: "In Athens, citizens could vote to exile any politician or person for <BLANK> in a process called ostracism.",
    answer: "ten years",
    category: "Greece",
    lies: ["five years", "seven years", "lifetime", "twenty years", "three years"]
  },
  {
    fact: "Saint Nicholas, the original Santa Claus, was from Ancient Greece and became patron saint of <BLANK>.",
    answer: "children",
    category: "Greece",
    "lines": ["merchants", "sailors", "travelers", "thieves", "poor people"]
  },
  {
    fact: "Ancient Sparta required every newborn to be inspected and <BLANK> if any physical defect was found.",
    answer: "abandoned to die",
    category: "Greece",
    lies: ["branded as slaves", "exiled from state", "raised separately", "enslaved permanently", "marked as impure"]
  },
  {
    fact: "The Antikythera Mechanism discovered in Ancient Greece was so complex it wouldn't be matched until mechanical <BLANK> were invented.",
    answer: "clocks in 14th century",
    category: "Greece",
    lies: ["watches in renaissance", "calculators in 1600s", "telescopes in 1700s", "chronometers recently", "timekeepers ever"]
  },
  {
    fact: "The E.T. video game was so catastrophically bad that Atari buried thousands of unsold cartridges in <BLANK>.",
    answer: "New Mexico landfill",
    category: "Gaming",
    lies: ["Nevada desert", "Arizona dump", "Texas landfill", "California site", "Colorado burial"]
  },
  {
    fact: "In Mario's original Donkey Kong arcade game, his profession was a <BLANK> not a plumber.",
    answer: "carpenter",
    category: "Gaming",
    lies: ["painter", "builder", "worker", "foreman", "construction supervisor"]
  },
  {
    fact: "Tetris played within <BLANK> hours of trauma reduced PTSD flashbacks in car accident survivors.",
    answer: "six hours after trauma",
    category: "Gaming",
    lies: ["two hours of trauma", "one day after trauma", "one week after trauma", "three days after trauma", "immediately after trauma"]
  },
  {
    fact: "A South Korean law made it illegal for children under <BLANK> to play video games from midnight until 6am.",
    answer: "16 years old",
    category: "Gaming",
    lies: ["18 years old", "13 years old", "12 years old", "14 years old", "15 years old"]
  },
  {
    fact: "The NBA Jam creator deliberately rigged the game to make the Chicago Bulls <BLANK> in last-second shots.",
    answer: "always shoot bricks",
    category: "Gaming",
    lies: ["always win games", "score three pointers", "never miss shots", "control outcomes", "dominate always"]
  },
  {
    fact: "Space Invaders' aliens appear to speed up because the computer rendered them faster as <BLANK> were destroyed.",
    answer: "more enemies",
    category: "Gaming",
    lies: ["more shields", "fewer obstacles", "power ups", "more bullets fired", "fewer asteroids"]
  },
  {
    fact: "Scribblenauts almost launched with a bizarre bug where a lion would eat itself if <BLANK> was glued to it.",
    answer: "bacon on its back",
    category: "Gaming",
    lies: ["meat on its body", "food near it", "its own tail", "another animal", "a magical spell"]
  },
  {
    fact: "A player in Diablo 1 started a rumor about a secret cow level that the developers actually <BLANK> in Diablo II.",
    answer: "implemented into game",
    category: "Gaming",
    lies: ["acknowledged as fake", "denied completely", "mocked publicly", "banned for spreading", "sued for claiming"]
  },
  {
    fact: "The Witcher author Andrzej Sapkowski initially thought CD Projekt Red would never make money and demanded <BLANK> instead.",
    answer: "payment up front",
    category: "Gaming",
    lies: ["annual royalties only", "percentage of sales", "bonus structure", "equity stake", "lifetime payments"]
  },
  {
    fact: "Mario's real name comes from landlord Mario Segale who collected unpaid rent from <BLANK> in 1981.",
    answer: "Nintendo's warehouse",
    category: "Gaming",
    lies: ["Sega's office building", "Atari's headquarters", "arcade game maker", "Famicom distributor", "Game Boy factory"]
  },
  {
    fact: "The Konami Code appears in over <BLANK> video games and became Gaming's most famous cheat code.",
    answer: "100 games",
    category: "Gaming",
    lies: ["50 games", "200 games", "75 games", "150 games", "250 games"]
  },
  {
    fact: "Mortal Kombat was released on Mortal Monday but Nintendo completely omitted all the <BLANK> from their versions.",
    answer: "blood from game",
    category: "Gaming",
    lies: ["violence from game", "fatalities from game", "gore from game", "fighting from game", "combat from game"]
  },
  {
    fact: "A World of Warcraft plague bug so closely mirrored real pandemic responses that epidemiologists are using it to study <BLANK>.",
    answer: "future outbreak behavior",
    category: "Gaming",
    lies: ["disease transmission models", "infection rate patterns", "medical response protocols", "population immunity levels", "vaccine distribution methods"]
  },
  {
    fact: "Freddie Mercury recorded Queen songs while performing with a <BLANK> in the studio during sessions.",
    answer: "llama",
    category: "Music",
    lies: ["goat", "alpaca", "sheep", "deer", "camel"]
  },
  {
    fact: "The Beatles were so Musically illiterate that Paul McCartney finally admitted in 2018 they couldn't <BLANK>.",
    answer: "read Music theory",
    category: "Music",
    lies: ["write songs properly", "play instruments well", "record accurately", "sing harmonies", "perform live"]
  },
  {
    fact: "Jimi Hendrix couldn't read sheet Music and played a right-handed guitar flipped <BLANK> being naturally left-handed.",
    answer: "upside down",
    category: "Music",
    lies: ["backwards normally", "inverted partially", "reversed completely", "sideways always", "mirrored"]
  },
  {
    fact: "Leo Fender, inventor of the legendary Stratocaster guitar, could never <BLANK> despite revolutionizing guitar design.",
    answer: "play guitar",
    category: "Music",
    lies: ["read Music notes", "sing well", "play drums", "compose songs", "perform publicly"]
  },
  {
    fact: "Robert Schumann thought he could cure his diseases by sticking his hands into <BLANK> from slaughtered animals.",
    answer: "the entrails",
    category: "Music",
    lies: ["blood from veins", "organs directly", "animal remains", "body cavities", "intestinal matter"]
  },
  {
    fact: "Franz Liszt caused such hysteria among fans that Music historians later called the phenomenon <BLANK>.",
    answer: "Lisztomania",
    category: "Music",
    lies: ["Liszt madness", "composer fever", "piano delirium", "performance frenzy", "Musician mania"]
  },
  {
    fact: "Rossini composed the famous aria Di tanti palpiti while waiting for <BLANK> in a Venice restaurant.",
    answer: "risotto to finish",
    category: "Music",
    lies: ["pasta to cook", "wine to arrive", "dinner to start", "soup to cool", "bread to bake"]
  },
  {
    fact: "Greece's national anthem has <BLANK> verses, making it the longest in the world.",
    answer: "158 verses",
    category: "Music",
    lies: ["92 verses", "211 verses", "145 verses", "176 verses", "203 verses"]
  },
  {
    fact: "Joseph Haydn's tomb contains <BLANK> skulls because his actual skull was stolen by phrenologists.",
    answer: "two skulls",
    category: "Music",
    lies: ["three skulls", "one skull only", "no skulls", "four skulls", "five skulls"]
  },
  {
    fact: "A grand piano exerts a combined force of <BLANK> tonnes from the tension of its strings.",
    answer: "20 tonnes",
    category: "Music",
    lies: ["10 tonnes", "35 tonnes", "15 tonnes", "50 tonnes", "5 tonnes"]
  },
  {
    fact: "The Koopalings in Super Mario World include a triceratops named <BLANK> after Trent Reznor of Nine Inch Nails.",
    answer: "Reznor",
    category: "Music",
    lies: ["Marilyn", "Vince", "Dario", "Atticus", "Johnny"]
  },
  {
    fact: "Rod Stewart's 1993 New Year's Eve concert on Copacabana Beach had <BLANK> attending, the most for any free concert.",
    answer: "4.2 million people",
    category: "Music",
    lies: ["2.1 million people", "6.5 million people", "3.8 million people", "5.2 million people", "1.9 million people"]
  },
  {
    fact: "An astronaut named Chris Hadfield recorded his album in <BLANK> while orbiting the International Space Station.",
    answer: "outer space",
    category: "Music",
    lies: ["low Earth orbit", "space station orbit", "vacuum condition", "zero gravity", "space environment"]
  },
  {
    fact: "The largest rock band ever assembled included <BLANK> Musicians performing in Beijing China.",
    answer: "953 Musicians",
    category: "Music",
    lies: ["627 Musicians", "1285 Musicians", "841 Musicians", "1156 Musicians", "734 Musicians"]
  },
  {
    fact: "Michael Jackson secretly wrote 'Do the Bartman' for The Simpsons but the producers kept it hidden because <BLANK>.",
    answer: "legal restrictions prevented credit",
    category: "Music",
    lies: ["Jackson wanted anonymity", "copyright issues existed", "contract forbade credit", "label disputes arose", "rights disputes occurred"]
  },
  {
    fact: "Louis Armstrong wore a Star of David necklace his entire life and spoke fluent <BLANK> even though not Jewish.",
    answer: "Yiddish language",
    category: "Music",
    lies: ["Hebrew language", "Yiddish dialect", "German language", "Yiddish script", "Hebrew prayers"]
  },
  {
    fact: "Therizinosaurus had claws that were longer than a baseball bat at over <BLANK> in length.",
    answer: "one meter long",
    category: "Dinosaurs",
    lies: ["two meters long", "half meter long", "three feet long", "fifty centimeters", "one foot long"]
  },
  {
    fact: "A Nemicolopterus pterodactyl discovered in 2008 had a wingspan of only <BLANK>.",
    answer: "ten inches",
    category: "Dinosaurs",
    lies: ["one foot wide", "two feet wide", "six inches", "three inches wide", "five feet wide"]
  },
  {
    fact: "Dinosaurs like Velociraptors were actually roughly the size of <BLANK>.",
    answer: "turkeys",
    category: "Dinosaurs",
    lies: ["chickens", "eagles", "ostriches", "geese", "hawks"]
  },
  {
    fact: "Scientists estimate Sauroposeidon weighed over <BLANK> tons and stood more than 60 feet tall.",
    answer: "60 tons",
    category: "Dinosaurs",
    lies: ["40 tons", "100 tons", "30 tons", "150 tons", "80 tons"]
  },
  {
    fact: "Kentosaurus had a spiked tail that could swing up to <BLANK> miles per hour.",
    answer: "89 miles per hour",
    category: "Dinosaurs",
    lies: ["45 miles per hour", "120 miles per hour", "60 miles per hour", "150 miles per hour", "30 miles per hour"]
  },
  {
    fact: "The Jurassic Park Velociraptors were actually based on a much larger relative called the <BLANK>.",
    answer: "Utahraptor",
    category: "Dinosaurs",
    lies: ["Deinonychus", "Troodon", "Compsognathus", "Velociraptor", "Carnotaurus"]
  },
  {
    fact: "Nearly half of the 1,200 known dinosaur species are identified from only <BLANK> specimen.",
    answer: "single unique",
    category: "Dinosaurs",
    lies: ["two skeletons", "multiple fossils", "three bones", "partial remains", "several teeth"]
  },
  {
    fact: "Archaeologists believe baby dinosaurs had proportionally larger eyes and <BLANK> faces than adults.",
    answer: "smaller cuter",
    category: "Dinosaurs",
    lies: ["bigger fiercer", "wider longer", "narrower sharper", "thinner meaner", "rounder flatter"]
  },
  {
    fact: "Fossil coprolites, which are <BLANK>, have taught us about dinosaur diets.",
    answer: "fossilized feces",
    category: "Dinosaurs",
    lies: ["preserved stomach acid", "hardened saliva", "petrified blood", "stone entrails", "calcified organs"]
  },
  {
    fact: "Brachiosaurus weighed approximately <BLANK> tons, the size of 17 large elephants.",
    answer: "80 tons",
    category: "Dinosaurs",
    lies: ["50 tons", "120 tons", "40 tons", "150 tons", "30 tons"]
  },
  {
    fact: "A man booked a cruise for December 2016 instead of December 2015 because he miscounted <BLANK>.",
    answer: "365 days",
    category: "Traveling Mistakes",
    lies: ["months on calendar", "booking dates", "year numbers", "calendar pages", "day squares"]
  },
  {
    fact: "An Indian tourist famously asked online how to drive from Sydney to Auckland across <BLANK>.",
    answer: "the ocean",
    category: "Traveling Mistakes",
    lies: ["the desert", "the rainforest", "the mountains", "the valley", "the plains"]
  },
  {
    fact: "A Scottish man booked a flight to Granada Spain but ended up in Grenada in <BLANK>.",
    answer: "the Caribbean",
    category: "Traveling Mistakes",
    lies: ["South America", "Africa", "Southeast Asia", "Central America", "Pacific Islands"]
  },
  {
    fact: "Julia Roberts wore a DIY shirt that said '<BLANK>' in obvious reference to her boyfriend's wife.",
    answer: "A Low Vera",
    category: "Traveling Mistakes",
    lies: ["A Hate Vera", "Bye Vera", "Vera Sucks", "Leave Vera", "Forget Vera"]
  },
  {
    fact: "A German couple on the Routeburn Track hike walked in the wrong direction for hours and ended up on <BLANK>.",
    answer: "a remote farm",
    category: "Traveling Mistakes",
    lies: ["a busy highway", "a river crossing", "a mountain cliff", "a private estate", "a marsh"]
  },
  {
    fact: "A tourist in Paris asked for bread in French but literally asked for <BLANK> instead.",
    answer: "pain and suffering",
    category: "Traveling Mistakes",
    lies: ["pleasure", "joy and happiness", "love and romance", "peace and quiet", "life itself"]
  },
  {
    fact: "In 1881, a Utah salesman in Florida wanted to marry <BLANK> of a deceased woman.",
    answer: "the corpse",
    category: "Romance",
    lies: ["the ghost", "the memory", "the tombstone", "the legacy", "the portrait"]
  },
  {
    fact: "A woman named Eija-Ritta married <BLANK> in 1979 and remained married for 29 years.",
    answer: "the Berlin Wall",
    category: "Romance",
    lies: ["a clock tower", "a bridge", "a lighthouse", "a statue", "a building"]
  },
  {
    fact: "A Scottish man named Henry met his Russian fiancée Anna again after being separated <BLANK>.",
    answer: "60 years apart",
    category: "Romance",
    lies: ["40 years apart", "80 years apart", "30 years apart", "50 years apart", "100 years apart"]
  },
  {
    fact: "Helen and Les were born on the same day December 31, 1918 and lived together for <BLANK>.",
    answer: "75 years",
    category: "Romance",
    lies: ["50 years", "100 years", "60 years", "80 years", "45 years"]
  },
  {
    fact: "James Joyce wrote passionate love letters praising his partner Nora's <BLANK> style.",
    answer: "flatulent lovemaking",
    category: "Romance",
    lies: ["passionate kissing", "tender embracing", "playful teasing", "romantic language", "adventurous nature"]
  },
  {
    fact: "According to research, men who kiss their partners every morning live <BLANK> longer.",
    answer: "five years",
    category: "Romance",
    lies: ["two years", "ten years", "three years", "seven years", "one year"]
  },
  {
    fact: "An experiment showed that gazing at a stranger for <BLANK> minutes can lead to love.",
    answer: "four minutes",
    category: "Romance",
    lies: ["two minutes", "ten minutes", "one minute", "six minutes", "three minutes"]
  },
  {
    fact: "Interracial marriage was legalized in America in <BLANK> by the Supreme Court.",
    answer: "1967",
    category: "Romance",
    lies: ["1956", "1972", "1960", "1975", "1950"]
  },
  {
    fact: "Women consistently prefer the smell of men whose immune systems were <BLANK> their own.",
    answer: "different from",
    category: "Romance",
    lies: ["similar to", "stronger than", "weaker than", "related to", "identical to"]
  },
  {
    fact: "A mother sow was executed but her <BLANK> piglets were acquitted for lack of culpability.",
    answer: "six suckling",
    category: "Celebrity Gossip",
    lies: ["three young", "ten little", "two small", "five young", "eight baby"]
  },
  {
    fact: "Ellen DeGeneres faced backlash in 2020 when reports revealed her workplace was <BLANK>.",
    answer: "toxic and abusive",
    category: "Celebrity Gossip",
    lies: ["disorganized chaos", "unprofessional and rude", "unfair to women", "poorly managed overall", "financially corrupt"]
  },
  {
    fact: "Matthew McConaughey was arrested in 1999 for dancing naked with <BLANK> in his home.",
    answer: "bongo drums",
    category: "Celebrity Gossip",
    lies: ["maracas", "a guitar", "a harmonica", "cowbells", "tambourines"]
  },
  {
    fact: "A Tom Cruise Scientology promotional video from 2008 caused massive backlash when <BLANK>.",
    answer: "it was leaked",
    category: "Celebrity Gossip",
    lies: ["aired on television", "published online", "released by studios", "broadcast publicly", "shared by media"]
  },
  {
    fact: "Michael Jackson held his nine-month-old son out a window <BLANK> while showing crowds.",
    answer: "one-handed",
    category: "Celebrity Gossip",
    lies: ["with both hands", "dangling by leg", "above his head", "by the diaper", "suspended high"]
  },
  {
    fact: "Harvey Weinstein was convicted of multiple counts and sentenced to <BLANK> in prison.",
    answer: "23 years",
    category: "Celebrity Gossip",
    lies: ["15 years", "30 years", "20 years", "10 years", "40 years"]
  },
  {
    fact: "Martha Stewart was convicted of insider trading and served <BLANK> in federal prison.",
    answer: "five months",
    category: "Celebrity Gossip",
    lies: ["three months", "one year", "ten months", "six months", "two years"]
  },
  {
    fact: "Felicity Huffman paid <BLANK> to have someone take her daughter's SAT test for her.",
    answer: "15 thousand dollars",
    category: "Celebrity Gossip",
    lies: ["5 thousand dollars", "25 thousand dollars", "10 thousand dollars", "50 thousand dollars", "3 thousand dollars"]
  },
  {
    fact: "Lori Loughlin paid <BLANK> to have her daughter enrolled at USC.",
    answer: "500 thousand dollars",
    category: "Celebrity Gossip",
    lies: ["250 thousand dollars", "750 thousand dollars", "100 thousand dollars", "1 million dollars", "300 thousand dollars"]
  },
  {
    fact: "Janet Jackson's Super Bowl XXXVIII halftime show exposed her breast for about <BLANK>.",
    answer: "half a second",
    category: "Celebrity Gossip",
    lies: ["one second", "two seconds", "three seconds", "one full minute", "five seconds"]
  },
  {
    fact: "Kobe Bryant died in a helicopter crash in 2020 with his <BLANK> daughter on board.",
    answer: "13-year-old",
    category: "Celebrity Gossip",
    lies: ["15-year-old", "10-year-old", "12-year-old", "14-year-old", "16-year-old"]
  },
  {
    fact: "Jean Harlow married Paul Bern who was already married to another woman named <BLANK>.",
    answer: "Dorothy Millette",
    category: "Celebrity Gossip",
    lies: ["Margaret Bern", "Vera Millette", "Helen Berman", "Edith Mills", "Clara Martin"]
  },
  {
    fact: "Charlie Chaplin married a 16-year-old named Mildred Harris when he was <BLANK>.",
    answer: "29 years old",
    category: "Celebrity Gossip",
    lies: ["35 years old", "40 years old", "25 years old", "45 years old", "22 years old"]
  },
  {
    fact: "Elizabeth Taylor began seeing Eddie Fisher while he was married to <BLANK>.",
    answer: "Debbie Reynolds",
    category: "Celebrity Gossip",
    lies: ["Vivien Leigh", "Joan Crawford", "Rita Hayworth", "Audrey Hepburn", "Grace Kelly"]
  },
  {
    fact: "Arnold Schwarzenegger fathered a child with his housekeeper after being married to <BLANK>.",
    answer: "Maria Shriver",
    category: "Celebrity Gossip",
    lies: ["Katherine Schwarzenegger", "Heidi Klum", "Michelle Pfeiffer", "Peggy Lipton", "Jennifer Beals"]
  },
  {
    fact: "Jerry Lee Lewis married his <BLANK> cousin when he was a rock and roll sensation.",
    answer: "13-year-old",
    category: "Celebrity Gossip",
    lies: ["16-year-old", "14-year-old", "15-year-old", "12-year-old", "17-year-old"]
  },
  {
    fact: "Britney Spears' father kept her under a conservatorship from 2008 until <BLANK>.",
    answer: "2021",
    category: "Celebrity Gossip",
    lies: ["2019", "2023", "2020", "2024", "2018"]
  },
  {
    fact: "Roman Polanski fled America in 1978 after being convicted and has lived in <BLANK>.",
    answer: "France since",
    category: "Celebrity Gossip",
    lies: ["Germany forever", "Switzerland always", "Poland returning", "Mexico hiding", "Italy secretly"]
  },
  {
    fact: "A 1950 case involved the execution of <BLANK> who killed a nobleman.",
    answer: "a farm pig",
    category: "Celebrity Gossip",
    lies: ["a wild boar", "an attack dog", "a feral horse", "a bull", "a bear"]
  },
  {
    fact: "The shortest war in history was between the UK and Zanzibar lasting <BLANK>.",
    answer: "38 to 45 minutes",
    category: "Dinosaurs",
    lies: ["2 hours flat", "90 minutes total", "12 minutes only", "one hour exactly", "three hours"]
  },
  {
    fact: "O.J. Simpson's slow-moving white Bronco chase in 1994 captivated <BLANK>.",
    answer: "all of America",
    category: "Celebrity Gossip",
    lies: ["the west coast", "California alone", "television viewers", "sports fans", "Los Angeles"]
  },
  {
    fact: "Ariana Grande's 'donutgate' scandal involved her licking donuts at a <BLANK>.",
    answer: "Los Angeles shop",
    category: "Celebrity Gossip",
    lies: ["New York bakery", "Chicago store", "Miami location", "San Francisco shop", "Houston venue"]
  },
  {
    fact: "The Hawaii false missile alert of 2018 lasted <BLANK> before being announced as a mistake.",
    answer: "38 fear-filled minutes",
    category: "Celebrity Gossip",
    lies: ["15 minutes only", "one hour total", "5 minutes flat", "30 minutes exactly", "45 minutes"]
  },
  {
    fact: "In 2021, Joey Chestnut consumed a record of <BLANK> hot dogs in just 10 minutes.",
    answer: "76 hot dogs",
    category: "Competitive Eating",
    lies: ["88 hot dogs", "64 hot dogs", "92 hot dogs", "55 hot dogs", "71 hot dogs"]
  },
  {
    fact: "Michelle Lesco set the record for consuming <BLANK> of mayonnaise in three minutes.",
    answer: "2448 grams",
    category: "Competitive Eating",
    lies: ["1850 grams", "3200 grams", "1500 grams", "4000 grams", "1200 grams"]
  },
  {
    fact: "Ken Edwards ate <BLANK> live Madagascan hissing cockroaches in just 60 seconds.",
    answer: "36 cockroaches",
    category: "Competitive Eating",
    lies: ["24 cockroaches", "48 cockroaches", "18 cockroaches", "52 cockroaches", "31 cockroaches"]
  },
  {
    fact: "Takeru Kobayashi consumed <BLANK> cow brains in 15 minutes, weighing over 18 pounds.",
    answer: "57 cow brains",
    category: "Competitive Eating",
    lies: ["73 cow brains", "42 cow brains", "91 cow brains", "38 cow brains", "65 cow brains"]
  },
  {
    fact: "Alex Williams ate 5 feet of raw stinging <BLANK> in just one minute.",
    answer: "nettles",
    category: "Competitive Eating",
    lies: ["thorns", "stinging plants", "leaves", "stems", "vines"]
  },
  {
    fact: "Don Lerman consumed <BLANK> of salted butter in five minutes flat.",
    answer: "28 ounces",
    category: "Competitive Eating",
    lies: ["42 ounces", "19 ounces", "36 ounces", "15 ounces", "52 ounces"]
  },
  {
    fact: "Isaac Harding-Davis ate <BLANK> of Ben & Jerry's ice cream in one minute.",
    answer: "806 grams",
    category: "Competitive Eating",
    lies: ["550 grams", "1100 grams", "680 grams", "1450 grams", "450 grams"]
  },
  {
    fact: "André Ortolf drank <BLANK> of soup in just 30 seconds.",
    answer: "483 grams",
    category: "Competitive Eating",
    lies: ["325 grams", "620 grams", "410 grams", "750 grams", "290 grams"]
  },
  {
    fact: "Matt Stonie ate <BLANK> Peeps marshmallows at the World Peeps Eating Championship.",
    answer: "255 Peeps",
    category: "Competitive Eating",
    lies: ["198 Peeps", "287 Peeps", "176 Peeps", "312 Peeps", "223 Peeps"]
  },
  {
    fact: "Donald Gorske has eaten <BLANK> Big Macs in his lifetime since 1972.",
    answer: "35000 Big Macs",
    category: "Competitive Eating",
    lies: ["28000 Big Macs", "42000 Big Macs", "31000 Big Macs", "48000 Big Macs", "24000 Big Macs"]
  },
  {
    fact: "Rolf Buchholz from Germany holds the record for <BLANK> body modifications.",
    answer: "516 body modifications",
    category: "Body Modifications",
    lies: ["412 body modifications", "638 body modifications", "487 body modifications", "724 body modifications", "356 body modifications"]
  },
  {
    fact: "Rolf has <BLANK> piercings, with 278 on his genitals alone.",
    answer: "481 piercings",
    category: "Body Modifications",
    lies: ["365 piercings", "542 piercings", "419 piercings", "603 piercings", "298 piercings"]
  },
  {
    fact: "Rolf Buchholz has <BLANK> magnetic implants in his fingertips that can pick up metal objects.",
    answer: "five magnetic implants",
    category: "Body Modifications",
    lies: ["three magnetic implants", "eight magnetic implants", "two magnetic implants", "seven magnetic implants", "four magnetic implants"]
  },
  {
    fact: "Elaine Davidson holds the record for <BLANK> piercings on her entire body.",
    answer: "4225 piercings",
    category: "Body Modifications",
    lies: ["2847 piercings", "5100 piercings", "3156 piercings", "6234 piercings", "2001 piercings"]
  },
  {
    fact: "Maria José Cristerna has <BLANK> body modifications including transdermal implants.",
    answer: "49 body modifications",
    category: "Body Modifications",
    lies: ["38 body modifications", "67 body modifications", "42 body modifications", "73 body modifications", "31 body modifications"]
  },
  {
    fact: "Sarwan Singh has the longest beard at <BLANK> in length.",
    answer: "2.54 meters long",
    category: "Body Modifications",
    lies: ["1.98 meters long", "3.15 meters long", "2.89 meters long", "3.42 meters long", "2.21 meters long"]
  },
  {
    fact: "Hans Langseth's beard measured <BLANK> when he died in 1927.",
    answer: "5.33 meters long",
    category: "Body Modifications",
    lies: ["4.12 meters long", "6.48 meters long", "3.87 meters long", "7.15 meters long", "4.91 meters long"]
  },
  {
    fact: "Lucky Diamond Rich has covered his entire body in black ink including <BLANK>.",
    answer: "his eyeballs",
    category: "Body Modifications",
    lies: ["his fingernails", "his toenails", "his teeth", "his gums", "his tongue"]
  },
  {
    fact: "An 86-person beard chain measured <BLANK> long at the National Beard Championships.",
    answer: "195 feet long",
    category: "Body Modifications",
    lies: ["156 feet long", "234 feet long", "178 feet long", "267 feet long", "129 feet long"]
  },
  {
    fact: "The heaviest pumpkin ever recorded weighed <BLANK> grown by the Paton brothers.",
    answer: "1278.8 kilograms",
    category: "Giant Vegetables",
    lies: ["987.5 kilograms", "1456.2 kilograms", "1089.3 kilograms", "1634.7 kilograms", "856.1 kilograms"]
  },
  {
    fact: "The largest pumpkin by circumference measured <BLANK> from stem to blossom.",
    answer: "649.8 centimeters",
    category: "Giant Vegetables",
    lies: ["524.3 centimeters", "782.1 centimeters", "438.9 centimeters", "901.2 centimeters", "356.7 centimeters"]
  },
  {
    fact: "Peter Glazebrook grew the tallest runner bean plant at <BLANK> in height.",
    answer: "8.006 meters tall",
    category: "Giant Vegetables",
    lies: ["6.234 meters tall", "9.781 meters tall", "7.115 meters tall", "10.342 meters tall", "5.987 meters tall"]
  },
  {
    fact: "Joe Atherton set the record for longest radish at <BLANK>.",
    answer: "7.8 meters long",
    category: "Giant Vegetables",
    lies: ["5.42 meters long", "9.15 meters long", "6.38 meters long", "10.23 meters long", "4.91 meters long"]
  },
  {
    fact: "The longest aubergine ever grown measured <BLANK> in length.",
    answer: "49 centimeters",
    category: "Giant Vegetables",
    lies: ["38 centimeters", "62 centimeters", "43 centimeters", "71 centimeters", "32 centimeters"]
  },
  {
    fact: "Graham Barratt grew the tallest luffa plant at <BLANK> in height.",
    answer: "11.672 meters tall",
    category: "Giant Vegetables",
    lies: ["8.945 meters tall", "14.231 meters tall", "9.876 meters tall", "15.542 meters tall", "7.389 meters tall"]
  },
  {
    fact: "The longest marrow ever recorded by Mark Baggs measured <BLANK>.",
    answer: "1.454 meters long",
    category: "Giant Vegetables",
    lies: ["0.987 meters long", "1.823 meters long", "1.156 meters long", "2.134 meters long", "0.756 meters long"]
  },
  {
    fact: "The world record heaviest onion weighed <BLANK> and took 13 years to achieve.",
    answer: "8.97 kilograms",
    category: "Giant Vegetables",
    lies: ["6.34 kilograms", "11.23 kilograms", "7.56 kilograms", "12.89 kilograms", "5.12 kilograms"]
  },
  {
    fact: "The longest sweet pepper ever grown measured <BLANK> in length.",
    answer: "26.7 centimeters",
    category: "Giant Vegetables",
    lies: ["19.2 centimeters", "34.8 centimeters", "22.5 centimeters", "39.1 centimeters", "16.3 centimeters"]
  },
  {
    fact: "The giant waterlily Victoria amazonica grows leaves that reach <BLANK> in diameter.",
    answer: "3 meters wide",
    category: "Giant Vegetables",
    lies: ["2.1 meters wide", "4.5 meters wide", "2.8 meters wide", "5.2 meters wide", "1.9 meters wide"]
  },
  {
    fact: "The titan arum corpse flower can grow to <BLANK> tall when blooming.",
    answer: "more than 3 metres",
    category: "Giant Vegetables",
    lies: ["less than 2 metres", "over 5 metres", "around 2 metres", "nearly 4 metres", "under 1 metre"]
  },
  {
    fact: "In 1998, a person married <BLANK> in a bizarre ceremony.",
    answer: "the Berlin Wall",
    category: "Bizarre Records",
    lies: ["a bridge", "a statue", "a clock tower", "a lighthouse", "a church"]
  },
  {
    fact: "Charles Osborne hiccupped continuously for <BLANK> without stopping.",
    answer: "68 years",
    category: "Bizarre Records",
    lies: ["45 years", "82 years", "37 years", "91 years", "52 years"]
  },
  {
    fact: "Etibar Elchiyev balanced <BLANK> spoons on his body in a single attempt.",
    answer: "250 spoons",
    category: "Bizarre Records",
    lies: ["187 spoons", "312 spoons", "156 spoons", "428 spoons", "89 spoons"]
  },
  {
    fact: "Sanath Bandara wore <BLANK> t-shirts at the same time for a record.",
    answer: "257 t-shirts",
    category: "Bizarre Records",
    lies: ["189 t-shirts", "324 t-shirts", "142 t-shirts", "396 t-shirts", "201 t-shirts"]
  },
  {
    fact: "Anand S. from India inserted <BLANK> straws into his mouth simultaneously.",
    answer: "459 straws",
    category: "Bizarre Records",
    lies: ["312 straws", "587 straws", "234 straws", "723 straws", "156 straws"]
  },
  {
    fact: "Charlotte Lee amassed over <BLANK> different rubber ducks in her collection.",
    answer: "9000 ducks",
    category: "Bizarre Records",
    lies: ["5600 ducks", "12300 ducks", "3400 ducks", "14800 ducks", "2100 ducks"]
  },
  {
    fact: "Hollis Cantrell set a record for <BLANK> tattoos inked in a single 24-hour period.",
    answer: "801 tattoos",
    category: "Bizarre Records",
    lies: ["567 tattoos", "1024 tattoos", "423 tattoos", "1256 tattoos", "312 tattoos"]
  },
  {
    fact: "A couple dressed as Smurfs gathered <BLANK> people in Germany for a record.",
    answer: "2762 people",
    category: "Bizarre Records",
    lies: ["1843 people", "3456 people", "1201 people", "4128 people", "945 people"]
  },
  {
    fact: "Takeru Kobayashi ate a bowl of pasta in just <BLANK> seconds.",
    answer: "26.69 seconds",
    category: "Bizarre Records",
    lies: ["18.34 seconds", "35.12 seconds", "14.78 seconds", "41.56 seconds", "8.92 seconds"]
  },
  {
    fact: "Ann Atkin collected <BLANK> garden gnomes and pixies over four decades.",
    answer: "2042 gnomes",
    category: "Bizarre Records",
    lies: ["1456 gnomes", "2891 gnomes", "987 gnomes", "3234 gnomes", "712 gnomes"]
  },
  {
    fact: "In 2014, the oldest cycad plant at Kew Gardens weighed over <BLANK> and stood four metres tall.",
    answer: "one tonne",
    category: "Bizarre Records",
    lies: ["half a tonne", "two tonnes", "three-quarters tonne", "one and a half tonnes", "quarter tonne"]
  },
  {
    fact: "The largest collection of living plants at a single botanical garden is <BLANK> species.",
    answer: "16900 species",
    category: "Bizarre Records",
    lies: ["12340 species", "21567 species", "8976 species", "24892 species", "5234 species"]
  },
  {
    fact: "Patrick Bertoletti ate <BLANK> cream-filled donuts in just five minutes.",
    answer: "47 donuts",
    category: "Competitive Eating",
    lies: ["32 donuts", "58 donuts", "41 donuts", "69 donuts", "28 donuts"]
  },
  {
    fact: "Eric Booker consumed <BLANK> one-pound bowls of peas in 12 minutes.",
    answer: "nine and a half bowls",
    category: "Competitive Eating",
    lies: ["six bowls", "thirteen bowls", "eight bowls", "fourteen and a half bowls", "five bowls"]
  },
  {
    fact: "The Eastern Cape giant cycad at Kew has been growing since <BLANK> when it arrived from South Africa.",
    answer: "1775",
    category: "Giant Vegetables",
    lies: ["1823", "1656", "1901", "1542", "1734"]
  }
];