import {
	defaultSettings, loadSettings, saveSettings, loadPersistentData, savePersistentData,
	encodeSettingsCode, decodeSettingsCode, downloadJson
} from "./storage.js";
import { loadMediaFile, detectFaces, revokeMedia } from "./media.js";
import {
	generateWallpaper, exportAnimatedWebM, randomSeed, seededRandom, selectMedia
} from "./generator.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

let settings = loadSettings();
const storedData = loadPersistentData();
const data = {
	...storedData,
	preferredKeys: new Set(storedData.preferredKeys || []),
	excludedKeys: new Set(storedData.excludedKeys || [])
};

let mediaList = [];
let recentlyUsed = new Set();
let currentGeneration = null;
let generatedBlob = null;
let editorEnabled = false;
let selectedEditorCell = null;
let toastTimer = null;

const elements = {
	folderInput: $("#folderInput"),
	fileInput: $("#fileInput"),
	galleryGrid: $("#galleryGrid"),
	gallerySummary: $("#gallerySummary"),
	sourceList: $("#sourceList"),
	previewCanvas: $("#previewCanvas"),
	previewInfo: $("#previewInfo"),
	editorOverlay: $("#editorOverlay"),
	photoCount: $("#photoCountInput"),
	seed: $("#seedInput"),
	layout: $("#layoutSelect"),
	background: $("#backgroundSelect"),
	colorOne: $("#backgroundColorOne"),
	colorTwo: $("#backgroundColorTwo"),
	useCustomLayouts: $("#useCustomLayoutsInput"),
	preferenceBias: $("#preferenceBiasInput"),
	download: $("#downloadButton"),
	downloadAnimated: $("#downloadAnimatedButton"),
	toggleEditor: $("#toggleEditorButton"),
	regenerateUnlocked: $("#regenerateUnlockedButton"),
	devicePreview: $("#devicePreviewButton"),
	ratingPanel: $("#ratingPanel"),
	collectionsGrid: $("#collectionsGrid"),
	customLayoutsGrid: $("#customLayoutsGrid")
};

function toast(message) {
	const node = $("#toast");
	node.textContent = message;
	node.classList.add("visible");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => node.classList.remove("visible"), 2400);
}

function openModal(id) {
	const modal = document.getElementById(id);
	modal.classList.add("visible");
	modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
	const modal = document.getElementById(id);
	modal.classList.remove("visible");
	modal.setAttribute("aria-hidden", "true");
}

function persistData() {
	savePersistentData(data);
}

function setTab(name) {
	$$(".tab").forEach(button => button.classList.toggle("active", button.dataset.tab === name));
	$$(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === `${name}Tab`));
}

function renderSources() {
	const sourceCounts = new Map();
	for (const media of mediaList) sourceCounts.set(media.source, (sourceCounts.get(media.source) || 0) + 1);
	elements.sourceList.replaceChildren();
	for (const [source, count] of sourceCounts) {
		const chip = document.createElement("div");
		chip.className = "source-chip";
		chip.innerHTML = `<span>${source} (${count})</span>`;
		const remove = document.createElement("button");
		remove.type = "button";
		remove.textContent = "×";
		remove.addEventListener("click", () => {
			const removed = mediaList.filter(media => media.source === source);
			removed.forEach(media => URL.revokeObjectURL(media.url));
			mediaList = mediaList.filter(media => media.source !== source);
			renderGallery();
		});
		chip.appendChild(remove);
		elements.sourceList.appendChild(chip);
	}
}

function renderGallery() {
	elements.galleryGrid.replaceChildren();
	for (const media of mediaList) {
		const card = document.createElement("article");
		card.className = "media-card";
		card.classList.toggle("preferred", data.preferredKeys.has(media.key));
		card.classList.toggle("excluded", data.excludedKeys.has(media.key));

		let visual;
		if (media.type === "video") {
			visual = document.createElement("video");
			visual.src = media.url;
			visual.muted = true;
			visual.loop = true;
			visual.playsInline = true;
			visual.addEventListener("click", () => visual.paused ? visual.play() : visual.pause());
		} else {
			visual = document.createElement("img");
			visual.src = media.url;
			visual.alt = media.file.name;
			visual.loading = "lazy";
		}
		card.appendChild(visual);

		const badge = document.createElement("span");
		badge.className = "media-badge";
		badge.textContent = media.type === "video" ? "VIDEO • click to play/pause" : media.file.name;
		card.appendChild(badge);

		const actions = document.createElement("div");
		actions.className = "media-actions";
		const prefer = document.createElement("button");
		prefer.type = "button";
		prefer.title = "Prefer";
		prefer.textContent = "★";
		prefer.addEventListener("click", event => {
			event.stopPropagation();
			if (data.excludedKeys.has(media.key)) data.excludedKeys.delete(media.key);
			data.preferredKeys.has(media.key) ? data.preferredKeys.delete(media.key) : data.preferredKeys.add(media.key);
			persistData();
			renderGallery();
		});
		const exclude = document.createElement("button");
		exclude.type = "button";
		exclude.title = "Exclude";
		exclude.textContent = "×";
		exclude.addEventListener("click", event => {
			event.stopPropagation();
			if (data.excludedKeys.has(media.key)) data.excludedKeys.delete(media.key);
			else {
				data.excludedKeys.add(media.key);
				data.preferredKeys.delete(media.key);
			}
			persistData();
			renderGallery();
		});
		actions.append(prefer, exclude);
		card.appendChild(actions);

		card.addEventListener("click", event => {
			if (!event.shiftKey || event.target.closest(".media-actions")) return;
			event.preventDefault();
			if (data.excludedKeys.has(media.key)) return;
			data.preferredKeys.has(media.key) ? data.preferredKeys.delete(media.key) : data.preferredKeys.add(media.key);
			persistData();
			renderGallery();
		});

		elements.galleryGrid.appendChild(card);
	}

	const images = mediaList.filter(media => media.type === "image").length;
	const videos = mediaList.filter(media => media.type === "video").length;
	elements.gallerySummary.textContent = mediaList.length
		? `${images} image${images === 1 ? "" : "s"}, ${videos} video${videos === 1 ? "" : "s"} across ${new Set(mediaList.map(media => media.source)).size} source folder${new Set(mediaList.map(media => media.source)).size === 1 ? "" : "s"}.`
		: "No folders selected.";
	renderSources();
}

async function addFiles(fileList) {
	const files = [...fileList].filter(file => file.type.startsWith("image/") || file.type.startsWith("video/"));
	if (!files.length) return toast("No supported images or videos were selected.");
	toast(`Loading ${files.length} file${files.length === 1 ? "" : "s"}…`);
	for (const file of files) {
		try {
			const media = await loadMediaFile(file);
			if (!mediaList.some(existing => existing.key === media.key)) {
				mediaList.push(media);
				if (settings.faceAwareness) detectFaces(media);
			} else {
				URL.revokeObjectURL(media.url);
			}
		} catch (error) {
			console.warn("Could not load", file.name, error);
		}
	}
	renderGallery();
	toast("Media loaded.");
}

function resolution() {
	const [width, height] = settings.resolution.split("x").map(Number);
	return { width, height };
}

function chooseLayoutName(random) {
	const enabledCustom = data.customLayouts.filter(layout => layout.enabled);
	if (elements.useCustomLayouts.checked && enabledCustom.length && random() < 0.45) {
		const custom = enabledCustom[Math.floor(random() * enabledCustom.length)];
		return { name: `custom:${custom.id}`, custom };
	}
	let requested = elements.layout.value;
	if (settings.bias && elements.preferenceBias.checked && data.ratings.length) {
		const positive = data.ratings.filter(entry => entry.rating >= 4 && !entry.disliked);
		if (positive.length && random() < 0.45) {
			requested = positive[Math.floor(random() * positive.length)].layout || requested;
		}
	}
	return { name: requested, custom: null };
}

async function generate(remake = false) {
	if (!mediaList.length) return toast("Add images or videos first.");
	const count = Math.max(1, Math.min(Number(elements.photoCount.value) || 18, mediaList.length));
	if (remake || !elements.seed.value.trim()) elements.seed.value = randomSeed();
	const seed = elements.seed.value.trim();
	const random = seededRandom(seed);
	const selected = selectMedia(mediaList, count, random, { ...settings, bias: settings.bias && elements.preferenceBias.checked }, data, recentlyUsed);
	if (!selected.length) return toast("Every available media item is excluded.");

	const { width, height } = resolution();
	elements.previewCanvas.width = width;
	elements.previewCanvas.height = height;
	const layoutChoice = chooseLayoutName(random);

	$("#generateButton").disabled = true;
	$("#remakeButton").disabled = true;
	elements.previewInfo.textContent = "Generating…";

	try {
		currentGeneration = await generateWallpaper({
			media: selected,
			canvas: elements.previewCanvas,
			layoutName: layoutChoice.name,
			background: elements.background.value,
			colors: { one: elements.colorOne.value, two: elements.colorTwo.value },
			settings,
			data,
			customLayout: layoutChoice.custom,
			seed
		});
		currentGeneration.media = selected;
		currentGeneration.seed = seed;
		currentGeneration.layoutName = layoutChoice.name;
		currentGeneration.background = elements.background.value;
		currentGeneration.customLayout = layoutChoice.custom;
		selected.forEach(media => recentlyUsed.add(media.key));
		generatedBlob = await new Promise(resolve => elements.previewCanvas.toBlob(resolve, "image/png"));
		elements.previewInfo.textContent = `${width} × ${height} • ${selected.length} media items • ${layoutChoice.custom?.name || layoutChoice.name} • Seed ${seed}`;
		elements.download.disabled = false;
		elements.downloadAnimated.disabled = !settings.animated;
		elements.toggleEditor.disabled = !settings.editor;
		elements.regenerateUnlocked.disabled = !settings.editor;
		elements.devicePreview.disabled = false;
		elements.ratingPanel.classList.toggle("hidden", !settings.ratings);
		renderEditor();
		renderRatingStars();
		if (settings.history) addToCollection("History", true);
	} catch (error) {
		console.error(error);
		toast(error.message || "The wallpaper could not be generated.");
		elements.previewInfo.textContent = "Generation failed.";
	} finally {
		$("#generateButton").disabled = false;
		$("#remakeButton").disabled = false;
	}
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderEditor() {
	elements.editorOverlay.replaceChildren();
	if (!currentGeneration) return;
	const canvasRect = elements.previewCanvas.getBoundingClientRect();
	const shellRect = elements.editorOverlay.getBoundingClientRect();
	const scaleX = canvasRect.width / elements.previewCanvas.width;
	const scaleY = canvasRect.height / elements.previewCanvas.height;
	const offsetX = canvasRect.left - shellRect.left;
	const offsetY = canvasRect.top - shellRect.top;

	currentGeneration.leaves.forEach((leaf, index) => {
		const cell = document.createElement("div");
		cell.className = "editor-cell";
		cell.classList.toggle("locked", leaf.locked);
		Object.assign(cell.style, {
			left: `${offsetX + leaf.x * scaleX}px`,
			top: `${offsetY + leaf.y * scaleY}px`,
			width: `${leaf.width * scaleX}px`,
			height: `${leaf.height * scaleY}px`
		});
		cell.innerHTML = `<span>${index + 1}</span>`;
		const lock = document.createElement("button");
		lock.type = "button";
		lock.textContent = leaf.locked ? "🔒" : "🔓";
		lock.addEventListener("click", event => {
			event.stopPropagation();
			leaf.locked = !leaf.locked;
			renderEditor();
		});
		cell.appendChild(lock);
		cell.addEventListener("click", () => {
			if (selectedEditorCell === null) {
				selectedEditorCell = index;
				cell.style.background = "rgba(255,213,79,.28)";
				return;
			}
			if (selectedEditorCell !== index) {
				const first = currentGeneration.leaves[selectedEditorCell];
				[first.media, leaf.media] = [leaf.media, first.media];
				selectedEditorCell = null;
				redrawCurrent();
			}
		});
		elements.editorOverlay.appendChild(cell);
	});
	elements.editorOverlay.classList.toggle("active", editorEnabled);
}

async function redrawCurrent() {
	if (!currentGeneration) return;
	const orderedMedia = currentGeneration.leaves.map(leaf => leaf.media);
	currentGeneration = await generateWallpaper({
		media: orderedMedia,
		canvas: elements.previewCanvas,
		layoutName: currentGeneration.layoutName,
		background: currentGeneration.background,
		colors: { one: elements.colorOne.value, two: elements.colorTwo.value },
		settings,
		data,
		customLayout: currentGeneration.customLayout,
		seed: currentGeneration.seed
	});
	currentGeneration.media = orderedMedia;
	currentGeneration.seed = elements.seed.value;
	currentGeneration.layoutName = currentGeneration.layoutName || elements.layout.value;
	currentGeneration.background = elements.background.value;
	generatedBlob = await new Promise(resolve => elements.previewCanvas.toBlob(resolve, "image/png"));
	renderEditor();
}

async function regenerateUnlocked() {
	if (!currentGeneration) return;
	const lockedKeys = new Set(currentGeneration.leaves.filter(leaf => leaf.locked).map(leaf => leaf.media.key));
	const pool = mediaList.filter(media => !lockedKeys.has(media.key) && !data.excludedKeys.has(media.key));
	const random = seededRandom(randomSeed());
	for (const leaf of currentGeneration.leaves) {
		if (!leaf.locked && pool.length) {
			leaf.media = pool.splice(Math.floor(random() * pool.length), 1)[0];
		}
	}
	await redrawCurrent();
}

function renderRatingStars() {
	const container = $("#ratingStars");
	container.replaceChildren();
	for (let rating = 1; rating <= 5; rating++) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = "★";
		button.title = `${rating} stars`;
		button.addEventListener("click", () => rateCurrent(rating, false));
		container.appendChild(button);
	}
}

function rateCurrent(rating, disliked) {
	if (!currentGeneration) return;
	data.ratings.push({
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		rating,
		disliked,
		layout: currentGeneration.layoutName,
		background: currentGeneration.background,
		mediaKeys: currentGeneration.media.map(media => media.key)
	});
	persistData();
	toast(disliked ? "Marked as disliked." : `Rated ${rating} star${rating === 1 ? "" : "s"}.`);
}

function createCollection(name) {
	const trimmed = name.trim();
	if (!trimmed) return;
	if (data.collections.some(collection => collection.name.toLowerCase() === trimmed.toLowerCase())) return toast("That collection already exists.");
	data.collections.push({ id: crypto.randomUUID(), name: trimmed, items: [] });
	persistData();
	renderCollections();
}

function addToCollection(name, silent = false) {
	if (!currentGeneration || !generatedBlob) return;
	let collection = data.collections.find(entry => entry.name === name);
	if (!collection) {
		collection = { id: crypto.randomUUID(), name, items: [] };
		data.collections.push(collection);
	}
	const thumbnail = elements.previewCanvas.toDataURL("image/jpeg", .72);
	collection.items.unshift({
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		thumbnail,
		seed: currentGeneration.seed,
		layout: currentGeneration.layoutName,
		background: currentGeneration.background,
		rating: 0
	});
	collection.items = collection.items.slice(0, 24);
	persistData();
	renderCollections();
	if (!silent) toast(`Added to ${name}.`);
}

function renderCollections() {
	elements.collectionsGrid.replaceChildren();
	for (const collection of data.collections) {
		const card = document.createElement("article");
		card.className = "card";
		card.innerHTML = `<h3>${collection.name}</h3><p>${collection.items.length} wallpaper${collection.items.length === 1 ? "" : "s"}</p>`;
		if (collection.items[0]) {
			const image = document.createElement("img");
			image.src = collection.items[0].thumbnail;
			card.appendChild(image);
		}
		const footer = document.createElement("div");
		footer.className = "card-footer";
		const deleteButton = document.createElement("button");
		deleteButton.className = "button small danger";
		deleteButton.textContent = "Delete";
		deleteButton.addEventListener("click", () => {
			data.collections = data.collections.filter(entry => entry.id !== collection.id);
			persistData();
			renderCollections();
		});
		footer.append(document.createElement("span"), deleteButton);
		card.appendChild(footer);
		elements.collectionsGrid.appendChild(card);
	}
}

function createCustomLayout() {
	const name = $("#layoutNameInput").value.trim() || "My layout";
	const columns = Math.max(1, Math.min(8, Number($("#layoutColumnsInput").value) || 3));
	const rows = Math.max(1, Math.min(8, Number($("#layoutRowsInput").value) || 2));
	data.customLayouts.push({ id: crypto.randomUUID(), name, columns, rows, enabled: true });
	persistData();
	renderCustomLayouts();
}

function renderCustomLayouts() {
	elements.customLayoutsGrid.replaceChildren();
	for (const layout of data.customLayouts) {
		const card = document.createElement("article");
		card.className = "card";
		card.innerHTML = `<h3>${layout.name}</h3><p>${layout.columns} columns × ${layout.rows} rows</p>`;
		const footer = document.createElement("div");
		footer.className = "card-footer";
		const toggle = document.createElement("label");
		toggle.className = "check-row";
		toggle.innerHTML = `<input type="checkbox" ${layout.enabled ? "checked" : ""}> Enabled`;
		toggle.querySelector("input").addEventListener("change", event => {
			layout.enabled = event.target.checked;
			persistData();
		});
		const copy = document.createElement("button");
		copy.className = "button small";
		copy.textContent = "Copy code";
		copy.addEventListener("click", async () => {
			await navigator.clipboard.writeText(`TMGLAYOUT1-${btoa(JSON.stringify(layout))}`);
			toast("Layout code copied.");
		});
		const remove = document.createElement("button");
		remove.className = "button small danger";
		remove.textContent = "Delete";
		remove.addEventListener("click", () => {
			data.customLayouts = data.customLayouts.filter(entry => entry.id !== layout.id);
			persistData();
			renderCustomLayouts();
		});
		footer.append(toggle, copy, remove);
		card.appendChild(footer);
		elements.customLayoutsGrid.appendChild(card);
	}
}

function fillSettingsForm() {
	const map = {
		smartSelection: "#smartSelectionSetting",
		preferUnused: "#preferUnusedSetting",
		avoidSimilar: "#avoidSimilarSetting",
		duplicateDetection: "#duplicateDetectionSetting",
		faceAwareness: "#faceAwarenessSetting",
		smartHero: "#smartHeroSetting",
		colorHarmony: "#colorHarmonySetting",
		ratings: "#ratingsSetting",
		bias: "#biasSetting",
		history: "#historySetting",
		animated: "#animatedSetting",
		editor: "#editorSetting",
		shadow: "#shadowSetting"
	};
	for (const [key, selector] of Object.entries(map)) $(selector).checked = Boolean(settings[key]);
	$("#resolutionSetting").value = settings.resolution;
	$("#gapSetting").value = settings.gap;
	$("#radiusSetting").value = settings.radius;
	$("#borderSetting").value = settings.border;
}

function saveSettingsFromForm() {
	const map = {
		smartSelection: "#smartSelectionSetting",
		preferUnused: "#preferUnusedSetting",
		avoidSimilar: "#avoidSimilarSetting",
		duplicateDetection: "#duplicateDetectionSetting",
		faceAwareness: "#faceAwarenessSetting",
		smartHero: "#smartHeroSetting",
		colorHarmony: "#colorHarmonySetting",
		ratings: "#ratingsSetting",
		bias: "#biasSetting",
		history: "#historySetting",
		animated: "#animatedSetting",
		editor: "#editorSetting",
		shadow: "#shadowSetting"
	};
	for (const [key, selector] of Object.entries(map)) settings[key] = $(selector).checked;
	settings.resolution = $("#resolutionSetting").value;
	settings.gap = Math.max(0, Math.min(80, Number($("#gapSetting").value) || 0));
	settings.radius = Math.max(0, Math.min(80, Number($("#radiusSetting").value) || 0));
	settings.border = $("#borderSetting").value;
	saveSettings(settings);
	elements.preferenceBias.checked = settings.bias;
	closeModal("settingsModal");
	toast("Settings saved.");
}

function renderDevicePreview(device = "monitor") {
	const stage = $("#deviceStage");
	const url = elements.previewCanvas.toDataURL("image/png");
	stage.replaceChildren();
	if (device === "dual") {
		const wrap = document.createElement("div");
		wrap.className = "dual-wrap";
		for (let index = 0; index < 2; index++) {
			const monitor = document.createElement("div");
			monitor.className = "device-monitor";
			monitor.innerHTML = `<img src="${url}" alt="Dual monitor preview">`;
			wrap.appendChild(monitor);
		}
		stage.appendChild(wrap);
		return;
	}
	const shell = document.createElement("div");
	shell.className = device === "phone" ? "device-phone" : `device-monitor ${device === "ultrawide" ? "ultrawide" : ""}`;
	shell.innerHTML = `<img src="${url}" alt="${device} preview">`;
	stage.appendChild(shell);
}

function exportProject() {
	const project = {
		version: 1,
		createdAt: new Date().toISOString(),
		settings,
		data: {
			customLayouts: data.customLayouts,
			collections: data.collections,
			ratings: data.ratings,
			preferredKeys: [...data.preferredKeys],
			excludedKeys: [...data.excludedKeys]
		},
		mediaManifest: mediaList.map(media => ({
			key: media.key, name: media.file.name, size: media.file.size,
			lastModified: media.file.lastModified, source: media.source, type: media.type
		}))
	};
	downloadJson("trollmine-project.tmgproject", project);
}

async function importProject(file) {
	try {
		const project = JSON.parse(await file.text());
		settings = { ...defaultSettings, ...(project.settings || {}) };
		data.customLayouts = project.data?.customLayouts || [];
		data.collections = project.data?.collections || [];
		data.ratings = project.data?.ratings || [];
		data.preferredKeys = new Set(project.data?.preferredKeys || []);
		data.excludedKeys = new Set(project.data?.excludedKeys || []);
		saveSettings(settings);
		persistData();
		fillSettingsForm();
		renderGallery();
		renderCollections();
		renderCustomLayouts();
		toast("Project imported. Re-add the original folders to reconnect local files.");
	} catch {
		toast("That project file is invalid.");
	}
}

$$(".tab").forEach(button => button.addEventListener("click", () => setTab(button.dataset.tab)));
elements.folderInput.addEventListener("change", event => addFiles(event.target.files));
elements.fileInput.addEventListener("change", event => addFiles(event.target.files));
$("#clearGalleryButton").addEventListener("click", () => {
	revokeMedia(mediaList);
	mediaList = [];
	renderGallery();
});
$("#generateButton").addEventListener("click", () => generate(false));
$("#remakeButton").addEventListener("click", () => generate(true));
elements.download.addEventListener("click", () => generatedBlob && downloadBlob(generatedBlob, `wallpaper-${currentGeneration.seed}.png`));
elements.downloadAnimated.addEventListener("click", async () => {
	if (!currentGeneration) return;
	toast("Rendering animated WebM…");
	try {
		const blob = await exportAnimatedWebM({
			canvas: elements.previewCanvas,
			leaves: currentGeneration.leaves,
			drawables: currentGeneration.drawables
		});
		downloadBlob(blob, `wallpaper-${currentGeneration.seed}.webm`);
	} catch (error) {
		console.error(error);
		toast("Animated export is not supported by this browser.");
	}
});
elements.toggleEditor.addEventListener("click", () => {
	editorEnabled = !editorEnabled;
	elements.editorOverlay.classList.toggle("active", editorEnabled);
	elements.toggleEditor.textContent = editorEnabled ? "Finish editing" : "Edit layout";
});
elements.regenerateUnlocked.addEventListener("click", regenerateUnlocked);
elements.devicePreview.addEventListener("click", () => {
	renderDevicePreview("monitor");
	openModal("deviceModal");
});
$("#favoriteCurrentButton").addEventListener("click", () => addToCollection("Favorites"));
$("#dislikeCurrentButton").addEventListener("click", () => rateCurrent(0, true));
$("#createCollectionButton").addEventListener("click", () => {
	createCollection($("#newCollectionName").value);
	$("#newCollectionName").value = "";
});
$("#createLayoutButton").addEventListener("click", createCustomLayout);
$("#importLayoutButton").addEventListener("click", () => {
	const code = prompt("Paste a TMGLAYOUT1 code:");
	if (!code) return;
	try {
		if (!code.startsWith("TMGLAYOUT1-")) throw new Error();
		const layout = JSON.parse(atob(code.slice(11)));
		data.customLayouts.push({ ...layout, id: crypto.randomUUID() });
		persistData();
		renderCustomLayouts();
	} catch {
		toast("Invalid layout code.");
	}
});
$("#openSettingsButton").addEventListener("click", () => {
	fillSettingsForm();
	openModal("settingsModal");
});
$("#saveSettingsButton").addEventListener("click", saveSettingsFromForm);
$("#resetSettingsButton").addEventListener("click", () => {
	settings = { ...defaultSettings };
	saveSettings(settings);
	fillSettingsForm();
	toast("Settings reset.");
});
$$("[data-close-modal]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.closeModal)));
$$(".modal").forEach(modal => modal.addEventListener("click", event => {
	if (event.target === modal) closeModal(modal.id);
}));
$$(".device-option").forEach(button => button.addEventListener("click", () => {
	$$(".device-option").forEach(option => option.classList.toggle("active", option === button));
	renderDevicePreview(button.dataset.device);
}));
$("#exportProjectButton").addEventListener("click", exportProject);
$("#importProjectInput").addEventListener("change", event => event.target.files[0] && importProject(event.target.files[0]));
$("#exportSettingsCodeButton").addEventListener("click", async () => {
	await navigator.clipboard.writeText(encodeSettingsCode(settings));
	toast("Settings code copied.");
});
$("#importSettingsCodeButton").addEventListener("click", () => {
	const code = prompt("Paste a TMG3 settings code:");
	if (!code) return;
	try {
		settings = { ...defaultSettings, ...decodeSettingsCode(code) };
		saveSettings(settings);
		fillSettingsForm();
		toast("Settings applied and saved.");
	} catch (error) {
		toast(error.message);
	}
});

window.addEventListener("resize", () => editorEnabled && renderEditor());

elements.seed.value = randomSeed();
elements.preferenceBias.checked = settings.bias;
fillSettingsForm();
renderGallery();
renderCollections();
renderCustomLayouts();
renderRatingStars();