export const defaultSettings = {
	smartSelection: false,
	preferUnused: false,
	avoidSimilar: false,
	duplicateDetection: false,
	faceAwareness: false,
	smartHero: true,
	colorHarmony: false,
	ratings: true,
	bias: false,
	history: true,
	animated: true,
	editor: true,
	resolution: "2560x1440",
	gap: 8,
	radius: 0,
	border: "none",
	shadow: false
};

const SETTINGS_KEY = "tmg-modular-settings-v1";
const DATA_KEY = "tmg-modular-data-v1";

export function loadSettings() {
	try {
		return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
	} catch {
		return { ...defaultSettings };
	}
}

export function saveSettings(settings) {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadPersistentData() {
	try {
		return {
			customLayouts: [],
			collections: [],
			ratings: [],
			preferredKeys: [],
			excludedKeys: [],
			...JSON.parse(localStorage.getItem(DATA_KEY) || "{}")
		};
	} catch {
		return { customLayouts: [], collections: [], ratings: [], preferredKeys: [], excludedKeys: [] };
	}
}

export function savePersistentData(data) {
	const serializable = {
		customLayouts: data.customLayouts,
		collections: data.collections,
		ratings: data.ratings,
		preferredKeys: [...data.preferredKeys],
		excludedKeys: [...data.excludedKeys]
	};
	localStorage.setItem(DATA_KEY, JSON.stringify(serializable));
}

export function encodeSettingsCode(settings) {
	const bytes = new TextEncoder().encode(JSON.stringify(settings));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return `TMG3-${btoa(binary)}`;
}

export function decodeSettingsCode(code) {
	const clean = code.trim();
	if (!clean.startsWith("TMG3-")) throw new Error("Invalid TMG3 settings code.");
	const binary = atob(clean.slice(5));
	const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
	return JSON.parse(new TextDecoder().decode(bytes));
}

export function downloadJson(filename, value) {
	const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}