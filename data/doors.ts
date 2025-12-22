export type DoorContent = {
  id: number;
  date: number; // Day of December (1-24)
  title: string;
  message?: string;
  image?: string;
  link?: string;
  video?: string;
  extra?: string;
};

export const doors: DoorContent[] = [
  {
    id: 1,
    date: 1,
    title: "Mein Mini-Mee",
    message: `Du bist mein kleines Mini Me  ${'\n'}
Satt-sehen an diesem Bild kann ich mich nie  ${'\n'}
Du machst sogar schon die gleichen Geräusche ${'\n'}
Muss manchmal testen ob du echt bist und ich mich nicht täusche ${'\n'}
Meine Klamotten wandern alle irgendwann an dich ${'\n'}
Und sehen dann auch besser an dir aus, das versteht sich ${'\n'}`,

    image: "/images/day1.jpg",
  },
  {
    id: 2,
    date: 2,
    title: "HIHIIHIHIHHI",
    message: "Ich werde für immer Äpfel für dich klauen",
    image: "/images/day2.jpg",
  },
  {
    id: 3,
    date: 3,
    title: "Gutschein",
    message: "Für einmal 20 minuten massieri",
    image: "/images/day3.jpg",
  },
  {
    id: 4,
    date: 4,
    title: "Absoluter Banger",
    message: "Der musste einfach mit rein",
    image: "/images/day4.jpeg",
  },
  {
    id: 5,
    date: 5,
    title: "Lieblingsbildi",
    message: "Dein Lieblingsbild von uns weil du natürlich so unfassbar gut aussiehst. Aber das tust du eigentlich immer du dummkopf. Ich liebe dich bis zum Mond und zurück. Ich will den Rest meines Lebens mit dir verbringen. Eines Tages wird es nur noch wir beide sein und nicht auch noch deine Dummidankis. Ich bin immer an deiner Seite und zusammen schaffem wir alles. Ich lieeeeeebe dich",
    image: "/images/day5.jpeg",
  },
  {
    id: 6,
    date: 6,
    title: "Wordle",
    message: "Errate das geheime Wort! hihihih",
    link: "/wordle",
  },
  {
    id: 7,
    date: 7,
    title: "Ich weiß doch auch nicht hahahahaha",
    message: "Ich weiß doch auch nicht hahahahaha",
    video: "/videos/day7.mp4",
  },
  {
    id: 8,
    date: 8,
    title: "Gutschein",
    message: "Für Kochen eines Gerichts deiner Wahl",
    image: "/images/chef.png",
  },
  {
    id: 9,
    date: 9,
    title: "Frohen Skriki Tag❤️",
    message: "Ich liebe dich so sehr mein kleines Skriiikiii",
    video: "/videos/day9.mov",
  },
  {
    id: 10,
    date: 10,
    title: "Du geile Schlange",
    message: "Ein geiles Spiel für eine geile Schlange",
    link: "/snake",
  },
  {
    id: 11,
    date: 11,
    title: "Gutschein",
    message: "Für einmal 15 minuten massieri",
    image: "/images/day3.jpg",
  },
  {
    id: 12,
    date: 12,
    title: "Eine besondere Weihnachtsgeschichte",
    message: "Eine besondere Weihnachtsgeschichte von einem Special Guest!",
    link: "/christmasstory",
  },
  {
    id: 13,
    date: 13,
    title: "Eine besondere Weihnachtsgeschichte Part 2",
    message: "Eine besondere Weihnachtsgeschichte von einem Special Guest!",
    video: "/videos/day13.mp4",
  },
  {
    id: 14,
    date: 14,
    title: "Memory",
    message: "Finde alle Paare!",
    link: "/memory",
  },
  {
    id: 15,
    date: 15,
    title: "Puzzle",
    message: "Weil mein skriki so gerne puzzlet",
    link: "/puzzle",
  },
  {
    id: 16, 
    date: 16,
    title: "Danke!",
    message: "Danke, dass du mich immer bei allem unterstützt und an mich glaubst. Es bedeutet mir so viel mehr als du denkst. Ob es der expo tag war oder bei den Jase tests wie hier auf dem Bild oder jetzt auch bei LockedIn. Ich weiß ich kann dir immer stolz meine Fortschritte präsentieren.",
    image: "/images/day16.jpeg",
  },
  {
    id: 17,
    date: 17,
    title: "Gutschein",
    message: "Für ein surprise-date",
    image: "/images/date.png",
  },
  {
    id: 18,
    date: 18,
    title: "Gutschein",
    message: "Für einmal 15 minuten massieri",
    image: "/images/day3.jpg",
  },
  {
    id: 19,
    date: 19,
    title: "Entschuldigung Gutschein",
    message: "Für einmal 25 minuten massieri",
    image: "/images/day3.jpg",
  },
  {
    id: 20,
    date: 20,
    title: "Sudoku",
    message: "Ein Sudoku mit unseren Bildern",
    link: "/sudoku",
  },
  {
    id: 21,
    date: 21,
    title: "Nochmal Memory",
    message: "Du kannst nochmal Memory spielen, weil es dir so gut gefallen hat! 😊",
    link: "/memory?set=new",
  },
  {
    id: 22,
    date: 22,
    title: "Finde uns!",
    message: "Finde unsere beiden Köpfe im Bild! Klicke auf uns, wenn du uns findest. 💕",
    link: "/whereiswaldo",
  },
  {
    id: 23,
    date: 23,
    title: "Schau mal wer da tanzt!",
    message: "Frohe Weihnachten aus dem Hause Niedermeier-Scholl",
    video: "/videos/eva.mp4",
  },
  {
    id: 24,
    date: 24,
    title: "Dein massierie gutscheinbuch",
    message: "Dein massierie gutscheinbuch + 5 Gutscheine für 15 minuten massieri",
    image: "/images/day3.jpg",
  },
];

