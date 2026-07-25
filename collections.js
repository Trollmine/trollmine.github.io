// Typing animation

		const typingText = document.getElementById("typingText");

		const phrases = [
			"Roblox Developer",
			"Game Creator",
			"UI Designer",
			"Professional bug creator",
			"Turning ideas into games"
		];

		let phraseIndex = 0;
		let characterIndex = 0;
		let isDeleting = false;

		function updateTyping() {
			const currentPhrase = phrases[phraseIndex];

			characterIndex += isDeleting ? -1 : 1;
			typingText.textContent = currentPhrase.substring(0, characterIndex);

			let delay = isDeleting ? 45 : 80;

			if (!isDeleting && characterIndex === currentPhrase.length) {
				isDeleting = true;
				delay = 1400;
			} else if (isDeleting && characterIndex === 0) {
				isDeleting = false;
				phraseIndex = (phraseIndex + 1) % phrases.length;
				delay = 350;
			}

			setTimeout(updateTyping, delay);
		}

		updateTyping();


		// Music system

		const musicButton = document.getElementById("musicButton");
		const backgroundMusic = document.getElementById("backgroundMusic");

		const MUSIC_PREFERENCE_KEY = "trollmineMusicPreference";
		const savedMusicPreference = localStorage.getItem(MUSIC_PREFERENCE_KEY);

		let musicEnabled = savedMusicPreference !== "off";

		backgroundMusic.volume = 0.35;

		function updateMusicButton() {
			if (musicEnabled && !backgroundMusic.paused) {
				musicButton.textContent = "❚❚";
				musicButton.classList.add("playing");
				musicButton.title = "Pause background music";
				musicButton.setAttribute("aria-label", "Pause background music");
			} else {
				musicButton.textContent = "♫";
				musicButton.classList.remove("playing");
				musicButton.title = "Play background music";
				musicButton.setAttribute("aria-label", "Play background music");
			}
		}

		async function playMusic() {
			if (!musicEnabled) {
				updateMusicButton();
				return;
			}

			try {
				await backgroundMusic.play();
				updateMusicButton();
			} catch (error) {
				console.log("Autoplay blocked until visitor interaction.");
				updateMusicButton();
			}
		}

		function pauseMusic() {
			backgroundMusic.pause();
			updateMusicButton();
		}

		async function toggleMusic(event) {
			event.stopPropagation();

			if (musicEnabled && !backgroundMusic.paused) {
				musicEnabled = false;
				localStorage.setItem(MUSIC_PREFERENCE_KEY, "off");
				pauseMusic();
			} else {
				musicEnabled = true;
				localStorage.setItem(MUSIC_PREFERENCE_KEY, "on");
				await playMusic();
			}
		}

		async function startMusicAfterInteraction() {
			if (musicEnabled && backgroundMusic.paused) {
				await playMusic();
			}
		}

		musicButton.addEventListener("click", toggleMusic);

		window.addEventListener("load", () => {
			if (musicEnabled) {
				playMusic();
			} else {
				pauseMusic();
			}
		});

		document.addEventListener("click", startMusicAfterInteraction, { once: true });
		document.addEventListener("touchstart", startMusicAfterInteraction, { once: true });
		document.addEventListener("keydown", startMusicAfterInteraction, { once: true });

		backgroundMusic.addEventListener("play", updateMusicButton);
		backgroundMusic.addEventListener("pause", updateMusicButton);

		backgroundMusic.addEventListener("error", () => {
			musicButton.textContent = "⚠";
			musicButton.classList.remove("playing");
			musicButton.title = "The music file could not be loaded";
		});

		updateMusicButton();


		// Tabs

		const homeTab = document.getElementById("homeTab");
		const galleryTab = document.getElementById("galleryTab");
		const homePage = document.getElementById("homePage");
		const galleryPage = document.getElementById("galleryPage");

		function openTab(tabName) {
			const showingGallery = tabName === "gallery";

			homeTab.classList.toggle("active", !showingGallery);
			galleryTab.classList.toggle("active", showingGallery);

			homePage.classList.toggle("active", !showingGallery);
			galleryPage.classList.toggle("active", showingGallery);

			musicButton.style.display = showingGallery ? "none" : "flex";
			document.body.style.overflow = showingGallery ? "hidden" : "";
		}

		homeTab.addEventListener("click", () => openTab("home"));
		galleryTab.addEventListener("click", () => openTab("gallery"));


		// Gallery — justified mosaic layout

		const folderInput = document.getElementById("folderInput");
		const galleryGrid = document.getElementById("galleryGrid");
		const galleryEmpty = document.getElementById("galleryEmpty");
		const galleryViewport = document.getElementById("galleryViewport");
		const galleryWorld = document.getElementById("galleryWorld");
		const zoomInButton = document.getElementById("zoomInButton");
		const zoomOutButton = document.getElementById("zoomOutButton");
		const resetGalleryButton = document.getElementById("resetGalleryButton");
		const generateBackgroundButton =
			document.getElementById("generateBackgroundButton");
		const galleryToast = document.getElementById("galleryToast");
		const wallpaperPreview = document.getElementById("wallpaperPreview");
		const wallpaperPreviewImage =
			document.getElementById("wallpaperPreviewImage");
		const downloadWallpaperButton =
			document.getElementById("downloadWallpaperButton");
		const remakeWallpaperButton =
			document.getElementById("remakeWallpaperButton");
		const closeWallpaperPreviewButton =
			document.getElementById("closeWallpaperPreviewButton");
		const randomCountEnabled =
			document.getElementById("randomCountEnabled");
		const fixedPhotoCount =
			document.getElementById("fixedPhotoCount");
		const minimumPhotoCount =
			document.getElementById("minimumPhotoCount");
		const maximumPhotoCount =
			document.getElementById("maximumPhotoCount");
		const wallpaperSeed =
			document.getElementById("wallpaperSeed");
		const randomizeSeedButton =
			document.getElementById("randomizeSeedButton");
		const previewSeed =
			document.getElementById("previewSeed");
		const openGeneratorSettingsButton =
			document.getElementById("openGeneratorSettingsButton");
		const generatorSettingsOverlay =
			document.getElementById("generatorSettingsOverlay");
		const closeGeneratorSettingsButton =
			document.getElementById("closeGeneratorSettingsButton");
		const cancelGeneratorSettingsButton =
			document.getElementById("cancelGeneratorSettingsButton");
		const saveGeneratorSettingsButton =
			document.getElementById("saveGeneratorSettingsButton");
		const randomModeButton =
			document.getElementById("randomModeButton");
		const fixedModeButton =
			document.getElementById("fixedModeButton");
		const randomCountFields =
			document.getElementById("randomCountFields");
		const fixedCountFields =
			document.getElementById("fixedCountFields");
		const zoomDisplay = document.getElementById("zoomDisplay");

		let galleryImages = [];
		let galleryScale = 1;
		let galleryX = 0;
		let galleryY = 0;
		let draggingGallery = false;
		let previousPointerX = 0;
		let previousPointerY = 0;

		const minimumZoom = 0.25;
		const maximumZoom = 4;
		const mosaicGap = 7;

		function isImageFile(file) {
			if (file.type.startsWith("image/")) {
				return true;
			}

			const extension = file.name.split(".").pop().toLowerCase();

			return [
				"jpg", "jpeg", "png", "gif", "webp",
				"avif", "bmp", "svg"
			].includes(extension);
		}

		function readFileAsDataURL(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(reader.error);

				reader.readAsDataURL(file);
			});
		}

		function measureImage(dataUrl, file) {
			return new Promise((resolve, reject) => {
				const image = new Image();

				image.onload = () => {
					resolve({
						file,
						src: dataUrl,
						width: image.naturalWidth,
						height: image.naturalHeight,
						ratio: image.naturalWidth / image.naturalHeight
					});
				};

				image.onerror = () => reject(
					new Error(`Could not read ${file.name}`)
				);

				image.src = dataUrl;
			});
		}

		async function loadGalleryImage(file) {
			const dataUrl = await readFileAsDataURL(file);
			return measureImage(dataUrl, file);
		}

		function applyGalleryTransform() {
			galleryWorld.style.transform =
				`translate(${galleryX}px, ${galleryY}px) scale(${galleryScale})`;

			zoomDisplay.textContent = `${Math.round(galleryScale * 100)}%`;
		}

		function resetGalleryView() {
			galleryScale = 1;
			galleryX = 0;
			galleryY = 0;
			applyGalleryTransform();
		}

		function createGalleryElement(photo) {
			const item = document.createElement("figure");
			item.className = "gallery-item";

			const image = document.createElement("img");
			image.src = photo.src;
			image.alt = photo.file.name;
			image.draggable = false;

			const caption = document.createElement("figcaption");
			caption.className = "gallery-file-name";
			caption.textContent =
				photo.file.webkitRelativePath || photo.file.name;

			item.appendChild(image);
			item.appendChild(caption);

			photo.element = item;
			return item;
		}

		function layoutMosaic() {
			if (galleryImages.length === 0) {
				galleryGrid.style.height = "0px";
				return;
			}

			const availableWidth = Math.max(
				320,
				galleryWorld.clientWidth - 16
			);

			/*
				Larger screens use taller rows. The last row is left at its
				natural target height instead of being stretched too far.
			*/
			const targetRowHeight = Math.max(
				150,
				Math.min(290, availableWidth / 5.2)
			);

			let currentRow = [];
			let currentRatioTotal = 0;
			let top = 0;

			function placeRow(row, ratioTotal, isLastRow) {
				if (row.length === 0) {
					return;
				}

				const totalGaps = mosaicGap * (row.length - 1);
				const usableWidth = availableWidth - totalGaps;

				let rowHeight = usableWidth / ratioTotal;

				if (isLastRow) {
					rowHeight = Math.min(rowHeight, targetRowHeight);
				}

				let left = 0;

				for (const photo of row) {
					const width = rowHeight * photo.ratio;

					photo.element.style.left = `${left}px`;
					photo.element.style.top = `${top}px`;
					photo.element.style.width = `${width}px`;
					photo.element.style.height = `${rowHeight}px`;

					left += width + mosaicGap;
				}

				top += rowHeight + mosaicGap;
			}

			for (const photo of galleryImages) {
				currentRow.push(photo);
				currentRatioTotal += photo.ratio;

				const estimatedWidth =
					currentRatioTotal * targetRowHeight +
					mosaicGap * (currentRow.length - 1);

				if (estimatedWidth >= availableWidth) {
					placeRow(currentRow, currentRatioTotal, false);
					currentRow = [];
					currentRatioTotal = 0;
				}
			}

			placeRow(currentRow, currentRatioTotal, true);
			galleryGrid.style.height = `${Math.max(0, top - mosaicGap)}px`;
		}

		folderInput.addEventListener("change", async () => {
			galleryGrid.replaceChildren();
			galleryImages = [];

			const imageFiles = Array.from(folderInput.files)
				.filter(isImageFile)
				.sort((firstFile, secondFile) =>
					firstFile.name.localeCompare(secondFile.name, undefined, {
						numeric: true,
						sensitivity: "base"
					})
				);

			if (imageFiles.length === 0) {
				galleryEmpty.style.display = "block";
				resetGalleryView();
				return;
			}

			galleryEmpty.style.display = "block";
			galleryEmpty.querySelector("h2").textContent = "Loading gallery…";
			galleryEmpty.querySelector("p").textContent =
				`Reading ${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"} from your folder.`;

			const loaded = await Promise.allSettled(
				imageFiles.map(loadGalleryImage)
			);

			galleryImages = loaded
				.filter(result => result.status === "fulfilled")
				.map(result => result.value);

			if (galleryImages.length === 0) {
				galleryEmpty.querySelector("h2").textContent =
					"No readable images found";
				galleryEmpty.querySelector("p").textContent =
					"Try JPG, PNG, WebP, GIF or another browser-supported image format.";
				resetGalleryView();
				return;
			}

			const fragment = document.createDocumentFragment();

			for (const photo of galleryImages) {
				fragment.appendChild(createGalleryElement(photo));
			}

			galleryGrid.appendChild(fragment);
			galleryEmpty.style.display = "none";

			requestAnimationFrame(() => {
				layoutMosaic();
				resetGalleryView();
			});
		});

		function setGalleryZoom(newScale, originX, originY) {
			const boundedScale = Math.min(
				maximumZoom,
				Math.max(minimumZoom, newScale)
			);

			if (boundedScale === galleryScale) {
				return;
			}

			const viewportBounds = galleryViewport.getBoundingClientRect();
			const cursorX = originX - viewportBounds.left;
			const cursorY = originY - viewportBounds.top;

			const worldX = (cursorX - galleryX) / galleryScale;
			const worldY = (cursorY - galleryY) / galleryScale;

			galleryScale = boundedScale;
			galleryX = cursorX - worldX * galleryScale;
			galleryY = cursorY - worldY * galleryScale;

			applyGalleryTransform();
		}

		galleryViewport.addEventListener(
			"wheel",
			event => {
				event.preventDefault();

				const zoomMultiplier = event.deltaY < 0 ? 1.12 : 0.89;

				setGalleryZoom(
					galleryScale * zoomMultiplier,
					event.clientX,
					event.clientY
				);
			},
			{ passive: false }
		);

		zoomInButton.addEventListener("click", () => {
			const bounds = galleryViewport.getBoundingClientRect();

			setGalleryZoom(
				galleryScale * 1.2,
				bounds.left + bounds.width / 2,
				bounds.top + bounds.height / 2
			);
		});

		zoomOutButton.addEventListener("click", () => {
			const bounds = galleryViewport.getBoundingClientRect();

			setGalleryZoom(
				galleryScale / 1.2,
				bounds.left + bounds.width / 2,
				bounds.top + bounds.height / 2
			);
		});

		resetGalleryButton.addEventListener("click", resetGalleryView);

		let galleryToastTimer;

		function showGalleryToast(message) {
			clearTimeout(galleryToastTimer);
			galleryToast.textContent = message;
			galleryToast.classList.add("visible");

			galleryToastTimer = setTimeout(() => {
				galleryToast.classList.remove("visible");
			}, 2600);
		}

		function shuffleArray(items) {
			const shuffled = [...items];

			for (let index = shuffled.length - 1; index > 0; index--) {
				const randomIndex = Math.floor(Math.random() * (index + 1));

				[shuffled[index], shuffled[randomIndex]] =
					[shuffled[randomIndex], shuffled[index]];
			}

			return shuffled;
		}

		function drawImageContain(context, image, x, y, width, height) {
			/*
				Fit the entire image inside the available rectangle.

				Nothing is cropped or stretched. The original width/height
				ratio is always preserved, and any unused space stays white.
			*/
			const sourceRatio = image.naturalWidth / image.naturalHeight;
			const targetRatio = width / height;

			let drawWidth;
			let drawHeight;

			if (sourceRatio > targetRatio) {
				drawWidth = width;
				drawHeight = width / sourceRatio;
			} else {
				drawHeight = height;
				drawWidth = height * sourceRatio;
			}

			const drawX = x + (width - drawWidth) / 2;
			const drawY = y + (height - drawHeight) / 2;

			context.drawImage(
				image,
				drawX,
				drawY,
				drawWidth,
				drawHeight
			);
		}

		function loadCanvasImage(source) {
			return new Promise((resolve, reject) => {
				const image = new Image();

				image.onload = () => resolve(image);
				image.onerror = reject;
				image.src = source;
			});
		}

		let generatedWallpaperBlob = null;
		let generatedWallpaperUrl = null;

		function hashSeed(seedText) {
			let hash = 2166136261;

			for (let index = 0; index < seedText.length; index++) {
				hash ^= seedText.charCodeAt(index);
				hash = Math.imul(hash, 16777619);
			}

			return hash >>> 0;
		}

		function createSeededRandom(seedText) {
			let state = hashSeed(seedText) || 0x6d2b79f5;

			return function seededRandom() {
				state += 0x6d2b79f5;
				let value = state;
				value = Math.imul(value ^ (value >>> 15), value | 1);
				value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
				return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
			};
		}

		function seededShuffle(items, random) {
			const result = [...items];

			for (let index = result.length - 1; index > 0; index--) {
				const swapIndex = Math.floor(random() * (index + 1));
				[result[index], result[swapIndex]] =
					[result[swapIndex], result[index]];
			}

			return result;
		}

		function createRandomSeed() {
			return String(
				Math.floor(Math.random() * 900000000) + 100000000
			);
		}

		function clampInteger(value, minimum, maximum, fallback) {
			const parsed = Number.parseInt(value, 10);

			if (!Number.isFinite(parsed)) {
				return fallback;
			}

			return Math.min(maximum, Math.max(minimum, parsed));
		}

		function getGeneratorOptions() {
			const availableCount = galleryImages.length;

			if (availableCount === 0) {
				throw new Error("Choose a folder with images first.");
			}

			const minimum = Math.min(
				availableCount,
				Math.max(1, savedGeneratorSettings.minimumCount)
			);

			const maximum = Math.min(
				availableCount,
				Math.max(minimum, savedGeneratorSettings.maximumCount)
			);

			const fixed = Math.min(
				availableCount,
				Math.max(1, savedGeneratorSettings.fixedCount)
			);

			let seed = savedGeneratorSettings.seed.trim();

			if (!seed) {
				seed = createRandomSeed();
				savedGeneratorSettings.seed = seed;
			}

			const random = createSeededRandom(seed);
			const count = savedGeneratorSettings.randomMode
				? minimum + Math.floor(random() * (maximum - minimum + 1))
				: fixed;

			return {
				count,
				seed,
				random
			};
		}

		function createLeafNode(photo) {
			return {
				type: "leaf",
				photo,
				ratio: photo.ratio
			};
		}

		function combineMosaicNodes(first, second, direction) {
			if (direction === "vertical") {
				/*
					Side-by-side cells share the same height, so their aspect
					ratios add together.
				*/
				return {
					type: "split",
					direction,
					first,
					second,
					ratio: first.ratio + second.ratio
				};
			}

			/*
				Stacked cells share the same width. The combined height is the
				sum of both child heights.
			*/
			return {
				type: "split",
				direction,
				first,
				second,
				ratio:
					1 /
					(
						1 / first.ratio +
						1 / second.ratio
					)
			};
		}

		function buildRandomMosaicTree(photos, random) {
			let nodes = seededShuffle(
				photos.map(createLeafNode),
				random
			);

			while (nodes.length > 1) {
				const firstIndex = Math.floor(random() * nodes.length);
				const first = nodes.splice(firstIndex, 1)[0];

				const secondIndex = Math.floor(random() * nodes.length);
				const second = nodes.splice(secondIndex, 1)[0];

				const verticalRatio =
					first.ratio + second.ratio;

				const horizontalRatio =
					1 /
					(
						1 / first.ratio +
						1 / second.ratio
					);

				/*
					Prefer the split that does not create an extremely thin
					combined region, while still allowing seeded variation.
				*/
				const verticalShapeScore =
					Math.abs(Math.log(verticalRatio / (16 / 9)));

				const horizontalShapeScore =
					Math.abs(Math.log(horizontalRatio / (16 / 9)));

				let direction;

				if (Math.abs(verticalShapeScore - horizontalShapeScore) < 0.2) {
					direction = random() >= 0.5
						? "vertical"
						: "horizontal";
				} else {
					direction =
						verticalShapeScore < horizontalShapeScore
							? "vertical"
							: "horizontal";
				}

				nodes.push(
					combineMosaicNodes(
						first,
						second,
						direction
					)
				);
			}

			return nodes[0];
		}

		function scoreMosaicTree(node, targetRatio) {
			let score = Math.abs(
				Math.log(node.ratio / targetRatio)
			) * 100000;

			function inspect(current) {
				if (current.type === "leaf") {
					return;
				}

				const firstRatio = current.first.ratio;
				const secondRatio = current.second.ratio;

				/*
					Penalize wildly unbalanced neighboring cells so the final
					layout stays readable and avoids very thin strips.
				*/
				score += Math.abs(
					Math.log(firstRatio / secondRatio)
				) * 180;

				inspect(current.first);
				inspect(current.second);
			}

			inspect(node);
			return score;
		}

		function layoutMosaicTree(node, x, y, width, height, gap, leaves) {
			if (node.type === "leaf") {
				leaves.push({
					photo: node.photo,
					x,
					y,
					width,
					height
				});
				return;
			}

			if (node.direction === "vertical") {
				const availableWidth = Math.max(1, width - gap);
				const firstWidth =
					availableWidth *
					(
						node.first.ratio /
						(node.first.ratio + node.second.ratio)
					);

				const secondWidth = availableWidth - firstWidth;

				layoutMosaicTree(
					node.first,
					x,
					y,
					firstWidth,
					height,
					gap,
					leaves
				);

				layoutMosaicTree(
					node.second,
					x + firstWidth + gap,
					y,
					secondWidth,
					height,
					gap,
					leaves
				);

				return;
			}

			const firstHeight =
				width / node.first.ratio;

			const secondHeight =
				width / node.second.ratio;

			const naturalTotalHeight = firstHeight + secondHeight;
			const availableHeight = Math.max(1, height - gap);
			const scale = availableHeight / naturalTotalHeight;
			const scaledFirstHeight = firstHeight * scale;
			const scaledSecondHeight = availableHeight - scaledFirstHeight;

			layoutMosaicTree(
				node.first,
				x,
				y,
				width,
				scaledFirstHeight,
				gap,
				leaves
			);

			layoutMosaicTree(
				node.second,
				x,
				y + scaledFirstHeight + gap,
				width,
				scaledSecondHeight,
				gap,
				leaves
			);
		}

		function buildRecursiveWallpaperLayout(
			photos,
			canvasWidth,
			canvasHeight,
			options
		) {
			const padding = 8;
			const gap = 8;
			const targetWidth = canvasWidth - padding * 2;
			const targetHeight = canvasHeight - padding * 2;
			const targetRatio = targetWidth / targetHeight;
			const selected = seededShuffle(
				photos,
				options.random
			).slice(0, options.count);

			let bestTree = null;
			let bestScore = Number.POSITIVE_INFINITY;

			for (let attempt = 0; attempt < 1000; attempt++) {
				const tree = buildRandomMosaicTree(
					selected,
					options.random
				);

				const score = scoreMosaicTree(
					tree,
					targetRatio
				);

				if (score < bestScore) {
					bestScore = score;
					bestTree = tree;
				}
			}

			/*
				Fit the complete tree inside the wallpaper. All internal cells
				match their photos exactly, so there are no blank areas between
				images. Only a small centered outer margin can remain when the
				tree's final ratio differs from 16:9.
			*/
			let layoutWidth;
			let layoutHeight;

			if (bestTree.ratio > targetRatio) {
				layoutWidth = targetWidth;
				layoutHeight = targetWidth / bestTree.ratio;
			} else {
				layoutHeight = targetHeight;
				layoutWidth = targetHeight * bestTree.ratio;
			}

			const startX =
				padding + (targetWidth - layoutWidth) / 2;

			const startY =
				padding + (targetHeight - layoutHeight) / 2;

			const leaves = [];

			layoutMosaicTree(
				bestTree,
				startX,
				startY,
				layoutWidth,
				layoutHeight,
				gap,
				leaves
			);

			return {
				leaves,
				photoCount: options.count,
				seed: options.seed
			};
		}

		async function renderMosaicWallpaper(options) {
			const canvas = document.createElement("canvas");
			canvas.width = 2560;
			canvas.height = 1440;

			const context = canvas.getContext("2d", {
				alpha: false
			});

			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, canvas.width, canvas.height);

			const layout = buildRecursiveWallpaperLayout(
				galleryImages,
				canvas.width,
				canvas.height,
				options
			);

			const uniquePhotos = [
				...new Set(
					layout.leaves.map(leaf => leaf.photo)
				)
			];

			const loadedImageMap = new Map();

			await Promise.all(
				uniquePhotos.map(async photo => {
					const loadedImage = await loadCanvasImage(photo.src);
					loadedImageMap.set(photo, loadedImage);
				})
			);

			for (const leaf of layout.leaves) {
				const image = loadedImageMap.get(leaf.photo);

				context.drawImage(
					image,
					leaf.x,
					leaf.y,
					leaf.width,
					leaf.height
				);
			}

			return new Promise((resolve, reject) => {
				canvas.toBlob(
					blob => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error("Could not create the wallpaper."));
						}
					},
					"image/png"
				);
			});
		}

		function closeWallpaperPreview() {
			wallpaperPreview.classList.remove("visible");
			wallpaperPreview.setAttribute("aria-hidden", "true");
		}

		function showWallpaperPreview(blob) {
			if (generatedWallpaperUrl) {
				URL.revokeObjectURL(generatedWallpaperUrl);
			}

			generatedWallpaperBlob = blob;
			generatedWallpaperUrl = URL.createObjectURL(blob);

			wallpaperPreviewImage.src = generatedWallpaperUrl;
			wallpaperPreview.classList.add("visible");
			wallpaperPreview.setAttribute("aria-hidden", "false");
		}

		async function generateMosaicBackground() {
			if (galleryImages.length === 0) {
				showGalleryToast("Choose a folder with images first.");
				return;
			}

			generateBackgroundButton.disabled = true;
			remakeWallpaperButton.disabled = true;
			generateBackgroundButton.textContent = "Generating…";
			remakeWallpaperButton.textContent = "Generating…";

			try {
				const options = getGeneratorOptions();
				const blob = await renderMosaicWallpaper(options);
				previewSeed.textContent =
					`Seed: ${options.seed} • ${options.count} photos`;
				showWallpaperPreview(blob);
			} catch (error) {
				console.error(error);
				showGalleryToast(
					error && error.message
						? `Could not generate: ${error.message}`
						: "The mosaic could not be generated."
				);
			} finally {
				generateBackgroundButton.disabled = false;
				remakeWallpaperButton.disabled = false;
				generateBackgroundButton.textContent = "Generate Background";
				remakeWallpaperButton.textContent = "Remake";
			}
		}

		function downloadGeneratedWallpaper() {
			if (!generatedWallpaperBlob || !generatedWallpaperUrl) {
				return;
			}

			const link = document.createElement("a");
			link.href = generatedWallpaperUrl;
			link.download = `trollmine-mosaic-${Date.now()}.png`;

			document.body.appendChild(link);
			link.click();
			link.remove();

			showGalleryToast("2560 × 1440 mosaic downloaded.");
		}

		downloadWallpaperButton.addEventListener(
			"click",
			downloadGeneratedWallpaper
		);

		remakeWallpaperButton.addEventListener(
			"click",
			() => {
				savedGeneratorSettings.seed = createRandomSeed();
				wallpaperSeed.value = savedGeneratorSettings.seed;
				generateMosaicBackground();
			}
		);

		closeWallpaperPreviewButton.addEventListener(
			"click",
			closeWallpaperPreview
		);

		wallpaperPreview.addEventListener("click", event => {
			if (event.target === wallpaperPreview) {
				closeWallpaperPreview();
			}
		});

		document.addEventListener("keydown", event => {
			if (event.key !== "Escape") {
				return;
			}

			if (generatorSettingsOverlay.classList.contains("visible")) {
				closeGeneratorSettings();
				return;
			}

			if (wallpaperPreview.classList.contains("visible")) {
				closeWallpaperPreview();
			}
		});


		let savedGeneratorSettings = {
			randomMode: true,
			fixedCount: 18,
			minimumCount: 15,
			maximumCount: 20,
			seed: ""
		};

		function setCountMode(randomMode) {
			randomCountEnabled.checked = randomMode;
			randomModeButton.classList.toggle("active", randomMode);
			fixedModeButton.classList.toggle("active", !randomMode);
			randomCountFields.classList.toggle("hidden", !randomMode);
			fixedCountFields.classList.toggle("hidden", randomMode);
		}

		function openGeneratorSettings() {
			fixedPhotoCount.value = savedGeneratorSettings.fixedCount;
			minimumPhotoCount.value = savedGeneratorSettings.minimumCount;
			maximumPhotoCount.value = savedGeneratorSettings.maximumCount;
			wallpaperSeed.value = savedGeneratorSettings.seed;
			setCountMode(savedGeneratorSettings.randomMode);

			generatorSettingsOverlay.classList.add("visible");
			generatorSettingsOverlay.setAttribute("aria-hidden", "false");
		}

		function closeGeneratorSettings() {
			generatorSettingsOverlay.classList.remove("visible");
			generatorSettingsOverlay.setAttribute("aria-hidden", "true");
		}

		function saveGeneratorSettings() {
			let minimum = Math.max(
				1,
				Number.parseInt(minimumPhotoCount.value, 10) || 1
			);

			let maximum = Math.max(
				1,
				Number.parseInt(maximumPhotoCount.value, 10) || minimum
			);

			if (minimum > maximum) {
				[minimum, maximum] = [maximum, minimum];
			}

			savedGeneratorSettings = {
				randomMode: randomCountEnabled.checked,
				fixedCount: Math.max(
					1,
					Number.parseInt(fixedPhotoCount.value, 10) || 1
				),
				minimumCount: minimum,
				maximumCount: maximum,
				seed: wallpaperSeed.value.trim()
			};

			closeGeneratorSettings();
			showGalleryToast("Generator settings saved.");
		}

		openGeneratorSettingsButton.addEventListener(
			"click",
			openGeneratorSettings
		);

		closeGeneratorSettingsButton.addEventListener(
			"click",
			closeGeneratorSettings
		);

		cancelGeneratorSettingsButton.addEventListener(
			"click",
			closeGeneratorSettings
		);

		saveGeneratorSettingsButton.addEventListener(
			"click",
			saveGeneratorSettings
		);

		randomModeButton.addEventListener("click", () => {
			setCountMode(true);
		});

		fixedModeButton.addEventListener("click", () => {
			setCountMode(false);
		});

		randomizeSeedButton.addEventListener("click", () => {
			wallpaperSeed.value = createRandomSeed();
		});

		generatorSettingsOverlay.addEventListener("click", event => {
			if (event.target === generatorSettingsOverlay) {
				closeGeneratorSettings();
			}
		});


		generateBackgroundButton.addEventListener(
			"click",
			generateMosaicBackground
		);

		galleryViewport.addEventListener("pointerdown", event => {
			if (event.button !== 0) {
				return;
			}

			draggingGallery = true;
			previousPointerX = event.clientX;
			previousPointerY = event.clientY;

			galleryViewport.classList.add("dragging");
			galleryViewport.setPointerCapture(event.pointerId);
		});

		galleryViewport.addEventListener("pointermove", event => {
			if (!draggingGallery) {
				return;
			}

			galleryX += event.clientX - previousPointerX;
			galleryY += event.clientY - previousPointerY;

			previousPointerX = event.clientX;
			previousPointerY = event.clientY;

			applyGalleryTransform();
		});

		function stopGalleryDragging(event) {
			draggingGallery = false;
			galleryViewport.classList.remove("dragging");

			if (
				event.pointerId !== undefined &&
				galleryViewport.hasPointerCapture(event.pointerId)
			) {
				galleryViewport.releasePointerCapture(event.pointerId);
			}
		}

		galleryViewport.addEventListener("pointerup", stopGalleryDragging);
		galleryViewport.addEventListener("pointercancel", stopGalleryDragging);

		document.addEventListener("keydown", event => {
			if (!galleryPage.classList.contains("active")) {
				return;
			}

			const bounds = galleryViewport.getBoundingClientRect();
			const centerX = bounds.left + bounds.width / 2;
			const centerY = bounds.top + bounds.height / 2;

			if (event.key === "+" || event.key === "=") {
				setGalleryZoom(galleryScale * 1.2, centerX, centerY);
			}

			if (event.key === "-") {
				setGalleryZoom(galleryScale / 1.2, centerX, centerY);
			}

			if (event.key === "0") {
				resetGalleryView();
			}
		});

		window.addEventListener("resize", () => {
			if (galleryImages.length > 0) {
				layoutMosaic();
			}
		});

		window.addEventListener("beforeunload", () => {
			if (generatedWallpaperUrl) {
				URL.revokeObjectURL(generatedWallpaperUrl);
			}
		});


		// Mouse tilt effect

		const profileCard = document.getElementById("profileCard");

		profileCard.addEventListener("mousemove", event => {
			const bounds = profileCard.getBoundingClientRect();

			const mouseX = event.clientX - bounds.left;
			const mouseY = event.clientY - bounds.top;

			const centerX = bounds.width / 2;
			const centerY = bounds.height / 2;

			const rotateY = ((mouseX - centerX) / centerX) * 2.2;
			const rotateX = ((centerY - mouseY) / centerY) * 2.2;

			profileCard.style.transform =
				`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		});

		profileCard.addEventListener("mouseleave", () => {
			profileCard.style.transform =
				"perspective(1000px) rotateX(0deg) rotateY(0deg)";
		});

		profileCard.style.transition = "transform 0.2s ease-out";


		// Particle background

		const canvas = document.getElementById("particles");
		const context = canvas.getContext("2d");

		let particles = [];

		function resizeCanvas() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			createParticles();
		}

		function createParticles() {
			const particleCount = Math.min(
				90,
				Math.floor((canvas.width * canvas.height) / 15000)
			);

			particles = [];

			for (let index = 0; index < particleCount; index++) {
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					radius: Math.random() * 1.6 + 0.4,
					speedX: (Math.random() - 0.5) * 0.25,
					speedY: Math.random() * 0.3 + 0.05,
					opacity: Math.random() * 0.45 + 0.1
				});
			}
		}

		function animateParticles() {
			context.clearRect(0, 0, canvas.width, canvas.height);

			for (const particle of particles) {
				particle.x += particle.speedX;
				particle.y += particle.speedY;

				if (particle.y > canvas.height + 10) {
					particle.y = -10;
					particle.x = Math.random() * canvas.width;
				}

				if (particle.x > canvas.width + 10) {
					particle.x = -10;
				}

				if (particle.x < -10) {
					particle.x = canvas.width + 10;
				}

				context.beginPath();
				context.arc(
					particle.x,
					particle.y,
					particle.radius,
					0,
					Math.PI * 2
				);

				context.fillStyle =
					`rgba(190, 180, 255, ${particle.opacity})`;

				context.fill();
			}

			requestAnimationFrame(animateParticles);
		}

		window.addEventListener("resize", resizeCanvas);

		resizeCanvas();
		animateParticles();
