import {
	MarkdownPostProcessorContext,
	MarkdownRenderChild,
	Plugin,
} from 'obsidian';
import {
	Decoration,
	DecorationSet,
	EditorView,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from '@codemirror/view';

const FIGURE_CLASS = 'better-figures-figure';
const CAPTION_CLASS = 'better-figures-figure-caption';
const LIVE_CAPTION_CLASS = 'better-figures-live-caption';
const EMBED_SELECTOR = '.internal-embed.image-embed, .image-embed';
const MARKDOWN_IMAGE_REGEX = /!\[([^\]\n]+)\]\([^)]+\)/g;

export function registerFigureCaption(plugin: Plugin) {
	plugin.registerMarkdownPostProcessor(
		(el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
			processFigureCaptions(el);
			ctx.addChild(new FigureCaptionRenderChild(el));
		},
	);

	plugin.registerEditorExtension(livePreviewFigureCaptionPlugin);
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

const livePreviewFigureCaptionPlugin = ViewPlugin.fromClass(
	class {
		private view: EditorView;
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.view = view;
			this.decorations = buildLivePreviewDecorations(view);
		}

		update(update: ViewUpdate) {
			if (
				update.docChanged ||
				update.viewportChanged ||
				update.selectionSet
			) {
				this.decorations = buildLivePreviewDecorations(this.view);
			}
		}
	},
	{
		decorations: (plugin) => plugin.decorations,
	},
);

function buildLivePreviewDecorations(view: EditorView) {
	if (!view.dom.closest('.is-live-preview')) {
		return Decoration.none;
	}

	const decorations = [];

	for (const range of view.visibleRanges) {
		let pos = range.from;
		while (pos <= range.to) {
			const line = view.state.doc.lineAt(pos);
			const captions = getLineImageCaptions(line.text);

			for (const caption of captions) {
				decorations.push(
					Decoration.widget({
						widget: new FigureCaptionWidget(caption),
						block: true,
						side: 1,
					}).range(line.to),
				);
			}

			if (line.to + 1 > range.to) {
				break;
			}
			pos = line.to + 1;
		}
	}

	return Decoration.set(decorations, true);
}

function getLineImageCaptions(line: string) {
	const captions: string[] = [];

	for (const match of line.matchAll(MARKDOWN_IMAGE_REGEX)) {
		const caption = match[1]?.trim();
		if (caption) {
			captions.push(caption);
		}
	}

	return captions;
}

class FigureCaptionWidget extends WidgetType {
	constructor(private readonly caption: string) {
		super();
	}

	toDOM() {
		const captionEl = activeDocument.createElement('div');
		captionEl.addClass(LIVE_CAPTION_CLASS);
		captionEl.textContent = this.caption;
		return captionEl;
	}

	eq(other: FigureCaptionWidget) {
		return other.caption === this.caption;
	}
}
