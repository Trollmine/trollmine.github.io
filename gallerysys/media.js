export function createMediaKey(file) {
	return `${file.name}|${file.size}|${file.lastModified}`;
}

export function fileSourceName(file) {
	const relative = file.webkitRelativePath || "";
	return relative.includes("/") ? relative.split("/")[0] : "Loose files";
}

export async function loadMediaFile(file) {
	const type = file.type.startsWith("video/") ? "video" : "image";
	const url = URL.createObjectURL(file);
	const key = createMediaKey(file);

	if (type === "video") {
		const video = document.createElement("video");
		video.preload = "metadata";
		video.muted = true;
		video.src = url;
		await new Promise((resolve, reject) => {
			video.onloadedmetadata = resolve;
			video.onerror = reject;
		});
		return {
			file, key, url, type, source: fileSourceName(file),
			width: video.videoWidth || 1920,
			height: video.videoHeight || 1080,
			ratio: (video.videoWidth || 1920) / (video.videoHeight || 1080),
			duration: video.duration || 0,
			hash: null,
			faces: 0
		};
	}

	const image = new Image();
	image.src = url;
	await image.decode();
	const media = {
		file, key, url, type, source: fileSourceName(file),
		width: image.naturalWidth,
		height: image.naturalHeight,
		ratio: image.naturalWidth / image.naturalHeight,
		hash: null,
		faces: 0
	};
	media.hash = await createAverageHash(image);
	return media;
}

export async function createAverageHash(image) {
	const canvas = document.createElement("canvas");
	canvas.width = 8;
	canvas.height = 8;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	context.drawImage(image, 0, 0, 8, 8);
	const data = context.getImageData(0, 0, 8, 8).data;
	const values = [];
	for (let index = 0; index < data.length; index += 4) {
		values.push((data[index] + data[index + 1] + data[index + 2]) / 3);
	}
	const average = values.reduce((sum, value) => sum + value, 0) / values.length;
	return values.map(value => value >= average ? "1" : "0").join("");
}

export function hammingDistance(first, second) {
	if (!first || !second || first.length !== second.length) return 64;
	let distance = 0;
	for (let index = 0; index < first.length; index++) {
		if (first[index] !== second[index]) distance++;
	}
	return distance;
}

export async function detectFaces(media) {
	if (media.type !== "image" || !("FaceDetector" in window)) return 0;
	try {
		const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 10 });
		const image = new Image();
		image.src = media.url;
		await image.decode();
		const faces = await detector.detect(image);
		media.faces = faces.length;
		return faces.length;
	} catch {
		return 0;
	}
}

export async function loadDrawable(media) {
	if (media.type === "video") {
		const video = document.createElement("video");
		video.src = media.url;
		video.muted = true;
		video.playsInline = true;
		video.preload = "auto";
		await new Promise((resolve, reject) => {
			video.onloadeddata = resolve;
			video.onerror = reject;
		});
		if (Number.isFinite(video.duration) && video.duration > 0.2) {
			video.currentTime = Math.min(0.2, video.duration / 4);
			await new Promise(resolve => {
				video.onseeked = resolve;
				setTimeout(resolve, 300);
			});
		}
		return video;
	}
	const image = new Image();
	image.src = media.url;
	await image.decode();
	return image;
}

export function revokeMedia(mediaList) {
	for (const media of mediaList) URL.revokeObjectURL(media.url);
}