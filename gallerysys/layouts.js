function leaf(media, x, y, width, height) {
	return { media, x, y, width, height, locked: false };
}

function buildTree(items, random) {
	if (items.length === 1) return { item: items[0], ratio: items[0].ratio };
	const split = 1 + Math.floor(random() * (items.length - 1));
	const leftItems = items.slice(0, split);
	const rightItems = items.slice(split);
	const left = buildTree(leftItems, random);
	const right = buildTree(rightItems, random);
	const vertical = random() > 0.5;
	const ratio = vertical
		? left.ratio + right.ratio
		: 1 / (1 / left.ratio + 1 / right.ratio);
	return { left, right, vertical, ratio };
}

function placeTree(node, x, y, width, height, output) {
	if (node.item) {
		output.push(leaf(node.item, x, y, width, height));
		return;
	}
	if (node.vertical) {
		const leftWidth = width * node.left.ratio / (node.left.ratio + node.right.ratio);
		placeTree(node.left, x, y, leftWidth, height, output);
		placeTree(node.right, x + leftWidth, y, width - leftWidth, height, output);
	} else {
		const leftHeight = height * node.right.ratio / (node.left.ratio + node.right.ratio);
		placeTree(node.left, x, y, width, leftHeight, output);
		placeTree(node.right, x, y + leftHeight, width, height - leftHeight, output);
	}
}

export function balancedLayout(items, width, height, random) {
	const tree = buildTree(items, random);
	const leaves = [];
	placeTree(tree, 0, 0, width, height, leaves);
	return leaves;
}

export function chaoticLayout(items, width, height, random) {
	const shuffled = [...items].sort(() => random() - 0.5);
	return balancedLayout(shuffled, width, height, random);
}

export function gridLayout(items, width, height) {
	const columns = Math.ceil(Math.sqrt(items.length * width / height));
	const rows = Math.ceil(items.length / columns);
	const cellWidth = width / columns;
	const cellHeight = height / rows;
	return items.map((media, index) => leaf(
		media,
		(index % columns) * cellWidth,
		Math.floor(index / columns) * cellHeight,
		cellWidth,
		cellHeight
	));
}

export function heroLayout(items, width, height, random, heroMedia = null) {
	const hero = heroMedia || items[0];
	const others = items.filter(item => item !== hero);
	const heroWidth = width * 0.48;
	const leaves = [leaf(hero, 0, 0, heroWidth, height)];
	if (others.length) {
		for (const item of balancedLayout(others, width - heroWidth, height, random)) {
			leaves.push({ ...item, x: item.x + heroWidth });
		}
	}
	return leaves;
}

export function customGridLayout(items, width, height, layout) {
	const columns = Math.max(1, layout.columns);
	const rows = Math.max(1, layout.rows);
	const cellWidth = width / columns;
	const cellHeight = height / rows;
	return items.slice(0, columns * rows).map((media, index) => leaf(
		media,
		(index % columns) * cellWidth,
		Math.floor(index / columns) * cellHeight,
		cellWidth,
		cellHeight
	));
}

export function chooseLayout(name, items, width, height, random, options = {}) {
	if (name === "grid") return gridLayout(items, width, height);
	if (name === "hero") return heroLayout(items, width, height, random, options.heroMedia);
	if (name === "chaotic") return chaoticLayout(items, width, height, random);
	if (name.startsWith("custom:") && options.customLayout) {
		return customGridLayout(items, width, height, options.customLayout);
	}
	return balancedLayout(items, width, height, random);
}