// Optional advanced wallpaper features

		const advancedSettingsMarkup = `
			<div class="generator-section">
				<div class="advanced-toggle-row">
					<div>
						<p class="generator-section-title" style="margin-bottom:4px;">Advanced features</p>
						<p class="generator-settings-description">Everything below is optional and can be disabled.</p>
					</div>
					<input id="advancedFeaturesEnabled" type="checkbox">
				</div>

				<div id="advancedSettingsBody" class="advanced-disabled">
					<div class="advanced-grid">
						<div class="generator-field">
							<label for="resolutionPreset">Resolution</label>
							<select id="resolutionPreset">
								<option value="2560x1440">2560 × 1440</option>
								<option value="1920x1080">1920 × 1080</option>
								<option value="3840x2160">3840 × 2160</option>
								<option value="3440x1440">3440 × 1440 Ultrawide</option>
								<option value="2560x1080">2560 × 1080 Ultrawide</option>
								<option value="1080x1920">1080 × 1920 Phone</option>
								<option value="custom">Custom</option>
							</select>
						</div>

						<div class="generator-field">
							<label for="layoutPreset">Layout style</label>
							<select id="layoutPreset">
								<option value="balanced">Balanced mosaic</option>
								<option value="chaotic">Chaotic mosaic</option>
								<option value="hero">Hero image</option>
								<option value="grid">Clean grid</option>
							</select>
						</div>

						<div class="generator-field">
							<label for="customWallpaperWidth">Custom width</label>
							<input id="customWallpaperWidth" type="number" min="320" max="7680" value="2560">
						</div>

						<div class="generator-field">
							<label for="customWallpaperHeight">Custom height</label>
							<input id="customWallpaperHeight" type="number" min="320" max="7680" value="1440">
						</div>

						<div class="generator-field">
							<label for="backgroundStyle">Background</label>
							<select id="backgroundStyle">
								<option value="white">White</option>
								<option value="black">Black</option>
								<option value="custom">Custom color</option>
								<option value="gradient">Gradient</option>
								<option value="dominant">Photo-based color</option>
								<option value="blurred">Blurred used photos</option>
								<option value="transparent">No background (transparent)</option>
							</select>
						</div>

						<div class="generator-field">
							<label for="backgroundColorOne">Primary color</label>
							<input id="backgroundColorOne" type="color" value="#ffffff">
						</div>

						<div class="generator-field">
							<label for="backgroundColorTwo">Secondary color</label>
							<input id="backgroundColorTwo" type="color" value="#836fff">
						</div>

						<div class="generator-field">
							<label for="imageGapSetting">Image gap</label>
							<input id="imageGapSetting" type="number" min="0" max="80" value="8">
						</div>

						<div class="generator-field">
							<label for="cornerRadiusSetting">Rounded corners</label>
							<input id="cornerRadiusSetting" type="number" min="0" max="100" value="0">
						</div>

						<div class="generator-field">
							<label for="borderStyleSetting">Border style</label>
							<select id="borderStyleSetting">
								<option value="none">None</option>
								<option value="white">White</option>
								<option value="black">Black</option>
								<option value="polaroid">Polaroid</option>
							</select>
						</div>

						<div class="generator-field">
							<label for="generationAttemptsSetting">Layout attempts</label>
							<input id="generationAttemptsSetting" type="number" min="20" max="3000" value="1000">
						</div>

						<div class="generator-field">
							<label for="bestOfSetting">Results generated</label>
							<select id="bestOfSetting">
								<option value="1">One wallpaper</option>
								<option value="4">Best of four</option>
							</select>
						</div>
					</div>

					<div class="generator-section" style="margin-top:12px;">
						<div class="advanced-option-row">
							<label for="shadowEnabledSetting">Image shadows</label>
							<input id="shadowEnabledSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="smartSelectionSetting">Smart photo selection</label>
							<input id="smartSelectionSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="preferUnusedSetting">Prefer recently unused photos</label>
							<input id="preferUnusedSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="avoidSimilarSetting">Avoid similar aspect ratios</label>
							<input id="avoidSimilarSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="statisticsEnabledSetting">Show generation statistics</label>
							<input id="statisticsEnabledSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="historyEnabledSetting">Remember session history</label>
							<input id="historyEnabledSetting" type="checkbox">
						</div>
						<div class="advanced-option-row" style="margin-top:11px;">
							<label for="favoritesEnabledSetting">Enable favorites</label>
							<input id="favoritesEnabledSetting" type="checkbox">
						</div>
					</div>
				</div>
			</div>
		`;

		const settingsFooter = document.querySelector(".generator-settings-footer");
		settingsFooter.insertAdjacentHTML("beforebegin", advancedSettingsMarkup);

		const advancedElements = {
			enabled: document.getElementById("advancedFeaturesEnabled"),
			body: document.getElementById("advancedSettingsBody"),
			resolution: document.getElementById("resolutionPreset"),
			customWidth: document.getElementById("customWallpaperWidth"),
			customHeight: document.getElementById("customWallpaperHeight"),
			layout: document.getElementById("layoutPreset"),
			background: document.getElementById("backgroundStyle"),
			colorOne: document.getElementById("backgroundColorOne"),
			colorTwo: document.getElementById("backgroundColorTwo"),
			gap: document.getElementById("imageGapSetting"),
			radius: document.getElementById("cornerRadiusSetting"),
			border: document.getElementById("borderStyleSetting"),
			attempts: document.getElementById("generationAttemptsSetting"),
			bestOf: document.getElementById("bestOfSetting"),
			shadow: document.getElementById("shadowEnabledSetting"),
			smartSelection: document.getElementById("smartSelectionSetting"),
			preferUnused: document.getElementById("preferUnusedSetting"),
			avoidSimilar: document.getElementById("avoidSimilarSetting"),
			statistics: document.getElementById("statisticsEnabledSetting"),
			history: document.getElementById("historyEnabledSetting"),
			favorites: document.getElementById("favoritesEnabledSetting")
		};

		const advancedDefaults = {
			advancedEnabled: false,
			resolution: "2560x1440",
			customWidth: 2560,
			customHeight: 1440,
			layout: "balanced",
			background: "white",
			colorOne: "#ffffff",
			colorTwo: "#836fff",
			gap: 8,
			radius: 0,
			border: "none",
			attempts: 1000,
			bestOf: 1,
			shadow: false,
			smartSelection: false,
			preferUnused: false,
			avoidSimilar: false,
			statistics: false,
			history: false,
			favorites: false
		};

		const SETTINGS_STORAGE_KEY = "trollmineWallpaperGeneratorSettingsV2";

		function loadPersistedGeneratorSettings() {
			try {
				const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
				return stored ? JSON.parse(stored) : {};
			} catch (error) {
				console.warn("Could not load saved generator settings.", error);
				return {};
			}
		}

		function persistGeneratorSettings() {
			try {
				localStorage.setItem(
					SETTINGS_STORAGE_KEY,
					JSON.stringify(savedGeneratorSettings)
				);
			} catch (error) {
				console.warn("Could not save generator settings.", error);
			}
		}

		Object.assign(
			savedGeneratorSettings,
			advancedDefaults,
			loadPersistedGeneratorSettings()
		);

		let generatedChoices = [];
		let selectedChoiceIndex = 0;
		let sessionGenerationHistory = [];
		let sessionFavorites = [];
		const recentlyUsedPhotos = new Set();
		const preferredPhotos = new Set();
		const excludedPhotos = new Set();

		function updateAdvancedSettingsState() {
			advancedElements.body.classList.toggle(
				"advanced-disabled",
				!advancedElements.enabled.checked
			);
		}

		advancedElements.enabled.addEventListener(
			"change",
			updateAdvancedSettingsState
		);

		const originalOpenGeneratorSettings = openGeneratorSettings;
		openGeneratorSettings = function openGeneratorSettingsWithAdvanced() {
			originalOpenGeneratorSettings();

			advancedElements.enabled.checked = savedGeneratorSettings.advancedEnabled;
			advancedElements.resolution.value = savedGeneratorSettings.resolution;
			advancedElements.customWidth.value = savedGeneratorSettings.customWidth;
			advancedElements.customHeight.value = savedGeneratorSettings.customHeight;
			advancedElements.layout.value = savedGeneratorSettings.layout;
			advancedElements.background.value = savedGeneratorSettings.background;
			advancedElements.colorOne.value = savedGeneratorSettings.colorOne;
			advancedElements.colorTwo.value = savedGeneratorSettings.colorTwo;
			advancedElements.gap.value = savedGeneratorSettings.gap;
			advancedElements.radius.value = savedGeneratorSettings.radius;
			advancedElements.border.value = savedGeneratorSettings.border;
			advancedElements.attempts.value = savedGeneratorSettings.attempts;
			advancedElements.bestOf.value = String(savedGeneratorSettings.bestOf);
			advancedElements.shadow.checked = savedGeneratorSettings.shadow;
			advancedElements.smartSelection.checked = savedGeneratorSettings.smartSelection;
			advancedElements.preferUnused.checked = savedGeneratorSettings.preferUnused;
			advancedElements.avoidSimilar.checked = savedGeneratorSettings.avoidSimilar;
			advancedElements.statistics.checked = savedGeneratorSettings.statistics;
			advancedElements.history.checked = savedGeneratorSettings.history;
			advancedElements.favorites.checked = savedGeneratorSettings.favorites;
			updateAdvancedSettingsState();
		};

		const originalSaveGeneratorSettings = saveGeneratorSettings;
		saveGeneratorSettings = function saveGeneratorSettingsWithAdvanced() {
			const advancedValues = {
				advancedEnabled: advancedElements.enabled.checked,
				resolution: advancedElements.resolution.value,
				customWidth: clampInteger(advancedElements.customWidth.value, 320, 7680, 2560),
				customHeight: clampInteger(advancedElements.customHeight.value, 320, 7680, 1440),
				layout: advancedElements.layout.value,
				background: advancedElements.background.value,
				colorOne: advancedElements.colorOne.value,
				colorTwo: advancedElements.colorTwo.value,
				gap: clampInteger(advancedElements.gap.value, 0, 80, 8),
				radius: clampInteger(advancedElements.radius.value, 0, 100, 0),
				border: advancedElements.border.value,
				attempts: clampInteger(advancedElements.attempts.value, 20, 3000, 1000),
				bestOf: Number.parseInt(advancedElements.bestOf.value, 10) || 1,
				shadow: advancedElements.shadow.checked,
				smartSelection: advancedElements.smartSelection.checked,
				preferUnused: advancedElements.preferUnused.checked,
				avoidSimilar: advancedElements.avoidSimilar.checked,
				statistics: advancedElements.statistics.checked,
				history: advancedElements.history.checked,
				favorites: advancedElements.favorites.checked
			};

			originalSaveGeneratorSettings();
			Object.assign(savedGeneratorSettings, advancedValues);
			persistGeneratorSettings();
		};

		// Replace old settings listeners so the overridden functions are used.
		openGeneratorSettingsButton.replaceWith(openGeneratorSettingsButton.cloneNode(true));
		saveGeneratorSettingsButton.replaceWith(saveGeneratorSettingsButton.cloneNode(true));

		const newOpenSettingsButton = document.getElementById("openGeneratorSettingsButton");
		const newSaveSettingsButton = document.getElementById("saveGeneratorSettingsButton");

		newOpenSettingsButton.addEventListener("click", () => openGeneratorSettings());
		newSaveSettingsButton.addEventListener("click", () => saveGeneratorSettings());

		function getAdvancedResolution() {
			if (!savedGeneratorSettings.advancedEnabled) {
				return { width: 2560, height: 1440 };
			}

			if (savedGeneratorSettings.resolution === "custom") {
				return {
					width: savedGeneratorSettings.customWidth,
					height: savedGeneratorSettings.customHeight
				};
			}

			const [width, height] = savedGeneratorSettings.resolution
				.split("x")
				.map(value => Number.parseInt(value, 10));

			return { width, height };
		}

		function selectPhotosForAdvancedGeneration(options) {
			const allowedPhotos = galleryImages.filter(
				photo => !excludedPhotos.has(photo)
			);

			if (allowedPhotos.length === 0) {
				throw new Error("Every photo is excluded.");
			}

			let pool = [...allowedPhotos];
			const preferred = pool.filter(photo => preferredPhotos.has(photo));
			const normal = pool.filter(photo => !preferredPhotos.has(photo));

			if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.preferUnused) {
				normal.sort((first, second) => {
					const firstUsed = recentlyUsedPhotos.has(first) ? 1 : 0;
					const secondUsed = recentlyUsedPhotos.has(second) ? 1 : 0;
					return firstUsed - secondUsed;
				});
			}

			if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.smartSelection) {
				const portrait = normal.filter(photo => photo.ratio < 0.85);
				const square = normal.filter(photo => photo.ratio >= 0.85 && photo.ratio <= 1.25);
				const landscape = normal.filter(photo => photo.ratio > 1.25);
				const buckets = [
					seededShuffle(portrait, options.random),
					seededShuffle(square, options.random),
					seededShuffle(landscape, options.random)
				];

				const smart = [];
				let bucketIndex = 0;

				while (buckets.some(bucket => bucket.length > 0)) {
					const bucket = buckets[bucketIndex % buckets.length];

					if (bucket.length > 0) {
						smart.push(bucket.shift());
					}

					bucketIndex++;
				}

				normal.splice(0, normal.length, ...smart);
			} else {
				normal.splice(0, normal.length, ...seededShuffle(normal, options.random));
			}

			if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.avoidSimilar) {
				const shuffledNormal = seededShuffle(normal, options.random);
				const diverse = [];
				let previousRatio = null;

				while (shuffledNormal.length > 0) {
					let bestIndex = 0;

					if (previousRatio !== null) {
						let bestDistance = -1;

						for (let index = 0; index < shuffledNormal.length; index++) {
							const distance = Math.abs(
								shuffledNormal[index].ratio - previousRatio
							);

							const randomizedDistance =
								distance * (0.8 + options.random() * 0.4);

							if (randomizedDistance > bestDistance) {
								bestDistance = randomizedDistance;
								bestIndex = index;
							}
						}
					} else {
						bestIndex = Math.floor(
							options.random() * shuffledNormal.length
						);
					}

					const [nextPhoto] = shuffledNormal.splice(bestIndex, 1);
					diverse.push(nextPhoto);
					previousRatio = nextPhoto.ratio;
				}

				normal.splice(0, normal.length, ...diverse);
			}

			pool = [...seededShuffle(preferred, options.random), ...normal];

			if (pool.length < options.count) {
				options.count = pool.length;
			}

			return pool.slice(0, options.count);
		}

		function roundedRectanglePath(context, x, y, width, height, radius) {
			const safeRadius = Math.max(
				0,
				Math.min(radius, width / 2, height / 2)
			);

			context.beginPath();
			context.moveTo(x + safeRadius, y);
			context.lineTo(x + width - safeRadius, y);
			context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
			context.lineTo(x + width, y + height - safeRadius);
			context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
			context.lineTo(x + safeRadius, y + height);
			context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
			context.lineTo(x, y + safeRadius);
			context.quadraticCurveTo(x, y, x + safeRadius, y);
			context.closePath();
		}

		function drawAdvancedBackground(context, canvas, loadedImages) {
			const style = savedGeneratorSettings.advancedEnabled
				? savedGeneratorSettings.background
				: "white";

			context.save();
			context.clearRect(0, 0, canvas.width, canvas.height);

			if (style === "transparent") {
				context.restore();
				return;
			}

			if (style === "blurred" && loadedImages.length > 0) {
				const columns = Math.max(
					1,
					Math.ceil(Math.sqrt(loadedImages.length * canvas.width / canvas.height))
				);

				const rows = Math.max(
					1,
					Math.ceil(loadedImages.length / columns)
				);

				const cellWidth = canvas.width / columns;
				const cellHeight = canvas.height / rows;

				context.filter = `blur(${Math.max(28, Math.round(Math.min(canvas.width, canvas.height) * 0.035))}px)`;
				context.globalAlpha = 0.9;

				for (let index = 0; index < loadedImages.length; index++) {
					const image = loadedImages[index];
					const column = index % columns;
					const row = Math.floor(index / columns);
					const x = column * cellWidth;
					const y = row * cellHeight;
					const scale = Math.max(
						cellWidth / image.naturalWidth,
						cellHeight / image.naturalHeight
					);

					const drawWidth = image.naturalWidth * scale;
					const drawHeight = image.naturalHeight * scale;

					context.drawImage(
						image,
						x + (cellWidth - drawWidth) / 2,
						y + (cellHeight - drawHeight) / 2,
						drawWidth,
						drawHeight
					);
				}

				context.filter = "none";
				context.globalAlpha = 0.2;
				context.fillStyle = "#000000";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.restore();
				return;
			}

			if (style === "black") {
				context.fillStyle = "#000000";
			} else if (style === "custom") {
				context.fillStyle = savedGeneratorSettings.colorOne;
			} else if (style === "gradient") {
				const gradient = context.createLinearGradient(
					0,
					0,
					canvas.width,
					canvas.height
				);

				gradient.addColorStop(0, savedGeneratorSettings.colorOne);
				gradient.addColorStop(1, savedGeneratorSettings.colorTwo);
				context.fillStyle = gradient;
			} else if (style === "dominant" && loadedImages.length > 0) {
				const sampleCanvas = document.createElement("canvas");
				sampleCanvas.width = 1;
				sampleCanvas.height = 1;
				const sampleContext = sampleCanvas.getContext("2d");
				sampleContext.drawImage(loadedImages[0], 0, 0, 1, 1);
				const pixel = sampleContext.getImageData(0, 0, 1, 1).data;
				context.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
			} else {
				context.fillStyle = "#ffffff";
			}

			context.fillRect(0, 0, canvas.width, canvas.height);
			context.restore();
		}

		function buildGridLayout(photos, width, height, gap) {
			const columns = Math.ceil(Math.sqrt(photos.length * (width / height)));
			const rows = Math.ceil(photos.length / columns);
			const cellWidth = (width - gap * (columns - 1)) / columns;
			const cellHeight = (height - gap * (rows - 1)) / rows;

			return photos.map((photo, index) => ({
				photo,
				x: (index % columns) * (cellWidth + gap),
				y: Math.floor(index / columns) * (cellHeight + gap),
				width: cellWidth,
				height: cellHeight,
				contain: true
			}));
		}

		function buildHeroLayout(photos, width, height, gap, options) {
			if (photos.length <= 1) {
				return [{
					photo: photos[0],
					x: 0,
					y: 0,
					width,
					height,
					contain: true
				}];
			}

			const hero = photos[0];
			const remaining = photos.slice(1);
			const heroWidth = width * 0.46;
			const rightWidth = width - heroWidth - gap;
			const secondaryLayout = buildRecursiveWallpaperLayout(
				remaining,
				rightWidth,
				height,
				{
					...options,
					count: remaining.length
				}
			);

			return [
				{
					photo: hero,
					x: 0,
					y: 0,
					width: heroWidth,
					height,
					contain: true
				},
				...secondaryLayout.leaves.map(leaf => ({
					...leaf,
					x: leaf.x + heroWidth + gap,
					y: leaf.y
				}))
			];
		}

		async function renderAdvancedWallpaper(options) {
			const resolution = getAdvancedResolution();
			const canvas = document.createElement("canvas");
			canvas.width = resolution.width;
			canvas.height = resolution.height;

			const context = canvas.getContext("2d", { alpha: true });
			const startedAt = performance.now();
			const selectedPhotos = selectPhotosForAdvancedGeneration(options);
			const loadedImageMap = new Map();

			await Promise.all(
				selectedPhotos.map(async photo => {
					loadedImageMap.set(photo, await loadCanvasImage(photo.src));
				})
			);

			drawAdvancedBackground(
				context,
				canvas,
				[...loadedImageMap.values()]
			);

			const advanced = savedGeneratorSettings.advancedEnabled;
			const gap = advanced ? savedGeneratorSettings.gap : 8;
			const padding = gap;
			const contentWidth = Math.max(1, canvas.width - padding * 2);
			const contentHeight = Math.max(1, canvas.height - padding * 2);
			const layoutMode = advanced ? savedGeneratorSettings.layout : "balanced";
			let leaves;

			if (layoutMode === "grid") {
				leaves = buildGridLayout(selectedPhotos, contentWidth, contentHeight, gap);
			} else if (layoutMode === "hero") {
				leaves = buildHeroLayout(selectedPhotos, contentWidth, contentHeight, gap, options);
			} else {
				const originalAttempts = 1000;
				const requestedAttempts = advanced
					? savedGeneratorSettings.attempts
					: originalAttempts;

				const originalRandom = options.random;
				const layout = buildRecursiveWallpaperLayout(
					selectedPhotos,
					contentWidth,
					contentHeight,
					{
						...options,
						count: selectedPhotos.length,
						random: originalRandom,
						attempts: requestedAttempts,
						chaotic: layoutMode === "chaotic"
					}
				);

				leaves = layout.leaves;
			}

			const borderStyle = advanced ? savedGeneratorSettings.border : "none";
			const radius = advanced ? savedGeneratorSettings.radius : 0;
			const shadowEnabled = advanced && savedGeneratorSettings.shadow;

			for (const leaf of leaves) {
				const image = loadedImageMap.get(leaf.photo);
				let x = leaf.x + padding;
				let y = leaf.y + padding;
				let width = leaf.width;
				let height = leaf.height;
				let borderSize = 0;
				let bottomBorder = 0;
				let borderColor = "#ffffff";

				if (borderStyle === "white" || borderStyle === "black") {
					borderSize = Math.max(3, Math.round(Math.min(width, height) * 0.012));
					borderColor = borderStyle === "black" ? "#000000" : "#ffffff";
				} else if (borderStyle === "polaroid") {
					borderSize = Math.max(5, Math.round(Math.min(width, height) * 0.018));
					bottomBorder = borderSize * 3;
					borderColor = "#ffffff";
				}

				if (shadowEnabled) {
					context.save();
					context.shadowColor = "rgba(0, 0, 0, 0.35)";
					context.shadowBlur = Math.max(8, Math.min(width, height) * 0.035);
					context.shadowOffsetY = Math.max(4, Math.min(width, height) * 0.018);
					context.fillStyle = borderColor;
					roundedRectanglePath(context, x, y, width, height, radius);
					context.fill();
					context.restore();
				}

				if (borderSize > 0 || bottomBorder > 0) {
					context.save();
					context.fillStyle = borderColor;
					roundedRectanglePath(context, x, y, width, height, radius);
					context.fill();
					context.restore();

					x += borderSize;
					y += borderSize;
					width -= borderSize * 2;
					height -= borderSize * 2 + bottomBorder;
				}

				context.save();
				roundedRectanglePath(context, x, y, width, height, radius);
				context.clip();

				if (leaf.contain) {
					drawImageContain(context, image, x, y, width, height);
				} else {
					context.drawImage(image, x, y, width, height);
				}

				context.restore();
				recentlyUsedPhotos.add(leaf.photo);
			}

			const generationTime = performance.now() - startedAt;

			const blob = await new Promise((resolve, reject) => {
				canvas.toBlob(
					result => result ? resolve(result) : reject(new Error("Could not create the wallpaper.")),
					"image/png"
				);
			});

			return {
				blob,
				seed: options.seed,
				count: selectedPhotos.length,
				width: canvas.width,
				height: canvas.height,
				layout: layoutMode,
				generationTime
			};
		}

		function clearGeneratedChoices() {
			for (const choice of generatedChoices) {
				if (choice.url) {
					URL.revokeObjectURL(choice.url);
				}
			}

			generatedChoices = [];
		}

		function selectGeneratedChoice(index) {
			selectedChoiceIndex = index;
			const choice = generatedChoices[index];

			generatedWallpaperBlob = choice.blob;
			generatedWallpaperUrl = choice.url;

			document.querySelectorAll(".wallpaper-choice").forEach((element, choiceIndex) => {
				element.classList.toggle("selected", choiceIndex === index);
			});

			const statsElement = document.getElementById("advancedWallpaperStats");

			if (statsElement) {
				statsElement.textContent =
					`${choice.width} × ${choice.height} • ${choice.count} photos • ${choice.layout} • ${Math.round(choice.generationTime)} ms • Seed ${choice.seed}`;
			}

			previewSeed.textContent = `Seed: ${choice.seed} • ${choice.count} photos`;
		}

		function showAdvancedWallpaperPreview(choices) {
			clearGeneratedChoices();

			generatedChoices = choices.map(choice => ({
				...choice,
				url: URL.createObjectURL(choice.blob)
			}));

			const previewCard = document.querySelector(".wallpaper-preview-card");
			const oldImage = document.getElementById("wallpaperPreviewImage");
			const oldGrid = document.getElementById("wallpaperChoiceGrid");

			if (oldGrid) {
				oldGrid.remove();
			}

			if (generatedChoices.length === 1) {
				oldImage.style.display = "block";
				oldImage.src = generatedChoices[0].url;
			} else {
				oldImage.style.display = "none";
				const grid = document.createElement("div");
				grid.id = "wallpaperChoiceGrid";
				grid.className = "wallpaper-choice-grid";

				generatedChoices.forEach((choice, index) => {
					const button = document.createElement("button");
					button.type = "button";
					button.className = "wallpaper-choice";
					button.innerHTML = `
						<img src="${choice.url}" alt="Generated wallpaper choice ${index + 1}">
						<span class="wallpaper-choice-number">Choice ${index + 1}</span>
					`;
					button.addEventListener("click", () => selectGeneratedChoice(index));
					grid.appendChild(button);
				});

				previewCard.insertBefore(grid, previewSeed);
			}

			let statsElement = document.getElementById("advancedWallpaperStats");

			if (!statsElement) {
				statsElement = document.createElement("div");
				statsElement.id = "advancedWallpaperStats";
				statsElement.className = "wallpaper-stats";
				previewSeed.insertAdjacentElement("afterend", statsElement);
			}

			statsElement.style.display =
				savedGeneratorSettings.advancedEnabled &&
				savedGeneratorSettings.statistics
					? "block"
					: "none";

			let extraActions = document.getElementById("wallpaperExtraActions");

			if (!extraActions) {
				extraActions = document.createElement("div");
				extraActions.id = "wallpaperExtraActions";
				extraActions.className = "wallpaper-extra-actions";
				document.querySelector(".wallpaper-preview-actions").insertAdjacentElement("beforebegin", extraActions);
			}

			extraActions.replaceChildren();

			if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.favorites) {
				const favoriteButton = document.createElement("button");
				favoriteButton.type = "button";
				favoriteButton.className = "wallpaper-action";
				favoriteButton.textContent = "Favorite";
				favoriteButton.addEventListener("click", () => {
					const selected = generatedChoices[selectedChoiceIndex];

					if (!sessionFavorites.includes(selected)) {
						sessionFavorites.push(selected);
						showGalleryToast(`Added to favorites (${sessionFavorites.length}).`);
					}
				});
				extraActions.appendChild(favoriteButton);
			}

			if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.history) {
				const historyButton = document.createElement("button");
				historyButton.type = "button";
				historyButton.className = "wallpaper-action";
				historyButton.textContent = `History (${sessionGenerationHistory.length})`;
				historyButton.addEventListener("click", openWallpaperHistory);
				extraActions.appendChild(historyButton);
			}

			wallpaperPreview.classList.add("visible");
			wallpaperPreview.setAttribute("aria-hidden", "false");
			selectGeneratedChoice(0);
		}

		async function generateAdvancedMosaicBackground() {
			if (galleryImages.length === 0) {
				showGalleryToast("Choose a folder with images first.");
				return;
			}

			const button = document.getElementById("generateBackgroundButton");
			const remake = document.getElementById("remakeWallpaperButton");

			button.disabled = true;
			remake.disabled = true;
			button.textContent = "Generating…";
			remake.textContent = "Generating…";

			try {
				const baseOptions = getGeneratorOptions();
				const resultCount =
					savedGeneratorSettings.advancedEnabled
						? savedGeneratorSettings.bestOf
						: 1;

				const choices = [];

				for (let index = 0; index < resultCount; index++) {
					const seed =
						index === 0
							? baseOptions.seed
							: `${baseOptions.seed}-${index + 1}`;

					const options = {
						...baseOptions,
						seed,
						random: createSeededRandom(seed)
					};

					choices.push(await renderAdvancedWallpaper(options));
				}

				if (savedGeneratorSettings.advancedEnabled && savedGeneratorSettings.history) {
					for (const choice of choices) {
						sessionGenerationHistory.push({
							...choice,
							historyUrl: URL.createObjectURL(choice.blob)
						});
					}
				}

				showAdvancedWallpaperPreview(choices);
			} catch (error) {
				console.error(error);
				showGalleryToast(
					error && error.message
						? `Could not generate: ${error.message}`
						: "The mosaic could not be generated."
				);
			} finally {
				button.disabled = false;
				remake.disabled = false;
				button.textContent = "Generate Background";
				remake.textContent = "Remake";
			}
		}

		// Replace generator buttons to remove the old listeners.
		const oldGenerateButton = document.getElementById("generateBackgroundButton");
		const newGenerateButton = oldGenerateButton.cloneNode(true);
		oldGenerateButton.replaceWith(newGenerateButton);
		newGenerateButton.addEventListener("click", () => {
			savedGeneratorSettings.seed = createRandomSeed();
			wallpaperSeed.value = savedGeneratorSettings.seed;
			persistGeneratorSettings();
			generateAdvancedMosaicBackground();
		});

		const oldRemakeButton = document.getElementById("remakeWallpaperButton");
		const newRemakeButton = oldRemakeButton.cloneNode(true);
		oldRemakeButton.replaceWith(newRemakeButton);
		newRemakeButton.addEventListener("click", () => {
			savedGeneratorSettings.seed = createRandomSeed();
			wallpaperSeed.value = savedGeneratorSettings.seed;
			generateAdvancedMosaicBackground();
		});

		downloadWallpaperButton.addEventListener("click", () => {
			if (generatedChoices[selectedChoiceIndex]) {
				generatedWallpaperBlob = generatedChoices[selectedChoiceIndex].blob;
				generatedWallpaperUrl = generatedChoices[selectedChoiceIndex].url;
			}
		}, true);

		function refreshPhotoState(photo) {
			if (!photo.element) {
				return;
			}

			photo.element.classList.toggle(
				"preferred-photo",
				preferredPhotos.has(photo)
			);

			photo.element.classList.toggle(
				"excluded-photo",
				excludedPhotos.has(photo)
			);
		}

		galleryGrid.addEventListener("contextmenu", event => {
			const item = event.target.closest(".gallery-item");

			if (!item) {
				return;
			}

			event.preventDefault();
			const photo = galleryImages.find(candidate => candidate.element === item);

			if (!photo) {
				return;
			}

			if (excludedPhotos.has(photo)) {
				excludedPhotos.delete(photo);
				showGalleryToast("Photo included again.");
			} else {
				excludedPhotos.add(photo);
				preferredPhotos.delete(photo);
				showGalleryToast("Photo excluded from wallpaper generation.");
			}

			refreshPhotoState(photo);
		});

		galleryGrid.addEventListener("click", event => {
			if (!event.shiftKey) {
				return;
			}

			const item = event.target.closest(".gallery-item");

			if (!item) {
				return;
			}

			const photo = galleryImages.find(candidate => candidate.element === item);

			if (!photo || excludedPhotos.has(photo)) {
				return;
			}

			if (preferredPhotos.has(photo)) {
				preferredPhotos.delete(photo);
				showGalleryToast("Photo preference removed.");
			} else {
				preferredPhotos.add(photo);
				showGalleryToast("Photo preferred for wallpaper generation.");
			}

			refreshPhotoState(photo);
		});

		updateAdvancedSettingsState();
