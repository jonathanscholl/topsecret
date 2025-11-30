export type DoorContent = {
  id: number;
  date: number; // Day of December (1-24)
  title: string;
  message: string;
  image?: string;
  link?: string;
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
    title: "Cozy Moments",
    message: "Here's to all the cozy moments we'll share this December. You make every day brighter! ✨",
    image: "/images/day2.jpg",
  },
  {
    id: 3,
    date: 3,
    title: "Sweet Memories",
    message: "Thinking of all our sweet memories together. Can't wait to make more! 💕",
  },
  {
    id: 4,
    date: 4,
    title: "Warm Hugs",
    message: "Sending you the warmest virtual hug today! You're amazing! 🤗",
  },
  {
    id: 5,
    date: 5,
    title: "Little Surprise",
    message: "You deserve all the happiness in the world. Here's a little surprise just for you! 🎁",
    link: "https://example.com/surprise",
  },
  {
    id: 6,
    date: 6,
    title: "Starry Night",
    message: "Just like the stars light up the night, you light up my life. ⭐",
    image: "/images/day6.jpg",
  },
  {
    id: 7,
    date: 7,
    title: "Heart Full of Love",
    message: "My heart is full of love for you, today and always. 💖",
  },
  {
    id: 8,
    date: 8,
    title: "Dreams Come True",
    message: "May all your dreams come true this holiday season! 🌟",
  },
  {
    id: 9,
    date: 9,
    title: "Special Day",
    message: "Every day with you is special, but today is extra special! 🎄",
    image: "/images/day9.jpg",
  },
  {
    id: 10,
    date: 10,
    title: "Warm Thoughts",
    message: "Sending you warm thoughts and lots of love today! ❤️",
  },
  {
    id: 11,
    date: 11,
    title: "Beautiful You",
    message: "You are beautiful inside and out. Never forget that! 💫",
  },
  {
    id: 12,
    date: 12,
    title: "Joy and Laughter",
    message: "Here's to all the joy and laughter we share together! 😊",
    link: "https://example.com/day12",
  },
  {
    id: 13,
    date: 13,
    title: "Grateful Heart",
    message: "I'm so grateful to have you in my life. Thank you for being you! 🙏",
  },
  {
    id: 14,
    date: 14,
    title: "Magic Moments",
    message: "Life is full of magic when I'm with you. ✨",
    image: "/images/day14.jpg",
  },
  {
    id: 15,
    date: 15,
    title: "Halfway There",
    message: "We're halfway through December! So many more surprises to come! 🎉",
  },
  {
    id: 16,
    date: 16,
    title: "Sweet Dreams",
    message: "Wishing you the sweetest dreams tonight and always! 💤",
  },
  {
    id: 17,
    date: 17,
    title: "Adventure Awaits",
    message: "Every day is an adventure with you. Can't wait for what's next! 🗺️",
  },
  {
    id: 18,
    date: 18,
    title: "Love Notes",
    message: "Just a little love note to remind you how special you are! 💌",
    image: "/images/day18.jpg",
  },
  {
    id: 19,
    date: 19,
    title: "Cozy Together",
    message: "There's nothing better than being cozy together. You're my favorite person! 🏠",
  },
  {
    id: 20,
    date: 20,
    title: "Almost There",
    message: "We're almost to Christmas! The best is yet to come! 🎄",
    link: "https://example.com/day20",
  },
  {
    id: 21,
    date: 21,
    title: "Winter Wonderland",
    message: "You make every day feel like a winter wonderland! ❄️",
    image: "/images/day21.jpg",
  },
  {
    id: 22,
    date: 22,
    title: "Heart to Heart",
    message: "From my heart to yours, sending you all my love! 💕",
  },
  {
    id: 23,
    date: 23,
    title: "Christmas Eve Eve",
    message: "The excitement is building! Tomorrow is Christmas Eve! 🎁",
  },
  {
    id: 24,
    date: 24,
    title: "Christmas Eve",
    message: "Merry Christmas Eve, my love! This has been such a special journey. Thank you for being the most amazing person. I love you! ❤️🎄✨",
    image: "/images/day24.jpg",
    extra: "The biggest surprise of all is how much I love you!",
  },
];

