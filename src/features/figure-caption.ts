import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

const FIGURE_CLASS = 'better-figures-figure';
const CAPTION_CLASS = 'better-figures-figure-caption';
const LIVE_PREVIEW_SELECTOR = '.markdown-source-view.mod-cm6.is-live-preview';
const IMAGE_EMBED_SELECTOR = '.internal-embed.image-embed, .image-embed';

export function registerFigureCaption(plugin: Plugin) {
	plugin.registerMarkdownPostProcessor(
		(el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			processFigureCaptions(el);
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
		processFigureCaptions(livePreviewContainer);
		return;
	}

	el.querySelectorAll(LIVE_PREVIEW_SELECTOR).forEach((container) => {
		if (container.instanceOf(HTMLElement)) {
			processFigureCaptions(container);
		}
	});
}

function processFigureCaptions(el: HTMLElement) {
	if (el.matches('img')) {
		processFigureCaption(el);
	}

	el.querySelectorAll('img').forEach((img) => {
		processFigureCaption(img);
	});
}

export function processFigureCaption(img: Element) {
	if (img.closest(`.${FIGURE_CLASS}`)) {
		return;
	}

	const parent = img.parentElement;
	if (!parent) return;

	const altText = img.getAttribute('alt')?.trim() || '';
	if (!altText) return;

	const target = getFigureTarget(img);
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

function getFigureTarget(img: Element) {
	const parent = img.parentElement;
	const link = parent?.closest('a');
	if (link) return link;

	const imageEmbed = img.closest(IMAGE_EMBED_SELECTOR);
	if (imageEmbed?.instanceOf(HTMLElement)) return imageEmbed;

	return img;
}
