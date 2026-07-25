const settingsCodeMarkup = `
			<div class="settings-code-box">
				<p class="generator-section-title" style="margin-bottom:5px;">Settings code</p>
				<p class="generator-settings-description">Copy this code to share every generator setting with a friend.</p>
				<textarea id="settingsCodeText" spellcheck="false" placeholder="Generate or paste a settings code here"></textarea>
				<div class="settings-code-actions">
					<button id="generateSettingsCodeButton" class="small-settings-button" type="button">Generate code</button>
					<button id="copySettingsCodeButton" class="small-settings-button secondary" type="button">Copy</button>
					<button id="applySettingsCodeButton" class="small-settings-button secondary" type="button">Apply code</button>
				</div>
			</div>
		`;

		advancedElements.body.insertAdjacentHTML(
			"beforeend",
			settingsCodeMarkup
		);

		const settingsCodeText = document.getElementById("settingsCodeText");
		const wallpaperHistoryOverlay = document.getElementById("wallpaperHistoryOverlay");
		const wallpaperHistoryGrid = document.getElementById("wallpaperHistoryGrid");
		const wallpaperHistoryCount = document.getElementById("wallpaperHistoryCount");

		function encodeSettingsCode(settings) {
			const json = JSON.stringify(settings);
			const bytes = new TextEncoder().encode(json);
			let binary = "";

			for (const byte of bytes) {
				binary += String.fromCharCode(byte);
			}

			return `TMG2-${btoa(binary)}`;
		}

		function decodeSettingsCode(code) {
			const cleanCode = code.trim();

			if (!cleanCode.startsWith("TMG2-")) {
				throw new Error("This is not a valid TMG2 settings code.");
			}

			const binary = atob(cleanCode.slice(5));
			const bytes = Uint8Array.from(
				binary,
				character => character.charCodeAt(0)
			);

			return JSON.parse(new TextDecoder().decode(bytes));
		}

		function applySettingsToControls(settings) {
			Object.assign(savedGeneratorSettings, advancedDefaults, settings);
			persistGeneratorSettings();
			openGeneratorSettings();
		}

		document.getElementById("generateSettingsCodeButton").addEventListener("click", () => {
			saveGeneratorSettings();
			settingsCodeText.value = encodeSettingsCode(savedGeneratorSettings);
			openGeneratorSettings();
			settingsCodeText.focus();
			settingsCodeText.select();
		});

		document.getElementById("copySettingsCodeButton").addEventListener("click", async () => {
			if (!settingsCodeText.value.trim()) {
				settingsCodeText.value = encodeSettingsCode(savedGeneratorSettings);
			}

			try {
				await navigator.clipboard.writeText(settingsCodeText.value.trim());
				showGalleryToast("Settings code copied.");
			} catch (error) {
				settingsCodeText.focus();
				settingsCodeText.select();
				document.execCommand("copy");
				showGalleryToast("Settings code copied.");
			}
		});

		document.getElementById("applySettingsCodeButton").addEventListener("click", () => {
			try {
				const importedSettings = decodeSettingsCode(settingsCodeText.value);
				applySettingsToControls(importedSettings);
				showGalleryToast("Settings code applied and saved.");
			} catch (error) {
				showGalleryToast(error.message || "The settings code is invalid.");
			}
		});

		function openWallpaperHistory() {
			wallpaperHistoryGrid.replaceChildren();
			wallpaperHistoryCount.textContent =
				`${sessionGenerationHistory.length} saved generation${sessionGenerationHistory.length === 1 ? "" : "s"} this session`;

			if (sessionGenerationHistory.length === 0) {
				const empty = document.createElement("p");
				empty.textContent = "No generated wallpapers are in the history yet.";
				empty.style.gridColumn = "1 / -1";
				empty.style.textAlign = "center";
				empty.style.padding = "40px";
				wallpaperHistoryGrid.appendChild(empty);
			}

			[...sessionGenerationHistory].reverse().forEach((entry, reverseIndex) => {
				const originalIndex =
					sessionGenerationHistory.length - 1 - reverseIndex;

				const item = document.createElement("div");
				item.className = "history-item";

				const image = document.createElement("img");
				image.src = entry.historyUrl;

				const footer = document.createElement("div");
				footer.className = "history-item-footer";

				const information = document.createElement("span");
				information.textContent =
					`${entry.width}×${entry.height} • ${entry.count} photos`;

				const useButton = document.createElement("button");
				useButton.type = "button";
				useButton.className = "small-settings-button";
				useButton.textContent = "Use";
				useButton.addEventListener("click", () => {
					const currentEntry = sessionGenerationHistory[originalIndex];

					showAdvancedWallpaperPreview([{
						...currentEntry,
						blob: currentEntry.blob
					}]);

					closeWallpaperHistory();
				});

				footer.append(information, useButton);
				item.append(image, footer);
				wallpaperHistoryGrid.appendChild(item);
			});

			wallpaperHistoryOverlay.classList.add("visible");
			wallpaperHistoryOverlay.setAttribute("aria-hidden", "false");
		}

		function closeWallpaperHistory() {
			wallpaperHistoryOverlay.classList.remove("visible");
			wallpaperHistoryOverlay.setAttribute("aria-hidden", "true");
		}

		document.getElementById("closeWallpaperHistory").addEventListener(
			"click",
			closeWallpaperHistory
		);

		wallpaperHistoryOverlay.addEventListener("click", event => {
			if (event.target === wallpaperHistoryOverlay) {
				closeWallpaperHistory();
			}
		});

		function ensurePhotoStateButtons(photo) {
			if (!photo.element || photo.element.querySelector(".photo-state-actions")) {
				return;
			}

			const actions = document.createElement("div");
			actions.className = "photo-state-actions";

			const preferButton = document.createElement("button");
			preferButton.type = "button";
			preferButton.className = "photo-state-button";
			preferButton.title = "Prefer this photo";
			preferButton.textContent = "★";

			const excludeButton = document.createElement("button");
			excludeButton.type = "button";
			excludeButton.className = "photo-state-button";
			excludeButton.title = "Exclude this photo";
			excludeButton.textContent = "×";

			preferButton.addEventListener("click", event => {
				event.preventDefault();
				event.stopPropagation();

				if (excludedPhotos.has(photo)) {
					excludedPhotos.delete(photo);
				}

				if (preferredPhotos.has(photo)) {
					preferredPhotos.delete(photo);
					showGalleryToast("Photo preference removed.");
				} else {
					preferredPhotos.add(photo);
					showGalleryToast("Photo preferred.");
				}

				refreshPhotoState(photo);
			});

			excludeButton.addEventListener("click", event => {
				event.preventDefault();
				event.stopPropagation();

				if (excludedPhotos.has(photo)) {
					excludedPhotos.delete(photo);
					showGalleryToast("Photo included again.");
				} else {
					excludedPhotos.add(photo);
					preferredPhotos.delete(photo);
					showGalleryToast("Photo excluded.");
				}

				refreshPhotoState(photo);
			});

			actions.append(preferButton, excludeButton);
			photo.element.appendChild(actions);
		}

		function refreshAllPhotoStateButtons() {
			for (const photo of galleryImages) {
				ensurePhotoStateButtons(photo);
			}
		}

		/*
			Capture phase makes Shift-click work before the gallery's normal
			click/preview behavior can consume the event.
		*/
		galleryGrid.addEventListener("click", event => {
			if (!event.shiftKey) {
				return;
			}

			const item = event.target.closest(".gallery-item");

			if (!item || event.target.closest(".photo-state-actions")) {
				return;
			}

			const photo = galleryImages.find(
				candidate => candidate.element === item
			);

			if (!photo || excludedPhotos.has(photo)) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();

			if (preferredPhotos.has(photo)) {
				preferredPhotos.delete(photo);
				showGalleryToast("Photo preference removed.");
			} else {
				preferredPhotos.add(photo);
				showGalleryToast("Photo preferred.");
			}

			refreshPhotoState(photo);
		}, true);

		const photoButtonObserver = new MutationObserver(() => {
			refreshAllPhotoStateButtons();
		});

		photoButtonObserver.observe(galleryGrid, {
			childList: true,
			subtree: false
		});

		refreshAllPhotoStateButtons();
		persistGeneratorSettings();
