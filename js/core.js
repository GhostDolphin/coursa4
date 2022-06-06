const CARD_TEMPLATE = `<tr class="up num"><td><span></span></td></tr><tr class="up suit"><td><span></span></td></tr><tr class="mid"><td></td></tr><tr class="down suit"><td><span></span></td></tr><tr class="down num"><td><span></span></td></tr>`;

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const defCards = () => {
	const range = ['J', 'Q', 'K', 'A'],
	suits = [
		'heart',
		'diamond',
		'spade',
		'club'
	],
	cards = [];
	for (let i = 10; i >= 2; i--)
		range.unshift(i);
	for (const suit of suits)
		for (const val of range)
			cards.push({ suit: suit, value: val });
	return cards;
};

const shuffle = (cards) => {
	const deck = cards,
	len = cards.length;
	for (let i = 0; i < len; i++) {
		const num = getRandom(i, len - 1);
		const temp = deck[i];
		deck[i] = deck[num];
		deck[num] = temp;
	}
	return deck;
};
