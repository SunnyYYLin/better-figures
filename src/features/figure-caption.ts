import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

const FIGURE_CLASS = 'better-figures-figure';
const CAPTION_CLASS = 'better-figures-figure-caption';
const LIVE_FIGURE_CLASS = 'better-figures-live-figure';
const LIVE_PREVIEW_SELECTOR = '.markdown-source-view.mod-cm6.is-live-preview';
const IMAGE_EMBED_SELECTOR = '.internal-embed.image-embed, .image-embed';
const CAPTION_DATA_ATTR = 'betterFiguresCaption';

export function registerFigureCaption(plugin: Plugin) {
	plugin.registerMarkdownPostProcessor(
		(el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			processReadingFigureCaptions(el);
		},
	);

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== 'childList') {
				continue;
			}

			mutation.addedNodes.forEach((node) => {
				if (node.instanceOf(HTMLElement)) {
					processLivePreviewFigureCaptions(node);
				}
			});
		}
	});

	observer.observe(activeDocument.body, {
		childList: true,
		subtree: true,
	});

	plugin.register(() => observer.disconnect());
	processLivePreviewFigureCaptions(activeDocument.body);
}

function processLivePreviewFigureCaptions(el: HTMLElement) {
	const livePreviewContainer = el.closest(LIVE_PREVIEW_SELECTOR);
	if (livePreviewContainer?.instanceOf(HTMLElement)) {
		processLivePreviewImages(livePreviewContainer);
		return;
	}

	el.querySelectorAll(LIVE_PREVIEW_SELECTOR).forEach((container) => {
		if (container.instanceOf(HTMLElement)) {
			processLivePreviewImages(container);
		}
	});
}

function processReadingFigureCaptions(el: HTMLElement) {
	if (el.matches('img')) {
		processReadingFigureCaption(el);
	}

	el.querySelectorAll('img').forEach((img) => {
		processReadingFigureCaption(img);
	});
}

function processLivePreviewImages(el: HTMLElement) {
	if (el.matches('img')) {
		processLivePreviewFigureCaption(el);
	}

	el.querySelectorAll('img').forEach((img) => {
		processLivePreviewFigureCaption(img);
	});
}

export function processReadingFigureCaption(img: Element) {
	if (img.closest(`.${FIGURE_CLASS}`)) {
		return;
	}

	const parent = img.parentElement;
	if (!parent) return;

	const altText = img.getAttribute('alt')?.trim() || '';
	if (!altText) return;

	const target = getReadingFigureTarget(img);
	const container = target.parentElement;
	if (!container) return;

	const figure = activeDocument.createElement('figure');
	figure.className = FIGURE_CLASS;

	const caption = activeDocument.createElement('figcaption');
	caption.className = CAPTION_CLASS;
	caption.textContent = altText;

	container.insertBefore(figure, target);
	figure.appendChild(target);
	figure.appendChild(caption);
}

function processLivePreviewFigureCaption(img: Element) {
	const altText = img.getAttribute('alt')?.trim() || '';
	if (!altText) return;

	const target = getLivePreviewFigureTarget(img);
	if (!target.instanceOf(HTMLElement)) return;

	target.addClass(LIVE_FIGURE_CLASS);
	target.dataset[CAPTION_DATA_ATTR] = altText;
}

function getReadingFigureTarget(img: Element) {
	const parent = img.parentElement;
	const link = parent?.closest('a');
	if (link) return link;

	const imageEmbed = img.closest(IMAGE_EMBED_SELECTOR);
	if (imageEmbed?.instanceOf(HTMLElement)) return imageEmbed;

	return img;
}

function getLivePreviewFigureTarget(img: Element) {
	const imageEmbed = img.closest(IMAGE_EMBED_SELECTOR);
	if (imageEmbed?.instanceOf(HTMLElement)) return imageEmbed;

	const parent = img.parentElement;
	const link = parent?.closest('a');
	if (link) return link;

	return img;
}
