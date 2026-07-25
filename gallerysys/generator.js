import { hammingDistance, loadDrawable } from "./media.js";
import { chooseLayout } from "./layouts.js";

export function seededRandom(seed) {
	let hash = 2166136261;
	for (let index = 0; index < String(seed).length; index++) {
		hash ^= String(seed).charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return () => {
		hash += 0x6D2B79F5;
		let value = hash;
		value = Math.imul(value ^ value >>> 15, value | 1);
		value ^= value + Math.imul(value ^ value >>> 7, value | 61);
		return ((value ^ value >>> 14) >>> 0) / 4294967296;
	};
}

export function randomSeed() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function shuffle(items, random) {
	const result = [...items];
	for (let index = result.length - 1; index > 0; index--) {
		const other = Math.floor(random() * (index + 1));
		[result[index], result[other]] = [result[other], result[index]];
	}
	return result;
}

function ratingBiasScore(media, data) {
	const ratings = data.ratings.filter(entry => entry.mediaKeys?.includes(media.key));
	if (!ratings.length) return 0;
	return ratings.reduce((sum, entry) => sum + (entry.rating || 0) - (entry.disliked ? 3 : 0), 0) / ratings.length;
}

export function selectMedia(mediaList, count, random, settings, data, recentlyUsed) {
	let pool = mediaList.filter(media => !data.excludedKeys.has(media.key));

	if (settings.duplicateDetection) {
		const unique = [];
		for (const media of pool) {
			const duplicate = unique.some(other =>
				media.type === "image" &&
				other.type === "image" &&
				hammingDistance(media.hash, other.hash) <= 5
			);
			if (!duplicate) unique.push(media);
		}
		pool = unique;
	}

	const preferred = pool.filter(media => data.preferredKeys.has(media.key));
	const regular = pool.filter(media => !data.preferredKeys.has(media.key));
	let ordered = shuffle(regular, random);

	if (settings.smartSelection) {
		const buckets = [
			ordered.filter(media => media.ratio < 0.85),
			ordered.filter(media => media.ratio >= 0.85 && media.ratio <= 1.25),
			ordered.filter(media => media.ratio > 1.25)
		];
		ordered = [];
		while (buckets.some(bucket => bucket.length)) {
			for (const bucket of buckets) {
				if (bucket.length) ordered.push(bucket.shift());
			}
		}
	}

	if (settings.preferUnused) {
		ordered.sort((first, second) =>
			(Number(recentlyUsed.has(first.key)) - Number(recentlyUsed.has(second.key))) +
			(random() - 0.5) * 0.2
		);
	}

	if (settings.bias) {
		ordered.sort((first, second) =>
			ratingBiasScore(second, data) - ratingBiasScore(first, data) +
			(random() - 0.5) * 0.4
		);
	}

	if (settings.avoidSimilar && ordered.length > 2) {
		const source = shuffle(ordered, random);
		const diverse = [];
		while (source.length) {
			if (!diverse.length) {
				diverse.push(source.splice(Math.floor(random() * source.length), 1)[0]);
				continue;
			}
			const previous = diverse[diverse.length - 1];
			let bestIndex = 0;
			let bestScore = -1;
			for (let index = 0; index < source.length; index++) {
				const score = Math.abs(source[index].ratio - previous.ratio) * (0.75 + random() * 0.5);
				if (score > bestScore) {
					bestScore = score;
					bestIndex = index;
				}
			}
			diverse.push(source.splice(bestIndex, 1)[0]);
		}
		ordered = diverse;
	}

	return [...shuffle(preferred, random), ...ordered].slice(0, Math.min(count, pool.length));
}

export function chooseSmartHero(items, settings) {
	if (!settings.smartHero) return items[0];
	return [...items].sort((first, second) => {
		const firstScore =
			Math.log2(first.width * first.height + 1) +
			(first.ratio > 1.2 ? 3 : 0) +
			(settings.faceAwareness && first.faces ? 2 : 0);
		const secondScore =
			Math.log2(second.width * second.height + 1) +
			(second.ratio > 1.2 ? 3 : 0) +
			(settings.faceAwareness && second.faces ? 2 : 0);
		return secondScore - firstScore;
	})[0];
}

function cover(context, drawable, x, y, width, height) {
	const sourceWidth = drawable.videoWidth || drawable.naturalWidth || drawable.width;
	const sourceHeight = drawable.videoHeight || drawable.naturalHeight || drawable.height;
	const scale = Math.max(width / sourceWidth, height / sourceHeight);
	const drawWidth = sourceWidth * scale;
	const drawHeight = sourceHeight * scale;
	context.drawImage(drawable, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function averageColor(drawables) {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d");
	let red = 0, green = 0, blue = 0, count = 0;
	for (const drawable of drawables.slice(0, 12)) {
		try {
			context.clearRect(0, 0, 1, 1);
			context.drawImage(drawable, 0, 0, 1, 1);
			const pixel = context.getImageData(0, 0, 1, 1).data;
			red += pixel[0]; green += pixel[1]; blue += pixel[2]; count++;
		} catch {}
	}
	return count ? `rgb(${Math.round(red/count)},${Math.round(green/count)},${Math.round(blue/count)})` : "#ffffff";
}

function roundedPath(context, x, y, width, height, radius) {
	const safe = Math.max(0, Math.min(radius, width / 2, height / 2));
	context.beginPath();
	context.roundRect(x, y, width, height, safe);
}

async function drawBackground(context, canvas, background, colors, drawables) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (background === "transparent") return;
	if (background === "black") context.fillStyle = "#000000";
	else if (background === "custom") context.fillStyle = colors.one;
	else if (background === "dominant") context.fillStyle = averageColor(drawables);
	else if (background === "gradient") {
		const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, colors.one);
		gradient.addColorStop(1, colors.two);
		context.fillStyle = gradient;
	} else if (background === "blurred") {
		const columns = Math.ceil(Math.sqrt(drawables.length * canvas.width / canvas.height));
		const rows = Math.ceil(drawables.length / columns);
		const cellWidth = canvas.width / columns;
		const cellHeight = canvas.height / rows;
		context.save();
		context.filter = `blur(${Math.max(25, Math.round(Math.min(canvas.width,canvas.height)*.035))}px)`;
		for (let index = 0; index < drawables.length; index++) {
			cover(context, drawables[index], (index % columns) * cellWidth, Math.floor(index / columns) * cellHeight, cellWidth, cellHeight);
		}
		context.restore();
		context.fillStyle = "rgba(0,0,0,.18)";
		context.fillRect(0, 0, canvas.width, canvas.height);
		return;
	} else context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
}

export async function generateWallpaper(options) {
	const { media, canvas, layoutName, background, colors, settings, data, customLayout, seed } = options;
	const random = seededRandom(seed);
	const context = canvas.getContext("2d", { alpha: true });
	const drawables = new Map();
	for (const item of media) drawables.set(item.key, await loadDrawable(item));
	await drawBackground(context, canvas, background, colors, [...drawables.values()]);

	const gap = Number(settings.gap) || 0;
	const padding = gap;
	const width = canvas.width - padding * 2;
	const height = canvas.height - padding * 2;
	const heroMedia = chooseSmartHero(media, settings);
	const leaves = chooseLayout(layoutName, media, width, height, random, { heroMedia, customLayout });
	const harmonyColor = settings.colorHarmony ? averageColor([...drawables.values()]) : null;

	for (const leaf of leaves) {
		const x = leaf.x + padding + gap / 2;
		const y = leaf.y + padding + gap / 2;
		const cellWidth = Math.max(1, leaf.width - gap);
		const cellHeight = Math.max(1, leaf.height - gap);
		const drawable = drawables.get(leaf.media.key);
		let border = settings.border === "none" ? 0 : Math.max(4, Math.min(cellWidth, cellHeight) * .012);
		let bottom = settings.border === "polaroid" ? border * 3 : 0;
		const borderColor = harmonyColor || (settings.border === "black" ? "#000000" : "#ffffff");

		if (settings.shadow) {
			context.save();
			context.shadowColor = harmonyColor || "rgba(0,0,0,.35)";
			context.shadowBlur = Math.max(8, Math.min(cellWidth, cellHeight) * .035);
			context.shadowOffsetY = 6;
			context.fillStyle = borderColor;
			roundedPath(context, x, y, cellWidth, cellHeight, settings.radius);
			context.fill();
			context.restore();
		}

		if (border > 0) {
			context.fillStyle = borderColor;
			roundedPath(context, x, y, cellWidth, cellHeight, settings.radius);
			context.fill();
		}

		const imageX = x + border;
		const imageY = y + border;
		const imageWidth = Math.max(1, cellWidth - border * 2);
		const imageHeight = Math.max(1, cellHeight - border * 2 - bottom);
		context.save();
		roundedPath(context, imageX, imageY, imageWidth, imageHeight, settings.radius);
		context.clip();
		cover(context, drawable, imageX, imageY, imageWidth, imageHeight);
		context.restore();
	}

	return { leaves, drawables, heroMedia };
}

export async function exportAnimatedWebM(options) {
	const { canvas, leaves, drawables, duration = 6, fps = 30 } = options;
	const context = canvas.getContext("2d");
	const stream = canvas.captureStream(fps);
	const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
	const chunks = [];
	recorder.ondataavailable = event => event.data.size && chunks.push(event.data);
	const stopped = new Promise(resolve => recorder.onstop = resolve);
	recorder.start();

	const start = performance.now();
	await new Promise(resolve => {
		function frame(now) {
			const elapsed = (now - start) / 1000;
			if (elapsed >= duration) return resolve();
			for (const drawable of drawables.values()) {
				if (drawable instanceof HTMLVideoElement && drawable.paused) drawable.play().catch(() => {});
			}
			requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	});
	recorder.stop();
	await stopped;
	for (const drawable of drawables.values()) {
		if (drawable instanceof HTMLVideoElement) drawable.pause();
	}
	return new Blob(chunks, { type: "video/webm" });
}