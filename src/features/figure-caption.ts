import { MarkdownPostProcessorContext, Plugin } from 'obsidian';

const FIGURE_CLASS = 'better-figures-figure';
const CAPTION_CLASS = 'better-figures-figure-caption';

export function registerFigureCaption(plugin: Plugin) {
	plugin.registerMarkdownPostProcessor(
		(el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
			el.querySelectorAll('img').forEach((img) => {
				processFigureCaption(img);
			});
		},
	);
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
	const parent = img.parentElement;

	if (parent?.tagName === 'A' && parent.childElementCount === 1) {
		return parent;
	}

	return img;
}
