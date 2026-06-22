import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Plugin,
} from 'obsidian';

const FIGURE_CLASS = 'better-figures-figure';
const CAPTION_CLASS = 'better-figures-figure-caption';
const EMBED_SELECTOR = '.internal-embed.image-embed, .image-embed';

export function registerFigureCaption(plugin: Plugin) {
	plugin.registerMarkdownPostProcessor(
		(el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			processFigureCaptions(el);
			ctx.addChild(new FigureCaptionRenderChild(el));
		},
	);
}

class FigureCaptionRenderChild extends MarkdownRenderChild {
	private observer: MutationObserver | null = null;

	onload() {
		this.observer = new MutationObserver(() => {
			processFigureCaptions(this.containerEl);
		});

		this.observer.observe(this.containerEl, {
			childList: true,
			subtree: true,
		});
	}

	onunload() {
		this.observer?.disconnect();
	}
}

function processFigureCaptions(el: HTMLElement) {
	el.querySelectorAll('img').forEach((img) => {
		processFigureCaption(img);
	});
}

export function processFigureCaption(img: HTMLImageElement) {
	if (img.closest(`.${FIGURE_CLASS}`)) {
		return;
	}

	const captionText = img.getAttribute('alt')?.trim();
	if (!captionText) {
		return;
	}

	const renderTarget = getImageRenderTarget(img);
	const container = renderTarget.parentElement;
	if (!container) {
		return;
	}

	const figure = activeDocument.createElement('figure');
	figure.addClass(FIGURE_CLASS);

	const caption = activeDocument.createElement('figcaption');
	caption.addClass(CAPTION_CLASS);
	caption.textContent = captionText;

	container.insertBefore(figure, renderTarget);
	figure.appendChild(renderTarget);
	figure.appendChild(caption);
}

function getImageRenderTarget(img: HTMLImageElement) {
	const embed = img.closest(EMBED_SELECTOR);
	if (embed instanceof HTMLElement) {
		return embed;
	}

	const parent = img.parentElement;
	if (parent?.tagName === 'A') {
		return parent;
	}

	return img;
}
